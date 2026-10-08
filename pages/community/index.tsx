import React, { ChangeEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Pagination, Stack } from '@mui/material';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import ArticleCard from '../../libs/components/community/ArticleCard';
import { userVar } from '../../apollo/store';
import { GET_BOARD_ARTICLES } from '../../apollo/user/query';
import { LIKE_TARGET_BOARD_ARTICLE } from '../../apollo/user/mutation';
import { BoardArticle } from '../../libs/types/community';
import { BoardArticleCategory } from '../../libs/enums/board-article.enum';
import { T } from '../../libs/types/common';
import { labelOf, likeHandler } from '../../libs/utils';
import { sweetLoginConfirmAlert } from '../../libs/sweetAlert';
import { useTranslation } from 'next-i18next';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

export const boards = [
	{ id: BoardArticleCategory.FREE, desc: 'Talk about anything beauty' },
	{ id: BoardArticleCategory.BEAUTY_TIP, desc: 'Small tricks that work' },
	{ id: BoardArticleCategory.ROUTINE, desc: 'Morning and night routines' },
	{ id: BoardArticleCategory.NEWS, desc: 'News from the Reneva team' },
	{ id: BoardArticleCategory.EVENT, desc: 'Sales, launches and giveaways' },
];

const sorts = [
	{ id: 'createdAt', label: 'Newest' },
	{ id: 'articleLikes', label: 'Most liked' },
	{ id: 'articleViews', label: 'Most viewed' },
];

const Community: NextPage = () => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const articleCategory = (router.query.articleCategory as BoardArticleCategory) ?? BoardArticleCategory.FREE;
	const [text, setText] = useState<string>('');
	const [inquiry, setInquiry] = useState<T>({ page: 1, limit: 9, sort: 'createdAt', direction: 'DESC', search: { articleCategory } });

	/** APOLLO REQUESTS **/
	const [likeTargetBoardArticle] = useMutation(LIKE_TARGET_BOARD_ARTICLE);
	const { data, refetch } = useQuery(GET_BOARD_ARTICLES, { fetchPolicy: 'network-only', variables: { input: inquiry } });
	const articles: BoardArticle[] = data?.getBoardArticles?.list ?? [];
	const total: number = data?.getBoardArticles?.metaCounter?.[0]?.total ?? 0;

	/** LIFECYCLES **/
	useEffect(() => {
		setInquiry((prev) => ({ ...prev, page: 1, search: { ...prev.search, articleCategory } }));
	}, [articleCategory]);

	/** HANDLERS **/
	const searchHandler = (e: React.FormEvent) => {
		e.preventDefault();
		const search: T = { articleCategory };
		if (text.trim()) search.text = text.trim();
		setInquiry({ ...inquiry, page: 1, search });
	};

	const writeHandler = async () => {
		if (user._id) return router.push('/mypage?category=writeArticle');
		if (await sweetLoginConfirmAlert('Log in to write an article?')) router.push('/account/join');
	};

	const board = boards.find((ele) => ele.id === articleCategory) ?? boards[0];

	return (
		<div id={'community-list-page'}>
			<div className={'container'}>
				<Stack className={'community-layout'}>
					<aside className={'board-menu'}>
						<span className={'title'}>{t('Boards')}</span>
						{boards.map((ele) => (
							<button
								key={ele.id}
								className={ele.id === articleCategory ? 'on' : ''}
								onClick={() => router.push({ pathname: '/community', query: { articleCategory: ele.id } }, undefined, { scroll: false })}
							>
								<b>{t(labelOf(ele.id))}</b>
								<span>{t(ele.desc)}</span>
							</button>
						))}
						<button className={'primary-btn write'} onClick={writeHandler}>
							<EditRoundedIcon fontSize={'small'} /> {t('Write')}
						</button>
					</aside>

					<Stack className={'board-main'}>
						<div className={'board-head'}>
							<div>
								<h2 className={'section-title'}>{t(labelOf(board.id))}</h2>
								<p>{t(board.desc)}</p>
							</div>
							<form onSubmit={searchHandler} className={'search'}>
								<label className={'sr-only'} htmlFor={'article-search'}>
									{t('Search articles')}
								</label>
								<input id={'article-search'} type={'search'} value={text} onChange={(e) => setText(e.target.value)} placeholder={t('Search articles')} />
								<button type={'submit'} className={'primary-btn'}>
									{t('Search')}
								</button>
							</form>
						</div>
						<Stack className={'chips'}>
							{sorts.map((sort) => (
								<button
									key={sort.id}
									className={`chip ${inquiry.sort === sort.id ? 'on' : ''}`}
									onClick={() => setInquiry({ ...inquiry, page: 1, sort: sort.id, direction: 'DESC' })}
								>
									{t(sort.label)}
								</button>
							))}
						</Stack>

						{articles.length === 0 ? (
							<div className={'no-data'}>{t('No articles on this board yet. Be the first to write one!')}</div>
						) : (
							<div className={'article-grid'}>
								{articles.map((article) => (
									<ArticleCard
										key={article._id}
										article={article}
										likeArticleHandler={(id) => likeHandler(likeTargetBoardArticle, user, id, () => refetch())}
									/>
								))}
							</div>
						)}

						{total > inquiry.limit && (
							<Stack className={'pagination-box'}>
								<Pagination
									page={inquiry.page}
									count={Math.ceil(total / inquiry.limit)}
									onChange={(e: ChangeEvent<unknown>, value: number) => setInquiry({ ...inquiry, page: value })}
									shape={'circular'}
									color={'primary'}
								/>
							</Stack>
						)}
					</Stack>
				</Stack>
			</div>
		</div>
	);
};

export default withLayoutBasic(Community);

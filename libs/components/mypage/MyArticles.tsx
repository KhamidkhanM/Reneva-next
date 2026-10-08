import React, { useState } from 'react';
import { Pagination, Stack } from '@mui/material';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { GET_BOARD_ARTICLES } from '../../../apollo/user/query';
import { LIKE_TARGET_BOARD_ARTICLE, UPDATE_BOARD_ARTICLE } from '../../../apollo/user/mutation';
import { BoardArticle } from '../../types/community';
import { BoardArticleStatus } from '../../enums/board-article.enum';
import { likeHandler } from '../../utils';
import ArticleCard from '../community/ArticleCard';
import { sweetConfirmAlert, sweetMixinErrorAlert } from '../../sweetAlert';
import { useTranslation } from 'next-i18next';

interface MyArticlesProps {
	memberId?: string; // set on the public member page
}

const MyArticles = ({ memberId }: MyArticlesProps) => {
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const owner = !memberId || memberId === user._id;
	const [page, setPage] = useState<number>(1);
	const limit = 6;

	/** APOLLO REQUESTS **/
	const [likeTargetBoardArticle] = useMutation(LIKE_TARGET_BOARD_ARTICLE);
	const [updateBoardArticle] = useMutation(UPDATE_BOARD_ARTICLE);
	const { data, refetch } = useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'network-only',
		skip: !(memberId ?? user._id),
		variables: { input: { page, limit, sort: 'createdAt', direction: 'DESC', search: { memberId: memberId ?? user._id } } },
	});
	const articles: BoardArticle[] = data?.getBoardArticles?.list ?? [];
	const total: number = data?.getBoardArticles?.metaCounter?.[0]?.total ?? 0;

	const removeHandler = async (id: string) => {
		try {
			if (!(await sweetConfirmAlert('Delete this article?'))) return;
			await updateBoardArticle({ variables: { input: { _id: id, articleStatus: BoardArticleStatus.DELETE } } });
			await refetch();
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	return (
		<div className={'my-section'}>
			<div className={'section-head'}>
				<h2>{owner ? t('My articles') : t('Articles')}</h2>
				{owner && <p>{t('Tips, routines and reviews you shared with the community.')}</p>}
			</div>
			{articles.length === 0 ? (
				<div className={'no-data'}>{t('No articles yet.')}</div>
			) : (
				<div className={'article-grid'}>
					{articles.map((article) => (
						<ArticleCard
							key={article._id}
							article={article}
							likeArticleHandler={(id) => likeHandler(likeTargetBoardArticle, user, id, () => refetch())}
							onRemove={owner ? removeHandler : undefined}
						/>
					))}
				</div>
			)}
			{total > limit && (
				<Stack className={'pagination-box'}>
					<Pagination page={page} count={Math.ceil(total / limit)} onChange={(e, value) => setPage(value)} shape={'circular'} color={'primary'} />
				</Stack>
			)}
		</div>
	);
};

export default MyArticles;

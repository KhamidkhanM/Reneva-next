import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import moment from 'moment';
import { Box, Stack } from '@mui/material';
import { useQuery } from '@apollo/client';
import { GET_BOARD_ARTICLES } from '../../../apollo/user/query';
import { BoardArticle } from '../../types/community';
import { T } from '../../types/common';
import { labelOf } from '../../utils';
import { useTranslation } from 'next-i18next';

const tones = ['lilac', 'peach', 'light'];

const CommunityBoards = () => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const [articles, setArticles] = useState<BoardArticle[]>([]);

	useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'cache-and-network',
		variables: { input: { page: 1, limit: 4, sort: 'articleLikes', direction: 'DESC', search: {} } },
		onCompleted: (data: T) => setArticles(data?.getBoardArticles?.list ?? []),
	});

	return (
		<Stack className={'community-board'}>
			<Stack className={'container column'}>
				<Stack className={'info-box'}>
					<h2 className={'section-title'}>{t('Community')}</h2>
					<Link href={'/community?articleCategory=FREE'} className={'more-link'}>
						{t('Go to community →')}
					</Link>
				</Stack>
				{articles.length === 0 ? (
					<Box component={'div'} className={'empty-list'}>
						{t('No posts yet. Be the first to share your routine!')}
					</Box>
				) : (
					<div className={'article-list'}>
						{articles.map((article, index) => (
							<button
								key={article._id}
								className={'article-row'}
								onClick={() => router.push({ pathname: '/community/detail', query: { id: article._id, articleCategory: article.articleCategory } })}
							>
								<span className={'txt'}>
									<span className={'cat'}>{t(labelOf(article.articleCategory))}</span>
									<b>{article.articleTitle}</b>
									<span className={'meta'}>
										{article.memberData?.memberNick} · {article.articleLikes} {t('likes ·')} {article.articleComments} {t('comments ·')}{' '}
										{moment(article.createdAt).fromNow()}
									</span>
								</span>
								<span className={`thumb ${tones[index % tones.length]}`}></span>
							</button>
						))}
					</div>
				)}
			</Stack>
		</Stack>
	);
};

export default CommunityBoards;

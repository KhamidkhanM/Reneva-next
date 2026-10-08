import React, { useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import moment from 'moment';
import { Stack } from '@mui/material';
import { useMutation, useQuery } from '@apollo/client';
import withAdminLayout from '../../libs/components/layout/LayoutAdmin';
import AdminPager from '../../libs/components/admin/AdminPager';
import { adminStaticProps } from '../../libs/components/admin/adminStatic';
import { GET_ALL_COMMENTS_BY_ADMIN, GET_ALL_REVIEWS_BY_ADMIN } from '../../apollo/admin/query';
import { REMOVE_BOARD_ARTICLE_BY_ADMIN, REMOVE_COMMENT_BY_ADMIN, REMOVE_REVIEW_BY_ADMIN } from '../../apollo/admin/mutation';
import { GET_BOARD_ARTICLES } from '../../apollo/user/query';
import { BoardArticle, Comment, Review } from '../../libs/types/community';
import { CommentGroup } from '../../libs/enums/comment.enum';
import { labelOf, memberImage } from '../../libs/utils';
import { sweetConfirmAlert, sweetErrorHandlingForAdmin, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { useTranslation } from 'next-i18next';

export const getStaticProps = adminStaticProps;

type Tab = 'reviews' | 'articles' | 'comments';
const tabs: { id: Tab; label: string }[] = [
	{ id: 'reviews', label: 'Reviews' },
	{ id: 'articles', label: 'Articles' },
	{ id: 'comments', label: 'Comments' },
];

// where a comment was written, so the admin can open it in context
const commentLink = (comment: Comment) => {
	if (comment.commentGroup === CommentGroup.ARTICLE) return { pathname: '/community/detail', query: { id: comment.commentRefId } };
	if (comment.commentGroup === CommentGroup.PRODUCT) return { pathname: '/product/detail', query: { id: comment.commentRefId } };
	if (comment.commentGroup === CommentGroup.MEMBER) return { pathname: '/member', query: { memberId: comment.commentRefId } };
	return null;
};

const Author = ({ member, date }: { member?: { memberNick: string; memberImage?: string }; date: Date }) => (
	<div className={'cell-member'}>
		<img src={memberImage(member?.memberImage)} alt={''} />
		<span>
			<b>{member?.memberNick ?? '—'}</b>
			<small>{moment(date).format('YY.MM.DD HH:mm')}</small>
		</span>
	</div>
);

const AdminCommunity: NextPage = () => {
	const { t } = useTranslation('common');
	const [tab, setTab] = useState<Tab>('reviews');
	const [page, setPage] = useState<number>(1);
	const limit = 10;
	const input = { page, limit };

	/** APOLLO REQUESTS **/
	const reviewsQuery = useQuery(GET_ALL_REVIEWS_BY_ADMIN, { fetchPolicy: 'network-only', skip: tab !== 'reviews', variables: { input } });
	const articlesQuery = useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'network-only',
		skip: tab !== 'articles',
		variables: { input: { ...input, sort: 'createdAt', direction: 'DESC', search: {} } },
	});
	const commentsQuery = useQuery(GET_ALL_COMMENTS_BY_ADMIN, { fetchPolicy: 'network-only', skip: tab !== 'comments', variables: { input } });
	const [removeReviewByAdmin] = useMutation(REMOVE_REVIEW_BY_ADMIN);
	const [removeBoardArticleByAdmin] = useMutation(REMOVE_BOARD_ARTICLE_BY_ADMIN);
	const [removeCommentByAdmin] = useMutation(REMOVE_COMMENT_BY_ADMIN);

	const reviews: Review[] = reviewsQuery.data?.getAllReviewsByAdmin?.list ?? [];
	const articles: BoardArticle[] = articlesQuery.data?.getBoardArticles?.list ?? [];
	const comments: Comment[] = commentsQuery.data?.getAllCommentsByAdmin?.list ?? [];
	const total: number =
		(tab === 'reviews'
			? reviewsQuery.data?.getAllReviewsByAdmin
			: tab === 'articles'
			? articlesQuery.data?.getBoardArticles
			: commentsQuery.data?.getAllCommentsByAdmin
		)?.metaCounter?.[0]?.total ?? 0;

	/** HANDLERS **/
	const removeHandler = async (what: string, remove: () => Promise<any>, refetch: () => Promise<any>) => {
		try {
			if (!(await sweetConfirmAlert(t(`Delete this ${what}? This cannot be undone.`)))) return;
			await remove();
			await refetch();
			await sweetTopSmallSuccessAlert('Deleted', 700);
		} catch (err: any) {
			sweetErrorHandlingForAdmin(err).then();
		}
	};

	const changeTab = (id: Tab) => {
		setTab(id);
		setPage(1);
	};

	return (
		<div className={'admin-page'}>
			<div className={'admin-head'}>
				<h2>{t('Community')}</h2>
				<p>{t('Remove reviews, articles and comments that break the rules. Reports from members arrive in Support chats.')}</p>
			</div>
			<Stack className={'chips'}>
				{tabs.map((ele) => (
					<button key={ele.id} className={`chip ${tab === ele.id ? 'on' : ''}`} onClick={() => changeTab(ele.id)}>
						{t(ele.label)}
					</button>
				))}
			</Stack>

			<div className={'table-box'}>
				<table>
					<thead>
						<tr>
							<th>{t('Author')}</th>
							<th>{tab === 'reviews' ? t('Review') : tab === 'articles' ? t('Article') : t('Comment')}</th>
							<th>{tab === 'reviews' ? t('Product') : tab === 'articles' ? t('Board') : t('Where')}</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{tab === 'reviews' &&
							reviews.map((review) => (
								<tr key={review._id}>
									<td>
										<Author member={review.memberData} date={review.createdAt} />
									</td>
									<td className={'cell-text'}>
										<b>{'★'.repeat(review.reviewRating)}</b>
										<small>{review.reviewContent}</small>
									</td>
									<td>
										<Link href={{ pathname: '/product/detail', query: { id: review.productId } }}>{review.productData?.productTitle ?? t('Product')}</Link>
									</td>
									<td className={'row-btns'}>
										<button
											className={'ghost-btn small danger'}
											onClick={() => removeHandler('review', () => removeReviewByAdmin({ variables: { input: review._id } }), reviewsQuery.refetch)}
										>
											{t('Delete')}
										</button>
									</td>
								</tr>
							))}
						{tab === 'articles' &&
							articles.map((article) => (
								<tr key={article._id}>
									<td>
										<Author member={article.memberData} date={article.createdAt} />
									</td>
									<td className={'cell-text'}>
										<Link href={{ pathname: '/community/detail', query: { id: article._id } }}>
											<b>{article.articleTitle}</b>
										</Link>
										<small>{article.articleContent}</small>
									</td>
									<td>{t(labelOf(article.articleCategory))}</td>
									<td className={'row-btns'}>
										<button
											className={'ghost-btn small danger'}
											onClick={() =>
												removeHandler('article', () => removeBoardArticleByAdmin({ variables: { input: article._id } }), articlesQuery.refetch)
											}
										>
											{t('Delete')}
										</button>
									</td>
								</tr>
							))}
						{tab === 'comments' &&
							comments.map((comment) => {
								const link = commentLink(comment);
								return (
									<tr key={comment._id}>
										<td>
											<Author member={comment.memberData} date={comment.createdAt} />
										</td>
										<td className={'cell-text'}>
											<small>{comment.commentContent}</small>
										</td>
										<td>{link ? <Link href={link}>{t(labelOf(comment.commentGroup))}</Link> : labelOf(comment.commentGroup)}</td>
										<td className={'row-btns'}>
											<button
												className={'ghost-btn small danger'}
												onClick={() =>
													removeHandler('comment', () => removeCommentByAdmin({ variables: { input: comment._id } }), commentsQuery.refetch)
												}
											>
												{t('Delete')}
											</button>
										</td>
									</tr>
								);
							})}
					</tbody>
				</table>
				{((tab === 'reviews' && reviews.length === 0) || (tab === 'articles' && articles.length === 0) || (tab === 'comments' && comments.length === 0)) && (
					<div className={'no-data'}>{t('Nothing here.')}</div>
				)}
			</div>
			<AdminPager page={page} limit={limit} total={total} onChange={setPage} />
		</div>
	);
};

export default withAdminLayout(AdminCommunity);

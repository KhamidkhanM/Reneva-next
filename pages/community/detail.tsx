import React from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import moment from 'moment';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import Comments from '../../libs/components/common/Comments';
import { userVar } from '../../apollo/store';
import { GET_BOARD_ARTICLE } from '../../apollo/user/query';
import { LIKE_TARGET_BOARD_ARTICLE, UPDATE_BOARD_ARTICLE } from '../../apollo/user/mutation';
import { BoardArticle } from '../../libs/types/community';
import { BoardArticleStatus } from '../../libs/enums/board-article.enum';
import { CommentGroup } from '../../libs/enums/comment.enum';
import { imageUrl, isLiked, labelOf, likeHandler, memberImage } from '../../libs/utils';
import { sweetConfirmAlert, sweetMixinErrorAlert } from '../../libs/sweetAlert';
import { useTranslation } from 'next-i18next';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const CommunityDetail: NextPage = () => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const articleId = router.query.id as string;

	/** APOLLO REQUESTS **/
	const [likeTargetBoardArticle] = useMutation(LIKE_TARGET_BOARD_ARTICLE);
	const [updateBoardArticle] = useMutation(UPDATE_BOARD_ARTICLE);
	const { data, refetch } = useQuery(GET_BOARD_ARTICLE, { fetchPolicy: 'network-only', skip: !articleId, variables: { input: articleId } });
	const article: BoardArticle | undefined = data?.getBoardArticle;

	const removeHandler = async () => {
		try {
			if (!article || !(await sweetConfirmAlert('Delete this article?'))) return;
			await updateBoardArticle({ variables: { input: { _id: article._id, articleStatus: BoardArticleStatus.DELETE } } });
			await router.push({ pathname: '/community', query: { articleCategory: article.articleCategory } });
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	if (!article) return <div id={'community-detail-page'}></div>;

	const authorHref = article.memberId === user._id ? { pathname: '/mypage' } : { pathname: '/member', query: { memberId: article.memberId } };

	return (
		<div id={'community-detail-page'}>
			<div className={'container column narrow'}>
				<Link href={{ pathname: '/community', query: { articleCategory: article.articleCategory } }} className={'back-link'}>
					<ArrowBackRoundedIcon fontSize={'small'} /> {t(labelOf(article.articleCategory))} {t('board')}
				</Link>
				<article className={'article-box'}>
					<span className={'cat'}>{t(labelOf(article.articleCategory))}</span>
					<h1>{article.articleTitle}</h1>
					<div className={'author-row'}>
						<Link href={authorHref} className={'author'}>
							<img src={memberImage(article.memberData?.memberImage)} alt={''} />
							<span>
								<b>{article.memberData?.memberNick}</b>
								<span>
									{moment(article.createdAt).format('YYYY.MM.DD HH:mm')} · {article.articleViews} {t('views')}
								</span>
							</span>
						</Link>
						{article.memberId === user._id && (
							<button className={'ghost-btn small'} onClick={removeHandler}>
								{t('Delete')}
							</button>
						)}
					</div>
					{article.articleImage && <img className={'cover'} src={imageUrl(article.articleImage)} alt={''} />}
					<div className={'content'}>
						{article.articleContent.split('\n').map((line, index) => (
							<p key={index}>{line}</p>
						))}
					</div>
					<button
						className={`like-btn ${isLiked(article) ? 'on' : ''}`}
						onClick={() => likeHandler(likeTargetBoardArticle, user, article._id, () => refetch())}
						aria-pressed={isLiked(article)}
					>
						{isLiked(article) ? <FavoriteRoundedIcon /> : <FavoriteBorderRoundedIcon />}
						{article.articleLikes} {t('likes')}
					</button>
				</article>
				<div className={'box'}>
					<Comments commentGroup={CommentGroup.ARTICLE} commentRefId={article._id} title={t('Comments')} onChange={() => refetch()} />
				</div>
			</div>
		</div>
	);
};

export default withLayoutBasic(CommunityDetail);

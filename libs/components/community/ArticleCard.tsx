import React from 'react';
import Link from 'next/link';
import moment from 'moment';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { BoardArticle } from '../../types/community';
import { imageUrl, isLiked, labelOf, memberImage } from '../../utils';
import { useTranslation } from 'next-i18next';

interface ArticleCardProps {
	article: BoardArticle;
	likeArticleHandler?: (id: string) => void;
	onRemove?: (id: string) => void;
}

const tones = ['lilac', 'peach', 'mint'];

const ArticleCard = ({ article, likeArticleHandler, onRemove }: ArticleCardProps) => {
	const { t } = useTranslation('common');
	const tone = tones[article._id.charCodeAt(article._id.length - 1) % tones.length];
	const href = { pathname: '/community/detail', query: { articleCategory: article.articleCategory, id: article._id } };

	return (
		<article className={'article-card'}>
			<Link href={href} className={`cover ${tone}`}>
				{article.articleImage ? <img src={imageUrl(article.articleImage)} alt={''} /> : <span>{t(labelOf(article.articleCategory))}</span>}
			</Link>
			<div className={'body'}>
				<span className={'cat'}>{t(labelOf(article.articleCategory))}</span>
				<Link href={href} className={'title'}>
					{article.articleTitle}
				</Link>
				<div className={'author'}>
					<img src={memberImage(article.memberData?.memberImage)} alt={''} />
					<span>
						{article.memberData?.memberNick} · {moment(article.createdAt).format('MMM D')}
					</span>
				</div>
				<div className={'stats'}>
					<span>
						<VisibilityOutlinedIcon fontSize={'inherit'} /> {article.articleViews}
					</span>
					<span>
						<ChatBubbleOutlineRoundedIcon fontSize={'inherit'} /> {article.articleComments}
					</span>
					<button
						className={isLiked(article) ? 'on' : ''}
						onClick={() => likeArticleHandler?.(article._id)}
						disabled={!likeArticleHandler}
						aria-label={t('Like article')}
						aria-pressed={isLiked(article)}
					>
						{isLiked(article) ? <FavoriteRoundedIcon fontSize={'inherit'} /> : <FavoriteBorderRoundedIcon fontSize={'inherit'} />}
						{article.articleLikes}
					</button>
					{onRemove && (
						<button className={'remove'} onClick={() => onRemove(article._id)}>
							{t('Delete')}
						</button>
					)}
				</div>
			</div>
		</article>
	);
};

export default ArticleCard;

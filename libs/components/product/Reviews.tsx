import React, { useState } from 'react';
import moment from 'moment';
import { Pagination, Rating, Stack } from '@mui/material';
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';
import ThumbUpAltRoundedIcon from '@mui/icons-material/ThumbUpAltRounded';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { GET_REVIEWS } from '../../../apollo/user/query';
import { LIKE_TARGET_REVIEW } from '../../../apollo/user/mutation';
import { Review } from '../../types/community';
import { T } from '../../types/common';
import { SkinType } from '../../enums/member.enum';
import { skinTypeList } from '../../config';
import { imageUrl, isLiked, labelOf, likeHandler, memberImage } from '../../utils';
import { useTranslation } from 'next-i18next';

interface ReviewsProps {
	productId: string;
	rating: number;
	total: number;
}

const Reviews = ({ productId, rating, total }: ReviewsProps) => {
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const [skinType, setSkinType] = useState<SkinType | null>(null);
	const [withImages, setWithImages] = useState<boolean>(false);
	const [sort, setSort] = useState<string>('createdAt');
	const [page, setPage] = useState<number>(1);
	const limit = 5;

	/** APOLLO REQUESTS **/
	const [likeTargetReview] = useMutation(LIKE_TARGET_REVIEW);
	const { data, refetch } = useQuery(GET_REVIEWS, {
		fetchPolicy: 'network-only',
		variables: {
			input: {
				page,
				limit,
				sort,
				direction: 'DESC',
				search: { productId, ...(skinType ? { reviewSkinType: skinType } : {}), ...(withImages ? { withImages: true } : {}) },
			},
		},
	});
	const reviews: Review[] = data?.getReviews?.list ?? [];
	const found: number = data?.getReviews?.metaCounter?.[0]?.total ?? 0;

	/** HANDLERS **/
	const helpfulHandler = (id: string) => likeHandler(likeTargetReview, user, id, () => refetch());

	return (
		<Stack className={'reviews'} id={'reviews'}>
			<div className={'reviews-head'}>
				<div className={'score'}>
					<b>{rating.toFixed(1)}</b>
					<Rating value={rating} precision={0.1} readOnly />
					<span>{total} {t('reviews')}</span>
				</div>
				<p>{t('Only people who bought this product can review it.')}</p>
			</div>

			<div className={'review-filters'}>
				<button className={`chip ${!skinType ? 'on' : ''}`} onClick={() => { setSkinType(null); setPage(1); }}>
					{t('All skin types')}
				</button>
				{skinTypeList.map((type) => (
					<button key={type} className={`chip ${skinType === type ? 'on' : ''}`} onClick={() => { setSkinType(type); setPage(1); }}>
						{t(labelOf(type))}
					</button>
				))}
				<button className={`chip ${withImages ? 'on' : ''}`} onClick={() => { setWithImages(!withImages); setPage(1); }} aria-pressed={withImages}>
					{t('With photos')}
				</button>
				<label className={'sort'}>
					<span className={'sr-only'}>{t('Sort reviews')}</span>
					<select value={sort} onChange={(e) => setSort(e.target.value)}>
						<option value={'createdAt'}>{t('Newest')}</option>
						<option value={'reviewLikes'}>{t('Most helpful')}</option>
						<option value={'reviewRating'}>{t('Highest rating')}</option>
					</select>
				</label>
			</div>

			{reviews.length === 0 ? (
				<div className={'empty-list'}>{t('No reviews')} {skinType ? `from ${labelOf(skinType).toLowerCase()} skin ` : ''}{t('yet.')}</div>
			) : (
				reviews.map((review) => (
					<article key={review._id} className={'review'}>
						<div className={'who'}>
							<img src={memberImage(review.memberData?.memberImage)} alt={''} />
							<span>
								<b>{review.memberData?.memberNick}</b>
								<small>
									{review.reviewSkinType ? t('{{type}} skin', { type: t(labelOf(review.reviewSkinType)) }) : t('Skin type not set')}
									{review.optionData ? ` · ${review.optionData.optionName}` : ''} · {moment(review.createdAt).format('YYYY.MM.DD')}
								</small>
							</span>
						</div>
						<Rating value={review.reviewRating} readOnly size={'small'} />
						<p>{review.reviewContent}</p>
						{review.reviewImages.length > 0 && (
							<div className={'review-images'}>
								{review.reviewImages.map((img) => (
									<img key={img} src={imageUrl(img)} alt={t('Review photo')} />
								))}
							</div>
						)}
						<button className={`helpful ${isLiked(review) ? 'on' : ''}`} onClick={() => helpfulHandler(review._id)}>
							{isLiked(review) ? <ThumbUpAltRoundedIcon fontSize={'small'} /> : <ThumbUpAltOutlinedIcon fontSize={'small'} />}
							{t('Helpful')} {review.reviewLikes > 0 ? `(${review.reviewLikes})` : ''}
						</button>
					</article>
				))
			)}

			{found > limit && (
				<Pagination page={page} count={Math.ceil(found / limit)} onChange={(e, value) => setPage(value)} shape={'circular'} color={'primary'} />
			)}
		</Stack>
	);
};

export default Reviews;

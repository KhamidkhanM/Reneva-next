import React, { useRef, useState } from 'react';
import { Dialog, DialogContent, IconButton, Rating, Stack } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import { useMutation } from '@apollo/client';
import { CREATE_REVIEW, IMAGES_UPLOADER } from '../../../apollo/user/mutation';
import { OrderItem } from '../../types/order';
import { imageUrl } from '../../utils';
import { sweetMixinErrorAlert, sweetTopSuccessAlert } from '../../sweetAlert';
import { useTranslation } from 'next-i18next';

interface ReviewFormProps {
	item: OrderItem | null;
	onClose: () => void;
	onSaved: () => void;
}

const ReviewForm = ({ item, onClose, onSaved }: ReviewFormProps) => {
	const { t } = useTranslation('common');
	const [rating, setRating] = useState<number | null>(5);
	const [content, setContent] = useState<string>('');
	const [images, setImages] = useState<string[]>([]);
	const fileRef = useRef<HTMLInputElement>(null);
	const [createReview, { loading }] = useMutation(CREATE_REVIEW);
	const [imagesUploader, { loading: uploading }] = useMutation(IMAGES_UPLOADER);

	const uploadHandler = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files ?? []).slice(0, 5 - images.length);
		e.target.value = '';
		if (!files.length) return;
		try {
			const result = await imagesUploader({ variables: { files, target: 'review' } });
			setImages([...images, ...result.data.imagesUploader]);
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const submitHandler = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!item) return;
		try {
			if (!rating) throw new Error('Please choose a rating');
			if (content.trim().length < 10) throw new Error('Please write at least 10 characters');
			await createReview({ variables: { input: { orderItemId: item._id, reviewRating: rating, reviewContent: content.trim(), reviewImages: images } } });
			setContent('');
			setImages([]);
			onSaved();
			await sweetTopSuccessAlert(images.length ? 'Thanks! You earned 3,000P' : 'Thanks! You earned 1,000P');
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	return (
		<Dialog open={!!item} onClose={onClose} fullWidth maxWidth={'sm'} PaperProps={{ className: 'review-dialog' }}>
			<DialogContent>
				<form onSubmit={submitHandler}>
					<Stack gap={'16px'}>
						<div className={'dialog-head'}>
							<h2>{t('Write a review')}</h2>
							<IconButton aria-label={t('Close')} onClick={onClose}>
								<CloseRoundedIcon />
							</IconButton>
						</div>
						<p className={'item-name'}>
							{item?.itemTitle} {item?.itemOptionName ? `· ${item.itemOptionName}` : ''}
						</p>
						<div className={'rating'}>
							<span>{t('Your rating')}</span>
							<Rating value={rating} onChange={(e, value) => setRating(value)} size={'large'} />
						</div>
						<label className={'field'}>
							<span>{t('How did it work for your skin?')}</span>
							<textarea value={content} onChange={(e) => setContent(e.target.value)} minLength={10} maxLength={1000} rows={5} placeholder={t('Texture, scent, how your skin felt after a week…')} />
						</label>
						<div className={'photos'}>
							{images.map((img) => (
								<img key={img} src={imageUrl(img)} alt={t('Review photo')} />
							))}
							{images.length < 5 && (
								<button type={'button'} className={'add-photo'} onClick={() => fileRef.current?.click()} disabled={uploading}>
									<AddPhotoAlternateOutlinedIcon />
									{t('Photo')}
								</button>
							)}
							<input ref={fileRef} type={'file'} multiple accept={'image/png,image/jpeg'} hidden onChange={uploadHandler} />
						</div>
						<p className={'hint'}>{t('Photo reviews earn 3,000P, text reviews 1,000P.')}</p>
						<button type={'submit'} className={'primary-btn'} disabled={loading}>
							{t('Post review')}
						</button>
					</Stack>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default ReviewForm;

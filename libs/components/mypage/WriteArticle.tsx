import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Stack } from '@mui/material';
import { useMutation } from '@apollo/client';
import { CREATE_BOARD_ARTICLE, IMAGE_UPLOADER } from '../../../apollo/user/mutation';
import { BoardArticleCategory } from '../../enums/board-article.enum';
import { imageUrl, labelOf } from '../../utils';
import { Messages } from '../../config';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';

// members write in these boards; NEWS and EVENT are for the Reneva team
const boards = [BoardArticleCategory.FREE, BoardArticleCategory.BEAUTY_TIP, BoardArticleCategory.ROUTINE];

const WriteArticle = () => {
	const router = useRouter();
	const [form, setForm] = useState({ articleCategory: BoardArticleCategory.FREE, articleTitle: '', articleContent: '', articleImage: '' });

	/** APOLLO REQUESTS **/
	const [createBoardArticle, { loading }] = useMutation(CREATE_BOARD_ARTICLE);
	const [imageUploader] = useMutation(IMAGE_UPLOADER);

	const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
		try {
			const file = e.target.files?.[0];
			if (!file) return;
			if (!['image/png', 'image/jpg', 'image/jpeg'].includes(file.type)) throw new Error(Messages.error5);
			const result = await imageUploader({ variables: { file, target: 'article' } });
			setForm({ ...form, articleImage: result.data.imageUploader });
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const submitHandler = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			if (!form.articleTitle.trim() || !form.articleContent.trim()) throw new Error(Messages.error3);
			const input: any = { ...form };
			if (!input.articleImage) delete input.articleImage;
			const result = await createBoardArticle({ variables: { input } });
			await sweetTopSmallSuccessAlert('Article posted', 900);
			await router.push({ pathname: '/community/detail', query: { articleCategory: form.articleCategory, id: result.data.createBoardArticle._id } });
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	return (
		<form className={'my-section'} onSubmit={submitHandler}>
			<div className={'section-head'}>
				<h2>Write article</h2>
				<p>Share a routine, a tip or an honest product story.</p>
			</div>
			<div className={'box'}>
				<span className={'label'}>Board</span>
				<Stack className={'chips'}>
					{boards.map((board) => (
						<button
							type={'button'}
							key={board}
							className={`chip ${form.articleCategory === board ? 'on' : ''}`}
							onClick={() => setForm({ ...form, articleCategory: board })}
						>
							{labelOf(board)}
						</button>
					))}
				</Stack>
				<label className={'field'}>
					<span>Title</span>
					<input value={form.articleTitle} onChange={(e) => setForm({ ...form, articleTitle: e.target.value })} maxLength={100} required />
				</label>
				<label className={'field'}>
					<span>Content</span>
					<textarea rows={10} value={form.articleContent} onChange={(e) => setForm({ ...form, articleContent: e.target.value })} required />
				</label>
				<div className={'upload-row'}>
					{form.articleImage && <img src={imageUrl(form.articleImage)} alt={''} />}
					<label className={'soft-btn'}>
						{form.articleImage ? 'Change cover photo' : 'Add cover photo'}
						<input type={'file'} hidden accept={'image/png, image/jpg, image/jpeg'} onChange={uploadImage} />
					</label>
				</div>
			</div>
			<div className={'actions'}>
				<button type={'submit'} className={'primary-btn'} disabled={loading}>
					Post article
				</button>
			</div>
		</form>
	);
};

export default WriteArticle;

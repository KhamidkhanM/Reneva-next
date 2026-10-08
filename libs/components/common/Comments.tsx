import React, { useState } from 'react';
import moment from 'moment';
import { Pagination, Stack } from '@mui/material';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { GET_COMMENTS } from '../../../apollo/user/query';
import { CREATE_COMMENT, UPDATE_COMMENT } from '../../../apollo/user/mutation';
import { Comment } from '../../types/community';
import { CommentGroup, CommentStatus } from '../../enums/comment.enum';
import { memberImage } from '../../utils';
import { Messages } from '../../config';
import { sweetConfirmAlert, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { useTranslation } from 'next-i18next';

interface CommentsProps {
	commentGroup: CommentGroup;
	commentRefId: string;
	title?: string;
	placeholder?: string;
	onChange?: () => void;
}

// used for product Q&A, community articles and member pages
const Comments = ({ commentGroup, commentRefId, title = 'Comments', placeholder = 'Write a comment', onChange }: CommentsProps) => {
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const [text, setText] = useState<string>('');
	const [page, setPage] = useState<number>(1);
	const limit = 5;

	/** APOLLO REQUESTS **/
	const [createComment] = useMutation(CREATE_COMMENT);
	const [updateComment] = useMutation(UPDATE_COMMENT);
	const { data, refetch } = useQuery(GET_COMMENTS, {
		fetchPolicy: 'network-only',
		variables: { input: { page, limit, sort: 'createdAt', direction: 'DESC', search: { commentRefId } } },
		skip: !commentRefId,
	});
	const comments: Comment[] = data?.getComments?.list ?? [];
	const total: number = data?.getComments?.metaCounter?.[0]?.total ?? 0;

	/** HANDLERS **/
	const createHandler = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			if (!user._id) throw new Error(Messages.error2);
			if (!text.trim()) throw new Error(Messages.error4);
			await createComment({ variables: { input: { commentGroup, commentRefId, commentContent: text.trim() } } });
			setText('');
			setPage(1);
			await refetch({ input: { page: 1, limit, sort: 'createdAt', direction: 'DESC', search: { commentRefId } } });
			onChange?.();
			await sweetTopSmallSuccessAlert('Posted', 700);
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const deleteHandler = async (id: string) => {
		if (!(await sweetConfirmAlert('Delete this comment?'))) return;
		try {
			await updateComment({ variables: { input: { _id: id, commentStatus: CommentStatus.DELETE } } });
			await refetch();
			onChange?.();
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	return (
		<Stack className={'comments'}>
			<h3>
				{title} <span>{total}</span>
			</h3>
			<form className={'comment-form'} onSubmit={createHandler}>
				<label className={'sr-only'} htmlFor={`comment-${commentRefId}`}>
					{placeholder}
				</label>
				<textarea
					id={`comment-${commentRefId}`}
					value={text}
					maxLength={500}
					placeholder={user._id ? placeholder : t('Login to write')}
					disabled={!user._id}
					onChange={(e) => setText(e.target.value)}
				/>
				<button type={'submit'} className={'primary-btn'} disabled={!user._id || !text.trim()}>
					{t('Post')}
				</button>
			</form>
			{comments.length === 0 ? (
				<div className={'empty-list'}>{t('Nothing here yet.')}</div>
			) : (
				comments.map((comment) => (
					<div key={comment._id} className={'comment'}>
						<img src={memberImage(comment.memberData?.memberImage)} alt={''} />
						<div className={'body'}>
							<div className={'row'}>
								<b>
									{comment.memberData?.memberNick}
									{comment.memberData?.memberType === 'SELLER' && <span className={'tag-pill'}>{t('Seller')}</span>}
									{comment.memberData?.memberType === 'ADMIN' && <span className={'tag-pill'}>{t('Reneva')}</span>}
								</b>
								<small>{moment(comment.createdAt).fromNow()}</small>
							</div>
							<p>{comment.commentContent}</p>
							{comment.memberId === user._id && (
								<button className={'link-btn'} onClick={() => deleteHandler(comment._id)}>
									{t('Delete')}
								</button>
							)}
						</div>
					</div>
				))
			)}
			{total > limit && (
				<Pagination page={page} count={Math.ceil(total / limit)} onChange={(e, value) => setPage(value)} shape={'circular'} color={'primary'} />
			)}
		</Stack>
	);
};

export default Comments;

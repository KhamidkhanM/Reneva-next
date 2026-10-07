import React, { useState } from 'react';
import { NextPage } from 'next';
import moment from 'moment';
import { Stack } from '@mui/material';
import { useMutation, useQuery } from '@apollo/client';
import withAdminLayout from '../../libs/components/layout/LayoutAdmin';
import AdminPager from '../../libs/components/admin/AdminPager';
import { adminStaticProps } from '../../libs/components/admin/adminStatic';
import { GET_ALL_NOTICES_BY_ADMIN } from '../../apollo/admin/query';
import { CREATE_NOTICE, UPDATE_NOTICE } from '../../apollo/admin/mutation';
import { Notice } from '../../libs/types/community';
import { NoticeCategory, NoticeStatus } from '../../libs/enums/notice.enum';
import { T } from '../../libs/types/common';
import { labelOf } from '../../libs/utils';
import { Messages } from '../../libs/config';
import { sweetConfirmAlert, sweetErrorHandlingForAdmin, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';

export const getStaticProps = adminStaticProps;

const empty = { _id: '', noticeCategory: NoticeCategory.FAQ, noticeTitle: '', noticeContent: '', noticeStatus: NoticeStatus.ACTIVE };

const AdminCs: NextPage = () => {
	const [inquiry, setInquiry] = useState<T>({ page: 1, limit: 10, search: {} });
	const [form, setForm] = useState({ ...empty });
	const [open, setOpen] = useState<boolean>(false);

	/** APOLLO REQUESTS **/
	const [createNotice, { loading: creating }] = useMutation(CREATE_NOTICE);
	const [updateNotice, { loading: updating }] = useMutation(UPDATE_NOTICE);
	const { data, refetch } = useQuery(GET_ALL_NOTICES_BY_ADMIN, { fetchPolicy: 'network-only', variables: { input: inquiry } });
	const notices: Notice[] = (data?.getAllNoticesByAdmin?.list ?? []).filter((ele: Notice) => ele.noticeStatus !== NoticeStatus.DELETE);
	const total: number = data?.getAllNoticesByAdmin?.metaCounter?.[0]?.total ?? 0;

	/** HANDLERS **/
	const submitHandler = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			if (!form.noticeTitle.trim() || !form.noticeContent.trim()) throw new Error(Messages.error3);
			const { _id, ...input } = form;
			if (_id) await updateNotice({ variables: { input: { _id, ...input } } });
			else await createNotice({ variables: { input } });
			setForm({ ...empty });
			setOpen(false);
			await refetch();
			await sweetTopSmallSuccessAlert(_id ? 'Saved' : 'Posted', 800);
		} catch (err: any) {
			sweetErrorHandlingForAdmin(err).then();
		}
	};

	const editHandler = (notice: Notice) => {
		setForm({
			_id: notice._id,
			noticeCategory: notice.noticeCategory,
			noticeTitle: notice.noticeTitle,
			noticeContent: notice.noticeContent,
			noticeStatus: notice.noticeStatus,
		});
		setOpen(true);
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	const statusHandler = async (notice: Notice, noticeStatus: NoticeStatus) => {
		try {
			if (noticeStatus === NoticeStatus.DELETE && !(await sweetConfirmAlert('Delete this post?'))) return;
			await updateNotice({ variables: { input: { _id: notice._id, noticeStatus } } });
			await refetch();
		} catch (err: any) {
			sweetErrorHandlingForAdmin(err).then();
		}
	};

	return (
		<div className={'admin-page'}>
			<div className={'admin-head'}>
				<h2>Notices & FAQ</h2>
				<p>Active posts show on the CS page. Hold keeps a draft hidden.</p>
				{!open && (
					<button className={'primary-btn'} onClick={() => setOpen(true)}>
						+ New post
					</button>
				)}
			</div>

			{open && (
				<form className={'box'} onSubmit={submitHandler}>
					<h2>{form._id ? 'Edit post' : 'New post'}</h2>
					<div className={'form-grid'}>
						<label className={'field'}>
							<span>Category</span>
							<select value={form.noticeCategory} onChange={(e) => setForm({ ...form, noticeCategory: e.target.value as NoticeCategory })}>
								{Object.values(NoticeCategory).map((ele) => (
									<option key={ele} value={ele}>
										{ele === NoticeCategory.EVENT ? 'Notice / event' : labelOf(ele)}
									</option>
								))}
							</select>
						</label>
						<label className={'field'}>
							<span>Status</span>
							<select value={form.noticeStatus} onChange={(e) => setForm({ ...form, noticeStatus: e.target.value as NoticeStatus })}>
								<option value={NoticeStatus.ACTIVE}>Active</option>
								<option value={NoticeStatus.HOLD}>Hold</option>
							</select>
						</label>
						<label className={'field wide'}>
							<span>{form.noticeCategory === NoticeCategory.FAQ ? 'Question' : 'Title'}</span>
							<input value={form.noticeTitle} onChange={(e) => setForm({ ...form, noticeTitle: e.target.value })} required />
						</label>
						<label className={'field wide'}>
							<span>{form.noticeCategory === NoticeCategory.FAQ ? 'Answer' : 'Content'}</span>
							<textarea rows={6} value={form.noticeContent} onChange={(e) => setForm({ ...form, noticeContent: e.target.value })} required />
						</label>
					</div>
					<div className={'btns'}>
						<button type={'submit'} className={'primary-btn'} disabled={creating || updating}>
							{form._id ? 'Save' : 'Post'}
						</button>
						<button
							type={'button'}
							className={'ghost-btn'}
							onClick={() => {
								setForm({ ...empty });
								setOpen(false);
							}}
						>
							Cancel
						</button>
					</div>
				</form>
			)}

			<Stack className={'chips'}>
				<button className={`chip ${!inquiry.search.noticeCategory ? 'on' : ''}`} onClick={() => setInquiry({ ...inquiry, page: 1, search: {} })}>
					All
				</button>
				{Object.values(NoticeCategory).map((ele) => (
					<button
						key={ele}
						className={`chip ${inquiry.search.noticeCategory === ele ? 'on' : ''}`}
						onClick={() => setInquiry({ ...inquiry, page: 1, search: { noticeCategory: ele } })}
					>
						{labelOf(ele)}
					</button>
				))}
			</Stack>
			<div className={'table-box'}>
				<table>
					<thead>
						<tr>
							<th>Title</th>
							<th>Category</th>
							<th>Date</th>
							<th>Status</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{notices.map((notice) => (
							<tr key={notice._id}>
								<td>
									<b>{notice.noticeTitle}</b>
								</td>
								<td>{labelOf(notice.noticeCategory)}</td>
								<td>{moment(notice.createdAt).format('YY.MM.DD')}</td>
								<td>
									<span className={`status-pill ${notice.noticeStatus}`}>{labelOf(notice.noticeStatus)}</span>
								</td>
								<td className={'row-btns'}>
									<button className={'ghost-btn small'} onClick={() => editHandler(notice)}>
										Edit
									</button>
									<button
										className={'ghost-btn small'}
										onClick={() => statusHandler(notice, notice.noticeStatus === NoticeStatus.ACTIVE ? NoticeStatus.HOLD : NoticeStatus.ACTIVE)}
									>
										{notice.noticeStatus === NoticeStatus.ACTIVE ? 'Hold' : 'Publish'}
									</button>
									<button className={'ghost-btn small danger'} onClick={() => statusHandler(notice, NoticeStatus.DELETE)}>
										Delete
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
				{notices.length === 0 && <div className={'no-data'}>No posts here.</div>}
			</div>
			<AdminPager page={inquiry.page} limit={inquiry.limit} total={total} onChange={(page) => setInquiry({ ...inquiry, page })} />
		</div>
	);
};

export default withAdminLayout(AdminCs);

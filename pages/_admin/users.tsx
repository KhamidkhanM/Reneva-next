import React, { useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import moment from 'moment';
import { Stack } from '@mui/material';
import { useMutation, useQuery } from '@apollo/client';
import withAdminLayout from '../../libs/components/layout/LayoutAdmin';
import AdminPager from '../../libs/components/admin/AdminPager';
import { adminStaticProps } from '../../libs/components/admin/adminStatic';
import { GET_ALL_MEMBERS_BY_ADMIN } from '../../apollo/admin/query';
import { UPDATE_MEMBER_BY_ADMIN } from '../../apollo/admin/mutation';
import { Member } from '../../libs/types/member';
import { MemberLevel, MemberStatus, MemberType } from '../../libs/enums/member.enum';
import { T } from '../../libs/types/common';
import { labelOf, memberImage } from '../../libs/utils';
import { sweetErrorHandlingForAdmin, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';

export const getStaticProps = adminStaticProps;

const AdminUsers: NextPage = () => {
	const [text, setText] = useState<string>('');
	const [inquiry, setInquiry] = useState<T>({ page: 1, limit: 10, sort: 'createdAt', direction: 'DESC', search: {} });

	/** APOLLO REQUESTS **/
	const [updateMemberByAdmin] = useMutation(UPDATE_MEMBER_BY_ADMIN);
	const { data, refetch } = useQuery(GET_ALL_MEMBERS_BY_ADMIN, { fetchPolicy: 'network-only', variables: { input: inquiry } });
	const members: Member[] = data?.getAllMembersByAdmin?.list ?? [];
	const total: number = data?.getAllMembersByAdmin?.metaCounter?.[0]?.total ?? 0;

	/** HANDLERS **/
	const filter = (key: string, value?: string) => {
		const search = { ...inquiry.search };
		if (value) search[key] = value;
		else delete search[key];
		setInquiry({ ...inquiry, page: 1, search });
	};

	const updateHandler = async (member: Member, input: T) => {
		try {
			await updateMemberByAdmin({ variables: { input: { _id: member._id, ...input } } });
			await refetch();
			await sweetTopSmallSuccessAlert('Updated', 700);
		} catch (err: any) {
			sweetErrorHandlingForAdmin(err).then();
		}
	};

	return (
		<div className={'admin-page'}>
			<div className={'admin-head'}>
				<h2>Members</h2>
				<form
					className={'search'}
					onSubmit={(e) => {
						e.preventDefault();
						filter('text', text.trim());
					}}
				>
					<input type={'search'} value={text} onChange={(e) => setText(e.target.value)} placeholder={'Search nickname'} aria-label={'Search nickname'} />
					<button type={'submit'} className={'primary-btn'}>
						Search
					</button>
				</form>
			</div>
			<Stack className={'chips'}>
				<button className={`chip ${!inquiry.search.memberType ? 'on' : ''}`} onClick={() => filter('memberType')}>
					All
				</button>
				{Object.values(MemberType).map((type) => (
					<button key={type} className={`chip ${inquiry.search.memberType === type ? 'on' : ''}`} onClick={() => filter('memberType', type)}>
						{labelOf(type)}
					</button>
				))}
				<span className={'divider'} />
				{Object.values(MemberStatus).map((status) => (
					<button
						key={status}
						className={`chip ${inquiry.search.memberStatus === status ? 'on' : ''}`}
						onClick={() => filter('memberStatus', inquiry.search.memberStatus === status ? undefined : status)}
					>
						{labelOf(status)}
					</button>
				))}
			</Stack>
			<div className={'table-box'}>
				<table>
					<thead>
						<tr>
							<th>Member</th>
							<th>Phone</th>
							<th>Joined</th>
							<th>Orders</th>
							<th>Type</th>
							<th>Level</th>
							<th>Status</th>
						</tr>
					</thead>
					<tbody>
						{members.map((member) => (
							<tr key={member._id}>
								<td>
									<Link href={{ pathname: '/member', query: { memberId: member._id } }} className={'cell-member'}>
										<img src={memberImage(member.memberImage)} alt={''} />
										<span>
											<b>{member.memberNick}</b>
											<small>{member.memberPoints}P</small>
										</span>
									</Link>
								</td>
								<td>{member.memberPhone}</td>
								<td>{moment(member.createdAt).format('YY.MM.DD')}</td>
								<td>{member.memberOrders}</td>
								<td>
									<select aria-label={'Member type'} value={member.memberType} onChange={(e) => updateHandler(member, { memberType: e.target.value })}>
										{Object.values(MemberType).map((ele) => (
											<option key={ele} value={ele}>
												{labelOf(ele)}
											</option>
										))}
									</select>
								</td>
								<td>
									<select aria-label={'Member level'} value={member.memberLevel} onChange={(e) => updateHandler(member, { memberLevel: e.target.value })}>
										{Object.values(MemberLevel).map((ele) => (
											<option key={ele} value={ele}>
												{labelOf(ele)}
											</option>
										))}
									</select>
								</td>
								<td>
									<select
										aria-label={'Member status'}
										className={`status-select ${member.memberStatus}`}
										value={member.memberStatus}
										onChange={(e) => updateHandler(member, { memberStatus: e.target.value })}
									>
										{Object.values(MemberStatus).map((ele) => (
											<option key={ele} value={ele}>
												{labelOf(ele)}
											</option>
										))}
									</select>
								</td>
							</tr>
						))}
					</tbody>
				</table>
				{members.length === 0 && <div className={'no-data'}>No members found.</div>}
			</div>
			<AdminPager page={inquiry.page} limit={inquiry.limit} total={total} onChange={(page) => setInquiry({ ...inquiry, page })} />
		</div>
	);
};

export default withAdminLayout(AdminUsers);

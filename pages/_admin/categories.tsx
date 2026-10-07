import React, { useState } from 'react';
import { NextPage } from 'next';
import { useMutation, useQuery } from '@apollo/client';
import withAdminLayout from '../../libs/components/layout/LayoutAdmin';
import { adminStaticProps } from '../../libs/components/admin/adminStatic';
import { GET_ALL_CATEGORIES_BY_ADMIN } from '../../apollo/admin/query';
import { CREATE_CATEGORY, UPDATE_CATEGORY } from '../../apollo/admin/mutation';
import { Category } from '../../libs/types/product';
import { CategoryStatus } from '../../libs/enums/category.enum';
import { T } from '../../libs/types/common';
import { labelOf } from '../../libs/utils';
import { Messages } from '../../libs/config';
import { sweetErrorHandlingForAdmin, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';

export const getStaticProps = adminStaticProps;

const slugify = (text: string) =>
	text
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');

const empty = { categoryName: '', categorySlug: '', categoryParentId: '', categoryOrder: '0' };

const AdminCategories: NextPage = () => {
	const [form, setForm] = useState({ ...empty });

	/** APOLLO REQUESTS **/
	const [createCategory, { loading }] = useMutation(CREATE_CATEGORY);
	const [updateCategory] = useMutation(UPDATE_CATEGORY);
	const { data, refetch } = useQuery(GET_ALL_CATEGORIES_BY_ADMIN, { fetchPolicy: 'network-only' });
	const categories: Category[] = data?.getAllCategoriesByAdmin ?? [];
	const parents = categories.filter((ele) => !ele.categoryParentId);
	const childrenOf = (id: string) => categories.filter((ele) => ele.categoryParentId === id);

	/** HANDLERS **/
	const createHandler = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			if (!form.categoryName.trim()) throw new Error(Messages.error3);
			const input: T = {
				categoryName: form.categoryName.trim(),
				categorySlug: form.categorySlug || slugify(form.categoryName),
				categoryOrder: Number(form.categoryOrder || 0),
			};
			if (form.categoryParentId) input.categoryParentId = form.categoryParentId;
			await createCategory({ variables: { input } });
			setForm({ ...empty });
			await refetch();
			await sweetTopSmallSuccessAlert('Category added', 800);
		} catch (err: any) {
			sweetErrorHandlingForAdmin(err).then();
		}
	};

	const updateHandler = async (category: Category, input: T) => {
		try {
			await updateCategory({ variables: { input: { _id: category._id, ...input } } });
			await refetch();
		} catch (err: any) {
			sweetErrorHandlingForAdmin(err).then();
		}
	};

	const row = (category: Category, child = false) => (
		<tr key={category._id} className={child ? 'child' : ''}>
			<td>
				<input
					aria-label={'Category name'}
					defaultValue={category.categoryName}
					onBlur={(e) => e.target.value.trim() && e.target.value !== category.categoryName && updateHandler(category, { categoryName: e.target.value.trim() })}
				/>
			</td>
			<td>
				<code>{category.categorySlug}</code>
			</td>
			<td>
				<input
					aria-label={'Order'}
					type={'number'}
					className={'short'}
					defaultValue={category.categoryOrder}
					onBlur={(e) => Number(e.target.value) !== category.categoryOrder && updateHandler(category, { categoryOrder: Number(e.target.value) })}
				/>
			</td>
			<td>
				<select
					aria-label={'Category status'}
					className={`status-select ${category.categoryStatus}`}
					value={category.categoryStatus}
					onChange={(e) => updateHandler(category, { categoryStatus: e.target.value })}
				>
					{Object.values(CategoryStatus).map((ele) => (
						<option key={ele} value={ele}>
							{labelOf(ele)}
						</option>
					))}
				</select>
			</td>
		</tr>
	);

	return (
		<div className={'admin-page'}>
			<div className={'admin-head'}>
				<h2>Categories</h2>
				<p>Main categories show in the shop menu; sub categories hold the products. Edit a name or order and click away to save.</p>
			</div>
			<form className={'box'} onSubmit={createHandler}>
				<h2>New category</h2>
				<div className={'form-grid'}>
					<label className={'field'}>
						<span>Name</span>
						<input
							value={form.categoryName}
							onChange={(e) => setForm({ ...form, categoryName: e.target.value, categorySlug: slugify(e.target.value) })}
							placeholder={'Serums'}
							required
						/>
					</label>
					<label className={'field'}>
						<span>Slug</span>
						<input value={form.categorySlug} onChange={(e) => setForm({ ...form, categorySlug: slugify(e.target.value) })} />
					</label>
					<label className={'field'}>
						<span>Parent</span>
						<select value={form.categoryParentId} onChange={(e) => setForm({ ...form, categoryParentId: e.target.value })}>
							<option value={''}>None (main category)</option>
							{parents.map((parent) => (
								<option key={parent._id} value={parent._id}>
									{parent.categoryName}
								</option>
							))}
						</select>
					</label>
					<label className={'field'}>
						<span>Order</span>
						<input type={'number'} value={form.categoryOrder} onChange={(e) => setForm({ ...form, categoryOrder: e.target.value })} />
					</label>
				</div>
				<div className={'btns'}>
					<button type={'submit'} className={'primary-btn'} disabled={loading}>
						Add category
					</button>
				</div>
			</form>
			<div className={'table-box'}>
				<table>
					<thead>
						<tr>
							<th>Name</th>
							<th>Slug</th>
							<th>Order</th>
							<th>Status</th>
						</tr>
					</thead>
					<tbody>
						{parents.map((parent) => (
							<React.Fragment key={parent._id}>
								{row(parent)}
								{childrenOf(parent._id).map((child) => row(child, true))}
							</React.Fragment>
						))}
					</tbody>
				</table>
				{categories.length === 0 && <div className={'no-data'}>No categories yet.</div>}
			</div>
		</div>
	);
};

export default withAdminLayout(AdminCategories);

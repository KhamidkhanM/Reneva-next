import React, { useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { Stack } from '@mui/material';
import { useMutation, useQuery } from '@apollo/client';
import withAdminLayout from '../../libs/components/layout/LayoutAdmin';
import AdminPager from '../../libs/components/admin/AdminPager';
import { BrandCircle } from '../../libs/components/homepage/TopBrands';
import { adminStaticProps } from '../../libs/components/admin/adminStatic';
import { GET_ALL_BRANDS_BY_ADMIN } from '../../apollo/admin/query';
import { REMOVE_BRAND_BY_ADMIN } from '../../apollo/admin/mutation';
import { UPDATE_BRAND } from '../../apollo/user/mutation';
import { Brand } from '../../libs/types/product';
import { BrandStatus } from '../../libs/enums/brand.enum';
import { T } from '../../libs/types/common';
import { labelOf } from '../../libs/utils';
import { sweetConfirmAlert, sweetErrorHandlingForAdmin, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';

export const getStaticProps = adminStaticProps;

const AdminBrands: NextPage = () => {
	const [inquiry, setInquiry] = useState<T>({ page: 1, limit: 10, sort: 'createdAt', direction: 'DESC', search: {} });

	/** APOLLO REQUESTS **/
	const [updateBrand] = useMutation(UPDATE_BRAND);
	const [removeBrandByAdmin] = useMutation(REMOVE_BRAND_BY_ADMIN);
	const { data, refetch } = useQuery(GET_ALL_BRANDS_BY_ADMIN, { fetchPolicy: 'network-only', variables: { input: inquiry } });
	const brands: Brand[] = data?.getAllBrandsByAdmin?.list ?? [];
	const total: number = data?.getAllBrandsByAdmin?.metaCounter?.[0]?.total ?? 0;

	/** HANDLERS **/
	const statusHandler = async (brand: Brand, brandStatus: string) => {
		try {
			await updateBrand({ variables: { input: { _id: brand._id, brandStatus } } });
			await refetch();
			await sweetTopSmallSuccessAlert('Updated', 700);
		} catch (err: any) {
			sweetErrorHandlingForAdmin(err).then();
		}
	};

	const removeHandler = async (brand: Brand) => {
		try {
			if (!(await sweetConfirmAlert('Remove this brand for good?'))) return;
			await removeBrandByAdmin({ variables: { input: brand._id } });
			await refetch();
		} catch (err: any) {
			sweetErrorHandlingForAdmin(err).then();
		}
	};

	return (
		<div className={'admin-page'}>
			<div className={'admin-head'}>
				<h2>Brands</h2>
				<p>A brand can be removed only when it is set to Delete and has no products.</p>
			</div>
			<Stack className={'chips'}>
				<button className={`chip ${!inquiry.search.brandStatus ? 'on' : ''}`} onClick={() => setInquiry({ ...inquiry, page: 1, search: {} })}>
					All
				</button>
				{Object.values(BrandStatus).map((status) => (
					<button
						key={status}
						className={`chip ${inquiry.search.brandStatus === status ? 'on' : ''}`}
						onClick={() => setInquiry({ ...inquiry, page: 1, search: { brandStatus: status } })}
					>
						{labelOf(status)}
					</button>
				))}
			</Stack>
			<div className={'table-box'}>
				<table>
					<thead>
						<tr>
							<th>Brand</th>
							<th>Owner</th>
							<th>Products</th>
							<th>Followers</th>
							<th>Status</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{brands.map((brand, index) => (
							<tr key={brand._id}>
								<td>
									<Link href={{ pathname: '/brand/detail', query: { id: brand._id } }} className={'cell-product'}>
										<BrandCircle brand={brand} index={index} size={44} />
										<span>
											<b>{brand.brandName}</b>
											<small>{brand.brandCountry}</small>
										</span>
									</Link>
								</td>
								<td>{brand.memberData?.memberNick}</td>
								<td>{brand.brandProducts}</td>
								<td>{brand.brandLikes}</td>
								<td>
									<select
										aria-label={'Brand status'}
										className={`status-select ${brand.brandStatus}`}
										value={brand.brandStatus}
										onChange={(e) => statusHandler(brand, e.target.value)}
									>
										{Object.values(BrandStatus).map((ele) => (
											<option key={ele} value={ele}>
												{labelOf(ele)}
											</option>
										))}
									</select>
								</td>
								<td className={'row-btns'}>
									{brand.brandStatus === BrandStatus.DELETE && brand.brandProducts === 0 && (
										<button className={'ghost-btn small danger'} onClick={() => removeHandler(brand)}>
											Remove
										</button>
									)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
				{brands.length === 0 && <div className={'no-data'}>No brands found.</div>}
			</div>
			<AdminPager page={inquiry.page} limit={inquiry.limit} total={total} onChange={(page) => setInquiry({ ...inquiry, page })} />
		</div>
	);
};

export default withAdminLayout(AdminBrands);

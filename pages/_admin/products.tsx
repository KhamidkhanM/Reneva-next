import React, { useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { Stack } from '@mui/material';
import { useMutation, useQuery } from '@apollo/client';
import withAdminLayout from '../../libs/components/layout/LayoutAdmin';
import AdminPager from '../../libs/components/admin/AdminPager';
import ProductThumb from '../../libs/components/common/ProductThumb';
import { adminStaticProps } from '../../libs/components/admin/adminStatic';
import { GET_ALL_PRODUCTS_BY_ADMIN } from '../../apollo/admin/query';
import { REMOVE_PRODUCT_BY_ADMIN } from '../../apollo/admin/mutation';
import { UPDATE_PRODUCT } from '../../apollo/user/mutation';
import { Product } from '../../libs/types/product';
import { ProductStatus } from '../../libs/enums/product.enum';
import { T } from '../../libs/types/common';
import { formatKRW, imageUrl, labelOf } from '../../libs/utils';
import { sweetConfirmAlert, sweetErrorHandlingForAdmin, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { useTranslation } from 'next-i18next';

export const getStaticProps = adminStaticProps;

const AdminProducts: NextPage = () => {
	const { t } = useTranslation('common');
	const [inquiry, setInquiry] = useState<T>({ page: 1, limit: 10, sort: 'createdAt', direction: 'DESC', search: {} });

	/** APOLLO REQUESTS **/
	const [updateProduct] = useMutation(UPDATE_PRODUCT);
	const [removeProductByAdmin] = useMutation(REMOVE_PRODUCT_BY_ADMIN);
	const { data, refetch } = useQuery(GET_ALL_PRODUCTS_BY_ADMIN, { fetchPolicy: 'network-only', variables: { input: inquiry } });
	const products: Product[] = data?.getAllProductsByAdmin?.list ?? [];
	const total: number = data?.getAllProductsByAdmin?.metaCounter?.[0]?.total ?? 0;

	/** HANDLERS **/
	const statusHandler = async (product: Product, productStatus: string) => {
		try {
			await updateProduct({ variables: { input: { _id: product._id, productStatus } } });
			await refetch();
			await sweetTopSmallSuccessAlert('Updated', 700);
		} catch (err: any) {
			sweetErrorHandlingForAdmin(err).then();
		}
	};

	const removeHandler = async (product: Product) => {
		try {
			if (!(await sweetConfirmAlert('Remove this product for good?'))) return;
			await removeProductByAdmin({ variables: { input: product._id } });
			await refetch();
		} catch (err: any) {
			sweetErrorHandlingForAdmin(err).then();
		}
	};

	return (
		<div className={'admin-page'}>
			<div className={'admin-head'}>
				<h2>{t('Products')}</h2>
				<p>{t('Set a product to Delete first, then you can remove it for good.')}</p>
			</div>
			<Stack className={'chips'}>
				<button className={`chip ${!inquiry.search.productStatus ? 'on' : ''}`} onClick={() => setInquiry({ ...inquiry, page: 1, search: {} })}>
					{t('All')}
				</button>
				{Object.values(ProductStatus).map((status) => (
					<button
						key={status}
						className={`chip ${inquiry.search.productStatus === status ? 'on' : ''}`}
						onClick={() => setInquiry({ ...inquiry, page: 1, search: { productStatus: status } })}
					>
						{t(labelOf(status))}
					</button>
				))}
			</Stack>
			<div className={'table-box'}>
				<table>
					<thead>
						<tr>
							<th>{t('Product')}</th>
							<th>{t('Price')}</th>
							<th>{t('Sold')}</th>
							<th>{t('Views')}</th>
							<th>{t('Status')}</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{products.map((product) => (
							<tr key={product._id}>
								<td>
									<Link href={{ pathname: '/product/detail', query: { id: product._id } }} className={'cell-product'}>
										<ProductThumb image={imageUrl(product.productImages?.[0])} seed={product._id} size={44} radius={12} />
										<span>
											<b>{product.productTitle}</b>
											<small>{product.brandData?.brandName}</small>
										</span>
									</Link>
								</td>
								<td>{formatKRW(product.productSalePrice)}</td>
								<td>{product.productSold}</td>
								<td>{product.productViews}</td>
								<td>
									<select
										aria-label={t('Product status')}
										className={`status-select ${product.productStatus}`}
										value={product.productStatus}
										onChange={(e) => statusHandler(product, e.target.value)}
									>
										{Object.values(ProductStatus).map((ele) => (
											<option key={ele} value={ele}>
												{t(labelOf(ele))}
											</option>
										))}
									</select>
								</td>
								<td className={'row-btns'}>
									{product.productStatus === ProductStatus.DELETE && (
										<button className={'ghost-btn small danger'} onClick={() => removeHandler(product)}>
											{t('Remove')}
										</button>
									)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
				{products.length === 0 && <div className={'no-data'}>{t('No products found.')}</div>}
			</div>
			<AdminPager page={inquiry.page} limit={inquiry.limit} total={total} onChange={(page) => setInquiry({ ...inquiry, page })} />
		</div>
	);
};

export default withAdminLayout(AdminProducts);

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Pagination, Stack } from '@mui/material';
import { useMutation, useQuery } from '@apollo/client';
import { GET_SELLER_PRODUCTS } from '../../../apollo/user/query';
import { UPDATE_PRODUCT } from '../../../apollo/user/mutation';
import { Product } from '../../types/product';
import { ProductStatus } from '../../enums/product.enum';
import { formatPrice, imageUrl, labelOf } from '../../utils';
import ProductThumb from '../common/ProductThumb';
import { sweetConfirmAlert, sweetMixinErrorAlert } from '../../sweetAlert';

const tabs = ['', ProductStatus.ACTIVE, ProductStatus.SOLDOUT, ProductStatus.HIDE];

const MyProducts = () => {
	const router = useRouter();
	const [status, setStatus] = useState<string>('');
	const [page, setPage] = useState<number>(1);
	const limit = 8;

	/** APOLLO REQUESTS **/
	const [updateProduct] = useMutation(UPDATE_PRODUCT);
	const { data, refetch } = useQuery(GET_SELLER_PRODUCTS, {
		fetchPolicy: 'network-only',
		variables: { input: { page, limit, sort: 'createdAt', direction: 'DESC', search: status ? { productStatus: status } : {} } },
	});
	const products: Product[] = data?.getSellerProducts?.list ?? [];
	const total: number = data?.getSellerProducts?.metaCounter?.[0]?.total ?? 0;

	const statusHandler = async (product: Product, productStatus: ProductStatus) => {
		try {
			if (productStatus === ProductStatus.DELETE && !(await sweetConfirmAlert('Delete this product?'))) return;
			await updateProduct({ variables: { input: { _id: product._id, productStatus } } });
			await refetch();
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	return (
		<div className={'my-section'}>
			<div className={'section-head'}>
				<h2>My products</h2>
				<p>Hide a product to take it off the shop for a while, or mark it sold out.</p>
				<button className={'primary-btn'} onClick={() => router.push('/mypage?category=addProduct')}>
					+ Add product
				</button>
			</div>
			<Stack className={'chips'}>
				{tabs.map((tab) => (
					<button
						key={tab || 'all'}
						className={`chip ${status === tab ? 'on' : ''}`}
						onClick={() => {
							setStatus(tab);
							setPage(1);
						}}
					>
						{tab ? labelOf(tab) : 'All'}
					</button>
				))}
			</Stack>
			{products.length === 0 ? (
				<div className={'no-data'}>No products here.</div>
			) : (
				<div className={'table-box'}>
					<table>
						<thead>
							<tr>
								<th>Product</th>
								<th>Price</th>
								<th>Sold</th>
								<th>Rating</th>
								<th>Status</th>
								<th></th>
							</tr>
						</thead>
						<tbody>
							{products.map((product) => (
								<tr key={product._id}>
									<td>
										<div className={'cell-product'}>
											<ProductThumb image={imageUrl(product.productImages?.[0])} seed={product._id} size={48} radius={12} />
											<span>
												<b>{product.productTitle}</b>
												<small>
													{product.brandData?.brandName} · {product.productVolume}
												</small>
											</span>
										</div>
									</td>
									<td>{formatPrice(product.productSalePrice)}</td>
									<td>{product.productSold}</td>
									<td>
										★ {product.productRating?.toFixed(1)} ({product.productReviews})
									</td>
									<td>
										<span className={`status-pill ${product.productStatus}`}>{labelOf(product.productStatus)}</span>
									</td>
									<td className={'row-btns'}>
										<button className={'ghost-btn small'} onClick={() => router.push({ pathname: '/mypage', query: { category: 'addProduct', productId: product._id } })}>
											Edit
										</button>
										<select
											aria-label={'Change status'}
											value={product.productStatus}
											onChange={(e) => statusHandler(product, e.target.value as ProductStatus)}
										>
											{Object.values(ProductStatus).map((ele) => (
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
				</div>
			)}
			{total > limit && (
				<Stack className={'pagination-box'}>
					<Pagination page={page} count={Math.ceil(total / limit)} onChange={(e, value) => setPage(value)} shape={'circular'} color={'primary'} />
				</Stack>
			)}
		</div>
	);
};

export default MyProducts;

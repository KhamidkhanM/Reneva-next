import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Box, Stack } from '@mui/material';
import { useQuery } from '@apollo/client';
import { GET_CATEGORIES, GET_PRODUCTS } from '../../../apollo/user/query';
import { Category, Product } from '../../types/product';
import { T } from '../../types/common';
import { formatPrice, imageUrl } from '../../utils';
import ProductThumb from '../common/ProductThumb';

// ranking from the nightly batch (productRank), filterable by top category
const BestProducts = () => {
	const router = useRouter();
	const [categoryId, setCategoryId] = useState<string>('');
	const [products, setProducts] = useState<Product[]>([]);

	/** APOLLO REQUESTS **/
	const { data: categoryData } = useQuery(GET_CATEGORIES, { fetchPolicy: 'cache-and-network' });
	const topCategories: Category[] = (categoryData?.getCategories ?? []).filter((ele: Category) => !ele.categoryParentId).slice(0, 5);

	useQuery(GET_PRODUCTS, {
		fetchPolicy: 'cache-and-network',
		variables: {
			input: { page: 1, limit: 6, sort: 'productRank', direction: 'DESC', search: categoryId ? { categoryList: [categoryId] } : {} },
		},
		onCompleted: (data: T) => setProducts(data?.getProducts?.list ?? []),
	});

	const pushDetailHandler = (id: string) => router.push({ pathname: '/product/detail', query: { id } });

	return (
		<Stack className={'best-products'}>
			<Stack className={'container column'}>
				<Stack className={'info-box'}>
					<Box component={'div'} className={'left'}>
						<h2 className={'section-title'}>Reneva ranking</h2>
						<p>Updated every night from sales, reviews and likes</p>
					</Box>
					<div className={'filters'}>
						<button className={`chip ${!categoryId ? 'on' : ''}`} onClick={() => setCategoryId('')}>
							All
						</button>
						{topCategories.map((category) => (
							<button
								key={category._id}
								className={`chip ${categoryId === category._id ? 'on' : ''}`}
								onClick={() => setCategoryId(category._id)}
							>
								{category.categoryName}
							</button>
						))}
					</div>
				</Stack>
				{products.length === 0 ? (
					<Box component={'div'} className={'empty-list'}>
						No ranked products in this category yet
					</Box>
				) : (
					<div className={'ranking'}>
						<button className={'rank-first'} onClick={() => pushDetailHandler(products[0]._id)}>
							<div className={'img'}>
								<span className={'num'}>1</span>
								<ProductThumb image={imageUrl(products[0].productImages?.[0])} seed={products[0]._id} radius={24} />
							</div>
							<div className={'txt'}>
								<span className={'brand'}>{products[0].brandData?.brandName}</span>
								<b>{products[0].productTitle}</b>
								{products[0].productReviewSummary && <p>“{products[0].productReviewSummary}”</p>}
								<span className={'price-row'}>
									<span className={'now'}>{formatPrice(products[0].productSalePrice)}</span>
									<span className={'meta'}>
										★ {products[0].productRating.toFixed(1)} · {products[0].productSold} sold
									</span>
								</span>
							</div>
						</button>
						<div className={'rank-list'}>
							{products.slice(1).map((product, index) => (
								<button key={product._id} className={'rank-row'} onClick={() => pushDetailHandler(product._id)}>
									<span className={'num'}>{index + 2}</span>
									<ProductThumb image={imageUrl(product.productImages?.[0])} seed={product._id} size={60} radius={16} />
									<span className={'txt'}>
										<span className={'brand'}>{product.brandData?.brandName}</span>
										<span className={'title'}>{product.productTitle}</span>
									</span>
									<b>{formatPrice(product.productSalePrice)}</b>
								</button>
							))}
						</div>
					</div>
				)}
			</Stack>
		</Stack>
	);
};

export default BestProducts;

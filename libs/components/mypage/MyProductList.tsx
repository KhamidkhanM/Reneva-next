import React, { useState } from 'react';
import { Pagination, Stack } from '@mui/material';
import { useMutation, useQuery } from '@apollo/client';
import { GET_FAVORITES, GET_VISITED } from '../../../apollo/user/query';
import { LIKE_TARGET_PRODUCT } from '../../../apollo/user/mutation';
import { Product } from '../../types/product';
import { likeHandler } from '../../utils';
import ProductCard from '../common/ProductCard';

interface MyProductListProps {
	kind: 'favorites' | 'visited';
}

// wishlist and recently viewed share the same grid
const MyProductList = ({ kind }: MyProductListProps) => {
	const [page, setPage] = useState<number>(1);
	const limit = 8;
	const favorites = kind === 'favorites';

	/** APOLLO REQUESTS **/
	const [likeTargetProduct] = useMutation(LIKE_TARGET_PRODUCT);
	const { data, refetch } = useQuery(favorites ? GET_FAVORITES : GET_VISITED, {
		fetchPolicy: 'network-only',
		variables: { input: { page, limit } },
	});
	const result = favorites ? data?.getFavorites : data?.getVisited;
	const products: Product[] = result?.list ?? [];
	const total: number = result?.metaCounter?.[0]?.total ?? 0;

	const likeProductHandler = (user: any, id: string) => likeHandler(likeTargetProduct, user, id, () => refetch());

	return (
		<div className={'my-section'}>
			<div className={'section-head'}>
				<h2>{favorites ? 'Wishlist' : 'Recently viewed'}</h2>
				<p>{favorites ? 'Products you saved with the heart button.' : 'Products you looked at lately.'}</p>
			</div>
			{products.length === 0 ? (
				<div className={'no-data'}>{favorites ? 'Your wishlist is empty.' : 'Nothing viewed yet.'}</div>
			) : (
				<div className={'product-grid four'}>
					{products.map((product) => (
						<ProductCard key={product._id} product={product} likeProductHandler={likeProductHandler} />
					))}
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

export default MyProductList;

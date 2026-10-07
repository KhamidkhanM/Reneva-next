import React, { useState } from 'react';
import Link from 'next/link';
import { Box, Stack } from '@mui/material';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { GET_MY_RECOMMENDATIONS, GET_PRODUCTS } from '../../../apollo/user/query';
import { LIKE_TARGET_PRODUCT } from '../../../apollo/user/mutation';
import { AiRecommendation } from '../../types/chat';
import { Product } from '../../types/product';
import { T } from '../../types/common';
import { ProductTag } from '../../enums/product.enum';
import { likeHandler } from '../../utils';
import ProductCard from '../common/ProductCard';

// logged in: the "For You" list from the batch and the AI advisor; guests: best sellers
const ForYouProducts = () => {
	const user = useReactiveVar(userVar);
	const [items, setItems] = useState<{ product: Product; note?: string }[]>([]);

	/** APOLLO REQUESTS **/
	const [likeTargetProduct] = useMutation(LIKE_TARGET_PRODUCT);
	const { refetch: recsRefetch } = useQuery(GET_MY_RECOMMENDATIONS, {
		skip: !user._id,
		fetchPolicy: 'network-only',
		variables: { input: { page: 1, limit: 4 } },
		onCompleted: (data: T) => {
			const list: AiRecommendation[] = data?.getMyRecommendations?.list ?? [];
			setItems(list.filter((ele) => ele.productData).map((ele) => ({ product: ele.productData as Product, note: ele.recommendReason })));
		},
	});
	const { refetch: bestRefetch } = useQuery(GET_PRODUCTS, {
		skip: !!user._id,
		fetchPolicy: 'cache-and-network',
		variables: { input: { page: 1, limit: 4, sort: 'productSold', direction: 'DESC', search: { tagList: [ProductTag.BEST] } } },
		onCompleted: (data: T) => setItems((data?.getProducts?.list ?? []).map((product: Product) => ({ product }))),
	});

	/** HANDLERS **/
	const likeProductHandler = (member: T, id: string) =>
		likeHandler(likeTargetProduct, member, id, () => (user._id ? recsRefetch() : bestRefetch()));

	return (
		<Stack className={'for-you'}>
			<Stack className={'container column'}>
				<Stack className={'info-box'}>
					<Box component={'div'} className={'left'}>
						<h2 className={'section-title'}>{user._id ? 'Picked for you' : 'Best sellers'}</h2>
						<p>
							{user._id
								? user.memberSkinType
									? `Matched to your ${user.memberSkinType.toLowerCase()} skin and what you looked at`
									: 'Add your skin type in My Page for better picks'
								: 'What Reneva shoppers buy most'}
						</p>
					</Box>
					<Link href={'/product'} className={'more-link'}>
						View all →
					</Link>
				</Stack>
				{items.length === 0 ? (
					<Box component={'div'} className={'empty-list'}>
						No products yet
					</Box>
				) : (
					<div className={'product-grid four'}>
						{items.map(({ product, note }) => (
							<ProductCard key={product._id} product={product} note={note} likeProductHandler={likeProductHandler} />
						))}
					</div>
				)}
			</Stack>
		</Stack>
	);
};

export default ForYouProducts;

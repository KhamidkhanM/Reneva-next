import React, { useState } from 'react';
import { Box, Stack } from '@mui/material';
import WestIcon from '@mui/icons-material/West';
import EastIcon from '@mui/icons-material/East';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper';
import { useMutation, useQuery } from '@apollo/client';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { GET_PRODUCTS } from '../../../apollo/user/query';
import { LIKE_TARGET_PRODUCT } from '../../../apollo/user/mutation';
import { Product, ProductsInquiry } from '../../types/product';
import { T } from '../../types/common';
import { likeHandler } from '../../utils';
import ProductCard from '../common/ProductCard';

interface TrendProductsProps {
	initialInput?: ProductsInquiry;
}

const defaultInput: ProductsInquiry = { page: 1, limit: 8, sort: 'productLikes', direction: 'DESC', search: {} };

const TrendProducts = ({ initialInput = defaultInput }: TrendProductsProps) => {
	const device = useDeviceDetect();
	const [trendProducts, setTrendProducts] = useState<Product[]>([]);

	/** APOLLO REQUESTS **/
	const [likeTargetProduct] = useMutation(LIKE_TARGET_PRODUCT);
	const { refetch: getProductsRefetch } = useQuery(GET_PRODUCTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: initialInput },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => setTrendProducts(data?.getProducts?.list || []),
	});

	/** HANDLERS **/
	const likeProductHandler = (user: T, id: string) =>
		likeHandler(likeTargetProduct, user, id, () => getProductsRefetch({ input: initialInput }));

	return (
		<Stack className={'trend-products'}>
			<Stack className={'container column'}>
				<Stack className={'info-box'}>
					<Box component={'div'} className={'left'}>
						<h2 className={'section-title'}>New and trending</h2>
						<p>The most loved products this week</p>
					</Box>
					{device !== 'mobile' && (
						<Box component={'div'} className={'right'}>
							<div className={'pagination-box'}>
								<button className={'swiper-trend-prev'} aria-label={'Previous'}>
									<WestIcon />
								</button>
								<div className={'swiper-trend-pagination'}></div>
								<button className={'swiper-trend-next'} aria-label={'Next'}>
									<EastIcon />
								</button>
							</div>
						</Box>
					)}
				</Stack>
				<Stack className={'card-box'}>
					{trendProducts.length === 0 ? (
						<Box component={'div'} className={'empty-list'}>
							No trending products yet
						</Box>
					) : (
						<Swiper
							className={'trend-product-swiper'}
							slidesPerView={'auto'}
							spaceBetween={20}
							modules={[Autoplay, Navigation, Pagination]}
							navigation={{ nextEl: '.swiper-trend-next', prevEl: '.swiper-trend-prev' }}
							pagination={{ el: '.swiper-trend-pagination' }}
						>
							{trendProducts.map((product: Product) => (
								<SwiperSlide key={product._id} className={'trend-product-slide'}>
									<ProductCard product={product} likeProductHandler={likeProductHandler} />
								</SwiperSlide>
							))}
						</Swiper>
					)}
				</Stack>
			</Stack>
		</Stack>
	);
};

export default TrendProducts;

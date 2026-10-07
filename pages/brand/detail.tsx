import React, { ChangeEvent, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Pagination, Stack } from '@mui/material';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { BrandCircle } from '../../libs/components/homepage/TopBrands';
import ProductCard from '../../libs/components/common/ProductCard';
import { userVar } from '../../apollo/store';
import { GET_BRAND, GET_PRODUCTS } from '../../apollo/user/query';
import { LIKE_TARGET_BRAND, LIKE_TARGET_PRODUCT } from '../../apollo/user/mutation';
import { Brand, Product } from '../../libs/types/product';
import { T } from '../../libs/types/common';
import { imageUrl, isLiked, likeHandler } from '../../libs/utils';
import { openStoreChat } from '../../libs/components/chat/openChat';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const BrandDetail: NextPage = () => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const brandId = router.query.id as string;
	const [page, setPage] = useState<number>(1);
	const limit = 8;

	/** APOLLO REQUESTS **/
	const [likeTargetBrand] = useMutation(LIKE_TARGET_BRAND);
	const [likeTargetProduct] = useMutation(LIKE_TARGET_PRODUCT);
	const { data: brandData, refetch: brandRefetch } = useQuery(GET_BRAND, {
		fetchPolicy: 'network-only',
		variables: { input: brandId },
		skip: !brandId,
	});
	const { data: productData, refetch: productsRefetch } = useQuery(GET_PRODUCTS, {
		fetchPolicy: 'network-only',
		skip: !brandId,
		variables: { input: { page, limit, sort: 'productRank', direction: 'DESC', search: { brandList: [brandId] } } },
	});
	const brand: Brand | undefined = brandData?.getBrand;
	const products: Product[] = productData?.getProducts?.list ?? [];
	const total: number = productData?.getProducts?.metaCounter?.[0]?.total ?? 0;

	if (!brand) return <div id={'brand-detail-page'}></div>;

	return (
		<div id={'brand-detail-page'}>
			<div className={'container column'}>
				<div
					className={'brand-hero'}
					style={brand.brandBanner ? { backgroundImage: `url(${imageUrl(brand.brandBanner)})` } : undefined}
				>
					<BrandCircle brand={brand} index={0} size={120} />
					<div className={'txt'}>
						<span className={'eyebrow'}>
							{brand.brandCountry} · SINCE {new Date(brand.createdAt).getFullYear()}
						</span>
						<h2>{brand.brandName}</h2>
						<p>{brand.brandDesc || 'This brand has not written its story yet.'}</p>
						<div className={'stats'}>
							<span>
								<b>{brand.brandProducts}</b> products
							</span>
							<span>
								<b>{brand.brandLikes}</b> followers
							</span>
						</div>
					</div>
					<div className={'actions'}>
						<button
							className={`${isLiked(brand) ? 'soft-btn' : 'primary-btn'}`}
							onClick={() => likeHandler(likeTargetBrand, user, brand._id, () => brandRefetch())}
							aria-pressed={isLiked(brand)}
						>
							{isLiked(brand) ? (
								<FavoriteRoundedIcon fontSize={'small'} />
							) : (
								<FavoriteBorderRoundedIcon fontSize={'small'} />
							)}
							{isLiked(brand) ? 'Following' : 'Follow brand'}
						</button>
						{products[0] && (
							<button className={'ghost-btn'} onClick={() => openStoreChat(products[0]._id)}>
								Chat with store
							</button>
						)}
					</div>
				</div>

				<h2 className={'section-title'}>Products</h2>
				{products.length === 0 ? (
					<div className={'no-data'}>No products yet.</div>
				) : (
					<div className={'product-grid four'}>
						{products.map((product) => (
							<ProductCard
								key={product._id}
								product={product}
								likeProductHandler={(member: T, id: string) =>
									likeHandler(likeTargetProduct, member, id, () => productsRefetch())
								}
							/>
						))}
					</div>
				)}
				{total > limit && (
					<Stack className={'pagination-box'}>
						<Pagination
							page={page}
							count={Math.ceil(total / limit)}
							onChange={(e: ChangeEvent<unknown>, value: number) => setPage(value)}
							shape={'circular'}
							color={'primary'}
						/>
					</Stack>
				)}
			</div>
		</div>
	);
};

export default withLayoutBasic(BrandDetail);

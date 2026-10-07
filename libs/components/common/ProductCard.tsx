import React from 'react';
import { useRouter } from 'next/router';
import { IconButton, Stack } from '@mui/material';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { Product } from '../../types/product';
import { ProductStatus } from '../../enums/product.enum';
import { formatKRW, imageUrl, isLiked, labelOf, salePercent } from '../../utils';
import ProductThumb from './ProductThumb';

interface ProductCardProps {
	product: Product;
	likeProductHandler?: (user: any, id: string) => void;
	note?: string; // e.g. "Targets dryness, one of your concerns"
	rank?: number;
}

const ProductCard = ({ product, likeProductHandler, note, rank }: ProductCardProps) => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const off = salePercent(product.productPrice, product.productSalePrice);
	const tag = product.productTags?.[0];
	const soldOut = product.productStatus === ProductStatus.SOLDOUT;

	const pushDetailHandler = () => router.push({ pathname: '/product/detail', query: { id: product._id } });

	return (
		<Stack className={`product-card ${soldOut ? 'soldout' : ''}`}>
			<div className={'card-img'}>
				<button className={'img-link'} onClick={pushDetailHandler} aria-label={product.productTitle}>
					<ProductThumb image={imageUrl(product.productImages?.[0])} seed={product._id} radius={24} />
				</button>
				{rank && <span className={'rank'}>{rank}</span>}
				{!rank && tag && <span className={'tag-pill'}>{labelOf(tag)}</span>}
				{soldOut && <span className={'soldout-pill'}>Sold out</span>}
				{likeProductHandler && (
					<IconButton
						className={'like-btn'}
						aria-label={isLiked(product) ? 'Remove from wishlist' : 'Add to wishlist'}
						onClick={() => likeProductHandler(user, product._id)}
					>
						{isLiked(product) ? <FavoriteRoundedIcon className={'liked'} /> : <FavoriteBorderRoundedIcon />}
					</IconButton>
				)}
			</div>
			<div className={'info'}>
				<span className={'brand'}>{product.brandData?.brandName ?? ''}</span>
				<button className={'title'} onClick={pushDetailHandler}>
					{product.productTitle}
				</button>
				<span className={'meta'}>
					★ {product.productRating?.toFixed(1) ?? '0.0'} · {product.productReviews} reviews
				</span>
				{note && <span className={'note'}>{note}</span>}
			</div>
			<div className={'bottom'}>
				<span className={'price-row'}>
					{off > 0 && <span className={'sale'}>{off}%</span>}
					<span className={'now'}>{formatKRW(product.productSalePrice)}</span>
					{off > 0 && <s>{formatKRW(product.productPrice)}</s>}
				</span>
				<button className={'soft-btn small'} onClick={pushDetailHandler}>
					View
				</button>
			</div>
		</Stack>
	);
};

export default ProductCard;

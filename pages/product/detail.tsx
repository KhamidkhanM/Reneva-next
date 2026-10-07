import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { CircularProgress, IconButton, Rating, Stack } from '@mui/material';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import { userVar } from '../../apollo/store';
import { GET_MY_CART, GET_PRODUCT, GET_PRODUCTS } from '../../apollo/user/query';
import { ADD_TO_CART, LIKE_TARGET_PRODUCT } from '../../apollo/user/mutation';
import { Product, ProductOption } from '../../libs/types/product';
import { T } from '../../libs/types/common';
import { OptionStatus, ProductStatus } from '../../libs/enums/product.enum';
import { CommentGroup } from '../../libs/enums/comment.enum';
import { FREE_DELIVERY_FROM, Messages } from '../../libs/config';
import { formatKRW, imageUrl, isLiked, labelOf, likeHandler, salePercent } from '../../libs/utils';
import { sweetLoginConfirmAlert, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import ProductThumb from '../../libs/components/common/ProductThumb';
import ProductCard from '../../libs/components/common/ProductCard';
import Reviews from '../../libs/components/product/Reviews';
import Comments from '../../libs/components/common/Comments';
import { openStoreChat } from '../../libs/components/chat/openChat';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const ProductDetail: NextPage = () => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const productId = router.query.id as string;
	const [product, setProduct] = useState<Product | null>(null);
	const [slide, setSlide] = useState<number>(0);
	const [option, setOption] = useState<ProductOption | null>(null);
	const [quantity, setQuantity] = useState<number>(1);
	const [tab, setTab] = useState<'details' | 'ingredients' | 'reviews' | 'qna'>('details');
	const [adding, setAdding] = useState<boolean>(false);

	/** APOLLO REQUESTS **/
	const [likeTargetProduct] = useMutation(LIKE_TARGET_PRODUCT);
	const [addToCart] = useMutation(ADD_TO_CART, { refetchQueries: [{ query: GET_MY_CART }] });

	const { loading, refetch: getProductRefetch } = useQuery(GET_PRODUCT, {
		fetchPolicy: 'network-only',
		variables: { input: productId },
		skip: !productId,
		onCompleted: (data: T) => {
			const found: Product = data?.getProduct;
			setProduct(found);
			const firstInStock = found?.productOptions?.find((ele) => ele.optionStatus === OptionStatus.ACTIVE && ele.optionStock > 0);
			setOption((prev) => found?.productOptions?.find((ele) => ele._id === prev?._id) ?? firstInStock ?? found?.productOptions?.[0] ?? null);
		},
	});

	const { data: moreData } = useQuery(GET_PRODUCTS, {
		fetchPolicy: 'cache-and-network',
		skip: !product?.brandId,
		variables: { input: { page: 1, limit: 5, sort: 'productRank', direction: 'DESC', search: { brandList: [product?.brandId] } } },
	});
	const moreFromBrand: Product[] = (moreData?.getProducts?.list ?? []).filter((ele: Product) => ele._id !== productId).slice(0, 4);

	/** LIFECYCLES **/
	useEffect(() => {
		setSlide(0);
		setQuantity(1);
		setTab('details');
	}, [productId]);

	/** HANDLERS **/
	const likeProductHandler = (member: T, id: string) => likeHandler(likeTargetProduct, member, id, () => getProductRefetch());

	const addToCartHandler = async (goToCart: boolean) => {
		try {
			if (!user._id) {
				if (await sweetLoginConfirmAlert(Messages.error2)) await router.push('/account/join');
				return;
			}
			if (!option) throw new Error('Please choose an option');
			setAdding(true);
			await addToCart({ variables: { input: { optionId: option._id, cartQuantity: quantity } } });
			if (goToCart) await router.push('/cart');
			else await sweetTopSmallSuccessAlert('Added to cart', 900);
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		} finally {
			setAdding(false);
		}
	};

	if (loading && !product) {
		return (
			<div id={'product-detail-page'} className={'loading'}>
				<CircularProgress />
			</div>
		);
	}
	if (!product) {
		return (
			<div id={'product-detail-page'}>
				<div className={'container'}>
					<div className={'no-data'}>This product is not available.</div>
				</div>
			</div>
		);
	}

	const images = product.productImages?.length ? product.productImages : [''];
	const off = salePercent(product.productPrice, product.productSalePrice);
	const unitPrice = product.productSalePrice + (option?.optionExtraPrice ?? 0);
	const optionAvailable = !!option && option.optionStatus === OptionStatus.ACTIVE && option.optionStock > 0;
	const soldOut = product.productStatus === ProductStatus.SOLDOUT || !optionAvailable;
	const hasShades = !!product.productOptions?.some((ele) => ele.optionColor);

	return (
		<div id={'product-detail-page'}>
			<div className={'container column'}>
				<nav className={'breadcrumb'} aria-label={'Breadcrumb'}>
					<Link href={'/'}>Home</Link>
					<span>/</span>
					<Link href={'/product'}>Shop</Link>
					{product.categoryData && (
						<>
							<span>/</span>
							<Link href={`/product?input=${JSON.stringify({ page: 1, limit: 9, sort: 'createdAt', direction: 'DESC', search: { categoryList: [product.categoryId] } })}`}>
								{product.categoryData.categoryName}
							</Link>
						</>
					)}
				</nav>

				<Stack className={'product-top'}>
					<div className={'gallery'}>
						<div className={'main-img'}>
							<ProductThumb image={imageUrl(images[slide])} seed={product._id} radius={36} alt={product.productTitle} />
							{off > 0 && <span className={'off-pill'}>{off}% OFF</span>}
						</div>
						{images.length > 1 && (
							<div className={'thumbs'}>
								{images.map((img, index) => (
									<button
										key={img + index}
										className={slide === index ? 'on' : ''}
										onClick={() => setSlide(index)}
										aria-label={`Photo ${index + 1}`}
									>
										<ProductThumb image={imageUrl(img)} seed={product._id + index} size={72} radius={16} />
									</button>
								))}
							</div>
						)}
					</div>

					<div className={'buy-box'}>
						<Link href={{ pathname: '/brand/detail', query: { id: product.brandId } }} className={'brand-link'}>
							{product.brandData?.brandName} ›
						</Link>
						<h1>{product.productTitle}</h1>
						<div className={'rating-row'}>
							<Rating value={product.productRating} precision={0.1} readOnly size={'small'} />
							<button className={'link-btn'} onClick={() => setTab('reviews')}>
								{product.productRating.toFixed(1)} · {product.productReviews} reviews
							</button>
							<span>· {product.productSold} sold</span>
						</div>

						<div className={'price-row big'}>
							{off > 0 && <span className={'sale'}>{off}%</span>}
							<span className={'now'}>{formatKRW(unitPrice)}</span>
							{off > 0 && <s>{formatKRW(product.productPrice + (option?.optionExtraPrice ?? 0))}</s>}
						</div>
						<span className={'volume'}>{product.productVolume}</span>

						{(product.productSkinTypes.length > 0 || product.productConcerns.length > 0) && (
							<div className={'fit-chips'}>
								{product.productSkinTypes.map((type) => (
									<span key={type} className={`chip ${user.memberSkinType === type ? 'on' : ''}`}>
										{labelOf(type)} skin
									</span>
								))}
								{product.productConcerns.map((concern) => (
									<span key={concern} className={'chip peach'}>
										{labelOf(concern)}
									</span>
								))}
							</div>
						)}
						{user.memberSkinType && product.productSkinTypes.includes(user.memberSkinType as any) && (
							<p className={'fit-note'}>Made for your {user.memberSkinType.toLowerCase()} skin</p>
						)}

						<fieldset className={'options'}>
							<legend>{hasShades ? 'Shade' : 'Option'}{option ? `: ${option.optionName}` : ''}</legend>
							<div className={hasShades ? 'swatches' : 'sizes'}>
								{product.productOptions?.map((ele) => {
									const out = ele.optionStatus !== OptionStatus.ACTIVE || ele.optionStock === 0;
									return (
										<button
											key={ele._id}
											className={`${option?._id === ele._id ? 'on' : ''} ${out ? 'out' : ''}`}
											onClick={() => {
												setOption(ele);
												setQuantity(1);
											}}
											aria-pressed={option?._id === ele._id}
											aria-label={`${ele.optionName}${out ? ', sold out' : ''}`}
											title={ele.optionName}
										>
											{hasShades ? (
												<span className={'swatch'} style={{ background: ele.optionColor || '#E6E0F6' }}></span>
											) : (
												<>
													{ele.optionName}
													{ele.optionExtraPrice > 0 && <small>+{formatKRW(ele.optionExtraPrice)}</small>}
												</>
											)}
										</button>
									);
								})}
							</div>
							{option && optionAvailable && option.optionStock <= 5 && <span className={'stock-note'}>Only {option.optionStock} left</span>}
						</fieldset>

						<div className={'qty-row'}>
							<div className={'qty'} aria-label={'Quantity'}>
								<IconButton aria-label={'Less'} onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}>
									<RemoveRoundedIcon />
								</IconButton>
								<span aria-live={'polite'}>{quantity}</span>
								<IconButton
									aria-label={'More'}
									onClick={() => setQuantity(Math.min(option?.optionStock ?? 1, 99, quantity + 1))}
									disabled={!option || quantity >= Math.min(option.optionStock, 99)}
								>
									<AddRoundedIcon />
								</IconButton>
							</div>
							<div className={'total'}>
								<span>Total</span>
								<b>{formatKRW(unitPrice * quantity)}</b>
							</div>
						</div>

						<div className={'buy-btns'}>
							<IconButton
								className={'like-big'}
								aria-label={isLiked(product) ? 'Remove from wishlist' : 'Add to wishlist'}
								onClick={() => likeProductHandler(user, product._id)}
							>
								{isLiked(product) ? <FavoriteRoundedIcon className={'liked'} /> : <FavoriteBorderRoundedIcon />}
							</IconButton>
							<button className={'soft-btn'} onClick={() => addToCartHandler(false)} disabled={soldOut || adding}>
								Add to cart
							</button>
							<button className={'primary-btn'} onClick={() => addToCartHandler(true)} disabled={soldOut || adding}>
								{soldOut ? 'Sold out' : 'Buy now'}
							</button>
						</div>

						<div className={'service-row'}>
							<span>
								<LocalShippingOutlinedIcon fontSize={'small'} />
								Free delivery over {formatKRW(FREE_DELIVERY_FROM)}
							</span>
							<button className={'link-btn'} onClick={() => openStoreChat(product._id)}>
								<ChatBubbleOutlineRoundedIcon fontSize={'small'} /> Chat with store
							</button>
						</div>
					</div>
				</Stack>

				{product.productReviewSummary && (
					<div className={'ai-summary'}>
						<img src={'/img/logo/rena-ai.svg'} alt={''} />
						<div>
							<span className={'eyebrow'}>WHAT BUYERS SAY · AI SUMMARY</span>
							<p>{product.productReviewSummary}</p>
						</div>
					</div>
				)}

				<div className={'detail-tabs'} role={'tablist'} aria-label={'Product information'}>
					{[
						{ id: 'details', label: 'Details' },
						{ id: 'ingredients', label: 'Ingredients' },
						{ id: 'reviews', label: `Reviews (${product.productReviews})` },
						{ id: 'qna', label: `Q&A (${product.productComments})` },
					].map((ele) => (
						<button
							key={ele.id}
							role={'tab'}
							aria-selected={tab === ele.id}
							className={tab === ele.id ? 'on' : ''}
							onClick={() => setTab(ele.id as any)}
						>
							{ele.label}
						</button>
					))}
				</div>

				<div className={'tab-panel'} role={'tabpanel'}>
					{tab === 'details' && (
						<div className={'details'}>
							<p>{product.productDesc || 'The seller has not added a description yet.'}</p>
							<dl>
								<dt>Volume</dt>
								<dd>{product.productVolume}</dd>
								<dt>Category</dt>
								<dd>{product.categoryData?.categoryName ?? '-'}</dd>
								<dt>Good for</dt>
								<dd>{product.productSkinTypes.map(labelOf).join(', ') || 'All skin types'}</dd>
								<dt>Seller</dt>
								<dd>{product.memberData?.memberNick ?? '-'}</dd>
							</dl>
						</div>
					)}
					{tab === 'ingredients' && (
						<div className={'ingredients'}>
							{product.productIngredients.length === 0 ? (
								<div className={'empty-list'}>The seller has not listed ingredients yet.</div>
							) : (
								<ul>
									{product.productIngredients.map((ing) => (
										<li key={ing}>{ing}</li>
									))}
								</ul>
							)}
							<p className={'hint'}>Not sure about an ingredient? Ask Rena in the chat, she can check it against your skin type.</p>
						</div>
					)}
					{tab === 'reviews' && <Reviews productId={product._id} rating={product.productRating} total={product.productReviews} />}
					{tab === 'qna' && (
						<Comments
							commentGroup={CommentGroup.PRODUCT}
							commentRefId={product._id}
							title={'Questions'}
							placeholder={'Ask a question about this product'}
							onChange={() => getProductRefetch()}
						/>
					)}
				</div>

				{moreFromBrand.length > 0 && (
					<Stack className={'more-from'}>
						<h2 className={'section-title'}>More from {product.brandData?.brandName}</h2>
						<div className={'product-grid four'}>
							{moreFromBrand.map((ele) => (
								<ProductCard key={ele._id} product={ele} />
							))}
						</div>
					</Stack>
				)}
			</div>
		</div>
	);
};

export default withLayoutFull(ProductDetail);

import React from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Checkbox, IconButton, LinearProgress, Stack } from '@mui/material';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import ProductThumb from '../../libs/components/common/ProductThumb';
import { userVar } from '../../apollo/store';
import { GET_MY_CART } from '../../apollo/user/query';
import { REMOVE_CART_ITEM, UPDATE_CART_ITEM } from '../../apollo/user/mutation';
import { Cart, MyCart } from '../../libs/types/order';
import { OptionStatus, ProductStatus } from '../../libs/enums/product.enum';
import { FREE_DELIVERY_FROM } from '../../libs/config';
import { formatKRW, imageUrl } from '../../libs/utils';
import { sweetConfirmAlert, sweetMixinErrorAlert } from '../../libs/sweetAlert';
import { useTranslation } from 'next-i18next';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const buyable = (item: Cart) =>
	item.productData?.productStatus === ProductStatus.ACTIVE &&
	item.optionData?.optionStatus === OptionStatus.ACTIVE &&
	(item.optionData?.optionStock ?? 0) >= item.cartQuantity;

const CartPage: NextPage = () => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const user = useReactiveVar(userVar);

	/** APOLLO REQUESTS **/
	const { data, loading, refetch } = useQuery(GET_MY_CART, { fetchPolicy: 'network-only', skip: !user._id });
	const [updateCartItem] = useMutation(UPDATE_CART_ITEM);
	const [removeCartItem] = useMutation(REMOVE_CART_ITEM);
	const cart: MyCart | undefined = data?.getMyCart;
	const items: Cart[] = cart?.list ?? [];
	const selectedCount = items.filter((item) => item.cartSelected && buyable(item)).length;

	/** HANDLERS **/
	const updateHandler = async (input: { _id: string; cartQuantity?: number; cartSelected?: boolean }) => {
		try {
			await updateCartItem({ variables: { input } });
			await refetch();
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const removeHandler = async (id: string) => {
		if (!(await sweetConfirmAlert('Remove this item from your cart?'))) return;
		try {
			await removeCartItem({ variables: { input: id } });
			await refetch();
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const selectAllHandler = async (checked: boolean) => {
		for (const item of items) {
			if (item.cartSelected !== checked) await updateCartItem({ variables: { input: { _id: item._id, cartSelected: checked } } });
		}
		await refetch();
	};

	if (!user._id) {
		return (
			<div id={'cart-page'}>
				<div className={'container'}>
					<div className={'no-data'}>
						<p>{t('Login to see your cart.')}</p>
						<button className={'primary-btn'} onClick={() => router.push('/account/join')}>
							{t('Login')}
						</button>
					</div>
				</div>
			</div>
		);
	}

	const subtotal = cart?.cartSubtotal ?? 0;
	const toFree = Math.max(0, FREE_DELIVERY_FROM - subtotal);

	return (
		<div id={'cart-page'}>
			<div className={'container'}>
				<Stack className={'cart-layout'}>
					<Stack className={'cart-items'}>
						{items.length === 0 && !loading ? (
							<div className={'no-data'}>
								<p>{t('Your cart is empty.')}</p>
								<Link href={'/product'} className={'primary-btn'}>
									{t('Start shopping')}
								</Link>
							</div>
						) : (
							<>
								<div className={'cart-head'}>
									<label>
										<Checkbox
											checked={items.length > 0 && items.every((item) => item.cartSelected)}
											onChange={(e) => selectAllHandler(e.target.checked)}
										/>
										{t('Select all (')}{selectedCount}/{items.length})
									</label>
								</div>
								{items.map((item) => {
									const ok = buyable(item);
									const price = (item.productData?.productSalePrice ?? 0) + (item.optionData?.optionExtraPrice ?? 0);
									return (
										<article key={item._id} className={`cart-item ${ok ? '' : 'unavailable'}`}>
											<Checkbox
												checked={item.cartSelected}
												onChange={(e) => updateHandler({ _id: item._id, cartSelected: e.target.checked })}
												inputProps={{ 'aria-label': t('Select {{name}}', { name: item.productData?.productTitle }) }}
											/>
											<Link href={{ pathname: '/product/detail', query: { id: item.productId } }}>
												<ProductThumb image={imageUrl(item.optionData?.optionImage || item.productData?.productImages?.[0])} seed={item.productId} size={96} radius={20} />
											</Link>
											<div className={'txt'}>
												<span className={'brand'}>{item.productData?.brandData?.brandName}</span>
												<Link href={{ pathname: '/product/detail', query: { id: item.productId } }} className={'title'}>
													{item.productData?.productTitle}
												</Link>
												<span className={'option'}>{item.optionData?.optionName}</span>
												{!ok && <span className={'warn'}>{t('Not enough stock right now')}</span>}
											</div>
											<div className={'qty'}>
												<IconButton
													aria-label={t('Less')}
													size={'small'}
													disabled={item.cartQuantity <= 1}
													onClick={() => updateHandler({ _id: item._id, cartQuantity: item.cartQuantity - 1 })}
												>
													<RemoveRoundedIcon fontSize={'small'} />
												</IconButton>
												<span>{item.cartQuantity}</span>
												<IconButton
													aria-label={t('More')}
													size={'small'}
													disabled={item.cartQuantity >= Math.min(99, item.optionData?.optionStock ?? 0)}
													onClick={() => updateHandler({ _id: item._id, cartQuantity: item.cartQuantity + 1 })}
												>
													<AddRoundedIcon fontSize={'small'} />
												</IconButton>
											</div>
											<b className={'line-total'}>{formatKRW(price * item.cartQuantity)}</b>
											<IconButton aria-label={t('Remove')} onClick={() => removeHandler(item._id)}>
												<DeleteOutlineRoundedIcon />
											</IconButton>
										</article>
									);
								})}
							</>
						)}
					</Stack>

					<Stack className={'cart-summary'}>
						<h2>{t('Summary')}</h2>
						<div className={'row'}>
							<span>{t('Products')}</span>
							<b>{formatKRW(subtotal)}</b>
						</div>
						<div className={'row'}>
							<span>{t('Delivery')}</span>
							<b>{cart?.cartDeliveryFee ? formatKRW(cart.cartDeliveryFee) : t('Free')}</b>
						</div>
						{subtotal > 0 && (
							<div className={'free-bar'}>
								<LinearProgress variant={'determinate'} value={Math.min(100, (subtotal / FREE_DELIVERY_FROM) * 100)} />
								<span>{toFree > 0 ? t('Add {{amount}} more for free delivery', { amount: formatKRW(toFree) }) : t('You get free delivery')}</span>
							</div>
						)}
						<div className={'row total'}>
							<span>{t('Total')}</span>
							<b>{formatKRW(cart?.cartTotal ?? 0)}</b>
						</div>
						<p className={'hint'}>{t('Coupons and points are applied at checkout.')}</p>
						<button className={'primary-btn'} disabled={selectedCount === 0} onClick={() => router.push('/order')}>
							{t('Checkout (')}{selectedCount})
						</button>
					</Stack>
				</Stack>
			</div>
		</div>
	);
};

export default withLayoutBasic(CartPage);

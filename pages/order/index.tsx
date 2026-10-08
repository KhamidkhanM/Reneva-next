import React, { useEffect, useMemo, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Radio, Stack } from '@mui/material';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import AddressForm from '../../libs/components/mypage/AddressForm';
import ProductThumb from '../../libs/components/common/ProductThumb';
import { userVar } from '../../apollo/store';
import { GET_MEMBER, GET_MY_ADDRESSES, GET_MY_CART, GET_MY_COUPONS } from '../../apollo/user/query';
import { CREATE_ORDER, PAY_ORDER } from '../../apollo/user/mutation';
import { Address, Cart, MemberCoupon, MyCart } from '../../libs/types/order';
import { CouponType, MemberCouponStatus } from '../../libs/enums/coupon.enum';
import { OptionStatus, ProductStatus } from '../../libs/enums/product.enum';
import { PaymentMethod } from '../../libs/enums/order.enum';
import { formatKRW, imageUrl, labelOf } from '../../libs/utils';
import { sweetMixinErrorAlert } from '../../libs/sweetAlert';
import { i18n, useTranslation } from 'next-i18next';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const methods = [
	{ id: PaymentMethod.CARD, label: 'Card' },
	{ id: PaymentMethod.KAKAO_PAY, label: 'Kakao Pay' },
	{ id: PaymentMethod.NAVER_PAY, label: 'Naver Pay' },
	{ id: PaymentMethod.BANK, label: 'Bank transfer' },
];

// the same rules the server uses, so the shopper sees the price before paying
const previewDiscount = (memberCoupon: MemberCoupon | undefined, items: Cart[], deliveryFee: number) => {
	const coupon = memberCoupon?.couponData;
	if (!coupon) return { discount: 0, freeDelivery: false, error: '' };
	const eligible = items
		.filter((item) => !coupon.brandId || item.productData?.brandId === coupon.brandId)
		.reduce((sum, item) => sum + ((item.productData?.productSalePrice ?? 0) + (item.optionData?.optionExtraPrice ?? 0)) * item.cartQuantity, 0);
	if (eligible === 0) return { discount: 0, freeDelivery: false, error: 'This coupon is for another brand' };
	if (eligible < coupon.couponMinOrder) return { discount: 0, freeDelivery: false, error: i18n?.t('Needs {{amount}} of eligible items', { amount: formatKRW(coupon.couponMinOrder) }) ?? '' };
	if (coupon.couponType === CouponType.FREE_DELIVERY) return { discount: 0, freeDelivery: deliveryFee > 0, error: '' };
	let discount = coupon.couponType === CouponType.PERCENT ? Math.floor((eligible * coupon.couponValue) / 100) : coupon.couponValue;
	if (coupon.couponMaxDiscount) discount = Math.min(discount, coupon.couponMaxDiscount);
	return { discount: Math.min(discount, eligible), freeDelivery: false, error: '' };
};

const Checkout: NextPage = () => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [addressId, setAddressId] = useState<string>('');
	const [showAddressForm, setShowAddressForm] = useState<boolean>(false);
	const [memberCouponId, setMemberCouponId] = useState<string>('');
	const [points, setPoints] = useState<number>(0);
	const [memo, setMemo] = useState<string>('');
	const [method, setMethod] = useState<PaymentMethod>(PaymentMethod.CARD);
	const [placing, setPlacing] = useState<boolean>(false);

	/** APOLLO REQUESTS **/
	const { data: cartData } = useQuery(GET_MY_CART, { fetchPolicy: 'network-only', skip: !user._id });
	const { data: addressData, refetch: addressRefetch } = useQuery(GET_MY_ADDRESSES, { fetchPolicy: 'network-only', skip: !user._id });
	const { data: couponData } = useQuery(GET_MY_COUPONS, {
		fetchPolicy: 'network-only',
		skip: !user._id,
		variables: { input: { page: 1, limit: 50, search: { memberCouponStatus: MemberCouponStatus.AVAILABLE } } },
	});
	const { data: memberData } = useQuery(GET_MEMBER, { fetchPolicy: 'network-only', skip: !user._id, variables: { input: user._id } });
	const [createOrder] = useMutation(CREATE_ORDER, { refetchQueries: [{ query: GET_MY_CART }] });
	const [payOrder] = useMutation(PAY_ORDER);

	const cart: MyCart | undefined = cartData?.getMyCart;
	const items: Cart[] = (cart?.list ?? []).filter(
		(item) =>
			item.cartSelected &&
			item.productData?.productStatus === ProductStatus.ACTIVE &&
			item.optionData?.optionStatus === OptionStatus.ACTIVE &&
			(item.optionData?.optionStock ?? 0) >= item.cartQuantity,
	);
	const addresses: Address[] = addressData?.getMyAddresses ?? [];
	const coupons: MemberCoupon[] = couponData?.getMyCoupons?.list ?? [];
	const myPoints: number = memberData?.getMember?.memberPoints ?? 0;

	/** LIFECYCLES **/
	useEffect(() => {
		if (!addressId && addresses.length) setAddressId((addresses.find((ele) => ele.addressDefault) ?? addresses[0])._id);
		if (addressData && addresses.length === 0) setShowAddressForm(true);
	}, [addressData]);

	const totals = useMemo(() => {
		const subtotal = cart?.cartSubtotal ?? 0;
		let deliveryFee = cart?.cartDeliveryFee ?? 0;
		const coupon = previewDiscount(coupons.find((ele) => ele._id === memberCouponId), items, deliveryFee);
		if (coupon.freeDelivery) deliveryFee = 0;
		const payable = subtotal - coupon.discount + deliveryFee;
		const usedPoints = Math.max(0, Math.min(points, myPoints, payable));
		return { subtotal, deliveryFee, discount: coupon.discount, couponError: coupon.error, usedPoints, total: payable - usedPoints };
	}, [cart, coupons, memberCouponId, points, myPoints, items]);

	/** HANDLERS **/
	const placeOrderHandler = async () => {
		try {
			if (!addressId) throw new Error('Please add a delivery address');
			if (totals.couponError) throw new Error(totals.couponError);
			setPlacing(true);
			const input: any = { addressId, orderPointsUsed: totals.usedPoints };
			if (memberCouponId) input.memberCouponId = memberCouponId;
			if (memo.trim()) input.orderMemo = memo.trim();
			const created = await createOrder({ variables: { input } });
			const orderId = created.data.createOrder._id;
			try {
				await payOrder({ variables: { input: { orderId, paymentMethod: method } } });
			} catch (err) {
				// the order is kept as "waiting for payment", the shopper can pay from the order page
			}
			await router.push({ pathname: '/order/detail', query: { id: orderId, placed: 1 } });
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		} finally {
			setPlacing(false);
		}
	};

	if (cartData && items.length === 0) {
		return (
			<div id={'checkout-page'}>
				<div className={'container'}>
					<div className={'no-data'}>
						<p>{t('No selected items to order.')}</p>
						<button className={'primary-btn'} onClick={() => router.push('/cart')}>
							{t('Back to cart')}
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div id={'checkout-page'}>
			<div className={'container'}>
				<Stack className={'cart-layout'}>
					<Stack className={'checkout-main'}>
						<section className={'box'}>
							<h2>{t('Delivery address')}</h2>
							{addresses.map((address) => (
								<label key={address._id} className={`address-option ${addressId === address._id ? 'on' : ''}`}>
									<Radio checked={addressId === address._id} onChange={() => setAddressId(address._id)} />
									<span>
										<b>
											{address.addressLabel} · {address.addressRecipient}
											{address.addressDefault && <span className={'tag-pill'}>{t('Default')}</span>}
										</b>
										<span>
											{address.addressLine1} {address.addressLine2 ?? ''} ({address.addressZip})
										</span>
										<span>{address.addressPhone}</span>
									</span>
								</label>
							))}
							{showAddressForm ? (
								<AddressForm
									onSaved={async (id) => {
										await addressRefetch();
										setAddressId(id);
										setShowAddressForm(false);
									}}
									onCancel={addresses.length ? () => setShowAddressForm(false) : undefined}
								/>
							) : (
								<button className={'soft-btn'} onClick={() => setShowAddressForm(true)}>
									{t('+ Add a new address')}
								</button>
							)}
						</section>

						<section className={'box'}>
							<h2>{t('Items (')}{items.length})</h2>
							{items.map((item) => (
								<div key={item._id} className={'order-line'}>
									<ProductThumb image={imageUrl(item.optionData?.optionImage || item.productData?.productImages?.[0])} seed={item.productId} size={64} radius={16} />
									<span className={'txt'}>
										<b>{item.productData?.productTitle}</b>
										<span>
											{item.optionData?.optionName} · {item.cartQuantity} {t('pcs')}
										</span>
									</span>
									<b>
										{formatKRW(((item.productData?.productSalePrice ?? 0) + (item.optionData?.optionExtraPrice ?? 0)) * item.cartQuantity)}
									</b>
								</div>
							))}
						</section>

						<section className={'box'}>
							<h2>{t('Coupon and points')}</h2>
							<label className={'field'}>
								<span>{t('Coupon')}</span>
								<select value={memberCouponId} onChange={(e) => setMemberCouponId(e.target.value)}>
									<option value={''}>{t('No coupon')}</option>
									{coupons.map((ele) => (
										<option key={ele._id} value={ele._id}>
											{ele.couponData?.couponTitle} ({ele.couponData?.couponCode})
										</option>
									))}
								</select>
								{totals.couponError && <small className={'warn'}>{totals.couponError}</small>}
							</label>
							<label className={'field'}>
								<span>{t('Points (you have')} {myPoints}P)</span>
								<div className={'points-row'}>
									<input
										type={'number'}
										min={0}
										max={myPoints}
										value={points}
										onChange={(e) => setPoints(Math.max(0, Number(e.target.value) || 0))}
									/>
									<button type={'button'} className={'ghost-btn'} onClick={() => setPoints(myPoints)}>
										{t('Use all')}
									</button>
								</div>
							</label>
							<label className={'field'}>
								<span>{t('Delivery note')}</span>
								<input value={memo} maxLength={100} onChange={(e) => setMemo(e.target.value)} placeholder={t('Leave at the door')} />
							</label>
						</section>

						<section className={'box'}>
							<h2>{t('Payment')}</h2>
							<div className={'methods'}>
								{methods.map((ele) => (
									<button key={ele.id} type={'button'} className={`method ${method === ele.id ? 'on' : ''}`} onClick={() => setMethod(ele.id)} aria-pressed={method === ele.id}>
										{t(ele.label)}
									</button>
								))}
							</div>
							<p className={'hint'}>{t('Test mode: payments are simulated and always succeed.')}</p>
						</section>
					</Stack>

					<Stack className={'cart-summary'}>
						<h2>{t('Order summary')}</h2>
						<div className={'row'}>
							<span>{t('Products')}</span>
							<b>{formatKRW(totals.subtotal)}</b>
						</div>
						<div className={'row'}>
							<span>{t('Coupon')}</span>
							<b className={'minus'}>{totals.discount ? `−${formatKRW(totals.discount)}` : '-'}</b>
						</div>
						<div className={'row'}>
							<span>{t('Points')}</span>
							<b className={'minus'}>{totals.usedPoints ? `−${formatKRW(totals.usedPoints)}` : '-'}</b>
						</div>
						<div className={'row'}>
							<span>{t('Delivery')}</span>
							<b>{totals.deliveryFee ? formatKRW(totals.deliveryFee) : t('Free')}</b>
						</div>
						<div className={'row total'}>
							<span>{t('Total')}</span>
							<b>{formatKRW(totals.total)}</b>
						</div>
						<p className={'hint'}>
							{t('You earn')} {user.memberLevel ? labelOf(user.memberLevel) : t('Baby')} {t('level points after you confirm delivery.')}
						</p>
						<button className={'primary-btn'} onClick={placeOrderHandler} disabled={placing || !addressId}>
							{placing ? t('Placing order…') : t('Pay {{amount}}', { amount: formatKRW(totals.total) })}
						</button>
					</Stack>
				</Stack>
			</div>
		</div>
	);
};

export default withLayoutBasic(Checkout);

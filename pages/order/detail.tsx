import React, { useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import moment from 'moment';
import { Stack } from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useMutation, useQuery } from '@apollo/client';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import ProductThumb from '../../libs/components/common/ProductThumb';
import ReviewForm from '../../libs/components/mypage/ReviewForm';
import { GET_ORDER } from '../../apollo/user/query';
import { CANCEL_ORDER, CONFIRM_ORDER, START_PAYMENT } from '../../apollo/user/mutation';
import { Order, OrderItem } from '../../libs/types/order';
import { OrderStatus, PaymentMethod, PaymentStatus } from '../../libs/enums/order.enum';
import TransferBox from '../../libs/components/order/TransferBox';
import { formatPrice, imageUrl, labelOf } from '../../libs/utils';
import { sweetConfirmAlert, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { openSupportChat } from '../../libs/components/chat/openChat';
import { useTranslation } from 'next-i18next';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const steps = [
	{ status: OrderStatus.PAUSE, label: 'Ordered' },
	{ status: OrderStatus.PROCESS, label: 'Paid' },
	{ status: OrderStatus.DELIVERY, label: 'Shipping' },
	{ status: OrderStatus.FINISH, label: 'Delivered' },
];

const OrderDetail: NextPage = () => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const orderId = router.query.id as string;
	const [reviewItem, setReviewItem] = useState<OrderItem | null>(null);

	/** APOLLO REQUESTS **/
	const { data, refetch } = useQuery(GET_ORDER, { fetchPolicy: 'network-only', variables: { input: orderId }, skip: !orderId });
	const [startPayment] = useMutation(START_PAYMENT);
	const [cancelOrder] = useMutation(CANCEL_ORDER);
	const [confirmOrder] = useMutation(CONFIRM_ORDER);
	const order: Order | undefined = data?.getOrder;

	/** HANDLERS **/
	const run = async (action: () => Promise<any>, message: string) => {
		try {
			await action();
			await refetch();
			await sweetTopSmallSuccessAlert(message, 1000);
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const payWith = async (paymentMethod: PaymentMethod) => {
		try {
			const started = await startPayment({ variables: { input: { orderId, paymentMethod } } });
			const paymentUrl = started.data.startPayment.paymentUrl;
			if (paymentUrl) window.location.href = paymentUrl;
			else await refetch();
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	if (!order) return <div id={'order-detail-page'}></div>;

	const stepIndex = steps.findIndex((ele) => ele.status === order.orderStatus);
	const stopped = [OrderStatus.CANCEL, OrderStatus.REFUND].includes(order.orderStatus);
	const canReview = [OrderStatus.DELIVERY, OrderStatus.FINISH].includes(order.orderStatus);
	const payment = order.payments?.[order.payments.length - 1];

	return (
		<div id={'order-detail-page'}>
			<div className={'container'}>
				<Stack className={'cart-layout'}>
					<Stack className={'checkout-main'}>
						{router.query.placed && order.orderStatus === OrderStatus.PROCESS && (
							<div className={'placed-banner'}>
								<CheckCircleRoundedIcon />
								<span>
									<b>{t('Thank you! Your order is placed.')}</b>
									<span>{t('The store will ship it soon. You can follow it here or in My Page.')}</span>
								</span>
							</div>
						)}

						<section className={'box'}>
							<div className={'order-head'}>
								<span>
									<span className={'eyebrow'}>{t('ORDER')} {order.orderNumber}</span>
									<h2>{moment(order.createdAt).format('YYYY.MM.DD HH:mm')}</h2>
								</span>
								<span className={`status-pill ${order.orderStatus}`}>{t(labelOf(order.orderStatus === OrderStatus.PAUSE ? 'WAITING_FOR_PAYMENT' : order.orderStatus))}</span>
							</div>
							{stopped ? (
								<p className={'stopped'}>
									{t('This order was')} {order.orderStatus === OrderStatus.CANCEL ? t('canceled') : t('refunded')}
									{order.canceledAt ? ` on ${moment(order.canceledAt).format('YYYY.MM.DD')}` : ''}.
								</p>
							) : (
								<ol className={'steps'}>
									{steps.map((step, index) => (
										<li key={step.status} className={index <= stepIndex ? 'done' : ''}>
											<span className={'dot'}>{index + 1}</span>
											{t(step.label)}
										</li>
									))}
								</ol>
							)}
						</section>

						<section className={'box'}>
							<h2>{t('Items')}</h2>
							{order.orderItems?.map((item) => (
								<div key={item._id} className={'order-line'}>
									<Link href={{ pathname: '/product/detail', query: { id: item.productId } }}>
										<ProductThumb image={imageUrl(item.itemImage)} seed={item.productId} size={64} radius={16} />
									</Link>
									<span className={'txt'}>
										<b>{item.itemTitle}</b>
										<span>
											{item.itemOptionName} · {item.itemQuantity} {t('pcs ·')} {formatPrice(item.itemPrice)}
										</span>
									</span>
									{canReview &&
										(item.itemReviewed ? (
											<span className={'tag-pill'}>{t('Reviewed')}</span>
										) : (
											<button className={'soft-btn small'} onClick={() => setReviewItem(item)}>
												{t('Write review')}
											</button>
										))}
								</div>
							))}
						</section>

						<section className={'box'}>
							<h2>{t('Delivery')}</h2>
							<p className={'address'}>
								<b>{order.orderAddress.addressRecipient}</b> · {order.orderAddress.addressPhone}
								<br />
								{order.orderAddress.addressLine1} {order.orderAddress.addressLine2 ?? ''} ({order.orderAddress.addressZip})
								{order.orderMemo && (
									<>
										<br />
										{t('Note:')} {order.orderMemo}
									</>
								)}
							</p>
						</section>
					</Stack>

					<Stack className={'cart-summary'}>
						<h2>{t('Payment')}</h2>
						<div className={'row'}>
							<span>{t('Products')}</span>
							<b>{formatPrice(order.orderSubtotal)}</b>
						</div>
						<div className={'row'}>
							<span>{t('Coupon')}</span>
							<b className={'minus'}>{order.orderDiscount ? `−${formatPrice(order.orderDiscount)}` : '-'}</b>
						</div>
						<div className={'row'}>
							<span>{t('Points')}</span>
							<b className={'minus'}>{order.orderPointsUsed ? `−${formatPrice(order.orderPointsUsed)}` : '-'}</b>
						</div>
						<div className={'row'}>
							<span>{t('Delivery')}</span>
							<b>{order.orderDeliveryFee ? formatPrice(order.orderDeliveryFee) : t('Free (delivery)')}</b>
						</div>
						<div className={'row total'}>
							<span>{t('Total')}</span>
							<b>{formatPrice(order.orderTotal)}</b>
						</div>
						{payment && (
							<p className={'hint'}>
								{t(labelOf(payment.paymentMethod))} · {t(labelOf(payment.paymentStatus))}
							</p>
						)}

						{order.orderStatus === OrderStatus.PAUSE &&
							payment?.paymentMethod === PaymentMethod.CARD_TRANSFER &&
							payment?.paymentStatus === PaymentStatus.READY && <TransferBox orderId={orderId} onFinished={() => refetch()} />}
						{order.orderStatus === OrderStatus.PAUSE && (
							<div className={'pay-again'}>
								<button className={'primary-btn'} onClick={() => payWith(PaymentMethod.PAYME)}>
									{t('Pay with Payme')}
								</button>
								<button className={'primary-btn'} onClick={() => payWith(PaymentMethod.CLICK)}>
									{t('Pay with Click')}
								</button>
								<button className={'primary-btn'} onClick={() => payWith(PaymentMethod.CARD_TRANSFER)}>
									{t('Card to card transfer')}
								</button>
								<button className={'ghost-btn'} onClick={() => payWith(PaymentMethod.CASH)}>
									{t('Cash on delivery')}
								</button>
							</div>
						)}
						{order.orderStatus === OrderStatus.DELIVERY && (
							<button className={'primary-btn'} onClick={() => run(() => confirmOrder({ variables: { input: orderId } }), 'Thank you!')}>
								{t('I got my order')}
							</button>
						)}
						{[OrderStatus.PAUSE, OrderStatus.PROCESS].includes(order.orderStatus) && (
							<button
								className={'ghost-btn'}
								onClick={async () => {
									if (await sweetConfirmAlert('Cancel this order? Stock, coupon and points go back.'))
										await run(() => cancelOrder({ variables: { input: orderId } }), 'Canceled');
								}}
							>
								{t('Cancel order')}
							</button>
						)}
						<button className={'soft-btn'} onClick={() => openSupportChat(orderId)}>
							{t('Get help with this order')}
						</button>
					</Stack>
				</Stack>
			</div>
			<ReviewForm item={reviewItem} onClose={() => setReviewItem(null)} onSaved={() => { setReviewItem(null); refetch(); }} />
		</div>
	);
};

export default withLayoutBasic(OrderDetail);

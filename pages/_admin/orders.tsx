import React, { useState } from 'react';
import { NextPage } from 'next';
import moment from 'moment';
import { Stack } from '@mui/material';
import { useMutation, useQuery } from '@apollo/client';
import withAdminLayout from '../../libs/components/layout/LayoutAdmin';
import AdminPager from '../../libs/components/admin/AdminPager';
import { adminStaticProps } from '../../libs/components/admin/adminStatic';
import { GET_ALL_ORDERS_BY_ADMIN } from '../../apollo/admin/query';
import { UPDATE_ORDER_BY_ADMIN } from '../../apollo/admin/mutation';
import { Order } from '../../libs/types/order';
import { OrderStatus } from '../../libs/enums/order.enum';
import { T } from '../../libs/types/common';
import { formatPrice, labelOf } from '../../libs/utils';
import { orderTabs, statusLabel } from '../../libs/components/mypage/MyOrders';
import { sweetConfirmAlert, sweetErrorHandlingForAdmin, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { useTranslation } from 'next-i18next';

export const getStaticProps = adminStaticProps;

// the moves the server allows from each status; delivered, cancelled and refunded orders are final
const nextStatuses: Partial<Record<OrderStatus, OrderStatus[]>> = {
	[OrderStatus.PAUSE]: [OrderStatus.CANCEL],
	[OrderStatus.PROCESS]: [OrderStatus.DELIVERY, OrderStatus.CANCEL],
	[OrderStatus.DELIVERY]: [OrderStatus.FINISH, OrderStatus.REFUND],
};

const AdminOrders: NextPage = () => {
	const { t } = useTranslation('common');
	const [inquiry, setInquiry] = useState<T>({ page: 1, limit: 10, sort: 'createdAt', direction: 'DESC', search: {} });
	const [openId, setOpenId] = useState<string>('');

	/** APOLLO REQUESTS **/
	const [updateOrderByAdmin] = useMutation(UPDATE_ORDER_BY_ADMIN);
	const { data, refetch } = useQuery(GET_ALL_ORDERS_BY_ADMIN, { fetchPolicy: 'network-only', variables: { input: inquiry } });
	const orders: Order[] = data?.getAllOrdersByAdmin?.list ?? [];
	const total: number = data?.getAllOrdersByAdmin?.metaCounter?.[0]?.total ?? 0;

	/** HANDLERS **/
	const statusHandler = async (order: Order, orderStatus: string) => {
		try {
			if ([OrderStatus.CANCEL, OrderStatus.REFUND].includes(orderStatus as OrderStatus)) {
				if (!(await sweetConfirmAlert(t('Set order {{number}} to {{status}}?', { number: order.orderNumber, status: t(statusLabel(orderStatus as OrderStatus)) })))) return;
			}
			await updateOrderByAdmin({ variables: { input: { _id: order._id, orderStatus } } });
			await refetch();
			await sweetTopSmallSuccessAlert('Updated', 700);
		} catch (err: any) {
			sweetErrorHandlingForAdmin(err).then();
		}
	};

	return (
		<div className={'admin-page'}>
			<div className={'admin-head'}>
				<h2>{t('Orders')}</h2>
				<p>{t('Move paid orders to Shipping, then Delivered. Click a row to see its items.')}</p>
			</div>
			<Stack className={'chips'}>
				{[...orderTabs, { status: OrderStatus.REFUND, label: 'Refunded' }].map((tab) => (
					<button
						key={tab.label}
						className={`chip ${(inquiry.search.orderStatus ?? '') === tab.status ? 'on' : ''}`}
						onClick={() => setInquiry({ ...inquiry, page: 1, search: tab.status ? { orderStatus: tab.status } : {} })}
					>
						{t(tab.label)}
					</button>
				))}
			</Stack>
			<div className={'table-box'}>
				<table>
					<thead>
						<tr>
							<th>{t('Order')}</th>
							<th>{t('Buyer')}</th>
							<th>{t('Date')}</th>
							<th>{t('Total')}</th>
							<th>{t('Payment')}</th>
							<th>{t('Status')}</th>
						</tr>
					</thead>
					<tbody>
						{orders.map((order) => (
							<React.Fragment key={order._id}>
								<tr className={'clickable'} onClick={() => setOpenId(openId === order._id ? '' : order._id)}>
									<td>
										<b>{order.orderNumber}</b>
										<small>{order.orderItems?.length} {t('items')}</small>
									</td>
									<td>{order.memberData?.memberNick}</td>
									<td>{moment(order.createdAt).format('YY.MM.DD HH:mm')}</td>
									<td>{formatPrice(order.orderTotal)}</td>
									<td>{labelOf(order.payments?.[order.payments.length - 1]?.paymentMethod) || '—'}</td>
									<td onClick={(e) => e.stopPropagation()}>
										<select
											aria-label={t('Order status')}
											className={`status-select ${order.orderStatus}`}
											value={order.orderStatus}
											onChange={(e) => statusHandler(order, e.target.value)}
											disabled={!nextStatuses[order.orderStatus]}
										>
											{[order.orderStatus, ...(nextStatuses[order.orderStatus] ?? [])].map((ele) => (
												<option key={ele} value={ele}>
													{t(statusLabel(ele))}
												</option>
											))}
										</select>
									</td>
								</tr>
								{openId === order._id && (
									<tr className={'detail'}>
										<td colSpan={6}>
											<div className={'order-detail-mini'}>
												<div>
													{order.orderItems?.map((item) => (
														<p key={item._id}>
															{item.itemTitle} · {item.itemOptionName} × {item.itemQuantity} — {formatPrice(item.itemPrice * item.itemQuantity)}
														</p>
													))}
												</div>
												<div>
													<p>
														<b>{order.orderAddress?.addressRecipient}</b> · {order.orderAddress?.addressPhone}
													</p>
													<p>
														({order.orderAddress?.addressZip}) {order.orderAddress?.addressLine1} {order.orderAddress?.addressLine2}
													</p>
													{order.orderMemo && <p>{t('Memo:')} {order.orderMemo}</p>}
												</div>
											</div>
										</td>
									</tr>
								)}
							</React.Fragment>
						))}
					</tbody>
				</table>
				{orders.length === 0 && <div className={'no-data'}>{t('No orders found.')}</div>}
			</div>
			<AdminPager page={inquiry.page} limit={inquiry.limit} total={total} onChange={(page) => setInquiry({ ...inquiry, page })} />
		</div>
	);
};

export default withAdminLayout(AdminOrders);

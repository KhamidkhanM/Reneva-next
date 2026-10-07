import React, { useState } from 'react';
import Link from 'next/link';
import moment from 'moment';
import { Pagination, Stack } from '@mui/material';
import { useQuery } from '@apollo/client';
import { GET_MY_ORDERS, GET_SELLER_ORDERS } from '../../../apollo/user/query';
import { Order } from '../../types/order';
import { OrderStatus } from '../../enums/order.enum';
import { formatKRW, imageUrl, labelOf } from '../../utils';
import ProductThumb from '../common/ProductThumb';

export const orderTabs = [
	{ status: '', label: 'All' },
	{ status: OrderStatus.PAUSE, label: 'Waiting payment' },
	{ status: OrderStatus.PROCESS, label: 'Paid' },
	{ status: OrderStatus.DELIVERY, label: 'Shipping' },
	{ status: OrderStatus.FINISH, label: 'Delivered' },
	{ status: OrderStatus.CANCEL, label: 'Canceled' },
];

const statusNames: Record<string, string> = {
	[OrderStatus.PAUSE]: 'Waiting payment',
	[OrderStatus.PROCESS]: 'Paid',
	[OrderStatus.DELIVERY]: 'Shipping',
	[OrderStatus.FINISH]: 'Delivered',
	[OrderStatus.CANCEL]: 'Canceled',
	[OrderStatus.REFUND]: 'Refunded',
};

export const statusLabel = (status: OrderStatus) => statusNames[status] ?? labelOf(status);

interface MyOrdersProps {
	seller?: boolean; // sellers see the orders that contain their products
}

const MyOrders = ({ seller = false }: MyOrdersProps) => {
	const [status, setStatus] = useState<string>('');
	const [page, setPage] = useState<number>(1);
	const limit = 6;
	const query = seller ? GET_SELLER_ORDERS : GET_MY_ORDERS;

	/** APOLLO REQUESTS **/
	const { data } = useQuery(query, {
		fetchPolicy: 'network-only',
		variables: { input: { page, limit, sort: 'createdAt', direction: 'DESC', search: status ? { orderStatus: status } : {} } },
	});
	const result = seller ? data?.getSellerOrders : data?.getMyOrders;
	const orders: Order[] = result?.list ?? [];
	const total: number = result?.metaCounter?.[0]?.total ?? 0;

	return (
		<div className={'my-section'}>
			<div className={'section-head'}>
				<h2>{seller ? 'Store orders' : 'My orders'}</h2>
				<p>{seller ? 'Orders that include your products. Buyers can chat with you from the product page.' : 'Track, pay, confirm and review your orders.'}</p>
			</div>
			<Stack className={'chips'}>
				{orderTabs.map((tab) => (
					<button
						key={tab.label}
						className={`chip ${status === tab.status ? 'on' : ''}`}
						onClick={() => {
							setStatus(tab.status);
							setPage(1);
						}}
					>
						{tab.label}
					</button>
				))}
			</Stack>

			{orders.length === 0 ? (
				<div className={'no-data'}>No orders here yet.</div>
			) : (
				<div className={'order-list'}>
					{orders.map((order) => {
						const first = order.orderItems?.[0];
						const more = (order.orderItems?.length ?? 1) - 1;
						const card = (
							<>
								<ProductThumb image={imageUrl(first?.itemImage)} seed={first?.productId} size={72} radius={18} />
								<span className={'txt'}>
									<span className={'meta'}>
										{moment(order.createdAt).format('YYYY.MM.DD')} · {order.orderNumber}
										{seller && order.memberData ? ` · ${order.memberData.memberNick}` : ''}
									</span>
									<b>
										{first?.itemTitle}
										{more > 0 ? ` and ${more} more` : ''}
									</b>
									<span>{formatKRW(order.orderTotal)}</span>
								</span>
								<span className={`status-pill ${order.orderStatus}`}>{statusLabel(order.orderStatus)}</span>
							</>
						);
						return seller ? (
							<div key={order._id} className={'order-row'}>
								{card}
							</div>
						) : (
							<Link key={order._id} href={{ pathname: '/order/detail', query: { id: order._id } }} className={'order-row'}>
								{card}
							</Link>
						);
					})}
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

export default MyOrders;

import React from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import moment from 'moment';
import { useQuery } from '@apollo/client';
import withAdminLayout from '../../libs/components/layout/LayoutAdmin';
import { adminStaticProps } from '../../libs/components/admin/adminStatic';
import { GET_ALL_BRANDS_BY_ADMIN, GET_ALL_MEMBERS_BY_ADMIN, GET_ALL_ORDERS_BY_ADMIN, GET_ALL_PRODUCTS_BY_ADMIN } from '../../apollo/admin/query';
import { GET_MY_CHAT_ROOMS } from '../../apollo/user/query';
import { Order } from '../../libs/types/order';
import { ChatRoom } from '../../libs/types/chat';
import { ChatStatus } from '../../libs/enums/chat.enum';
import { formatPrice } from '../../libs/utils';
import { statusLabel } from '../../libs/components/mypage/MyOrders';
import { roomTitle } from '../../libs/components/chat/RoomList';
import { openChatRoomById } from '../../libs/components/chat/openChat';

export const getStaticProps = adminStaticProps;

const one = { page: 1, limit: 1 };

const AdminHome: NextPage = () => {
	/** APOLLO REQUESTS **/
	const { data: members } = useQuery(GET_ALL_MEMBERS_BY_ADMIN, { fetchPolicy: 'network-only', variables: { input: { ...one, search: {} } } });
	const { data: products } = useQuery(GET_ALL_PRODUCTS_BY_ADMIN, { fetchPolicy: 'network-only', variables: { input: { ...one, search: {} } } });
	const { data: brands } = useQuery(GET_ALL_BRANDS_BY_ADMIN, { fetchPolicy: 'network-only', variables: { input: { ...one, search: {} } } });
	const { data: orders } = useQuery(GET_ALL_ORDERS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: { page: 1, limit: 6, sort: 'createdAt', direction: 'DESC', search: {} } },
	});
	const { data: rooms } = useQuery(GET_MY_CHAT_ROOMS, { fetchPolicy: 'network-only', variables: { input: { page: 1, limit: 6 } } });

	const count = (data: any, key: string): number => data?.[key]?.metaCounter?.[0]?.total ?? 0;
	const recentOrders: Order[] = orders?.getAllOrdersByAdmin?.list ?? [];
	const openRooms: ChatRoom[] = (rooms?.getMyChatRooms?.list ?? []).filter((ele: ChatRoom) => ele.chatStatus !== ChatStatus.CLOSED);

	const cards = [
		{ label: 'Members', value: count(members, 'getAllMembersByAdmin'), href: '/_admin/users', tone: 'lilac' },
		{ label: 'Products', value: count(products, 'getAllProductsByAdmin'), href: '/_admin/products', tone: 'peach' },
		{ label: 'Brands', value: count(brands, 'getAllBrandsByAdmin'), href: '/_admin/brands', tone: 'lilac' },
		{ label: 'Orders', value: count(orders, 'getAllOrdersByAdmin'), href: '/_admin/orders', tone: 'peach' },
	];

	return (
		<div className={'admin-page'}>
			<div className={'admin-head'}>
				<h2>Dashboard</h2>
				<p>{moment().format('dddd, MMMM D')}</p>
			</div>
			<div className={'stat-grid'}>
				{cards.map((card) => (
					<Link key={card.label} href={card.href} className={`stat-card ${card.tone}`}>
						<span>{card.label}</span>
						<b>{card.value}</b>
					</Link>
				))}
			</div>
			<div className={'admin-columns'}>
				<section className={'box'}>
					<h2>Recent orders</h2>
					{recentOrders.length === 0 ? (
						<p className={'hint'}>No orders yet.</p>
					) : (
						<div className={'table-box flat'}>
							<table>
								<tbody>
									{recentOrders.map((order) => (
										<tr key={order._id}>
											<td>
												<b>{order.orderNumber}</b>
												<small>{order.memberData?.memberNick}</small>
											</td>
											<td>{formatPrice(order.orderTotal)}</td>
											<td>
												<span className={`status-pill ${order.orderStatus}`}>{statusLabel(order.orderStatus)}</span>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</section>
				<section className={'box'}>
					<h2>Open support chats</h2>
					{openRooms.length === 0 ? (
						<p className={'hint'}>No open chats. Members reach you from CS, order pages and Rena.</p>
					) : (
						<div className={'room-mini-list'}>
							{openRooms.map((room) => (
								<button key={room._id} onClick={() => openChatRoomById(room._id)}>
									<b>{roomTitle(room, '')}</b>
									<span>{room.lastMessage || 'No messages yet'}</span>
									{room.agentUnread > 0 && <em>{room.agentUnread}</em>}
								</button>
							))}
						</div>
					)}
				</section>
			</div>
		</div>
	);
};

export default withAdminLayout(AdminHome);

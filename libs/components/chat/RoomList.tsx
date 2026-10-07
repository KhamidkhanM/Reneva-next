import React from 'react';
import { Badge, Stack } from '@mui/material';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import { useReactiveVar } from '@apollo/client';
import { useRouter } from 'next/router';
import moment from 'moment';
import { userVar } from '../../../apollo/store';
import { ChatRoom } from '../../types/chat';
import { ChatType } from '../../enums/chat.enum';
import { memberImage } from '../../utils';
import { openSupportChat } from './openChat';

interface RoomListProps {
	rooms: ChatRoom[];
	memberId: string;
	openRoom: (roomId: string) => void;
}

export const roomTitle = (room: ChatRoom, memberId: string) => {
	const iAmCustomer = room.customerId === memberId;
	if (room.chatType === ChatType.SUPPORT) return iAmCustomer ? 'Reneva support' : `${room.customerData?.memberNick ?? 'Customer'} · support`;
	return iAmCustomer ? `${room.agentData?.memberNick ?? 'Store'} · store` : room.customerData?.memberNick ?? 'Customer';
};

export const roomAvatar = (room: ChatRoom, memberId: string) => {
	const iAmCustomer = room.customerId === memberId;
	if (room.chatType === ChatType.SUPPORT && iAmCustomer) return '/img/logo/reneva-mark.svg';
	return memberImage(iAmCustomer ? room.agentData?.memberImage : room.customerData?.memberImage);
};

const RoomList = ({ rooms, memberId, openRoom }: RoomListProps) => {
	const user = useReactiveVar(userVar);
	const router = useRouter();

	if (!user._id) {
		return (
			<Stack className={'room-empty'}>
				<strong>Your 1:1 chats</strong>
				<p>Login to chat with stores about their products, or with Reneva support about orders and reports.</p>
				<button className={'primary-btn'} onClick={() => router.push('/account/join')}>
					Login
				</button>
			</Stack>
		);
	}

	return (
		<Stack className={'room-list'}>
			<button className={'support-card'} onClick={() => openSupportChat()}>
				<SupportAgentOutlinedIcon />
				<span className={'txt'}>
					<b>Contact Reneva support</b>
					<span>Reports, refunds, delivery or account requests</span>
				</span>
			</button>
			<p className={'hint'}>To ask a store about a product, press “Chat with store” on its product page.</p>

			{rooms.length === 0 ? (
				<div className={'no-rooms'}>No conversations yet.</div>
			) : (
				rooms.map((room) => {
					const unread = room.customerId === memberId ? room.customerUnread : room.agentUnread;
					return (
						<button key={room._id} className={`room ${unread ? 'unread' : ''}`} onClick={() => openRoom(room._id)}>
							<Badge color={'secondary'} variant={'dot'} invisible={!unread} overlap={'circular'}>
								<img src={roomAvatar(room, memberId)} alt={''} />
							</Badge>
							<span className={'txt'}>
								<span className={'row'}>
									<b>{roomTitle(room, memberId)}</b>
									<span className={'time'}>{room.lastMessageAt ? moment(room.lastMessageAt).fromNow() : ''}</span>
								</span>
								{room.productData && <span className={'about'}>About: {room.productData.productTitle}</span>}
								<span className={'preview'}>{room.lastMessage || 'No messages yet'}</span>
							</span>
							{unread > 0 && <span className={'count'}>{unread}</span>}
						</button>
					);
				})
			)}
		</Stack>
	);
};

export default RoomList;

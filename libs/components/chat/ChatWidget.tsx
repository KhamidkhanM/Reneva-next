import React, { useCallback } from 'react';
import { Badge, Box, IconButton, Stack } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { useQuery, useReactiveVar } from '@apollo/client';
import { chatWidgetVar, unreadChatVar, userVar } from '../../../apollo/store';
import { GET_MY_CHAT_ROOMS } from '../../../apollo/user/query';
import useChatSocket, { SocketEvent } from '../../hooks/useChatSocket';
import { ChatRoom } from '../../types/chat';
import { T } from '../../types/common';
import AiChatPanel from './AiChatPanel';
import RoomList from './RoomList';
import RoomConversation from './RoomConversation';
import { useTranslation } from 'next-i18next';

const myUnread = (room: ChatRoom, memberId: string) =>
	room.customerId === memberId ? room.customerUnread : room.agentId === memberId ? room.agentUnread : 0;

const ChatWidget = () => {
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const widget = useReactiveVar(chatWidgetVar);
	const unread = useReactiveVar(unreadChatVar);

	/** APOLLO REQUESTS **/
	const { data: roomsData, refetch: roomsRefetch } = useQuery(GET_MY_CHAT_ROOMS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: { page: 1, limit: 30 } },
		skip: !user._id,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			const rooms: ChatRoom[] = data?.getMyChatRooms?.list ?? [];
			unreadChatVar(rooms.reduce((sum, room) => sum + myUnread(room, user._id), 0));
		},
	});
	const rooms: ChatRoom[] = roomsData?.getMyChatRooms?.list ?? [];

	/** LIVE UPDATES **/
	const socketListener = useCallback(
		(socketEvent: SocketEvent) => {
			if (socketEvent.event === 'message' || socketEvent.event === 'read') roomsRefetch().then();
		},
		[roomsRefetch],
	);
	useChatSocket(socketListener, !!user._id);

	/** HANDLERS **/
	const toggleHandler = () => chatWidgetVar({ ...widget, open: !widget.open });
	const tabHandler = (tab: 'ai' | 'messages') => chatWidgetVar({ ...widget, tab, roomId: tab === 'ai' ? widget.roomId : null });
	const openRoomHandler = (roomId: string | null) => chatWidgetVar({ ...widget, tab: 'messages', roomId });

	return (
		<Stack className={'chat-widget'}>
			<Stack className={`chat-frame ${widget.open ? 'open' : ''}`} role={'dialog'} aria-label={t('Chat')}>
				<Box component={'div'} className={'chat-head'}>
					<div className={'tabs'}>
						<button className={widget.tab === 'ai' ? 'on' : ''} onClick={() => tabHandler('ai')}>
							<img src={'/img/logo/rena-ai.svg'} alt={''} />
							{t('Rena AI')}
						</button>
						<button className={widget.tab === 'messages' ? 'on' : ''} onClick={() => tabHandler('messages')}>
							{t('Messages')}
							{unread > 0 && <span className={'count'}>{unread}</span>}
						</button>
					</div>
					<IconButton aria-label={t('Close chat')} onClick={toggleHandler} size={'small'}>
						<CloseRoundedIcon />
					</IconButton>
				</Box>

				<Box component={'div'} className={'chat-body'}>
					{widget.tab === 'ai' && <AiChatPanel />}
					{widget.tab === 'messages' && !widget.roomId && (
						<RoomList rooms={rooms} memberId={user._id} openRoom={openRoomHandler} />
					)}
					{widget.tab === 'messages' && widget.roomId && (
						<RoomConversation roomId={widget.roomId} back={() => openRoomHandler(null)} onRead={() => roomsRefetch()} />
					)}
				</Box>
			</Stack>

			<button className={`chat-button ${widget.open ? 'open' : ''}`} onClick={toggleHandler} aria-label={widget.open ? t('Close chat') : t('Open chat')}>
				<Badge badgeContent={unread} color={'secondary'} invisible={widget.open || unread === 0}>
					{widget.open ? <CloseRoundedIcon /> : <img src={'/img/logo/rena-ai.svg'} alt={''} />}
				</Badge>
			</button>
		</Stack>
	);
};

export default ChatWidget;

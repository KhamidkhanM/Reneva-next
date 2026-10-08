import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { IconButton, Stack } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import moment from 'moment';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { GET_CHAT_MESSAGES, GET_CHAT_ROOM } from '../../../apollo/user/query';
import { IMAGE_UPLOADER, MARK_CHAT_ROOM_READ, SEND_CHAT_MESSAGE } from '../../../apollo/user/mutation';
import useChatSocket, { SocketEvent, sendSocketEvent } from '../../hooks/useChatSocket';
import { ChatMessage, ChatRoom } from '../../types/chat';
import { ChatType, MessageStatus, MessageType } from '../../enums/chat.enum';
import { T } from '../../types/common';
import { formatPrice, imageUrl } from '../../utils';
import { sweetMixinErrorAlert } from '../../sweetAlert';
import { roomAvatar, roomTitle } from './RoomList';
import ProductThumb from '../common/ProductThumb';

const supportTopics = ['Report a product or seller', 'Refund or return request', 'Delivery problem', 'Account or payment issue'];

interface RoomConversationProps {
	roomId: string;
	back: () => void;
	onRead: () => void;
}

const RoomConversation = ({ roomId, back, onRead }: RoomConversationProps) => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [text, setText] = useState<string>('');
	const [sending, setSending] = useState<boolean>(false);
	const feedRef = useRef<HTMLDivElement>(null);
	const fileRef = useRef<HTMLInputElement>(null);

	/** APOLLO REQUESTS **/
	const [sendChatMessage] = useMutation(SEND_CHAT_MESSAGE);
	const [markChatRoomRead] = useMutation(MARK_CHAT_ROOM_READ);
	const [imageUploader] = useMutation(IMAGE_UPLOADER);

	const { data: roomData } = useQuery(GET_CHAT_ROOM, {
		fetchPolicy: 'network-only',
		variables: { input: roomId },
	});
	const room: ChatRoom | undefined = roomData?.getChatRoom;

	useQuery(GET_CHAT_MESSAGES, {
		fetchPolicy: 'network-only',
		variables: { input: { page: 1, limit: 50, roomId } },
		onCompleted: (data: T) => {
			// the server sends newest first
			setMessages([...(data?.getChatMessages?.list ?? [])].reverse());
			markRead();
		},
	});

	/** LIVE UPDATES **/
	const socketListener = useCallback(
		(socketEvent: SocketEvent) => {
			if (socketEvent.event === 'message' && socketEvent.data?.roomId === roomId) {
				const incoming: ChatMessage = socketEvent.data;
				setMessages((prev) => (prev.some((ele) => ele._id === incoming._id) ? prev : [...prev, incoming]));
				if (incoming.senderId !== user._id) markRead();
			}
			if (socketEvent.event === 'read' && socketEvent.data?.roomId === roomId && socketEvent.data?.readerId !== user._id) {
				setMessages((prev) =>
					prev.map((ele) => (ele.senderId === user._id ? { ...ele, messageStatus: MessageStatus.READ } : ele)),
				);
			}
		},
		[roomId, user._id],
	);
	const socketOpen = useChatSocket(socketListener, !!user._id);

	useEffect(() => {
		feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight });
	}, [messages]);

	/** HANDLERS **/
	const markRead = () => {
		if (!sendSocketEvent('read', { roomId })) {
			markChatRoomRead({ variables: { input: roomId } }).catch(() => undefined);
		}
		setTimeout(onRead, 300);
	};

	const send = async (input: T) => {
		setSending(true);
		try {
			// live path: the server saves it and pushes it back to both of us
			if (sendSocketEvent('message', { roomId, ...input })) return;
			const result = await sendChatMessage({ variables: { input: { roomId, ...input } } });
			const saved: ChatMessage = result.data.sendChatMessage;
			setMessages((prev) => (prev.some((ele) => ele._id === saved._id) ? prev : [...prev, saved]));
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		} finally {
			setSending(false);
		}
	};

	const sendTextHandler = async () => {
		const content = text.trim();
		if (!content) return;
		setText('');
		await send({ messageType: MessageType.TEXT, messageContent: content });
	};

	const uploadImageHandler = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		e.target.value = '';
		if (!file) return;
		try {
			const result = await imageUploader({ variables: { file, target: 'chat' } });
			await send({ messageType: MessageType.IMAGE, messageImage: result.data.imageUploader, messageContent: '' });
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const keyHandler = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			sendTextHandler();
		}
	};

	const isSupport = room?.chatType === ChatType.SUPPORT;
	const showTopics = isSupport && room?.customerId === user._id && messages.filter((m) => m.messageType !== MessageType.SYSTEM).length === 0;

	return (
		<Stack className={'room-chat'}>
			<div className={'room-head'}>
				<IconButton aria-label={'Back to all chats'} size={'small'} onClick={back}>
					<ArrowBackRoundedIcon />
				</IconButton>
				{room && <img src={roomAvatar(room, user._id)} alt={''} />}
				<div className={'who'}>
					<strong>{room ? roomTitle(room, user._id) : 'Loading…'}</strong>
					<span>{socketOpen ? 'Live' : 'Connecting…'}</span>
				</div>
			</div>

			{room?.productData && (
				<button
					className={'room-product'}
					onClick={() => router.push({ pathname: '/product/detail', query: { id: room.productData?._id } })}
				>
					<ProductThumb image={imageUrl(room.productData.productImages?.[0])} size={40} seed={room.productData._id} radius={12} />
					<span>
						<b>{room.productData.productTitle}</b>
						<span>{formatPrice(room.productData.productSalePrice)}</span>
					</span>
				</button>
			)}

			<div className={'room-feed'} ref={feedRef}>
				{messages.map((message) => {
					if (message.messageType === MessageType.SYSTEM) {
						return (
							<div key={message._id} className={'system-msg'}>
								{message.messageContent}
							</div>
						);
					}
					const mine = message.senderId === user._id;
					return (
						<div key={message._id} className={`room-msg ${mine ? 'mine' : 'theirs'}`}>
							<div className={'bubble'}>
								{message.messageType === MessageType.IMAGE && message.messageImage ? (
									<img src={imageUrl(message.messageImage)} alt={'Sent image'} />
								) : (
									message.messageContent
								)}
							</div>
							<span className={'meta'}>
								{moment(message.createdAt).format('HH:mm')}
								{mine && message.messageStatus === MessageStatus.READ && <DoneAllRoundedIcon fontSize={'inherit'} />}
							</span>
						</div>
					);
				})}
				{messages.length === 0 && (
					<div className={'system-msg'}>
						{isSupport ? 'Tell us what happened and a Reneva admin will reply here.' : 'Ask the store anything about this product.'}
					</div>
				)}
			</div>

			{showTopics && (
				<div className={'quick-replies'}>
					{supportTopics.map((topic) => (
						<button key={topic} onClick={() => setText(`${topic}: `)}>
							{topic}
						</button>
					))}
				</div>
			)}

			<div className={'ai-input'}>
				<input ref={fileRef} type={'file'} accept={'image/png,image/jpeg'} hidden onChange={uploadImageHandler} />
				<IconButton aria-label={'Send a photo'} onClick={() => fileRef.current?.click()} size={'small'}>
					<ImageOutlinedIcon />
				</IconButton>
				<label className={'sr-only'} htmlFor={'room-input'}>
					Message
				</label>
				<textarea
					id={'room-input'}
					rows={1}
					value={text}
					placeholder={'Write a message…'}
					onChange={(e) => setText(e.target.value)}
					onKeyDown={keyHandler}
					maxLength={2000}
				/>
				<button className={'send-btn'} aria-label={'Send'} onClick={sendTextHandler} disabled={sending || !text.trim()}>
					<SendRoundedIcon />
				</button>
			</div>
		</Stack>
	);
};

export default RoomConversation;

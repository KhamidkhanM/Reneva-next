import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { Box, CircularProgress, IconButton, Stack } from '@mui/material';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';
import ThumbDownAltOutlinedIcon from '@mui/icons-material/ThumbDownAltOutlined';
import AddCommentOutlinedIcon from '@mui/icons-material/AddCommentOutlined';
import { useApolloClient, useMutation, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { GET_AI_MESSAGES, GET_MY_AI_CHATS } from '../../../apollo/user/query';
import { CREATE_AI_CHAT, FEEDBACK_AI_MESSAGE, SEND_AI_MESSAGE } from '../../../apollo/user/mutation';
import { AiChat, AiMessage } from '../../types/chat';
import { AiChatStatus, AiChatType, AiMessageFeedback, AiMessageRole } from '../../enums/ai.enum';
import { formatKRW, imageUrl, labelOf } from '../../utils';
import { sweetMixinErrorAlert } from '../../sweetAlert';
import { openChatRoomById } from './openChat';
import ProductThumb from '../common/ProductThumb';
import { useTranslation } from 'next-i18next';

const quickReplies = [
	'My skin gets dry in winter, which cream?',
	'Build me a simple night routine',
	'Is retinol safe for sensitive skin?',
	'I have a problem with my order',
];

interface AiChatPanelProps {
	variant?: 'widget' | 'page';
	aiChatType?: AiChatType;
	analysisId?: string;
	initialChat?: AiChat | null; // open this past chat instead of the latest one
	onChatChange?: () => void;
	startFresh?: boolean; // begin a new conversation instead of loading one
}

const AiChatPanel = ({ variant = 'widget', aiChatType = AiChatType.ADVISOR, analysisId, initialChat, onChatChange, startFresh }: AiChatPanelProps) => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const client = useApolloClient();
	const [aiChat, setAiChat] = useState<AiChat | null>(null);
	const [messages, setMessages] = useState<AiMessage[]>([]);
	const [text, setText] = useState<string>('');
	const [thinking, setThinking] = useState<boolean>(false);
	const [loaded, setLoaded] = useState<boolean>(false);
	const feedRef = useRef<HTMLDivElement>(null);

	/** APOLLO REQUESTS **/
	const [createAiChat] = useMutation(CREATE_AI_CHAT);
	const [sendAiMessage] = useMutation(SEND_AI_MESSAGE);
	const [feedbackAiMessage] = useMutation(FEEDBACK_AI_MESSAGE);

	/** LIFECYCLES **/
	useEffect(() => {
		if (!user._id || loaded || analysisId || startFresh) return;
		// continue the chosen or the latest conversation
		(async () => {
			try {
				if (initialChat) {
					await loadChat(initialChat);
					setLoaded(true);
					return;
				}
				const { data } = await client.query({
					query: GET_MY_AI_CHATS,
					variables: { input: { page: 1, limit: 1 } },
					fetchPolicy: 'network-only',
				});
				const latest: AiChat | undefined = data?.getMyAiChats?.list?.[0];
				if (latest) await loadChat(latest);
			} catch (err: any) {
				console.log('ERROR, load ai chat:', err.message);
			}
			setLoaded(true);
		})();
	}, [user._id]);

	useEffect(() => {
		feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: 'smooth' });
	}, [messages, thinking]);

	/** HANDLERS **/
	const loadChat = async (chat: AiChat) => {
		setAiChat(chat);
		const { data } = await client.query({
			query: GET_AI_MESSAGES,
			variables: { input: { page: 1, limit: 50, aiChatId: chat._id } },
			fetchPolicy: 'network-only',
		});
		setMessages(data?.getAiMessages?.list ?? []);
	};

	const newChatHandler = () => {
		setAiChat(null);
		setMessages([]);
	};

	const sendHandler = async (content?: string) => {
		const question = (content ?? text).trim();
		if (!question || thinking) return;
		if (!user._id) return router.push('/account/join');

		const tempMessage: AiMessage = {
			_id: `temp-${Date.now()}`,
			aiChatId: aiChat?._id ?? '',
			aiMessageRole: AiMessageRole.USER,
			aiMessageContent: question,
			aiMessageProducts: [],
			aiMessageFeedback: AiMessageFeedback.NONE,
			createdAt: new Date(),
		};
		setMessages((prev) => [...prev, tempMessage]);
		setText('');
		setThinking(true);

		try {
			let chat = aiChat;
			if (!chat || chat.aiChatStatus !== AiChatStatus.ACTIVE) {
				const created = await createAiChat({ variables: { input: { aiChatType, analysisId } } });
				chat = created.data.createAiChat as AiChat;
				setAiChat(chat);
			}
			const result = await sendAiMessage({ variables: { input: { aiChatId: chat._id, aiMessageContent: question } } });
			const reply = result.data.sendAiMessage;
			setAiChat(reply.aiChat);
			setMessages((prev) => [...prev, reply.message]);
			onChatChange?.();
		} catch (err: any) {
			console.log('ERROR, sendAiMessage:', err.message);
			setMessages((prev) => prev.filter((ele) => ele._id !== tempMessage._id));
			setText(question);
		} finally {
			setThinking(false);
		}
	};

	const feedbackHandler = async (message: AiMessage, feedback: AiMessageFeedback) => {
		try {
			const next = message.aiMessageFeedback === feedback ? AiMessageFeedback.NONE : feedback;
			await feedbackAiMessage({ variables: { input: { aiMessageId: message._id, aiMessageFeedback: next } } });
			setMessages((prev) => prev.map((ele) => (ele._id === message._id ? { ...ele, aiMessageFeedback: next } : ele)));
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const keyHandler = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			sendHandler();
		}
	};

	const handedOff = aiChat?.aiChatStatus === AiChatStatus.HANDOFF;

	return (
		<Stack className={`ai-chat ${variant}`}>
			<Box component={'div'} className={'ai-chat-top'}>
				<img src={'/img/logo/rena-ai.svg'} alt={''} className={'avatar'} />
				<div className={'who'}>
					<strong>{t('Rena')}</strong>
					<span>{t('AI beauty advisor · recommends real Reneva products')}</span>
				</div>
				{messages.length > 0 && (
					<IconButton aria-label={t('Start a new chat')} title={t('New chat')} onClick={newChatHandler} size={'small'}>
						<AddCommentOutlinedIcon fontSize={'small'} />
					</IconButton>
				)}
			</Box>

			<Box component={'div'} className={'ai-feed'} ref={feedRef}>
				{messages.length === 0 && (
					<Stack className={'ai-welcome'}>
						<img src={'/img/logo/rena-ai.svg'} alt={''} />
						<strong>{t('Hi')}{user.memberNick ? `, ${user.memberNick}` : ''}{t('! I\'m Rena.')}</strong>
						<p>
							{t('Tell me about your skin or what you are looking for. I pick from products Reneva really sells')}
							{user.memberSkinType ? t(', with your {{skin}} skin in mind', { skin: t(labelOf(user.memberSkinType)).toLowerCase() }) : ''}.
						</p>
						{!user._id && (
							<button className={'primary-btn'} onClick={() => router.push('/account/join')}>
								{t('Login to chat with Rena')}
							</button>
						)}
					</Stack>
				)}

				{messages.map((message) => {
					const mine = message.aiMessageRole === AiMessageRole.USER;
					return (
						<div key={message._id} className={`ai-msg ${mine ? 'mine' : 'rena'}`}>
							{!mine && <img src={'/img/logo/rena-ai.svg'} alt={''} className={'mini-avatar'} />}
							<div className={'bubble-wrap'}>
								<div className={'bubble'}>{message.aiMessageContent}</div>
								{!!message.productsData?.length && (
									<div className={'ai-products'}>
										{message.productsData.map((product) => (
											<button
												key={product._id}
												className={'ai-product'}
												onClick={() => router.push({ pathname: '/product/detail', query: { id: product._id } })}
											>
												<ProductThumb image={imageUrl(product.productImages?.[0])} size={48} seed={product._id} />
												<span className={'txt'}>
													<b>{product.productTitle}</b>
													<span>
														{formatKRW(product.productSalePrice)} · ★ {product.productRating?.toFixed(1)}
													</span>
												</span>
											</button>
										))}
									</div>
								)}
								{!mine && !message._id.startsWith('temp') && (
									<div className={'feedback'}>
										<IconButton
											aria-label={t('Helpful')}
											size={'small'}
											className={message.aiMessageFeedback === AiMessageFeedback.LIKE ? 'on' : ''}
											onClick={() => feedbackHandler(message, AiMessageFeedback.LIKE)}
										>
											<ThumbUpAltOutlinedIcon fontSize={'inherit'} />
										</IconButton>
										<IconButton
											aria-label={t('Not helpful')}
											size={'small'}
											className={message.aiMessageFeedback === AiMessageFeedback.DISLIKE ? 'on' : ''}
											onClick={() => feedbackHandler(message, AiMessageFeedback.DISLIKE)}
										>
											<ThumbDownAltOutlinedIcon fontSize={'inherit'} />
										</IconButton>
									</div>
								)}
							</div>
						</div>
					);
				})}

				{thinking && (
					<div className={'ai-msg rena'}>
						<img src={'/img/logo/rena-ai.svg'} alt={''} className={'mini-avatar'} />
						<div className={'bubble thinking'}>
							<CircularProgress size={14} /> {t('Rena is thinking…')}
						</div>
					</div>
				)}

				{handedOff && (
					<div className={'handoff'}>
						<span>{t('Rena passed this to Reneva support. A person will answer you in Messages.')}</span>
						{aiChat?.roomId && (
							<button className={'primary-btn'} onClick={() => openChatRoomById(aiChat.roomId as string)}>
								{t('Open support chat')}
							</button>
						)}
						<button className={'ghost-btn'} onClick={newChatHandler}>
							{t('Ask Rena something else')}
						</button>
					</div>
				)}
			</Box>

			{!handedOff && (
				<>
					{messages.length === 0 && user._id && (
						<div className={'quick-replies'}>
							{quickReplies.map((reply) => (
								<button key={reply} onClick={() => sendHandler(reply)} disabled={thinking}>
									{reply}
								</button>
							))}
						</div>
					)}
					<Box component={'div'} className={'ai-input'}>
						<label className={'sr-only'} htmlFor={`ai-input-${variant}`}>
							{t('Message Rena')}
						</label>
						<textarea
							id={`ai-input-${variant}`}
							rows={1}
							value={text}
							placeholder={user._id ? t('Ask about skin, routines, ingredients…') : t('Login to chat with Rena')}
							disabled={!user._id || thinking}
							onChange={(e) => setText(e.target.value)}
							onKeyDown={keyHandler}
							maxLength={2000}
						/>
						<button
							className={'send-btn'}
							aria-label={t('Send')}
							onClick={() => sendHandler()}
							disabled={!user._id || thinking || !text.trim()}
						>
							<SendRoundedIcon />
						</button>
					</Box>
				</>
			)}
		</Stack>
	);
};

export default AiChatPanel;

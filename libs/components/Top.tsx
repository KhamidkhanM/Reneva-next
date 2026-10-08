import React, { useCallback, useEffect, useState } from 'react';
import { useRouter, withRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import moment from 'moment';
import { Badge, Box, Button, IconButton, Menu, MenuItem, Stack } from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { Logout } from '@mui/icons-material';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { getJwtToken, logOut, updateUserInfo } from '../auth';
import useDeviceDetect from '../hooks/useDeviceDetect';
import { chatWidgetVar, unreadChatVar, userVar } from '../../apollo/store';
import { GET_MY_CART, GET_MY_NOTIFICATIONS } from '../../apollo/user/query';
import { READ_ALL_NOTIFICATIONS, READ_NOTIFICATION } from '../../apollo/user/mutation';
import { Notification } from '../types/community';
import { labelOf, memberImage } from '../utils';
import { openChatRoomById } from './chat/openChat';

const Top = () => {
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const unreadChats = useReactiveVar(unreadChatVar);
	const { t } = useTranslation('common');
	const router = useRouter();
	const [lang, setLang] = useState<string | null>(router.locale ?? 'uz');
	const [langAnchor, setLangAnchor] = useState<null | HTMLElement>(null);
	const [userAnchor, setUserAnchor] = useState<null | HTMLElement>(null);
	const [noteAnchor, setNoteAnchor] = useState<null | HTMLElement>(null);
	const [scrolled, setScrolled] = useState<boolean>(false);

	/** APOLLO REQUESTS **/
	const { data: cartData } = useQuery(GET_MY_CART, { skip: !user._id, fetchPolicy: 'cache-and-network' });
	const { data: noteData, refetch: noteRefetch } = useQuery(GET_MY_NOTIFICATIONS, {
		skip: !user._id,
		fetchPolicy: 'cache-and-network',
		variables: { input: { page: 1, limit: 8 } },
	});
	const [readNotification] = useMutation(READ_NOTIFICATION);
	const [readAllNotifications] = useMutation(READ_ALL_NOTIFICATIONS);

	const cartCount: number = cartData?.getMyCart?.list?.length ?? 0;
	const notifications: Notification[] = noteData?.getMyNotifications?.list ?? [];
	const unreadNotes: number = noteData?.getMyNotifications?.unreadCount ?? 0;

	/** LIFECYCLES **/
	// the flag follows the language in the URL
	useEffect(() => {
		setLang(router.locale ?? 'uz');
		localStorage.setItem('locale', router.locale ?? 'uz');
	}, [router.locale]);

	useEffect(() => {
		const jwt = getJwtToken();
		if (jwt) updateUserInfo(jwt);
	}, []);

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY >= 30);
		window.addEventListener('scroll', onScroll);
		return () => window.removeEventListener('scroll', onScroll);
	}, []);

	/** HANDLERS **/
	const langChoice = useCallback(
		async (locale: string) => {
			setLang(locale);
			localStorage.setItem('locale', locale);
			setLangAnchor(null);
			await router.push(router.asPath, router.asPath, { locale });
		},
		[router],
	);

	const notificationHandler = async (note: Notification) => {
		setNoteAnchor(null);
		try {
			await readNotification({ variables: { input: note._id } });
			await noteRefetch();
		} catch (err) {
			console.log('ERROR, readNotification', err);
		}
		if (note.roomId) return openChatRoomById(note.roomId);
		if (note.orderId) return router.push({ pathname: '/order/detail', query: { id: note.orderId } });
		if (note.productId) return router.push({ pathname: '/product/detail', query: { id: note.productId } });
		if (note.articleId) return router.push({ pathname: '/community/detail', query: { id: note.articleId } });
	};

	const readAllHandler = async () => {
		await readAllNotifications();
		await noteRefetch();
	};

	const isActive = (path: string) => (path === '/' ? router.pathname === '/' : router.pathname.startsWith(path));

	const links = [
		{ href: '/', label: 'Home' },
		{ href: '/product', label: 'Shop' },
		{ href: '/brand', label: 'Brands' },
		{ href: '/community?articleCategory=FREE', label: 'Community', path: '/community' },
		{ href: '/ai', label: 'AI Advisor' },
		{ href: '/cs', label: 'CS' },
	];

	// search, notifications, cart, language and account menu: shared by the phone bar and the desktop bar
	const userBox = (
		<Box component={'div'} className={'user-box'}>
			<IconButton aria-label={t('Search')} className={'round-btn'} onClick={() => router.push('/product')}>
				<SearchRoundedIcon />
			</IconButton>

			{user._id && (
				<>
					<IconButton
						aria-label={`${t('Notifications')}, ${t('{{n}} unread', { n: unreadNotes })}`}
						className={'round-btn'}
						onClick={(e) => setNoteAnchor(e.currentTarget)}
					>
						<Badge badgeContent={unreadNotes} color={'secondary'}>
							<NotificationsNoneRoundedIcon />
						</Badge>
					</IconButton>
					<Menu
						anchorEl={noteAnchor}
						open={Boolean(noteAnchor)}
						onClose={() => setNoteAnchor(null)}
						PaperProps={{ className: 'notification-menu' }}
					>
						<div className={'note-head'}>
							<strong>{t('Notifications')}</strong>
							{unreadNotes > 0 && <button onClick={readAllHandler}>{t('Mark all read')}</button>}
						</div>
						{notifications.length === 0 && <div className={'note-empty'}>{t('No notifications yet')}</div>}
						{notifications.map((note) => (
							<MenuItem
								key={note._id}
								onClick={() => notificationHandler(note)}
								className={note.notificationStatus === 'WAIT' ? 'unread' : ''}
							>
								<div className={'note-row'}>
									<b>{note.notificationTitle}</b>
									{note.notificationDesc && <span>{note.notificationDesc}</span>}
									<small>{moment(note.createdAt).fromNow()}</small>
								</div>
							</MenuItem>
						))}
					</Menu>

					<IconButton
						aria-label={`${t('Cart')}, ${cartCount} ${t('items')}`}
						className={'round-btn'}
						onClick={() => router.push('/cart')}
					>
						<Badge badgeContent={cartCount} color={'primary'}>
							<ShoppingBagOutlinedIcon />
						</Badge>
					</IconButton>
				</>
			)}

			<Button
				disableRipple
				className={'btn-lang'}
				onClick={(e) => setLangAnchor(e.currentTarget)}
				endIcon={<KeyboardArrowDownRoundedIcon />}
				aria-label={t('Language')}
			>
				<img src={`/img/flag/lang${lang ?? 'uz'}.png`} alt={''} className={'flag'} />
			</Button>
			<Menu anchorEl={langAnchor} open={Boolean(langAnchor)} onClose={() => setLangAnchor(null)}>
				{[
					{ id: 'uz', label: 'Uzbek' },
					{ id: 'en', label: 'English' },
					{ id: 'kr', label: 'Korean' },
					{ id: 'ru', label: 'Russian' },
				].map((item) => (
					<MenuItem key={item.id} onClick={() => langChoice(item.id)}>
						<img className={'img-flag'} src={`/img/flag/lang${item.id}.png`} alt={''} />
						{t(item.label)}
					</MenuItem>
				))}
			</Menu>

			{user._id ? (
				<>
					<button className={'login-user'} onClick={(e) => setUserAnchor(e.currentTarget)} aria-label={t('Account menu')}>
						<Badge color={'secondary'} variant={'dot'} invisible={!unreadChats} overlap={'circular'}>
							<img src={memberImage(user.memberImage)} alt={''} />
						</Badge>
					</button>
					<Menu anchorEl={userAnchor} open={Boolean(userAnchor)} onClose={() => setUserAnchor(null)} sx={{ mt: '8px' }}>
						<div className={'user-menu-head'}>
							<b>{user.memberNick}</b>
							<span>
								{user.memberType === 'USER' ? t('{{level}} member', { level: labelOf(user.memberLevel) }) : t(labelOf(user.memberType))} · {user.memberPoints}P
							</span>
						</div>
						<MenuItem onClick={() => router.push('/mypage')}>{t('My Page')}</MenuItem>
						<MenuItem onClick={() => router.push('/mypage?category=myOrders')}>{t('My orders')}</MenuItem>
						<MenuItem
							onClick={() => {
								setUserAnchor(null);
								chatWidgetVar({ open: true, tab: 'messages', roomId: null });
							}}
						>
							{t('Messages')} {unreadChats > 0 && `(${unreadChats})`}
						</MenuItem>
						{user.memberType === 'ADMIN' && <MenuItem onClick={() => router.push('/_admin')}>{t('Admin panel')}</MenuItem>}
						<MenuItem onClick={() => logOut()}>
							<Logout fontSize={'small'} style={{ marginRight: '10px' }} />
							{t('Logout')}
						</MenuItem>
					</Menu>
				</>
			) : (
				<Link href={'/account/join'} className={'join-box'}>
					{t('Login')}
				</Link>
			)}
		</Box>
	);

	if (device == 'mobile') {
		return (
			<Stack className={'top'}>
				<div className={'mobile-row'}>
					<Link href={'/'} className={'mobile-logo'}>
						<img src={'/img/logo/reneva-mark.svg'} alt={''} />
						{t('Reneva')}
					</Link>
					{userBox}
				</div>
				<nav className={'mobile-links'} aria-label={t('Main')}>
					{links.map((link) => (
						<Link key={link.label} href={link.href} className={isActive(link.path ?? link.href) ? 'on' : ''}>
							{t(link.label)}
						</Link>
					))}
				</nav>
			</Stack>
		);
	}

	return (
		<Stack className={`navbar ${scrolled ? 'scrolled' : ''}`}>
			<Stack className={'container'}>
				<nav className={'navbar-main'} aria-label={t('Main')}>
					<Link href={'/'} className={'logo-box'}>
						<img src={'/img/logo/reneva-mark.svg'} alt={''} />
						<span>{t('Reneva')}</span>
					</Link>

					<Box component={'div'} className={'router-box'}>
						{links.map((link) => (
							<Link key={link.label} href={link.href} className={isActive(link.path ?? link.href) ? 'on' : ''}>
								{link.href === '/ai' && <img src={'/img/logo/rena-ai.svg'} alt={''} className={'ai-dot'} />}
								{t(link.label)}
							</Link>
						))}
					</Box>

					{userBox}
				</nav>
			</Stack>
		</Stack>
	);
};

export default withRouter(Top);

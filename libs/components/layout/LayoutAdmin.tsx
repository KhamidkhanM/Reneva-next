import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Stack } from '@mui/material';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { getJwtToken, logOut, updateUserInfo } from '../../auth';
import { memberImage } from '../../utils';
import ChatWidget from '../chat/ChatWidget';
import { chatWidgetVar } from '../../../apollo/store';

const menu = [
	{ href: '/_admin', label: 'Dashboard' },
	{ href: '/_admin/users', label: 'Members' },
	{ href: '/_admin/products', label: 'Products' },
	{ href: '/_admin/brands', label: 'Brands' },
	{ href: '/_admin/categories', label: 'Categories' },
	{ href: '/_admin/orders', label: 'Orders' },
	{ href: '/_admin/coupons', label: 'Coupons' },
	{ href: '/_admin/community', label: 'Community' },
	{ href: '/_admin/cs', label: 'Notices & FAQ' },
];

const withAdminLayout = (Component: any) => {
	return (props: any) => {
		const router = useRouter();
		const user = useReactiveVar(userVar);
		const [checked, setChecked] = useState<boolean>(false);

		/** LIFECYCLES **/
		useEffect(() => {
			const jwt = getJwtToken();
			if (jwt) updateUserInfo(jwt);
			setChecked(true);
		}, []);

		useEffect(() => {
			if (checked && user.memberType !== 'ADMIN') router.push('/').then();
		}, [checked, user]);

		if (!checked || user.memberType !== 'ADMIN') return null;

		return (
			<>
				<Head>
					<title>Reneva Admin</title>
				</Head>
				<Stack id={'pc-wrap'} className={'admin-wrap'}>
					<aside className={'admin-side'}>
						<Link href={'/'} className={'admin-logo'}>
							<img src={'/img/logo/reneva-mark.svg'} alt={''} />
							<span>Reneva admin</span>
						</Link>
						<nav aria-label={'Admin'}>
							{menu.map((item) => (
								<Link key={item.href} href={item.href} className={router.pathname === item.href ? 'on' : ''}>
									{item.label}
								</Link>
							))}
							<button onClick={() => chatWidgetVar({ open: true, tab: 'messages', roomId: null })}>Support chats</button>
						</nav>
						<div className={'admin-user'}>
							<img src={memberImage(user.memberImage)} alt={''} />
							<span>{user.memberNick}</span>
							<button onClick={() => logOut()}>Logout</button>
						</div>
					</aside>
					<main className={'admin-main'}>
						<Component {...props} />
					</main>
					<ChatWidget />
				</Stack>
			</>
		);
	};
};

export default withAdminLayout;

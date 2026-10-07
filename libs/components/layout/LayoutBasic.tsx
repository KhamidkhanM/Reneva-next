import React, { useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Stack } from '@mui/material';
import { useTranslation } from 'next-i18next';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import Top from '../Top';
import Footer from '../Footer';
import ChatWidget from '../chat/ChatWidget';
import { getJwtToken, updateUserInfo } from '../../auth';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const withLayoutBasic = (Component: any) => {
	return (props: any) => {
		const router = useRouter();
		const { t } = useTranslation('common');
		const device = useDeviceDetect();

		const memoizedValues = useMemo(() => {
			let title = '',
				desc = '',
				tone = 'lilac',
				compact = false;

			switch (router.pathname) {
				case '/product':
					title = 'Shop all products';
					desc = 'Find what suits your skin';
					break;
				case '/brand':
					title = 'Brands on Reneva';
					desc = 'Brands';
					tone = 'peach';
					break;
				case '/brand/detail':
					title = 'Brand';
					desc = 'Brands';
					tone = 'peach';
					compact = true;
					break;
				case '/cart':
					title = 'Your cart';
					desc = 'Cart';
					compact = true;
					break;
				case '/order':
					title = 'Checkout';
					desc = 'Cart';
					compact = true;
					break;
				case '/order/detail':
					title = 'Order';
					desc = 'My Page';
					compact = true;
					break;
				case '/mypage':
					title = 'My Page';
					desc = 'Your orders, wishlist and skin profile';
					compact = true;
					break;
				case '/member':
					title = 'Member Page';
					desc = 'Community';
					tone = 'peach';
					compact = true;
					break;
				case '/community':
					title = 'Community';
					desc = 'Beauty talk and routines';
					tone = 'peach';
					break;
				case '/community/detail':
					title = 'Community';
					desc = 'Beauty talk and routines';
					tone = 'peach';
					compact = true;
					break;
				case '/cs':
					title = 'Customer center';
					desc = 'Notices, FAQ and 1:1 help';
					break;
				case '/ai':
					title = 'AI Advisor';
					desc = 'Ask Rena, your AI beauty advisor';
					compact = true;
					break;
				case '/ai/skin':
					title = 'Skin Analysis';
					desc = 'One selfie, a full skin reading';
					compact = true;
					break;
				case '/account/join':
					title = 'Login/Signup';
					desc = 'Welcome to Reneva';
					compact = true;
					break;
				case '/about':
					title = 'About Reneva';
					desc = 'Welcome to Reneva';
					tone = 'peach';
					break;
				default:
					break;
			}

			return { title, desc, tone, compact };
		}, [router.pathname]);

		/** LIFECYCLES **/
		useEffect(() => {
			const jwt = getJwtToken();
			if (jwt) updateUserInfo(jwt);
		}, []);

		return (
			<>
				<Head>
					<title>{memoizedValues.title ? `${t(memoizedValues.title)} · Reneva` : 'Reneva'}</title>
					<meta name={'title'} content={`Reneva`} />
				</Head>
				<Stack id={device === 'mobile' ? 'mobile-wrap' : 'pc-wrap'}>
					<Stack id={'top'}>
						<Top />
					</Stack>

					<Stack className={'container'}>
						<Stack className={`header-basic ${memoizedValues.tone} ${memoizedValues.compact ? 'compact' : ''}`}>
							<span className={'eyebrow'}>{t(memoizedValues.desc)}</span>
							<h1>{t(memoizedValues.title)}</h1>
						</Stack>
					</Stack>

					<Stack id={'main'}>
						<Component {...props} />
					</Stack>

					<ChatWidget />

					<Stack id={'footer'}>
						<Footer />
					</Stack>
				</Stack>
			</>
		);
	};
};

export default withLayoutBasic;

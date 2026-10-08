import React, { useEffect } from 'react';
import Head from 'next/head';
import { Stack } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import Top from '../Top';
import Footer from '../Footer';
import ChatWidget from '../chat/ChatWidget';
import { getJwtToken, updateUserInfo } from '../../auth';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { useTranslation } from 'next-i18next';

// pages that draw their own header, like the product detail page
const withLayoutFull = (Component: any) => {
	return (props: any) => {
	const { t } = useTranslation('common');
		const device = useDeviceDetect();

		/** LIFECYCLES **/
		useEffect(() => {
			const jwt = getJwtToken();
			if (jwt) updateUserInfo(jwt);
		}, []);

		return (
			<>
				<Head>
					<title>{t('Reneva')}</title>
					<meta name={'title'} content={`Reneva`} />
				</Head>
				<Stack id={device === 'mobile' ? 'mobile-wrap' : 'pc-wrap'}>
					<Stack id={'top'}>
						<Top />
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

export default withLayoutFull;

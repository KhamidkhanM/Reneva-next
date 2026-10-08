import React from 'react';
import Link from 'next/link';
import moment from 'moment';
import { Stack, Box } from '@mui/material';
import InstagramIcon from '@mui/icons-material/Instagram';
import TelegramIcon from '@mui/icons-material/Telegram';
import YouTubeIcon from '@mui/icons-material/YouTube';
import { openSupportChat } from './chat/openChat';
import { CS_PHONE } from '../config';
import { useTranslation } from 'next-i18next';

const Footer = () => {
	const { t } = useTranslation('common');
	return (
		<Stack className={'footer-container'}>
			<Stack className={'container main'}>
				<Stack className={'left'}>
					<Box component={'div'} className={'footer-box brand'}>
						<strong>{t('Reneva')}</strong>
						<p>{t('K-beauty for every skin type, with an AI advisor that knows our shelves.')}</p>
					</Box>
					<Box component={'div'} className={'footer-box'}>
						<span>{t('Customer center')}</span>
						<p>{CS_PHONE}</p>
						<span>{t('Mon–Fri 9:00–18:00')}</span>
					</Box>
					<Box component={'div'} className={'footer-box'}>
						<div className={'media-box'}>
							<a href={'#'} aria-label={t('Instagram')}>
								<InstagramIcon />
							</a>
							<a href={'#'} aria-label={t('Telegram')}>
								<TelegramIcon />
							</a>
							<a href={'#'} aria-label={t('YouTube')}>
								<YouTubeIcon />
							</a>
						</div>
					</Box>
				</Stack>
				<Stack className={'right'}>
					<div>
						<strong>{t('Shop')}</strong>
						<Link href={'/product'}>{t('All products')}</Link>
						<Link href={'/product?tag=BEST'}>{t('Best sellers')}</Link>
						<Link href={'/brand'}>{t('Brands')}</Link>
					</div>
					<div>
						<strong>{t('Help')}</strong>
						<Link href={'/cs'}>{t('FAQ')}</Link>
						<Link href={'/cs?tab=notice'}>{t('Notices')}</Link>
						<button onClick={() => openSupportChat()}>{t('Chat with support')}</button>
					</div>
					<div>
						<strong>{t('Reneva')}</strong>
						<Link href={'/about'}>{t('About us')}</Link>
						<Link href={'/ai'}>{t('AI advisor')}</Link>
						<Link href={'/ai/skin'}>{t('Skin analysis')}</Link>
					</div>
				</Stack>
			</Stack>
			<Stack className={'container second'}>
				<span>{t('© Reneva')} {moment().year()}{t('. All rights reserved.')}</span>
				<span>{t('Privacy · Terms')}</span>
			</Stack>
		</Stack>
	);
};

export default Footer;

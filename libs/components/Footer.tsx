import React from 'react';
import Link from 'next/link';
import moment from 'moment';
import { Stack, Box } from '@mui/material';
import InstagramIcon from '@mui/icons-material/Instagram';
import TelegramIcon from '@mui/icons-material/Telegram';
import YouTubeIcon from '@mui/icons-material/YouTube';
import { openSupportChat } from './chat/openChat';
import { CS_PHONE } from '../config';

const Footer = () => {
	return (
		<Stack className={'footer-container'}>
			<Stack className={'container main'}>
				<Stack className={'left'}>
					<Box component={'div'} className={'footer-box brand'}>
						<strong>Reneva</strong>
						<p>K-beauty for every skin type, with an AI advisor that knows our shelves.</p>
					</Box>
					<Box component={'div'} className={'footer-box'}>
						<span>Customer center</span>
						<p>{CS_PHONE}</p>
						<span>Mon–Fri 9:00–18:00</span>
					</Box>
					<Box component={'div'} className={'footer-box'}>
						<div className={'media-box'}>
							<a href={'#'} aria-label={'Instagram'}>
								<InstagramIcon />
							</a>
							<a href={'#'} aria-label={'Telegram'}>
								<TelegramIcon />
							</a>
							<a href={'#'} aria-label={'YouTube'}>
								<YouTubeIcon />
							</a>
						</div>
					</Box>
				</Stack>
				<Stack className={'right'}>
					<div>
						<strong>Shop</strong>
						<Link href={'/product'}>All products</Link>
						<Link href={'/product?tag=BEST'}>Best sellers</Link>
						<Link href={'/brand'}>Brands</Link>
					</div>
					<div>
						<strong>Help</strong>
						<Link href={'/cs'}>FAQ</Link>
						<Link href={'/cs?tab=notice'}>Notices</Link>
						<button onClick={() => openSupportChat()}>Chat with support</button>
					</div>
					<div>
						<strong>Reneva</strong>
						<Link href={'/about'}>About us</Link>
						<Link href={'/ai'}>AI advisor</Link>
						<Link href={'/ai/skin'}>Skin analysis</Link>
					</div>
				</Stack>
			</Stack>
			<Stack className={'container second'}>
				<span>© Reneva {moment().year()}. All rights reserved.</span>
				<span>Privacy · Terms</span>
			</Stack>
		</Stack>
	);
};

export default Footer;

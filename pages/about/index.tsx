import React from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const values = [
	{ title: 'Skin first', text: 'Every product is tagged by skin type and concern, so you only see what fits you.', tone: 'lilac' },
	{ title: 'Honest reviews', text: 'Only buyers can review, and Rena sums up hundreds of reviews in one line.', tone: 'peach' },
	{ title: 'Talk to the store', text: 'Every brand has a 1:1 chat. Ask about ingredients before you buy.', tone: 'lilac' },
];

const About: NextPage = () => {
	return (
		<div id={'about-page'}>
			<div className={'container column'}>
				<section className={'about-hero'}>
					<div className={'txt'}>
						<span className={'eyebrow'}>OUR STORY</span>
						<h2>Soft care, smart choices.</h2>
						<p>
							Reneva is a K-beauty store that helps you find the right products for your skin. We bring together independent brands, real reviews and
							Rena, our AI skin advisor.
						</p>
						<div className={'btns'}>
							<Link href={'/product'} className={'primary-btn'}>
								Shop now
							</Link>
							<Link href={'/ai/skin'} className={'ghost-btn'}>
								Try the skin check
							</Link>
						</div>
					</div>
					<div className={'art'}>
						<img src={'/img/logo/rena-ai.svg'} alt={''} />
					</div>
				</section>
				<section className={'about-values'}>
					{values.map((value) => (
						<div key={value.title} className={`value ${value.tone}`}>
							<b>{value.title}</b>
							<p>{value.text}</p>
						</div>
					))}
				</section>
				<section className={'about-sell'}>
					<div>
						<h3>Have a brand?</h3>
						<p>Open a store on Reneva, add your products and chat with your customers.</p>
					</div>
					<Link href={'/account/join'} className={'dark-btn'}>
						Become a seller
					</Link>
				</section>
			</div>
		</div>
	);
};

export default withLayoutBasic(About);

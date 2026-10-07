import React from 'react';
import { Stack } from '@mui/material';

const levels = [
	{ name: 'Baby', rate: '0.5%', tone: 'light' },
	{ name: 'Pink', rate: '1%', tone: 'peach' },
	{ name: 'Green', rate: '1%', tone: 'green' },
	{ name: 'Black', rate: '2%', tone: 'black' },
	{ name: 'Gold', rate: '3%', tone: 'gold' },
];

const Events = () => {
	return (
		<Stack className={'events'}>
			<Stack className={'container column'}>
				<h2 className={'section-title'}>Benefits</h2>
				<div className={'event-grid'}>
					<div className={'event-card peach'}>
						<span className={'eyebrow'}>EVERY DAY</span>
						<b>Free delivery over ₩30,000</b>
						<span>Below that, delivery is ₩3,000</span>
					</div>
					<div className={'event-card'}>
						<span className={'eyebrow'}>REVIEW REWARDS</span>
						<b>300P per photo review</b>
						<span>100P for a text review, only for products you bought</span>
					</div>
					<div className={'event-card membership'}>
						<span className={'eyebrow'}>MEMBERSHIP</span>
						<b>Points back on every order</b>
						<div className={'levels'}>
							{levels.map((level) => (
								<span key={level.name} className={'level'}>
									<span className={`dot ${level.tone}`}></span>
									{level.name}
									<small>{level.rate}</small>
								</span>
							))}
						</div>
					</div>
				</div>
			</Stack>
		</Stack>
	);
};

export default Events;

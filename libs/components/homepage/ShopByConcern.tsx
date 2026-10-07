import React from 'react';
import { useRouter } from 'next/router';
import { Stack } from '@mui/material';
import WaterDropOutlinedIcon from '@mui/icons-material/WaterDropOutlined';
import { SkinConcern } from '../../enums/member.enum';
import { labelOf } from '../../utils';

const concerns = [
	{ value: SkinConcern.DRYNESS, tone: 'lilac' },
	{ value: SkinConcern.ACNE, tone: 'peach' },
	{ value: SkinConcern.PORES, tone: 'light' },
	{ value: SkinConcern.WRINKLE, tone: 'peach-light' },
	{ value: SkinConcern.DULLNESS, tone: 'lilac' },
	{ value: SkinConcern.REDNESS, tone: 'peach' },
];

const ShopByConcern = () => {
	const router = useRouter();

	const pushHandler = async (concern: SkinConcern) => {
		const input = { page: 1, limit: 9, sort: 'productRank', direction: 'DESC', search: { concernList: [concern] } };
		await router.push(`/product?input=${JSON.stringify(input)}`, `/product?input=${JSON.stringify(input)}`);
	};

	return (
		<Stack className={'shop-by-concern'}>
			<Stack className={'container column'}>
				<h2 className={'section-title'}>Shop by concern</h2>
				<div className={'concern-grid'}>
					{concerns.map((item) => (
						<button key={item.value} className={`concern ${item.tone}`} onClick={() => pushHandler(item.value)}>
							<span className={'icon'}>
								<WaterDropOutlinedIcon fontSize={'small'} />
							</span>
							<b>{labelOf(item.value === SkinConcern.WRINKLE ? 'WRINKLES' : item.value)}</b>
						</button>
					))}
				</div>
			</Stack>
		</Stack>
	);
};

export default ShopByConcern;

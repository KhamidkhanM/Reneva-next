import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Stack } from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { useMutation, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { CLAIM_COUPON } from '../../../apollo/user/mutation';
import { SkinType } from '../../enums/member.enum';
import { ProductsInquiry } from '../../types/product';
import { labelOf } from '../../utils';
import { sweetLoginConfirmAlert, sweetMixinErrorAlert, sweetTopSuccessAlert } from '../../sweetAlert';
import { skinTypeList } from '../../config';

// the homepage header: search by skin, AI skin analysis card and the welcome coupon
const HeaderFilter = () => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [text, setText] = useState<string>('');
	const [skinType, setSkinType] = useState<SkinType | null>((user.memberSkinType as SkinType) || null);

	/** APOLLO REQUESTS **/
	const [claimCoupon] = useMutation(CLAIM_COUPON);

	/** HANDLERS **/
	const pushSearchHandler = async () => {
		const input: ProductsInquiry = {
			page: 1,
			limit: 9,
			sort: 'productRank',
			direction: 'DESC',
			search: {},
		};
		if (text.trim()) input.search.text = text.trim();
		if (skinType) input.search.skinTypeList = [skinType];
		await router.push(`/product?input=${JSON.stringify(input)}`, `/product?input=${JSON.stringify(input)}`);
	};

	const claimHandler = async () => {
		try {
			if (!user._id) {
				const goLogin = await sweetLoginConfirmAlert('Login to claim your welcome coupon');
				if (goLogin) await router.push('/account/join');
				return;
			}
			await claimCoupon({ variables: { input: 'WELCOME10' } });
			await sweetTopSuccessAlert('WELCOME10 is in your coupon wallet!');
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	return (
		<Stack className={'hero'}>
			<Stack className={'hero-search'}>
				<span className={'eyebrow'}>SOFT K-BEAUTY · FOR EVERY SKIN</span>
				<h1>Skin care that feels like a cloud</h1>
				<p>Search by your skin, not just by name. Every product shows how it worked for people like you.</p>
				<form
					className={'search-bar'}
					onSubmit={(e) => {
						e.preventDefault();
						pushSearchHandler();
					}}
				>
					<SearchRoundedIcon />
					<label className={'sr-only'} htmlFor={'hero-search'}>
						Search products
					</label>
					<input
						id={'hero-search'}
						type={'search'}
						value={text}
						onChange={(e) => setText(e.target.value)}
						placeholder={'Try “ceramide cream” or “sun stick”'}
					/>
					<button type={'submit'} className={'primary-btn'}>
						Search
					</button>
				</form>
				<div className={'skin-chips'} aria-label={'Skin type'}>
					{skinTypeList.map((type) => (
						<button
							key={type}
							type={'button'}
							className={`chip ${skinType === type ? 'on' : ''}`}
							aria-pressed={skinType === type}
							onClick={() => setSkinType(skinType === type ? null : type)}
						>
							{labelOf(type)}
						</button>
					))}
				</div>
			</Stack>

			<Stack className={'hero-side'}>
				<Stack className={'hero-card ai'}>
					<span className={'eyebrow'}>AI SKIN ANALYSIS</span>
					<strong>Your skin, read in 30 seconds</strong>
					<div className={'bars'} aria-hidden={'true'}>
						{[
							{ label: 'Moist', h: 64, peach: false },
							{ label: 'Oil', h: 36, peach: true },
							{ label: 'Pores', h: 48, peach: false },
							{ label: 'Lines', h: 22, peach: true },
							{ label: 'Tone', h: 30, peach: false },
						].map((bar) => (
							<span key={bar.label} className={'bar-col'}>
								<span className={`bar ${bar.peach ? 'peach' : ''}`} style={{ height: bar.h }}></span>
								{bar.label}
							</span>
						))}
					</div>
					<button className={'dark-btn'} onClick={() => router.push('/ai/skin')}>
						Try it free
					</button>
				</Stack>
				<Stack className={'hero-card coupon'}>
					<span className={'txt'}>
						<span className={'eyebrow'}>NEW MEMBER</span>
						<b>10% off first order</b>
						<span>Code WELCOME10</span>
					</span>
					<button className={'ghost-btn white'} onClick={claimHandler}>
						Claim
					</button>
				</Stack>
			</Stack>
		</Stack>
	);
};

export default HeaderFilter;

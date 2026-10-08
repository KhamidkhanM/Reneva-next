import React, { useState } from 'react';
import moment from 'moment';
import { Stack } from '@mui/material';
import { useMutation, useQuery } from '@apollo/client';
import { GET_MY_COUPONS } from '../../../apollo/user/query';
import { CLAIM_COUPON } from '../../../apollo/user/mutation';
import { MemberCoupon } from '../../types/order';
import { MemberCouponStatus } from '../../enums/coupon.enum';
import { couponValue } from './CouponManager';
import { formatPrice, labelOf } from '../../utils';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { useTranslation } from 'next-i18next';

const tabs = [MemberCouponStatus.AVAILABLE, MemberCouponStatus.USED, MemberCouponStatus.EXPIRED];

const MyCoupons = () => {
	const { t } = useTranslation('common');
	const [status, setStatus] = useState<MemberCouponStatus>(MemberCouponStatus.AVAILABLE);
	const [code, setCode] = useState<string>('');

	/** APOLLO REQUESTS **/
	const [claimCoupon] = useMutation(CLAIM_COUPON);
	const { data, refetch } = useQuery(GET_MY_COUPONS, {
		fetchPolicy: 'network-only',
		variables: { input: { page: 1, limit: 30, search: { memberCouponStatus: status } } },
	});
	const coupons: MemberCoupon[] = data?.getMyCoupons?.list ?? [];

	const claimHandler = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			if (!code.trim()) return;
			await claimCoupon({ variables: { input: code.trim().toUpperCase() } });
			setCode('');
			setStatus(MemberCouponStatus.AVAILABLE);
			await refetch();
			await sweetTopSmallSuccessAlert('Coupon added', 900);
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	return (
		<div className={'my-section'}>
			<div className={'section-head'}>
				<h2>{t('Coupons')}</h2>
				<p>{t('Use them at checkout. Try WELCOME10 if you are new.')}</p>
			</div>
			<form className={'box inline-form'} onSubmit={claimHandler}>
				<label className={'field'}>
					<span>{t('Coupon code')}</span>
					<input value={code} onChange={(e) => setCode(e.target.value)} placeholder={t('e.g. WELCOME10')} />
				</label>
				<button type={'submit'} className={'primary-btn'}>
					{t('Add coupon')}
				</button>
			</form>
			<Stack className={'chips'}>
				{tabs.map((tab) => (
					<button key={tab} className={`chip ${status === tab ? 'on' : ''}`} onClick={() => setStatus(tab)}>
						{t(labelOf(tab))}
					</button>
				))}
			</Stack>
			{coupons.length === 0 ? (
				<div className={'no-data'}>{t('No')} {labelOf(status).toLowerCase()} {t('coupons.')}</div>
			) : (
				<div className={'coupon-grid'}>
					{coupons.map((item) => {
						const coupon = item.couponData;
						if (!coupon) return null;
						return (
							<div key={item._id} className={`coupon-card ${item.memberCouponStatus}`}>
								<div className={'value'}>{couponValue(coupon)}</div>
								<div className={'txt'}>
									<b>{coupon.couponTitle}</b>
									<span>
										{coupon.couponMinOrder ? t('Orders from {{amount}}', { amount: formatPrice(coupon.couponMinOrder) }) : t('No minimum')}
										{coupon.couponMaxDiscount ? ` · ${t('up to {{amount}}', { amount: formatPrice(coupon.couponMaxDiscount) })}` : ''}
									</span>
									<span>{t('Until')} {moment(coupon.endAt).format('YYYY.MM.DD')}</span>
								</div>
								<span className={'code'}>{coupon.couponCode}</span>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
};

export default MyCoupons;

import React, { useState } from 'react';
import moment from 'moment';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { GET_BRANDS, GET_ISSUED_COUPONS } from '../../../apollo/user/query';
import { CREATE_COUPON, UPDATE_COUPON } from '../../../apollo/user/mutation';
import { Coupon } from '../../types/order';
import { Brand } from '../../types/product';
import { CouponStatus, CouponType } from '../../enums/coupon.enum';
import { formatKRW, labelOf } from '../../utils';
import { Messages } from '../../config';
import { sweetConfirmAlert, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';

export const couponValue = (coupon: Pick<Coupon, 'couponType' | 'couponValue'>): string => {
	if (coupon.couponType === CouponType.PERCENT) return `${coupon.couponValue}%`;
	if (coupon.couponType === CouponType.FREE_DELIVERY) return 'Free ship';
	return formatKRW(coupon.couponValue);
};

const today = () => moment().format('YYYY-MM-DD');
const empty = () => ({
	couponTitle: '',
	couponCode: '',
	couponType: CouponType.PERCENT,
	couponValue: '10',
	couponMinOrder: '0',
	couponMaxDiscount: '',
	brandId: '',
	startAt: today(),
	endAt: moment().add(30, 'days').format('YYYY-MM-DD'),
});

interface CouponManagerProps {
	admin?: boolean;
}

// sellers make coupons for their store; the admin sees and controls every coupon
const CouponManager = ({ admin = false }: CouponManagerProps) => {
	const user = useReactiveVar(userVar);
	const [form, setForm] = useState(empty());
	const [open, setOpen] = useState<boolean>(false);

	/** APOLLO REQUESTS **/
	const { data, refetch } = useQuery(GET_ISSUED_COUPONS, { fetchPolicy: 'network-only', variables: { input: { page: 1, limit: 50 } } });
	// a seller's coupon always belongs to one of their brands; the admin may leave it empty for all brands
	const { data: brandData } = useQuery(GET_BRANDS, {
		fetchPolicy: 'network-only',
		skip: admin || !user._id,
		variables: { input: { page: 1, limit: 50, search: { memberId: user._id } } },
	});
	const myBrands: Brand[] = brandData?.getBrands?.list ?? [];
	const [createCoupon, { loading }] = useMutation(CREATE_COUPON);
	const [updateCoupon] = useMutation(UPDATE_COUPON);
	const coupons: Coupon[] = (data?.getIssuedCoupons?.list ?? []).filter((ele: Coupon) => ele.couponStatus !== CouponStatus.DELETE);

	const change = (key: keyof ReturnType<typeof empty>) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
		setForm({ ...form, [key]: e.target.value });

	const createHandler = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			if (!form.couponTitle || !form.couponCode) throw new Error(Messages.error3);
			const brandId = form.brandId || (admin ? '' : myBrands[0]?._id);
			if (!admin && !brandId) throw new Error('Create a brand first, then make a coupon for it.');
			const input: any = {
				couponTitle: form.couponTitle,
				couponCode: form.couponCode.trim().toUpperCase(),
				couponType: form.couponType,
				couponValue: form.couponType === CouponType.FREE_DELIVERY ? 0 : Number(form.couponValue),
				couponMinOrder: Number(form.couponMinOrder || 0),
				startAt: moment(form.startAt).startOf('day').toISOString(),
				endAt: moment(form.endAt).endOf('day').toISOString(),
			};
			if (form.couponMaxDiscount) input.couponMaxDiscount = Number(form.couponMaxDiscount);
			if (brandId) input.brandId = brandId;
			await createCoupon({ variables: { input } });
			setForm(empty());
			setOpen(false);
			await refetch();
			await sweetTopSmallSuccessAlert('Coupon created', 900);
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const statusHandler = async (coupon: Coupon, couponStatus: CouponStatus) => {
		try {
			if (couponStatus === CouponStatus.DELETE && !(await sweetConfirmAlert('Delete this coupon?'))) return;
			await updateCoupon({ variables: { input: { _id: coupon._id, couponStatus } } });
			await refetch();
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	return (
		<div className={'my-section'}>
			<div className={admin ? 'admin-head' : 'section-head'}>
				<h2>{admin ? 'Coupons' : 'Store coupons'}</h2>
				<p>Customers add a coupon with its code, then use it at checkout.</p>
				{!open && (
					<button className={'primary-btn'} onClick={() => setOpen(true)}>
						+ New coupon
					</button>
				)}
			</div>

			{open && (
				<form className={'box'} onSubmit={createHandler}>
					<h2>New coupon</h2>
					<div className={'form-grid'}>
						<label className={'field'}>
							<span>Title</span>
							<input value={form.couponTitle} onChange={change('couponTitle')} placeholder={'Spring sale 15%'} required />
						</label>
						<label className={'field'}>
							<span>Code</span>
							<input value={form.couponCode} onChange={change('couponCode')} placeholder={'SPRING15'} required />
						</label>
						{!admin && (
							<label className={'field'}>
								<span>Brand</span>
								<select value={form.brandId || myBrands[0]?._id || ''} onChange={change('brandId')}>
									{myBrands.map((brand) => (
										<option key={brand._id} value={brand._id}>
											{brand.brandName}
										</option>
									))}
								</select>
							</label>
						)}
						<label className={'field'}>
							<span>Type</span>
							<select value={form.couponType} onChange={change('couponType')}>
								{Object.values(CouponType).map((type) => (
									<option key={type} value={type}>
										{labelOf(type)}
									</option>
								))}
							</select>
						</label>
						{form.couponType !== CouponType.FREE_DELIVERY && (
							<label className={'field'}>
								<span>{form.couponType === CouponType.PERCENT ? 'Percent off' : 'Won off'}</span>
								<input type={'number'} min={1} value={form.couponValue} onChange={change('couponValue')} required />
							</label>
						)}
						<label className={'field'}>
							<span>Minimum order (₩)</span>
							<input type={'number'} min={0} value={form.couponMinOrder} onChange={change('couponMinOrder')} />
						</label>
						{form.couponType === CouponType.PERCENT && (
							<label className={'field'}>
								<span>Max discount (₩)</span>
								<input type={'number'} min={0} value={form.couponMaxDiscount} onChange={change('couponMaxDiscount')} />
							</label>
						)}
						<label className={'field'}>
							<span>Starts</span>
							<input type={'date'} value={form.startAt} onChange={change('startAt')} required />
						</label>
						<label className={'field'}>
							<span>Ends</span>
							<input type={'date'} value={form.endAt} onChange={change('endAt')} required />
						</label>
					</div>
					<div className={'btns'}>
						<button type={'submit'} className={'primary-btn'} disabled={loading}>
							Create coupon
						</button>
						<button type={'button'} className={'ghost-btn'} onClick={() => setOpen(false)}>
							Cancel
						</button>
					</div>
				</form>
			)}

			{coupons.length === 0 ? (
				<div className={'no-data'}>No coupons yet.</div>
			) : (
				<div className={'table-box'}>
					<table>
						<thead>
							<tr>
								<th>Coupon</th>
								<th>Code</th>
								<th>Value</th>
								<th>Period</th>
								<th>Status</th>
								<th></th>
							</tr>
						</thead>
						<tbody>
							{coupons.map((coupon) => (
								<tr key={coupon._id}>
									<td>
										<b>{coupon.couponTitle}</b>
										<small>{coupon.couponMinOrder ? `From ${formatKRW(coupon.couponMinOrder)}` : 'No minimum'}</small>
									</td>
									<td>
										<code>{coupon.couponCode}</code>
									</td>
									<td>{couponValue(coupon)}</td>
									<td>
										{moment(coupon.startAt).format('MM.DD')} – {moment(coupon.endAt).format('YY.MM.DD')}
									</td>
									<td>
										<span className={`status-pill ${coupon.couponStatus}`}>{labelOf(coupon.couponStatus)}</span>
									</td>
									<td className={'row-btns'}>
										<button
											className={'ghost-btn small'}
											onClick={() => statusHandler(coupon, coupon.couponStatus === CouponStatus.ACTIVE ? CouponStatus.PAUSE : CouponStatus.ACTIVE)}
										>
											{coupon.couponStatus === CouponStatus.ACTIVE ? 'Pause' : 'Activate'}
										</button>
										<button className={'ghost-btn small'} onClick={() => statusHandler(coupon, CouponStatus.DELETE)}>
											Delete
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
};

export default CouponManager;

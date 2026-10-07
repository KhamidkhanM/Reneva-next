import React, { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { GET_BRANDS } from '../../../apollo/user/query';
import { CREATE_BRAND, IMAGE_UPLOADER, UPDATE_BRAND } from '../../../apollo/user/mutation';
import { Brand } from '../../types/product';
import { BrandStatus } from '../../enums/brand.enum';
import { imageUrl, labelOf } from '../../utils';
import { Messages } from '../../config';
import { BrandCircle } from '../homepage/TopBrands';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';

const empty = { _id: '', brandName: '', brandCountry: 'KR', brandDesc: '', brandLogo: '', brandBanner: '' };

const MyBrands = () => {
	const user = useReactiveVar(userVar);
	const [form, setForm] = useState({ ...empty });
	const [open, setOpen] = useState<boolean>(false);

	/** APOLLO REQUESTS **/
	const { data, refetch } = useQuery(GET_BRANDS, {
		fetchPolicy: 'network-only',
		skip: !user._id,
		variables: { input: { page: 1, limit: 20, sort: 'createdAt', direction: 'DESC', search: { memberId: user._id } } },
	});
	const [createBrand, { loading: creating }] = useMutation(CREATE_BRAND);
	const [updateBrand, { loading: updating }] = useMutation(UPDATE_BRAND);
	const [imageUploader] = useMutation(IMAGE_UPLOADER);
	const brands: Brand[] = data?.getBrands?.list ?? [];

	const change = (key: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
		setForm({ ...form, [key]: e.target.value });

	const uploadImage = (key: 'brandLogo' | 'brandBanner') => async (e: React.ChangeEvent<HTMLInputElement>) => {
		try {
			const file = e.target.files?.[0];
			if (!file) return;
			if (!['image/png', 'image/jpg', 'image/jpeg'].includes(file.type)) throw new Error(Messages.error5);
			const result = await imageUploader({ variables: { file, target: 'brand' } });
			setForm({ ...form, [key]: result.data.imageUploader });
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const editHandler = (brand: Brand) => {
		setForm({
			_id: brand._id,
			brandName: brand.brandName,
			brandCountry: brand.brandCountry ?? '',
			brandDesc: brand.brandDesc ?? '',
			brandLogo: brand.brandLogo ?? '',
			brandBanner: brand.brandBanner ?? '',
		});
		setOpen(true);
	};

	const submitHandler = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			if (!form.brandName.trim()) throw new Error(Messages.error3);
			const { _id, ...rest } = form;
			const input: any = { ...rest };
			Object.keys(input).forEach((key) => input[key] === '' && delete input[key]);
			if (_id) await updateBrand({ variables: { input: { _id, ...input } } });
			else await createBrand({ variables: { input } });
			setForm({ ...empty });
			setOpen(false);
			await refetch();
			await sweetTopSmallSuccessAlert(_id ? 'Brand updated' : 'Brand created', 900);
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const pauseHandler = async (brand: Brand) => {
		try {
			const brandStatus = brand.brandStatus === BrandStatus.ACTIVE ? BrandStatus.PAUSE : BrandStatus.ACTIVE;
			await updateBrand({ variables: { input: { _id: brand._id, brandStatus } } });
			await refetch();
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	return (
		<div className={'my-section'}>
			<div className={'section-head'}>
				<h2>My brands</h2>
				<p>Every product belongs to one of your brands. Shoppers can follow and chat with your store.</p>
				{!open && (
					<button className={'primary-btn'} onClick={() => setOpen(true)}>
						+ New brand
					</button>
				)}
			</div>

			{open && (
				<form className={'box'} onSubmit={submitHandler}>
					<h2>{form._id ? 'Edit brand' : 'New brand'}</h2>
					<div className={'form-grid'}>
						<label className={'field'}>
							<span>Brand name</span>
							<input value={form.brandName} onChange={change('brandName')} required />
						</label>
						<label className={'field'}>
							<span>Country</span>
							<input value={form.brandCountry} onChange={change('brandCountry')} placeholder={'KR'} />
						</label>
						<label className={'field wide'}>
							<span>Story</span>
							<textarea rows={3} value={form.brandDesc} onChange={change('brandDesc')} />
						</label>
					</div>
					<div className={'upload-row'}>
						{form.brandLogo && <img className={'logo'} src={imageUrl(form.brandLogo)} alt={''} />}
						<label className={'soft-btn'}>
							{form.brandLogo ? 'Change logo' : 'Upload logo'}
							<input type={'file'} hidden accept={'image/png, image/jpg, image/jpeg'} onChange={uploadImage('brandLogo')} />
						</label>
						{form.brandBanner && <img src={imageUrl(form.brandBanner)} alt={''} />}
						<label className={'soft-btn'}>
							{form.brandBanner ? 'Change banner' : 'Upload banner'}
							<input type={'file'} hidden accept={'image/png, image/jpg, image/jpeg'} onChange={uploadImage('brandBanner')} />
						</label>
					</div>
					<div className={'btns'}>
						<button type={'submit'} className={'primary-btn'} disabled={creating || updating}>
							{form._id ? 'Save brand' : 'Create brand'}
						</button>
						<button
							type={'button'}
							className={'ghost-btn'}
							onClick={() => {
								setForm({ ...empty });
								setOpen(false);
							}}
						>
							Cancel
						</button>
					</div>
				</form>
			)}

			{brands.length === 0 && !open ? (
				<div className={'no-data'}>
					You have no brand yet.
					<button className={'primary-btn'} onClick={() => setOpen(true)}>
						Create your first brand
					</button>
				</div>
			) : (
				<div className={'seller-brand-list'}>
					{brands.map((brand, index) => (
						<div key={brand._id} className={'seller-brand'}>
							<BrandCircle brand={brand} index={index} size={64} />
							<span className={'txt'}>
								<Link href={{ pathname: '/brand/detail', query: { id: brand._id } }}>
									<b>{brand.brandName}</b>
								</Link>
								<span>
									{brand.brandProducts} products · {brand.brandLikes} followers
								</span>
							</span>
							<span className={`status-pill ${brand.brandStatus}`}>{labelOf(brand.brandStatus)}</span>
							<button className={'ghost-btn small'} onClick={() => editHandler(brand)}>
								Edit
							</button>
							<button className={'ghost-btn small'} onClick={() => pauseHandler(brand)}>
								{brand.brandStatus === BrandStatus.ACTIVE ? 'Pause' : 'Activate'}
							</button>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default MyBrands;

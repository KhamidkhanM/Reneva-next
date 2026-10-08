import React, { useEffect, useState } from 'react';
import { Stack } from '@mui/material';
import PhotoCameraRoundedIcon from '@mui/icons-material/PhotoCameraRounded';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { IMAGE_UPLOADER, UPDATE_MEMBER, UPDATE_MEMBER_PHONE } from '../../../apollo/user/mutation';
import { GET_PHONE_VERIFICATION_ENABLED } from '../../../apollo/user/query';
import PhoneVerify from '../common/PhoneVerify';
import { VerificationPurpose } from '../../enums/verification.enum';
import { updateStorage, updateUserInfo } from '../../auth';
import { labelOf, memberImage } from '../../utils';
import { Messages, skinConcernList, skinTypeList } from '../../config';
import { SkinConcern, SkinType } from '../../enums/member.enum';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { useTranslation } from 'next-i18next';

const MyProfile = () => {
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const [form, setForm] = useState({
		memberNick: '',
		memberPhone: '',
		memberFullName: '',
		memberEmail: '',
		memberAddress: '',
		memberDesc: '',
		memberImage: '',
	});
	const [skinType, setSkinType] = useState<SkinType | ''>('');
	const [concerns, setConcerns] = useState<SkinConcern[]>([]);
	const [changingPhone, setChangingPhone] = useState<boolean>(false);

	/** APOLLO REQUESTS **/
	const [updateMember, { loading }] = useMutation(UPDATE_MEMBER);
	const [imageUploader] = useMutation(IMAGE_UPLOADER);
	const [updateMemberPhone] = useMutation(UPDATE_MEMBER_PHONE);
	const { data: verificationData } = useQuery(GET_PHONE_VERIFICATION_ENABLED);
	const verifyPhone = verificationData?.getPhoneVerificationEnabled ?? true;

	/** LIFECYCLES **/
	useEffect(() => {
		setForm({
			memberNick: user.memberNick ?? '',
			memberPhone: user.memberPhone ?? '',
			memberFullName: user.memberFullName ?? '',
			memberEmail: user.memberEmail ?? '',
			memberAddress: user.memberAddress ?? '',
			memberDesc: user.memberDesc ?? '',
			memberImage: user.memberImage ?? '',
		});
		setSkinType((user.memberSkinType as SkinType) ?? '');
		setConcerns((user.memberSkinConcerns as SkinConcern[]) ?? []);
	}, [user._id]);

	/** HANDLERS **/
	const change = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
		setForm({ ...form, [key]: e.target.value });

	const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
		try {
			const file = e.target.files?.[0];
			if (!file) return;
			if (!['image/png', 'image/jpg', 'image/jpeg'].includes(file.type)) throw new Error(Messages.error5);
			const result = await imageUploader({ variables: { file, target: 'member' } });
			setForm({ ...form, memberImage: result.data.imageUploader });
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const toggleConcern = (concern: SkinConcern) =>
		setConcerns(concerns.includes(concern) ? concerns.filter((ele) => ele !== concern) : [...concerns, concern]);

	// runs when Telegram confirmed the new number: save it, then refresh the login token
	const changePhone = async (phoneToken: string) => {
		try {
			const result = await updateMemberPhone({ variables: { phoneToken } });
			const jwtToken = result.data.updateMemberPhone?.accessToken;
			if (jwtToken) {
				updateStorage({ jwtToken });
				updateUserInfo(jwtToken);
			}
			setForm((prev) => ({ ...prev, memberPhone: result.data.updateMemberPhone.memberPhone }));
			await sweetTopSmallSuccessAlert('Phone number changed', 900);
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		} finally {
			setChangingPhone(false);
		}
	};

	const submitHandler = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			if (!form.memberNick) throw new Error(Messages.error3);
			const input: any = { _id: user._id, ...form, memberSkinConcerns: concerns };
			// with Telegram verification the phone is saved by changePhone, not here
			if (verifyPhone) delete input.memberPhone;
			if (skinType) input.memberSkinType = skinType;
			Object.keys(input).forEach((key) => input[key] === '' && delete input[key]);
			const result = await updateMember({ variables: { input } });
			// the backend returns a fresh token so the new nick, image and skin profile show everywhere
			const jwtToken = result.data.updateMember?.accessToken;
			if (jwtToken) {
				updateStorage({ jwtToken });
				updateUserInfo(jwtToken);
			}
			await sweetTopSmallSuccessAlert('Profile saved', 900);
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	return (
		<form className={'my-section'} onSubmit={submitHandler}>
			<div className={'section-head'}>
				<h2>{t('My profile')}</h2>
				<p>{t('Your skin profile helps Rena and the shop pick products for you.')}</p>
			</div>

			<div className={'box'}>
				<div className={'avatar-row'}>
					<img src={memberImage(form.memberImage)} alt={''} />
					<label className={'soft-btn'}>
						<PhotoCameraRoundedIcon fontSize={'small'} /> {t('Change photo')}
						<input type={'file'} hidden accept={'image/png, image/jpg, image/jpeg'} onChange={uploadImage} />
					</label>
				</div>
				<div className={'form-grid'}>
					<label className={'field'}>
						<span>{t('Nickname')}</span>
						<input value={form.memberNick} onChange={change('memberNick')} required />
					</label>
					{verifyPhone ? (
						<div className={'field'}>
							<span>{t('Phone')}</span>
							{changingPhone ? (
								<PhoneVerify purpose={VerificationPurpose.CHANGE_PHONE} onVerified={(token) => changePhone(token)} />
							) : (
								<div className={'phone-row'}>
									<b>{form.memberPhone || t('No phone yet')}</b>
									<button type={'button'} className={'soft-btn'} onClick={() => setChangingPhone(true)}>
										{form.memberPhone ? t('Change phone') : t('Add phone')}
									</button>
								</div>
							)}
						</div>
					) : (
						<label className={'field'}>
							<span>{t('Phone')}</span>
							<input type={'tel'} value={form.memberPhone} onChange={change('memberPhone')} required />
						</label>
					)}
					<label className={'field'}>
						<span>{t('Full name')}</span>
						<input value={form.memberFullName} onChange={change('memberFullName')} />
					</label>
					<label className={'field'}>
						<span>{t('Email')}</span>
						<input type={'email'} value={form.memberEmail} onChange={change('memberEmail')} />
					</label>
					<label className={'field wide'}>
						<span>{t('Address')}</span>
						<input value={form.memberAddress} onChange={change('memberAddress')} />
					</label>
					<label className={'field wide'}>
						<span>{t('About me')}</span>
						<textarea rows={3} value={form.memberDesc} onChange={change('memberDesc')} />
					</label>
				</div>
			</div>

			<div className={'box'}>
				<h2>{t('Skin profile')}</h2>
				<span className={'label'}>{t('Skin type')}</span>
				<Stack className={'chips'}>
					{skinTypeList.map((type) => (
						<button
							type={'button'}
							key={type}
							className={`chip ${skinType === type ? 'on' : ''}`}
							aria-pressed={skinType === type}
							onClick={() => setSkinType(skinType === type ? '' : type)}
						>
							{t(labelOf(type))}
						</button>
					))}
				</Stack>
				<span className={'label'}>{t('Concerns')}</span>
				<Stack className={'chips'}>
					{skinConcernList.map((concern) => (
						<button
							type={'button'}
							key={concern}
							className={`chip ${concerns.includes(concern) ? 'on' : ''}`}
							aria-pressed={concerns.includes(concern)}
							onClick={() => toggleConcern(concern)}
						>
							{t(labelOf(concern))}
						</button>
					))}
				</Stack>
			</div>

			<div className={'actions'}>
				<button type={'submit'} className={'primary-btn'} disabled={loading}>
					{t('Save profile')}
				</button>
			</div>
		</form>
	);
};

export default MyProfile;

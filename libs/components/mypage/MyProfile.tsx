import React, { useEffect, useState } from 'react';
import { Stack } from '@mui/material';
import PhotoCameraRoundedIcon from '@mui/icons-material/PhotoCameraRounded';
import { useMutation, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { IMAGE_UPLOADER, UPDATE_MEMBER } from '../../../apollo/user/mutation';
import { updateStorage, updateUserInfo } from '../../auth';
import { labelOf, memberImage } from '../../utils';
import { Messages, skinConcernList, skinTypeList } from '../../config';
import { SkinConcern, SkinType } from '../../enums/member.enum';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';

const MyProfile = () => {
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

	/** APOLLO REQUESTS **/
	const [updateMember, { loading }] = useMutation(UPDATE_MEMBER);
	const [imageUploader] = useMutation(IMAGE_UPLOADER);

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

	const submitHandler = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			if (!form.memberNick || !form.memberPhone) throw new Error(Messages.error3);
			const input: any = { _id: user._id, ...form, memberSkinConcerns: concerns };
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
				<h2>My profile</h2>
				<p>Your skin profile helps Rena and the shop pick products for you.</p>
			</div>

			<div className={'box'}>
				<div className={'avatar-row'}>
					<img src={memberImage(form.memberImage)} alt={''} />
					<label className={'soft-btn'}>
						<PhotoCameraRoundedIcon fontSize={'small'} /> Change photo
						<input type={'file'} hidden accept={'image/png, image/jpg, image/jpeg'} onChange={uploadImage} />
					</label>
				</div>
				<div className={'form-grid'}>
					<label className={'field'}>
						<span>Nickname</span>
						<input value={form.memberNick} onChange={change('memberNick')} required />
					</label>
					<label className={'field'}>
						<span>Phone</span>
						<input type={'tel'} value={form.memberPhone} onChange={change('memberPhone')} required />
					</label>
					<label className={'field'}>
						<span>Full name</span>
						<input value={form.memberFullName} onChange={change('memberFullName')} />
					</label>
					<label className={'field'}>
						<span>Email</span>
						<input type={'email'} value={form.memberEmail} onChange={change('memberEmail')} />
					</label>
					<label className={'field wide'}>
						<span>Address</span>
						<input value={form.memberAddress} onChange={change('memberAddress')} />
					</label>
					<label className={'field wide'}>
						<span>About me</span>
						<textarea rows={3} value={form.memberDesc} onChange={change('memberDesc')} />
					</label>
				</div>
			</div>

			<div className={'box'}>
				<h2>Skin profile</h2>
				<span className={'label'}>Skin type</span>
				<Stack className={'chips'}>
					{skinTypeList.map((type) => (
						<button
							type={'button'}
							key={type}
							className={`chip ${skinType === type ? 'on' : ''}`}
							aria-pressed={skinType === type}
							onClick={() => setSkinType(skinType === type ? '' : type)}
						>
							{labelOf(type)}
						</button>
					))}
				</Stack>
				<span className={'label'}>Concerns</span>
				<Stack className={'chips'}>
					{skinConcernList.map((concern) => (
						<button
							type={'button'}
							key={concern}
							className={`chip ${concerns.includes(concern) ? 'on' : ''}`}
							aria-pressed={concerns.includes(concern)}
							onClick={() => toggleConcern(concern)}
						>
							{labelOf(concern)}
						</button>
					))}
				</Stack>
			</div>

			<div className={'actions'}>
				<button type={'submit'} className={'primary-btn'} disabled={loading}>
					Save profile
				</button>
			</div>
		</form>
	);
};

export default MyProfile;

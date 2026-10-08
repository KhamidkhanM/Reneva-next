import React, { useState } from 'react';
import { Checkbox, FormControlLabel, Stack } from '@mui/material';
import { useMutation } from '@apollo/client';
import { CREATE_ADDRESS } from '../../../apollo/user/mutation';
import { Messages } from '../../config';
import { sweetMixinErrorAlert } from '../../sweetAlert';
import { useTranslation } from 'next-i18next';

interface AddressFormProps {
	onSaved: (addressId: string) => void;
	onCancel?: () => void;
}

const empty = { addressLabel: 'Home', addressRecipient: '', addressPhone: '', addressZip: '', addressLine1: '', addressLine2: '' };

const AddressForm = ({ onSaved, onCancel }: AddressFormProps) => {
	const { t } = useTranslation('common');
	const [form, setForm] = useState({ ...empty });
	const [makeDefault, setMakeDefault] = useState<boolean>(true);
	const [createAddress, { loading }] = useMutation(CREATE_ADDRESS);

	const change = (key: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [key]: e.target.value });

	const submitHandler = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			if (!form.addressRecipient || !form.addressPhone || !form.addressZip || !form.addressLine1) throw new Error(Messages.error3);
			const input: any = { ...form, addressDefault: makeDefault };
			if (!input.addressLine2) delete input.addressLine2;
			const result = await createAddress({ variables: { input } });
			setForm({ ...empty });
			onSaved(result.data.createAddress._id);
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const field = (key: keyof typeof empty, label: string, placeholder: string, wide = false, required = true) => (
		<label className={`field ${wide ? 'wide' : ''}`}>
			<span>{label}</span>
			<input value={form[key]} onChange={change(key)} placeholder={placeholder} required={required} />
		</label>
	);

	return (
		<form className={'address-form'} onSubmit={submitHandler}>
			<div className={'fields'}>
				{field('addressLabel', 'Name for this address', 'Home', false, false)}
				{field('addressRecipient', 'Recipient', 'Full name')}
				{field('addressPhone', 'Phone', '010-1234-5678')}
				{field('addressZip', 'Postal code', '04524')}
				{field('addressLine1', 'Address', 'Street and building', true)}
				{field('addressLine2', 'Detail', 'Apartment, floor (optional)', true, false)}
			</div>
			<Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'} flexWrap={'wrap'} gap={'10px'}>
				<FormControlLabel control={<Checkbox checked={makeDefault} onChange={(e) => setMakeDefault(e.target.checked)} />} label={t('Use as my default address')} />
				<div className={'btns'}>
					{onCancel && (
						<button type={'button'} className={'ghost-btn'} onClick={onCancel}>
							{t('Cancel')}
						</button>
					)}
					<button type={'submit'} className={'primary-btn'} disabled={loading}>
						{t('Save address')}
					</button>
				</div>
			</Stack>
		</form>
	);
};

export default AddressForm;

import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { GET_MY_ADDRESSES } from '../../../apollo/user/query';
import { REMOVE_ADDRESS, UPDATE_ADDRESS } from '../../../apollo/user/mutation';
import { Address } from '../../types/order';
import AddressForm from './AddressForm';
import { sweetConfirmAlert, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { useTranslation } from 'next-i18next';

const MyAddresses = () => {
	const { t } = useTranslation('common');
	const [adding, setAdding] = useState<boolean>(false);

	/** APOLLO REQUESTS **/
	const { data, refetch } = useQuery(GET_MY_ADDRESSES, { fetchPolicy: 'network-only' });
	const [updateAddress] = useMutation(UPDATE_ADDRESS);
	const [removeAddress] = useMutation(REMOVE_ADDRESS);
	const addresses: Address[] = data?.getMyAddresses ?? [];

	const defaultHandler = async (id: string) => {
		try {
			await updateAddress({ variables: { input: { _id: id, addressDefault: true } } });
			await refetch();
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const removeHandler = async (id: string) => {
		try {
			if (!(await sweetConfirmAlert('Remove this address?'))) return;
			await removeAddress({ variables: { input: id } });
			await refetch();
			await sweetTopSmallSuccessAlert('Removed', 700);
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	return (
		<div className={'my-section'}>
			<div className={'section-head'}>
				<h2>{t('Addresses')}</h2>
				<p>{t('The default address is picked first at checkout.')}</p>
			</div>
			{addresses.length === 0 && !adding && <div className={'no-data'}>{t('No saved addresses.')}</div>}
			<div className={'address-list'}>
				{addresses.map((address) => (
					<div key={address._id} className={`address-card ${address.addressDefault ? 'on' : ''}`}>
						<b>
							{address.addressLabel}
							{address.addressDefault && <span className={'tag-pill'}>{t('Default')}</span>}
						</b>
						<span>
							{address.addressRecipient} · {address.addressPhone}
						</span>
						<span>
							({address.addressZip}) {address.addressLine1} {address.addressLine2}
						</span>
						<div className={'btns'}>
							{!address.addressDefault && (
								<button className={'ghost-btn small'} onClick={() => defaultHandler(address._id)}>
									{t('Make default')}
								</button>
							)}
							<button className={'ghost-btn small'} onClick={() => removeHandler(address._id)}>
								{t('Remove')}
							</button>
						</div>
					</div>
				))}
			</div>
			{adding ? (
				<AddressForm
					onSaved={() => {
						setAdding(false);
						refetch();
					}}
					onCancel={() => setAdding(false)}
				/>
			) : (
				<div className={'actions'}>
					<button className={'soft-btn'} onClick={() => setAdding(true)}>
						{t('+ Add address')}
					</button>
				</div>
			)}
		</div>
	);
};

export default MyAddresses;

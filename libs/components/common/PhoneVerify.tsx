import React, { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import TelegramIcon from '@mui/icons-material/Telegram';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { START_PHONE_VERIFICATION } from '../../../apollo/user/mutation';
import { CHECK_PHONE_VERIFICATION } from '../../../apollo/user/query';
import { VerificationPurpose } from '../../enums/verification.enum';
import { sweetMixinErrorAlert } from '../../sweetAlert';
import { useTranslation } from 'next-i18next';

interface PhoneVerifyProps {
	purpose: VerificationPurpose;
	// called once, when the bot got the phone; the page sends phoneToken to the backend
	onVerified: (phoneToken: string, phone: string) => void;
}

const PhoneVerify = ({ purpose, onVerified }: PhoneVerifyProps) => {
	const { t } = useTranslation('common');
	const [token, setToken] = useState<string>('');
	const [botUrl, setBotUrl] = useState<string>('');
	const [phone, setPhone] = useState<string>('');
	const [expired, setExpired] = useState<boolean>(false);
	const waiting = !!token && !phone && !expired;

	/** APOLLO REQUESTS **/
	const [startPhoneVerification, { loading }] = useMutation(START_PHONE_VERIFICATION);
	// asks every 2 s while waiting; skip stops it once verified or expired
	const { data } = useQuery(CHECK_PHONE_VERIFICATION, {
		variables: { token },
		skip: !waiting,
		pollInterval: 2000,
		fetchPolicy: 'network-only',
	});

	/** LIFECYCLES **/
	useEffect(() => {
		const state = data?.checkPhoneVerification;
		if (!state || !waiting) return;
		if (state.expired) setExpired(true);
		else if (state.status === 'VERIFIED' && state.phone) {
			setPhone(state.phone);
			onVerified(token, state.phone);
		}
	}, [data]);

	/** HANDLERS **/
	const start = async () => {
		// open the tab right away: browsers block tabs opened after waiting for the server
		const tab = window.open('', '_blank');
		try {
			const result = await startPhoneVerification({ variables: { purpose } });
			const { token, botUrl } = result.data.startPhoneVerification;
			setToken(token);
			setBotUrl(botUrl);
			setExpired(false);
			if (tab) tab.location.href = botUrl;
		} catch (err: any) {
			tab?.close();
			sweetMixinErrorAlert(err.message).then();
		}
	};

	if (phone) {
		return (
			<div className={'phone-verify done'}>
				<CheckCircleRoundedIcon fontSize={'small'} />
				<b>{phone}</b>
				<span>{t('Verified with Telegram')}</span>
			</div>
		);
	}

	return (
		<div className={'phone-verify'}>
			<button
				type={'button'}
				className={'tg-btn'}
				disabled={loading}
				// while waiting, the same link opens again instead of making a new one
				onClick={waiting ? () => window.open(botUrl, '_blank') : start}
			>
				<TelegramIcon fontSize={'small'} />
				{waiting ? t('Open Telegram again') : t('Verify with Telegram')}
			</button>
			{waiting && <p className={'note'}>{t('In Telegram press Start, then «Share my number». This page updates by itself.')}</p>}
			{expired && <p className={'note error'}>{t('The link expired. Press the button to try again.')}</p>}
		</div>
	);
};

export default PhoneVerify;

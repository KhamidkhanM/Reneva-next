import React, { useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMutation } from '@apollo/client';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import PhoneVerify from '../../libs/components/common/PhoneVerify';
import { RESET_PASSWORD } from '../../apollo/user/mutation';
import { updateStorage, updateUserInfo } from '../../libs/auth';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { VerificationPurpose } from '../../libs/enums/verification.enum';
import { useTranslation } from 'next-i18next';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const ResetPassword: NextPage = () => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const [phoneToken, setPhoneToken] = useState<string>('');
	const [password, setPassword] = useState<string>('');
	const [repeat, setRepeat] = useState<string>('');

	/** APOLLO REQUESTS **/
	const [resetPassword, { loading }] = useMutation(RESET_PASSWORD);

	/** HANDLERS **/
	const submitHandler = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			if (!phoneToken) throw new Error('Please verify your phone number with Telegram first!');
			// same limits as the backend ResetPasswordInput
			if (password.length < 5 || password.length > 12) throw new Error('Password must be 5 to 12 characters');
			if (password !== repeat) throw new Error('Passwords do not match');

			const result = await resetPassword({ variables: { input: { phoneToken, memberPassword: password } } });
			const jwtToken = result.data.resetPassword?.accessToken;
			if (jwtToken) {
				updateStorage({ jwtToken });
				updateUserInfo(jwtToken);
			}
			await sweetTopSmallSuccessAlert('Password changed, you are logged in', 1200);
			await router.push('/');
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	return (
		<div id={'join-page'}>
			<div className={'container'}>
				<div className={'join-card'}>
					<div className={'join-art'}>
						<img src={'/img/logo/rena-ai.svg'} alt={''} />
						<h2>{t('Reset password')}</h2>
						<p>{t('Verify your phone in Telegram, then choose a new password.')}</p>
					</div>

					<form className={'join-form'} onSubmit={submitHandler}>
						<div className={'field'}>
							<span>{t('Phone')}</span>
							<PhoneVerify purpose={VerificationPurpose.RESET_PASSWORD} onVerified={(token) => setPhoneToken(token)} />
						</div>
						<label className={'field'}>
							<span>{t('New password')}</span>
							<input type={'password'} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={'new-password'} required />
						</label>
						<label className={'field'}>
							<span>{t('Repeat new password')}</span>
							<input type={'password'} value={repeat} onChange={(e) => setRepeat(e.target.value)} autoComplete={'new-password'} required />
						</label>

						<button type={'submit'} className={'primary-btn'} disabled={loading || !phoneToken}>
							{t('Save new password')}
						</button>
						<p className={'hint'}>
							<Link href={'/account/join'} className={'link'}>
								{t('Back to log in')}
							</Link>
						</p>
					</form>
				</div>
			</div>
		</div>
	);
};

export default withLayoutBasic(ResetPassword);

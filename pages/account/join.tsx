import Link from 'next/link';
import React, { useCallback, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { googleLogIn, logIn, signUp } from '../../libs/auth';
import GoogleButton from '../../libs/components/common/GoogleButton';
import { sweetMixinErrorAlert } from '../../libs/sweetAlert';
import { FREE_DELIVERY_FROM, Messages } from '../../libs/config';
import { formatPrice } from '../../libs/utils';
import { MemberType } from '../../libs/enums/member.enum';
import { useTranslation } from 'next-i18next';
import { useQuery } from '@apollo/client';
import { GET_PHONE_VERIFICATION_ENABLED } from '../../apollo/user/query';
import PhoneVerify from '../../libs/components/common/PhoneVerify';
import { VerificationPurpose } from '../../libs/enums/verification.enum';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const Join: NextPage = () => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const [input, setInput] = useState({ nick: '', password: '', phone: '', type: MemberType.USER });
	const [loginView, setLoginView] = useState<boolean>(true);
	const [phoneToken, setPhoneToken] = useState<string>('');

	/** APOLLO REQUESTS **/
	const { data: verificationData } = useQuery(GET_PHONE_VERIFICATION_ENABLED);
	const verifyPhone = verificationData?.getPhoneVerificationEnabled ?? true;

	/** HANDLERS **/
	const handleInput = useCallback((name: string, value: string) => {
		setInput((prev) => ({ ...prev, [name]: value }));
	}, []);

	const doLogin = useCallback(async () => {
		try {
			if (!input.nick || !input.password) throw new Error(Messages.error3);
			await logIn(input.nick, input.password);
			await router.push(`${router.query.referrer ?? '/'}`);
		} catch (err: any) {
			await sweetMixinErrorAlert(err.message);
		}
	}, [input]);

	const doSignUp = useCallback(async () => {
		try {
			if (!input.nick || !input.password) throw new Error(Messages.error3);
			if (verifyPhone ? !phoneToken : !input.phone) throw new Error(t('Please verify your phone number with Telegram first!'));
			// same limits as the backend MemberInput
			if (input.nick.length < 3 || input.nick.length > 12) throw new Error('Nickname must be 3 to 12 characters');
			if (input.password.length < 5 || input.password.length > 12) throw new Error('Password must be 5 to 12 characters');
			await signUp(input.nick, input.password, input.phone, input.type, verifyPhone ? phoneToken : undefined);
			await router.push(input.type === MemberType.SELLER ? '/mypage?category=myBrands' : '/mypage?category=myProfile');
		} catch (err: any) {
			await sweetMixinErrorAlert(err.message);
		}
	}, [input, phoneToken, verifyPhone]);

	const doGoogle = useCallback(
		async (credential: string) => {
			try {
				// on the sign-up tab the chosen "Shop / Sell" type is used if this Google account is new
				const { isNew } = await googleLogIn(credential, loginView ? undefined : input.type);
				if (!isNew) return await router.push(`${router.query.referrer ?? '/'}`);
				const seller = !loginView && input.type === MemberType.SELLER;
				await router.push(seller ? '/mypage?category=myBrands' : '/mypage?category=myProfile');
			} catch (err: any) {
				await sweetMixinErrorAlert(err.message);
			}
		},
		[input.type, loginView, router.query.referrer],
	);

	const submitHandler = (e: React.FormEvent) => {
		e.preventDefault();
		loginView ? doLogin() : doSignUp();
	};

	return (
		<div id={'join-page'}>
			<div className={'container'}>
				<div className={'join-card'}>
					<div className={'join-art'}>
						<img src={'/img/logo/rena-ai.svg'} alt={''} />
						<h2>{loginView ? t('Welcome back') : t('Join Reneva')}</h2>
						<p>
							{loginView
								? t('Log in to see your cart, orders and Rena, your AI skin advisor.')
								: t('Members get skin-matched picks, a WELCOME10 coupon and points on every order.')}
						</p>
						<ul>
							<li>{t('Free delivery from {{amount}}', { amount: formatPrice(FREE_DELIVERY_FROM) })}</li>
							<li>{t('1:1 chat with every store')}</li>
							<li>{t('AI skin check in 30 seconds')}</li>
						</ul>
					</div>

					<form className={'join-form'} onSubmit={submitHandler}>
						<div className={'switch'} role={'tablist'}>
							<button type={'button'} role={'tab'} aria-selected={loginView} className={loginView ? 'on' : ''} onClick={() => setLoginView(true)}>
								{t('Log in')}
							</button>
							<button type={'button'} role={'tab'} aria-selected={!loginView} className={!loginView ? 'on' : ''} onClick={() => setLoginView(false)}>
								{t('Sign up')}
							</button>
						</div>

						<label className={'field'}>
							<span>{t('Nickname')}</span>
							<input value={input.nick} onChange={(e) => handleInput('nick', e.target.value)} autoComplete={'username'} required />
						</label>
						<label className={'field'}>
							<span>{t('Password')}</span>
							<input
								type={'password'}
								value={input.password}
								onChange={(e) => handleInput('password', e.target.value)}
								autoComplete={loginView ? 'current-password' : 'new-password'}
								required
							/>
						</label>

						{!loginView && (
							<>
								{verifyPhone ? (
									<div className={'field'}>
										<span>{t('Phone')}</span>
										<PhoneVerify purpose={VerificationPurpose.SIGNUP} onVerified={(token) => setPhoneToken(token)} />
									</div>
								) : (
									<label className={'field'}>
										<span>{t('Phone')}</span>
										<input type={'tel'} value={input.phone} onChange={(e) => handleInput('phone', e.target.value)} placeholder={'+998 90 123 45 67'} required />
									</label>
								)}
								<fieldset className={'type-pick'}>
									<legend>{t('I want to')}</legend>
									<label className={input.type === MemberType.USER ? 'on' : ''}>
										<input type={'radio'} name={'type'} checked={input.type === MemberType.USER} onChange={() => handleInput('type', MemberType.USER)} />
										<b>{t('Shop')}</b>
										<span>{t('Buy products, write reviews')}</span>
									</label>
									<label className={input.type === MemberType.SELLER ? 'on' : ''}>
										<input type={'radio'} name={'type'} checked={input.type === MemberType.SELLER} onChange={() => handleInput('type', MemberType.SELLER)} />
										<b>{t('Sell')}</b>
										<span>{t('Open a store for my brand')}</span>
									</label>
								</fieldset>
							</>
						)}

						{loginView && verifyPhone && (
							<p className={'hint'}>
								<Link href={'/account/reset'} className={'link'}>
									{t('Forgot password?')}
								</Link>
							</p>
						)}
						<button type={'submit'} className={'primary-btn'}>
							{loginView ? t('Log in') : t('Create account')}
						</button>
						<div className={'or-line'}>
							<span>{t('or')}</span>
						</div>
						<GoogleButton text={loginView ? 'signin_with' : 'signup_with'} onCredential={doGoogle} />
						<p className={'hint'}>
							{loginView ? t('New here? ') : t('Already a member? ')}
							<button type={'button'} className={'link'} onClick={() => setLoginView(!loginView)}>
								{loginView ? t('Create an account') : t('Log in')}
							</button>
						</p>
					</form>
				</div>
			</div>
		</div>
	);
};

export default withLayoutBasic(Join);

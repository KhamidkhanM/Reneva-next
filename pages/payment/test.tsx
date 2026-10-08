import React from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useMutation, useQuery } from '@apollo/client';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { GET_MY_PAYMENT } from '../../apollo/user/query';
import { CONFIRM_TEST_PAYMENT } from '../../apollo/user/mutation';
import { PaymentMethod, PaymentStatus } from '../../libs/enums/order.enum';
import { formatPrice } from '../../libs/utils';
import { sweetMixinErrorAlert } from '../../libs/sweetAlert';
import { useTranslation } from 'next-i18next';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

/**
 * Practice page that stands in for the real Payme / Click page while PAYMENT_MODE=test.
 * The backend refuses confirmTestPayment in live mode, so this page cannot give free orders.
 */
const TestPayment: NextPage = () => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const paymentId = router.query.paymentId as string;

	/** APOLLO REQUESTS **/
	const { data, error } = useQuery(GET_MY_PAYMENT, { variables: { paymentId }, skip: !paymentId, fetchPolicy: 'network-only' });
	const [confirmTestPayment, { loading }] = useMutation(CONFIRM_TEST_PAYMENT);
	const payment = data?.getMyPayment;

	/** HANDLERS **/
	const finish = async (success: boolean) => {
		try {
			await confirmTestPayment({ variables: { paymentId, success } });
			const query: any = { id: payment.orderId };
			if (success) query.placed = 1;
			await router.replace({ pathname: '/order/detail', query });
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	if (error) return <div id={'payment-test-page'}><p className={'no-data'}>{t('This payment was not found.')}</p></div>;
	if (!payment) return <div id={'payment-test-page'}></div>;

	const brand = payment.paymentMethod === PaymentMethod.CLICK ? 'click' : 'payme';
	const done = payment.paymentStatus !== PaymentStatus.READY;

	return (
		<div id={'payment-test-page'}>
			<div className={`pay-card ${brand}`}>
				<span className={'test-badge'}>{t('TEST')}</span>
				<h1>{brand === 'click' ? 'Click' : 'Payme'}</h1>
				<p className={'amount'}>{formatPrice(payment.paymentAmount, 'uz')}</p>
				<p className={'hint'}>{t('Practice payment: no card is needed and no money is charged.')}</p>

				{done ? (
					<p className={'hint'}>{t('This payment is already finished.')}</p>
				) : (
					<div className={'actions'}>
						<button className={'pay-btn'} disabled={loading} onClick={() => finish(true)}>
							{t('Pay')}
						</button>
						<button className={'ghost-btn'} disabled={loading} onClick={() => finish(false)}>
							{t('Cancel')}
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default withLayoutBasic(TestPayment);

import React, { useEffect } from 'react';
import { useQuery } from '@apollo/client';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import TelegramIcon from '@mui/icons-material/Telegram';
import HourglassTopRoundedIcon from '@mui/icons-material/HourglassTopRounded';
import { GET_TRANSFER_INFO } from '../../../apollo/user/query';
import { PaymentStatus } from '../../enums/order.enum';
import { formatCard, formatPrice } from '../../utils';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { useTranslation } from 'next-i18next';

interface TransferBoxProps {
	orderId: string;
	// called when the seller confirmed or rejected, so the order page reloads
	onFinished: () => void;
}

const TransferBox = ({ orderId, onFinished }: TransferBoxProps) => {
	const { t } = useTranslation('common');

	/** APOLLO REQUESTS **/
	// every 10 s: did the seller confirm yet? (and did the receipt arrive?)
	const { data } = useQuery(GET_TRANSFER_INFO, { variables: { orderId }, fetchPolicy: 'network-only', pollInterval: 10000 });
	const info = data?.getTransferInfo;

	/** LIFECYCLES **/
	useEffect(() => {
		if (info && info.paymentStatus !== PaymentStatus.READY) onFinished();
	}, [info?.paymentStatus]);

	/** HANDLERS **/
	const copy = async (text: string) => {
		try {
			await navigator.clipboard.writeText(text);
			await sweetTopSmallSuccessAlert('Copied', 700);
		} catch (err) {
			// old browsers or http pages cannot copy: the number is on screen to type by hand
			sweetMixinErrorAlert('Could not copy, please write the number down').then();
		}
	};

	if (!info || info.paymentStatus !== PaymentStatus.READY) return null;

	return (
		<div className={'transfer-box'}>
			<h3>{t('Pay by card transfer')}</h3>

			<ol className={'steps'}>
				<li>{t('Open your bank app (or go to a bank) and send exactly this amount:')}</li>
			</ol>
			<p className={'amount'}>{formatPrice(info.amount, 'uz')}</p>

			<div className={'card'}>
				<div>
					<span className={'label'}>{t('Card number')}</span>
					<b className={'number'}>{formatCard(info.cardNumber)}</b>
					<span className={'owner'}>{info.cardOwner}</span>
				</div>
				<button type={'button'} className={'soft-btn'} onClick={() => copy(info.cardNumber)}>
					<ContentCopyRoundedIcon fontSize={'small'} /> {t('Copy')}
				</button>
			</div>

			<ol className={'steps'} start={2}>
				<li>{t('Check that the name matches, then send the money.')}</li>
				<li>{t('Send a photo of the receipt so the store can find your payment.')}</li>
			</ol>

			{info.receiptSent ? (
				<p className={'waiting'}>
					<HourglassTopRoundedIcon fontSize={'small'} /> {t('Receipt received. The store is checking your payment…')}
				</p>
			) : info.receiptUrl ? (
				<a className={'tg-btn'} href={info.receiptUrl} target={'_blank'} rel={'noreferrer'}>
					<TelegramIcon fontSize={'small'} /> {t('Send receipt in Telegram')}
				</a>
			) : (
				<p className={'waiting'}>
					<HourglassTopRoundedIcon fontSize={'small'} /> {t('After the transfer, the store will check your payment and confirm the order.')}
				</p>
			)}
			<p className={'hint'}>
				{t('Order')} {info.orderNumber}
			</p>
		</div>
	);
};

export default TransferBox;

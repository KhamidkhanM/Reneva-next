import numeral from 'numeral';
import { REACT_APP_API_URL } from './config';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from './sweetAlert';
import { i18n } from 'next-i18next';
import { ratesVar } from '../apollo/store';

export const formatterStr = (value: number | undefined): string => {
	return numeral(value).format('0,0') != '0' ? numeral(value).format('0,0') : '';
};

// prices are stored in so'm; Uzbek and Russian show so'm, English shows $ and Korean shows ₩ (converted)
//   uz: 230 000 so'm   ru: 230 000 сум   en: $17.97   kr: ₩25,000
export const formatPrice = (value: number | undefined, locale: string = i18n?.language ?? 'uz'): string => {
	const sum = value ?? 0;
	const rates = ratesVar();
	if (locale === 'en') return `$${numeral(sum / rates.usd).format('0,0.00')}`;
	if (locale === 'kr') return `₩${numeral(Math.round(sum / rates.krw / 10) * 10).format('0,0')}`;
	const spaced = numeral(sum).format('0,0').replace(/,/g, ' ');
	return locale === 'ru' ? `${spaced} сум` : `${spaced} so'm`;
};

// true when prices on screen are converted from so'm, so the shop says the charge is in so'm
export const isConvertedPrice = (locale: string = i18n?.language ?? 'uz'): boolean => locale === 'en' || locale === 'kr';

export const salePercent = (price: number, salePrice: number): number =>
	price > 0 && salePrice < price ? Math.round(((price - salePrice) / price) * 100) : 0;

// "COMBINATION" -> "Combination", "KAKAO_PAY" -> "Kakao pay"
export const labelOf = (value?: string | null): string => {
	if (!value) return '';
	const text = value.toLowerCase().replace(/_/g, ' ');
	return text.charAt(0).toUpperCase() + text.slice(1);
};

// uploads/product/a.jpg -> http://localhost:3000/uploads/product/a.jpg
export const imageUrl = (path?: string | null): string => {
	if (!path) return '';
	if (path.startsWith('http') || path.startsWith('/')) return path;
	return `${REACT_APP_API_URL}/${path}`;
};

export const memberImage = (path?: string | null): string => imageUrl(path) || '/img/profile/defaultUser.svg';

export const isLiked = (item: { meLiked?: { myFavorite: boolean }[] } | undefined): boolean =>
	!!item?.meLiked?.[0]?.myFavorite;

// shared handler: like a product, brand, article, member or review, then refresh the list
export const likeHandler = async (likeMutation: any, user: { _id?: string }, id: string, refetch?: () => any) => {
	try {
		if (!id) return;
		if (!user._id) throw new Error('Please login first!');
		await likeMutation({ variables: { input: id } });
		if (refetch) await refetch();
		await sweetTopSmallSuccessAlert('Saved', 700);
	} catch (err: any) {
		console.log('ERROR, likeHandler:', err.message);
		sweetMixinErrorAlert(err.message).then();
	}
};

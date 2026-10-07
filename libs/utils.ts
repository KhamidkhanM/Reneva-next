import numeral from 'numeral';
import { REACT_APP_API_URL } from './config';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from './sweetAlert';

export const formatterStr = (value: number | undefined): string => {
	return numeral(value).format('0,0') != '0' ? numeral(value).format('0,0') : '';
};

// ₩25,600
export const formatKRW = (value: number | undefined): string => `₩${numeral(value ?? 0).format('0,0')}`;

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

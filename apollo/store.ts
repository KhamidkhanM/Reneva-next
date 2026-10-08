import { makeVar } from '@apollo/client';
import { CustomJwtPayload } from '../libs/types/customJwtPayload';

export const emptyUser: CustomJwtPayload = {
	_id: '',
	memberType: '',
	memberStatus: '',
	memberAuthType: '',
	memberPhone: '',
	memberNick: '',
	memberFullName: '',
	memberImage: '',
	memberEmail: '',
	memberAddress: '',
	memberDesc: '',
	memberLevel: '',
	memberSkinType: '',
	memberSkinConcerns: [],
	memberPoints: 0,
	memberProducts: 0,
	memberArticles: 0,
	memberOrders: 0,
	memberLikes: 0,
	memberViews: 0,
	memberRank: 0,
};

export const userVar = makeVar<CustomJwtPayload>({ ...emptyUser });

// the floating chat widget: which panel is open and which 1:1 room
export interface ChatWidgetState {
	open: boolean;
	tab: 'ai' | 'messages';
	roomId: string | null;
}
export const chatWidgetVar = makeVar<ChatWidgetState>({ open: false, tab: 'ai', roomId: null });

// unread 1:1 messages, shown on the chat button and the top menu
export const unreadChatVar = makeVar<number>(0);

// how many so'm one dollar / one won costs; the API replaces these with the Central Bank's daily rates
export const ratesVar = makeVar<{ usd: number; krw: number }>({ usd: 12800, krw: 9.2 });

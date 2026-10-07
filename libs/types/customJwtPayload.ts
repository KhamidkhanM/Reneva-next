import { JwtPayload } from 'jwt-decode';

export interface CustomJwtPayload extends JwtPayload {
	_id: string;
	memberType: string;
	memberStatus: string;
	memberAuthType: string;
	memberPhone: string;
	memberNick: string;
	memberFullName?: string;
	memberImage?: string;
	memberEmail?: string;
	memberAddress?: string;
	memberDesc?: string;
	memberLevel: string;
	memberSkinType?: string;
	memberSkinConcerns: string[];
	memberPoints: number;
	memberProducts: number;
	memberArticles: number;
	memberOrders: number;
	memberLikes: number;
	memberViews: number;
	memberRank: number;
}

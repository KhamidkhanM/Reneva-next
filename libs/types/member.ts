import { MemberAuthType, MemberLevel, MemberStatus, MemberType, SkinConcern, SkinType } from '../enums/member.enum';
import { MeFollowed, MeLiked } from './common';

export interface Member {
	_id: string;
	memberType: MemberType;
	memberStatus: MemberStatus;
	memberAuthType: MemberAuthType;
	memberPhone: string;
	memberNick: string;
	memberFullName?: string;
	memberImage: string;
	memberEmail?: string;
	memberAddress?: string;
	memberDesc?: string;
	memberLevel: MemberLevel;
	memberSkinType?: SkinType;
	memberSkinConcerns: SkinConcern[];
	memberPoints: number;
	memberTotalSpent: number;
	memberOrders: number;
	memberReviews: number;
	memberProducts: number;
	memberArticles: number;
	memberFollowers: number;
	memberFollowings: number;
	memberLikes: number;
	memberViews: number;
	memberComments: number;
	memberRank: number;
	memberWarnings: number;
	memberBlocks: number;
	createdAt: Date;
	updatedAt: Date;
	accessToken?: string;
	meLiked?: MeLiked[];
	meFollowed?: MeFollowed[];
}

export interface MemberUpdate {
	_id: string;
	memberPhone?: string;
	memberNick?: string;
	memberFullName?: string;
	memberImage?: string;
	memberEmail?: string;
	memberAddress?: string;
	memberDesc?: string;
	memberSkinType?: SkinType | null;
	memberSkinConcerns?: SkinConcern[];
}

export interface Follower {
	_id: string;
	followingId: string;
	followerId: string;
	createdAt: Date;
	meLiked?: MeLiked[];
	meFollowed?: MeFollowed[];
	followerData?: Member;
}

export interface Following {
	_id: string;
	followingId: string;
	followerId: string;
	createdAt: Date;
	meLiked?: MeLiked[];
	meFollowed?: MeFollowed[];
	followingData?: Member;
}

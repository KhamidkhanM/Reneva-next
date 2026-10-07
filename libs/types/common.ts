export interface T {
	[key: string]: any;
}

export interface TotalCounter {
	total: number;
}

export interface MeLiked {
	memberId: string;
	likeRefId: string;
	myFavorite: boolean;
}

export interface MeFollowed {
	followingId: string;
	followerId: string;
	myFollowing: boolean;
}

export interface Paged<Item> {
	list: Item[];
	metaCounter: TotalCounter[];
}

export interface OrdinaryInquiry {
	page: number;
	limit: number;
}

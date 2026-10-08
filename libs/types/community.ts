import { BoardArticleCategory, BoardArticleStatus } from '../enums/board-article.enum';
import { CommentGroup, CommentStatus } from '../enums/comment.enum';
import { NoticeCategory, NoticeStatus } from '../enums/notice.enum';
import { NotificationGroup, NotificationStatus, NotificationType } from '../enums/notification.enum';
import { ReviewStatus } from '../enums/review.enum';
import { SkinType } from '../enums/member.enum';
import { MeLiked } from './common';
import { Member } from './member';
import { Product, ProductOption } from './product';

export interface BoardArticle {
	_id: string;
	articleCategory: BoardArticleCategory;
	articleStatus: BoardArticleStatus;
	articleTitle: string;
	articleContent: string;
	articleImage?: string;
	articleViews: number;
	articleLikes: number;
	articleComments: number;
	memberId: string;
	createdAt: Date;
	memberData?: Member;
	meLiked?: MeLiked[];
}

export interface Comment {
	_id: string;
	commentStatus: CommentStatus;
	commentGroup: CommentGroup;
	commentContent: string;
	commentRefId: string;
	memberId: string;
	createdAt: Date;
	memberData?: Member;
}

export interface Review {
	_id: string;
	reviewStatus: ReviewStatus;
	reviewRating: number;
	reviewContent: string;
	reviewImages: string[];
	reviewSkinType?: SkinType;
	reviewLikes: number;
	reviewComments: number;
	productId: string;
	memberId: string;
	createdAt: Date;
	memberData?: Member;
	optionData?: ProductOption;
	productData?: Pick<Product, '_id' | 'productTitle'>;
	meLiked?: MeLiked[];
}

export interface Notice {
	_id: string;
	noticeCategory: NoticeCategory;
	noticeStatus: NoticeStatus;
	noticeTitle: string;
	noticeContent: string;
	createdAt: Date;
}

export interface Notification {
	_id: string;
	notificationType: NotificationType;
	notificationStatus: NotificationStatus;
	notificationGroup: NotificationGroup;
	notificationTitle: string;
	notificationDesc?: string;
	productId?: string;
	articleId?: string;
	orderId?: string;
	roomId?: string;
	createdAt: Date;
	authorData?: Member;
}

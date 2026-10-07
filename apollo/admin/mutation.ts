import { gql } from '@apollo/client';

export const UPDATE_MEMBER_BY_ADMIN = gql`
	mutation UpdateMemberByAdmin($input: MemberUpdateByAdmin!) {
		updateMemberByAdmin(input: $input) {
			_id
			memberType
			memberStatus
			memberLevel
		}
	}
`;

export const REMOVE_PRODUCT_BY_ADMIN = gql`
	mutation RemoveProductByAdmin($input: String!) {
		removeProductByAdmin(productId: $input) {
			_id
		}
	}
`;

export const REMOVE_BRAND_BY_ADMIN = gql`
	mutation RemoveBrandByAdmin($input: String!) {
		removeBrandByAdmin(brandId: $input) {
			_id
		}
	}
`;

export const CREATE_CATEGORY = gql`
	mutation CreateCategory($input: CategoryInput!) {
		createCategory(input: $input) {
			_id
		}
	}
`;

export const UPDATE_CATEGORY = gql`
	mutation UpdateCategory($input: CategoryUpdate!) {
		updateCategory(input: $input) {
			_id
			categoryStatus
		}
	}
`;

export const UPDATE_ORDER_BY_ADMIN = gql`
	mutation UpdateOrderByAdmin($input: OrderUpdateByAdmin!) {
		updateOrderByAdmin(input: $input) {
			_id
			orderStatus
		}
	}
`;

export const CREATE_NOTICE = gql`
	mutation CreateNotice($input: NoticeInput!) {
		createNotice(input: $input) {
			_id
		}
	}
`;

export const UPDATE_NOTICE = gql`
	mutation UpdateNotice($input: NoticeUpdate!) {
		updateNotice(input: $input) {
			_id
			noticeStatus
		}
	}
`;

export const REMOVE_REVIEW_BY_ADMIN = gql`
	mutation RemoveReviewByAdmin($input: String!) {
		removeReviewByAdmin(reviewId: $input) {
			_id
		}
	}
`;

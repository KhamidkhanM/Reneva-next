import { gql } from '@apollo/client';
import { BRAND_FIELDS, MEMBER_FIELDS, ORDER_FIELDS, PRODUCT_FIELDS } from '../fragments';

export const GET_ALL_MEMBERS_BY_ADMIN = gql`
	${MEMBER_FIELDS}
	query GetAllMembersByAdmin($input: MembersInquiry!) {
		getAllMembersByAdmin(input: $input) {
			list {
				...MemberFields
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_ALL_PRODUCTS_BY_ADMIN = gql`
	${PRODUCT_FIELDS}
	query GetAllProductsByAdmin($input: AllProductsInquiry!) {
		getAllProductsByAdmin(input: $input) {
			list {
				...ProductFields
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_ALL_BRANDS_BY_ADMIN = gql`
	${BRAND_FIELDS}
	query GetAllBrandsByAdmin($input: BrandsInquiry!) {
		getAllBrandsByAdmin(input: $input) {
			list {
				...BrandFields
				memberData {
					_id
					memberNick
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_ALL_CATEGORIES_BY_ADMIN = gql`
	query GetAllCategoriesByAdmin {
		getAllCategoriesByAdmin {
			_id
			categoryName
			categorySlug
			categoryParentId
			categoryOrder
			categoryStatus
		}
	}
`;

export const GET_ALL_ORDERS_BY_ADMIN = gql`
	${ORDER_FIELDS}
	query GetAllOrdersByAdmin($input: OrdersInquiry!) {
		getAllOrdersByAdmin(input: $input) {
			list {
				...OrderFields
				memberData {
					_id
					memberNick
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_ALL_NOTICES_BY_ADMIN = gql`
	query GetAllNoticesByAdmin($input: NoticesInquiry!) {
		getAllNoticesByAdmin(input: $input) {
			list {
				_id
				noticeCategory
				noticeStatus
				noticeTitle
				noticeContent
				createdAt
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_ALL_REVIEWS_BY_ADMIN = gql`
	query GetAllReviewsByAdmin($input: OrdinaryInquiry!) {
		getAllReviewsByAdmin(input: $input) {
			list {
				_id
				reviewRating
				reviewContent
				reviewImages
				productId
				createdAt
				memberData {
					_id
					memberNick
					memberImage
				}
				productData {
					_id
					productTitle
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_ALL_COMMENTS_BY_ADMIN = gql`
	query GetAllCommentsByAdmin($input: OrdinaryInquiry!) {
		getAllCommentsByAdmin(input: $input) {
			list {
				_id
				commentGroup
				commentContent
				commentRefId
				createdAt
				memberData {
					_id
					memberNick
					memberImage
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

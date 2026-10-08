import { gql } from '@apollo/client';
import {
	AI_CHAT_FIELDS,
	AI_MESSAGE_FIELDS,
	ANALYSIS_FIELDS,
	ARTICLE_FIELDS,
	BRAND_FIELDS,
	MEMBER_FIELDS,
	MESSAGE_FIELDS,
	OPTION_FIELDS,
	ORDER_FIELDS,
	PRODUCT_FIELDS,
	ROOM_FIELDS,
} from '../fragments';

/**************************
 *         MEMBER         *
 *************************/

export const GET_MEMBER = gql`
	${MEMBER_FIELDS}
	query GetMember($input: String!) {
		getMember(memberId: $input) {
			...MemberFields
			meLiked {
				memberId
				likeRefId
				myFavorite
			}
			meFollowed {
				followingId
				followerId
				myFollowing
			}
		}
	}
`;

export const GET_SELLERS = gql`
	${MEMBER_FIELDS}
	query GetSellers($input: SellersInquiry!) {
		getSellers(input: $input) {
			list {
				...MemberFields
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_MEMBER_FOLLOWERS = gql`
	query GetMemberFollowers($input: FollowInquiry!) {
		getMemberFollowers(input: $input) {
			list {
				_id
				followingId
				followerId
				createdAt
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
				meFollowed {
					followingId
					followerId
					myFollowing
				}
				followerData {
					_id
					memberNick
					memberImage
					memberType
					memberFollowers
					memberFollowings
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_MEMBER_FOLLOWINGS = gql`
	query GetMemberFollowings($input: FollowInquiry!) {
		getMemberFollowings(input: $input) {
			list {
				_id
				followingId
				followerId
				createdAt
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
				meFollowed {
					followingId
					followerId
					myFollowing
				}
				followingData {
					_id
					memberNick
					memberImage
					memberType
					memberFollowers
					memberFollowings
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *     BRAND & CATEGORY   *
 *************************/

export const GET_BRAND = gql`
	${BRAND_FIELDS}
	query GetBrand($input: String!) {
		getBrand(brandId: $input) {
			...BrandFields
			meLiked {
				memberId
				likeRefId
				myFavorite
			}
		}
	}
`;

export const GET_BRANDS = gql`
	${BRAND_FIELDS}
	query GetBrands($input: BrandsInquiry!) {
		getBrands(input: $input) {
			list {
				...BrandFields
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_CATEGORIES = gql`
	query GetCategories {
		getCategories {
			_id
			categoryName
			categorySlug
			categoryParentId
			categoryOrder
			categoryImage
			categoryStatus
		}
	}
`;

/**************************
 *        PRODUCT         *
 *************************/

export const GET_PRODUCT = gql`
	${PRODUCT_FIELDS}
	${OPTION_FIELDS}
	query GetProduct($input: String!) {
		getProduct(productId: $input) {
			...ProductFields
			productOptions {
				...OptionFields
			}
			categoryData {
				_id
				categoryName
				categorySlug
			}
			memberData {
				_id
				memberNick
				memberImage
			}
		}
	}
`;

export const GET_PRODUCTS = gql`
	${PRODUCT_FIELDS}
	query GetProducts($input: ProductsInquiry!) {
		getProducts(input: $input) {
			list {
				...ProductFields
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_SELLER_PRODUCTS = gql`
	${PRODUCT_FIELDS}
	query GetSellerProducts($input: SellerProductsInquiry!) {
		getSellerProducts(input: $input) {
			list {
				...ProductFields
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_FAVORITES = gql`
	${PRODUCT_FIELDS}
	query GetFavorites($input: OrdinaryInquiry!) {
		getFavorites(input: $input) {
			list {
				...ProductFields
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_VISITED = gql`
	${PRODUCT_FIELDS}
	query GetVisited($input: OrdinaryInquiry!) {
		getVisited(input: $input) {
			list {
				...ProductFields
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *    CART, ORDER, COUPON *
 *************************/

export const GET_MY_CART = gql`
	${OPTION_FIELDS}
	query GetMyCart {
		getMyCart {
			list {
				_id
				productId
				optionId
				cartQuantity
				cartSelected
				productData {
					_id
					productTitle
					productStatus
					productImages
					productPrice
					productSalePrice
					brandId
					brandData {
						_id
						brandName
					}
				}
				optionData {
					...OptionFields
				}
			}
			cartSubtotal
			cartDeliveryFee
			cartTotal
		}
	}
`;

export const GET_MY_ADDRESSES = gql`
	query GetMyAddresses {
		getMyAddresses {
			_id
			addressLabel
			addressRecipient
			addressPhone
			addressZip
			addressLine1
			addressLine2
			addressDefault
		}
	}
`;

export const GET_MY_COUPONS = gql`
	query GetMyCoupons($input: MemberCouponsInquiry!) {
		getMyCoupons(input: $input) {
			list {
				_id
				couponId
				memberCouponStatus
				usedAt
				couponData {
					_id
					couponTitle
					couponCode
					couponType
					couponValue
					couponMinOrder
					couponMaxDiscount
					brandId
					startAt
					endAt
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_ISSUED_COUPONS = gql`
	query GetIssuedCoupons($input: OrdinaryInquiry!) {
		getIssuedCoupons(input: $input) {
			list {
				_id
				couponTitle
				couponCode
				couponType
				couponValue
				couponMinOrder
				couponMaxDiscount
				couponStatus
				brandId
				startAt
				endAt
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_MY_ORDERS = gql`
	${ORDER_FIELDS}
	query GetMyOrders($input: OrdersInquiry!) {
		getMyOrders(input: $input) {
			list {
				...OrderFields
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_SELLER_ORDERS = gql`
	${ORDER_FIELDS}
	query GetSellerOrders($input: OrdersInquiry!) {
		getSellerOrders(input: $input) {
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

export const GET_ORDER = gql`
	${ORDER_FIELDS}
	query GetOrder($input: String!) {
		getOrder(orderId: $input) {
			...OrderFields
		}
	}
`;

/**************************
 *   REVIEW & COMMUNITY   *
 *************************/

export const GET_REVIEWS = gql`
	query GetReviews($input: ReviewsInquiry!) {
		getReviews(input: $input) {
			list {
				_id
				reviewStatus
				reviewRating
				reviewContent
				reviewImages
				reviewSkinType
				reviewLikes
				reviewComments
				productId
				memberId
				createdAt
				memberData {
					_id
					memberNick
					memberImage
					memberLevel
				}
				optionData {
					_id
					optionName
				}
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_BOARD_ARTICLE = gql`
	${ARTICLE_FIELDS}
	query GetBoardArticle($input: String!) {
		getBoardArticle(articleId: $input) {
			...ArticleFields
		}
	}
`;

export const GET_BOARD_ARTICLES = gql`
	${ARTICLE_FIELDS}
	query GetBoardArticles($input: BoardArticlesInquiry!) {
		getBoardArticles(input: $input) {
			list {
				...ArticleFields
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_COMMENTS = gql`
	query GetComments($input: CommentsInquiry!) {
		getComments(input: $input) {
			list {
				_id
				commentStatus
				commentGroup
				commentContent
				commentRefId
				memberId
				createdAt
				memberData {
					_id
					memberNick
					memberImage
					memberType
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_NOTICES = gql`
	query GetNotices($input: NoticesInquiry!) {
		getNotices(input: $input) {
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

export const GET_MY_NOTIFICATIONS = gql`
	query GetMyNotifications($input: OrdinaryInquiry!) {
		getMyNotifications(input: $input) {
			list {
				_id
				notificationType
				notificationStatus
				notificationGroup
				notificationTitle
				notificationDesc
				productId
				articleId
				orderId
				roomId
				createdAt
				authorData {
					_id
					memberNick
					memberImage
				}
			}
			metaCounter {
				total
			}
			unreadCount
		}
	}
`;

/**************************
 *       1:1 CHAT         *
 *************************/

export const GET_MY_CHAT_ROOMS = gql`
	${ROOM_FIELDS}
	query GetMyChatRooms($input: OrdinaryInquiry!) {
		getMyChatRooms(input: $input) {
			list {
				...RoomFields
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_CHAT_ROOM = gql`
	${ROOM_FIELDS}
	query GetChatRoom($input: String!) {
		getChatRoom(roomId: $input) {
			...RoomFields
		}
	}
`;

export const GET_CHAT_MESSAGES = gql`
	${MESSAGE_FIELDS}
	query GetChatMessages($input: ChatMessagesInquiry!) {
		getChatMessages(input: $input) {
			list {
				...MessageFields
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *          AI            *
 *************************/

export const GET_MY_SKIN_ANALYSES = gql`
	${ANALYSIS_FIELDS}
	query GetMySkinAnalyses($input: OrdinaryInquiry!) {
		getMySkinAnalyses(input: $input) {
			list {
				...AnalysisFields
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_MY_AI_CHATS = gql`
	${AI_CHAT_FIELDS}
	query GetMyAiChats($input: OrdinaryInquiry!) {
		getMyAiChats(input: $input) {
			list {
				...AiChatFields
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_AI_MESSAGES = gql`
	${AI_MESSAGE_FIELDS}
	query GetAiMessages($input: AiMessagesInquiry!) {
		getAiMessages(input: $input) {
			list {
				...AiMessageFields
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_MY_RECOMMENDATIONS = gql`
	${PRODUCT_FIELDS}
	query GetMyRecommendations($input: OrdinaryInquiry!) {
		getMyRecommendations(input: $input) {
			list {
				_id
				productId
				recommendScore
				recommendReason
				recommendSource
				productData {
					...ProductFields
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *        CURRENCY        *
 *************************/

export const GET_EXCHANGE_RATES = gql`
	query GetExchangeRates {
		getExchangeRates {
			usd
			krw
			date
			source
		}
	}
`;

export const GET_PHONE_VERIFICATION_ENABLED = gql`
	query GetPhoneVerificationEnabled {
		getPhoneVerificationEnabled
	}
`;

export const CHECK_PHONE_VERIFICATION = gql`
	query CheckPhoneVerification($token: String!) {
		checkPhoneVerification(token: $token) {
			status
			phone
			expired
		}
	}
`;

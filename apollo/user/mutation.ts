import { gql } from '@apollo/client';
import {
	AI_CHAT_FIELDS,
	AI_MESSAGE_FIELDS,
	ANALYSIS_FIELDS,
	ARTICLE_FIELDS,
	BRAND_FIELDS,
	MEMBER_FIELDS,
	MESSAGE_FIELDS,
	ORDER_FIELDS,
	PRODUCT_FIELDS,
	ROOM_FIELDS,
} from '../fragments';

/**************************
 *         MEMBER         *
 *************************/

export const SIGN_UP = gql`
	${MEMBER_FIELDS}
	mutation Signup($input: MemberInput!) {
		signup(input: $input) {
			...MemberFields
			accessToken
		}
	}
`;

export const LOGIN = gql`
	${MEMBER_FIELDS}
	mutation Login($input: LoginInput!) {
		login(input: $input) {
			...MemberFields
			accessToken
		}
	}
`;

export const UPDATE_MEMBER = gql`
	${MEMBER_FIELDS}
	mutation UpdateMember($input: MemberUpdate!) {
		updateMember(input: $input) {
			...MemberFields
			accessToken
		}
	}
`;

export const IMAGE_UPLOADER = gql`
	mutation ImageUploader($file: Upload!, $target: String!) {
		imageUploader(file: $file, target: $target)
	}
`;

export const IMAGES_UPLOADER = gql`
	mutation ImagesUploader($files: [Upload!]!, $target: String!) {
		imagesUploader(files: $files, target: $target)
	}
`;

export const LIKE_TARGET_MEMBER = gql`
	mutation LikeTargetMember($input: String!) {
		likeTargetMember(memberId: $input) {
			_id
			memberLikes
		}
	}
`;

export const SUBSCRIBE = gql`
	mutation Subscribe($input: String!) {
		subscribe(input: $input) {
			_id
			followingId
			followerId
		}
	}
`;

export const UNSUBSCRIBE = gql`
	mutation Unsubscribe($input: String!) {
		unsubscribe(input: $input) {
			_id
			followingId
			followerId
		}
	}
`;

export const CREATE_ADDRESS = gql`
	mutation CreateAddress($input: AddressInput!) {
		createAddress(input: $input) {
			_id
			addressDefault
		}
	}
`;

export const UPDATE_ADDRESS = gql`
	mutation UpdateAddress($input: AddressUpdate!) {
		updateAddress(input: $input) {
			_id
			addressDefault
		}
	}
`;

export const REMOVE_ADDRESS = gql`
	mutation RemoveAddress($input: String!) {
		removeAddress(addressId: $input) {
			_id
		}
	}
`;

/**************************
 *     BRAND & PRODUCT    *
 *************************/

export const CREATE_BRAND = gql`
	${BRAND_FIELDS}
	mutation CreateBrand($input: BrandInput!) {
		createBrand(input: $input) {
			...BrandFields
		}
	}
`;

export const UPDATE_BRAND = gql`
	${BRAND_FIELDS}
	mutation UpdateBrand($input: BrandUpdate!) {
		updateBrand(input: $input) {
			...BrandFields
		}
	}
`;

export const LIKE_TARGET_BRAND = gql`
	mutation LikeTargetBrand($input: String!) {
		likeTargetBrand(brandId: $input) {
			_id
			brandLikes
		}
	}
`;

export const CREATE_PRODUCT = gql`
	${PRODUCT_FIELDS}
	mutation CreateProduct($input: ProductInput!) {
		createProduct(input: $input) {
			...ProductFields
		}
	}
`;

export const UPDATE_PRODUCT = gql`
	${PRODUCT_FIELDS}
	mutation UpdateProduct($input: ProductUpdate!) {
		updateProduct(input: $input) {
			...ProductFields
		}
	}
`;

export const ADD_PRODUCT_OPTION = gql`
	mutation AddProductOption($productId: String!, $input: ProductOptionInput!) {
		addProductOption(productId: $productId, input: $input) {
			_id
			productStatus
		}
	}
`;

export const UPDATE_PRODUCT_OPTION = gql`
	mutation UpdateProductOption($input: ProductOptionUpdate!) {
		updateProductOption(input: $input) {
			_id
			productStatus
		}
	}
`;

export const LIKE_TARGET_PRODUCT = gql`
	mutation LikeTargetProduct($input: String!) {
		likeTargetProduct(productId: $input) {
			_id
			productLikes
		}
	}
`;

/**************************
 *    CART, ORDER, COUPON *
 *************************/

export const ADD_TO_CART = gql`
	mutation AddToCart($input: CartInput!) {
		addToCart(input: $input) {
			_id
			cartQuantity
		}
	}
`;

export const UPDATE_CART_ITEM = gql`
	mutation UpdateCartItem($input: CartUpdate!) {
		updateCartItem(input: $input) {
			_id
			cartQuantity
			cartSelected
		}
	}
`;

export const REMOVE_CART_ITEM = gql`
	mutation RemoveCartItem($input: String!) {
		removeCartItem(cartId: $input) {
			_id
		}
	}
`;

export const CLAIM_COUPON = gql`
	mutation ClaimCoupon($input: String!) {
		claimCoupon(couponCode: $input) {
			_id
			memberCouponStatus
		}
	}
`;

export const CREATE_COUPON = gql`
	mutation CreateCoupon($input: CouponInput!) {
		createCoupon(input: $input) {
			_id
			couponCode
		}
	}
`;

export const UPDATE_COUPON = gql`
	mutation UpdateCoupon($input: CouponUpdate!) {
		updateCoupon(input: $input) {
			_id
			couponStatus
		}
	}
`;

export const CREATE_ORDER = gql`
	${ORDER_FIELDS}
	mutation CreateOrder($input: OrderInput!) {
		createOrder(input: $input) {
			...OrderFields
		}
	}
`;

export const PAY_ORDER = gql`
	${ORDER_FIELDS}
	mutation PayOrder($input: PaymentInput!) {
		payOrder(input: $input) {
			...OrderFields
		}
	}
`;

export const CANCEL_ORDER = gql`
	mutation CancelOrder($input: String!) {
		cancelOrder(orderId: $input) {
			_id
			orderStatus
		}
	}
`;

export const SHIP_ORDER_BY_SELLER = gql`
	mutation ShipOrderBySeller($input: String!) {
		shipOrderBySeller(orderId: $input) {
			_id
			orderStatus
		}
	}
`;

export const CONFIRM_ORDER = gql`
	mutation ConfirmOrder($input: String!) {
		confirmOrder(orderId: $input) {
			_id
			orderStatus
		}
	}
`;

/**************************
 *   REVIEW & COMMUNITY   *
 *************************/

export const CREATE_REVIEW = gql`
	mutation CreateReview($input: ReviewInput!) {
		createReview(input: $input) {
			_id
		}
	}
`;

export const LIKE_TARGET_REVIEW = gql`
	mutation LikeTargetReview($input: String!) {
		likeTargetReview(reviewId: $input) {
			_id
			reviewLikes
		}
	}
`;

export const CREATE_BOARD_ARTICLE = gql`
	mutation CreateBoardArticle($input: BoardArticleInput!) {
		createBoardArticle(input: $input) {
			_id
		}
	}
`;

export const UPDATE_BOARD_ARTICLE = gql`
	${ARTICLE_FIELDS}
	mutation UpdateBoardArticle($input: BoardArticleUpdate!) {
		updateBoardArticle(input: $input) {
			...ArticleFields
		}
	}
`;

export const LIKE_TARGET_BOARD_ARTICLE = gql`
	mutation LikeTargetBoardArticle($input: String!) {
		likeTargetBoardArticle(articleId: $input) {
			_id
			articleLikes
		}
	}
`;

export const CREATE_COMMENT = gql`
	mutation CreateComment($input: CommentInput!) {
		createComment(input: $input) {
			_id
		}
	}
`;

export const UPDATE_COMMENT = gql`
	mutation UpdateComment($input: CommentUpdate!) {
		updateComment(input: $input) {
			_id
			commentStatus
		}
	}
`;

export const READ_NOTIFICATION = gql`
	mutation ReadNotification($input: String!) {
		readNotification(notificationId: $input) {
			_id
			notificationStatus
		}
	}
`;

export const READ_ALL_NOTIFICATIONS = gql`
	mutation ReadAllNotifications {
		readAllNotifications
	}
`;

/**************************
 *       1:1 CHAT         *
 *************************/

export const OPEN_CHAT_ROOM = gql`
	${ROOM_FIELDS}
	mutation OpenChatRoom($input: ChatRoomInput!) {
		openChatRoom(input: $input) {
			...RoomFields
		}
	}
`;

export const SEND_CHAT_MESSAGE = gql`
	${MESSAGE_FIELDS}
	mutation SendChatMessage($input: ChatMessageInput!) {
		sendChatMessage(input: $input) {
			...MessageFields
		}
	}
`;

export const MARK_CHAT_ROOM_READ = gql`
	mutation MarkChatRoomRead($input: String!) {
		markChatRoomRead(roomId: $input) {
			_id
			customerUnread
			agentUnread
		}
	}
`;

export const CLOSE_CHAT_ROOM = gql`
	mutation CloseChatRoom($input: String!) {
		closeChatRoom(roomId: $input) {
			_id
			chatStatus
		}
	}
`;

/**************************
 *          AI            *
 *************************/

export const ANALYZE_SKIN = gql`
	${ANALYSIS_FIELDS}
	mutation AnalyzeSkin($input: SkinAnalysisInput!) {
		analyzeSkin(input: $input) {
			...AnalysisFields
		}
	}
`;

export const CREATE_AI_CHAT = gql`
	${AI_CHAT_FIELDS}
	mutation CreateAiChat($input: AiChatInput!) {
		createAiChat(input: $input) {
			...AiChatFields
		}
	}
`;

export const SEND_AI_MESSAGE = gql`
	${AI_CHAT_FIELDS}
	${AI_MESSAGE_FIELDS}
	mutation SendAiMessage($input: AiMessageInput!) {
		sendAiMessage(input: $input) {
			message {
				...AiMessageFields
			}
			aiChat {
				...AiChatFields
			}
		}
	}
`;

export const FEEDBACK_AI_MESSAGE = gql`
	mutation FeedbackAiMessage($input: AiFeedbackInput!) {
		feedbackAiMessage(input: $input) {
			_id
			aiMessageFeedback
		}
	}
`;

export const ARCHIVE_AI_CHAT = gql`
	mutation ArchiveAiChat($input: String!) {
		archiveAiChat(aiChatId: $input) {
			_id
			aiChatStatus
		}
	}
`;

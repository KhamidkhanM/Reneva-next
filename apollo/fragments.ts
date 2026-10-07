import { gql } from '@apollo/client';

export const MEMBER_FIELDS = gql`
	fragment MemberFields on Member {
		_id
		memberType
		memberStatus
		memberAuthType
		memberPhone
		memberNick
		memberFullName
		memberImage
		memberEmail
		memberAddress
		memberDesc
		memberLevel
		memberSkinType
		memberSkinConcerns
		memberPoints
		memberTotalSpent
		memberOrders
		memberReviews
		memberProducts
		memberArticles
		memberFollowers
		memberFollowings
		memberLikes
		memberViews
		memberComments
		memberRank
		memberWarnings
		memberBlocks
		createdAt
		updatedAt
	}
`;

export const BRAND_FIELDS = gql`
	fragment BrandFields on Brand {
		_id
		brandName
		brandLogo
		brandBanner
		brandDesc
		brandCountry
		brandStatus
		brandProducts
		brandLikes
		memberId
		createdAt
	}
`;

export const OPTION_FIELDS = gql`
	fragment OptionFields on ProductOption {
		_id
		productId
		optionName
		optionColor
		optionImage
		optionExtraPrice
		optionStock
		optionStatus
	}
`;

export const PRODUCT_FIELDS = gql`
	fragment ProductFields on Product {
		_id
		productStatus
		productTitle
		productDesc
		productPrice
		productSalePrice
		productVolume
		productImages
		productIngredients
		productSkinTypes
		productConcerns
		productTags
		productReviewSummary
		productRating
		productReviews
		productViews
		productLikes
		productComments
		productSold
		productRank
		brandId
		categoryId
		memberId
		createdAt
		brandData {
			_id
			brandName
			brandLogo
		}
		meLiked {
			memberId
			likeRefId
			myFavorite
		}
	}
`;

export const ORDER_FIELDS = gql`
	fragment OrderFields on Order {
		_id
		orderNumber
		orderStatus
		orderSubtotal
		orderDiscount
		orderPointsUsed
		orderDeliveryFee
		orderTotal
		orderAddress {
			addressRecipient
			addressPhone
			addressZip
			addressLine1
			addressLine2
		}
		orderMemo
		memberId
		createdAt
		paidAt
		deliveredAt
		finishedAt
		canceledAt
		orderItems {
			_id
			orderId
			productId
			optionId
			itemTitle
			itemOptionName
			itemImage
			itemPrice
			itemQuantity
			itemReviewed
			sellerId
		}
		payments {
			_id
			paymentMethod
			paymentAmount
			paymentStatus
			paymentTxId
			paidAt
		}
	}
`;

export const ARTICLE_FIELDS = gql`
	fragment ArticleFields on BoardArticle {
		_id
		articleCategory
		articleStatus
		articleTitle
		articleContent
		articleImage
		articleViews
		articleLikes
		articleComments
		memberId
		createdAt
		memberData {
			_id
			memberNick
			memberImage
			memberType
		}
		meLiked {
			memberId
			likeRefId
			myFavorite
		}
	}
`;

export const ROOM_FIELDS = gql`
	fragment RoomFields on ChatRoom {
		_id
		chatType
		chatStatus
		customerId
		agentId
		productId
		orderId
		lastMessage
		lastMessageAt
		customerUnread
		agentUnread
		customerData {
			_id
			memberNick
			memberImage
			memberType
		}
		agentData {
			_id
			memberNick
			memberImage
			memberType
		}
		productData {
			_id
			productTitle
			productImages
			productSalePrice
		}
	}
`;

export const MESSAGE_FIELDS = gql`
	fragment MessageFields on ChatMessage {
		_id
		roomId
		senderId
		messageType
		messageContent
		messageImage
		messageRefId
		messageStatus
		createdAt
	}
`;

export const AI_CHAT_FIELDS = gql`
	fragment AiChatFields on AiChat {
		_id
		aiChatType
		aiChatTitle
		aiChatStatus
		analysisId
		roomId
		aiChatMessages
		lastMessageAt
		createdAt
	}
`;

export const AI_MESSAGE_FIELDS = gql`
	fragment AiMessageFields on AiMessage {
		_id
		aiChatId
		aiMessageRole
		aiMessageContent
		aiMessageProducts
		aiMessageFeedback
		createdAt
		productsData {
			_id
			productTitle
			productImages
			productSalePrice
			productPrice
			productRating
		}
	}
`;

export const ANALYSIS_FIELDS = gql`
	fragment AnalysisFields on SkinAnalysis {
		_id
		analysisImage
		analysisSkinType
		analysisScores {
			moisture
			oil
			pores
			wrinkles
			tone
		}
		analysisConcerns
		analysisSummary
		analysisStatus
		createdAt
	}
`;

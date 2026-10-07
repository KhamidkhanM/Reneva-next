import { OrderStatus, PaymentMethod, PaymentStatus } from '../enums/order.enum';
import { CouponStatus, CouponType, MemberCouponStatus } from '../enums/coupon.enum';
import { Product, ProductOption } from './product';
import { Member } from './member';

export interface Address {
	_id: string;
	addressLabel: string;
	addressRecipient: string;
	addressPhone: string;
	addressZip: string;
	addressLine1: string;
	addressLine2?: string;
	addressDefault: boolean;
}

export interface Cart {
	_id: string;
	productId: string;
	optionId: string;
	cartQuantity: number;
	cartSelected: boolean;
	productData?: Product;
	optionData?: ProductOption;
}

export interface MyCart {
	list: Cart[];
	cartSubtotal: number;
	cartDeliveryFee: number;
	cartTotal: number;
}

export interface OrderItem {
	_id: string;
	orderId: string;
	productId: string;
	optionId: string;
	itemTitle: string;
	itemOptionName?: string;
	itemImage?: string;
	itemPrice: number;
	itemQuantity: number;
	itemReviewed: boolean;
	sellerId: string;
}

export interface Payment {
	_id: string;
	paymentMethod: PaymentMethod;
	paymentAmount: number;
	paymentStatus: PaymentStatus;
	paymentTxId?: string;
	paidAt?: Date;
}

export interface Order {
	_id: string;
	orderNumber: string;
	orderStatus: OrderStatus;
	orderSubtotal: number;
	orderDiscount: number;
	orderPointsUsed: number;
	orderDeliveryFee: number;
	orderTotal: number;
	orderAddress: Omit<Address, '_id' | 'addressLabel' | 'addressDefault'>;
	orderMemo?: string;
	memberId: string;
	createdAt: Date;
	paidAt?: Date;
	deliveredAt?: Date;
	finishedAt?: Date;
	canceledAt?: Date;
	orderItems?: OrderItem[];
	payments?: Payment[];
	memberData?: Member;
}

export interface Coupon {
	_id: string;
	couponTitle: string;
	couponCode: string;
	couponType: CouponType;
	couponValue: number;
	couponMinOrder: number;
	couponMaxDiscount?: number;
	couponStatus: CouponStatus;
	brandId?: string | null;
	startAt: Date;
	endAt: Date;
}

export interface MemberCoupon {
	_id: string;
	couponId: string;
	memberCouponStatus: MemberCouponStatus;
	usedAt?: Date;
	couponData?: Coupon;
}

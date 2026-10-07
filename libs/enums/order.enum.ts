export enum OrderStatus {
	PAUSE = 'PAUSE',
	PROCESS = 'PROCESS',
	DELIVERY = 'DELIVERY',
	FINISH = 'FINISH',
	CANCEL = 'CANCEL',
	REFUND = 'REFUND',
}

export enum PaymentMethod {
	CARD = 'CARD',
	KAKAO_PAY = 'KAKAO_PAY',
	NAVER_PAY = 'NAVER_PAY',
	BANK = 'BANK',
}

export enum PaymentStatus {
	READY = 'READY',
	PAID = 'PAID',
	FAILED = 'FAILED',
	REFUNDED = 'REFUNDED',
}

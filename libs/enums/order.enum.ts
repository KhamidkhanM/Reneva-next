export enum OrderStatus {
	PAUSE = 'PAUSE',
	PROCESS = 'PROCESS',
	DELIVERY = 'DELIVERY',
	FINISH = 'FINISH',
	CANCEL = 'CANCEL',
	REFUND = 'REFUND',
}

export enum PaymentMethod {
	PAYME = 'PAYME',
	CLICK = 'CLICK',
	CASH = 'CASH',
	// buyer sends money card-to-card to the seller, the seller confirms it
	CARD_TRANSFER = 'CARD_TRANSFER',
	// old Korean methods: kept so old orders still show their method
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

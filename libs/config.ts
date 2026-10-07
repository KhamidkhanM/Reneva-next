import { SkinConcern, SkinType } from './enums/member.enum';
import { ProductTag } from './enums/product.enum';

export const REACT_APP_API_URL = `${process.env.REACT_APP_API_URL}`;
export const REACT_APP_API_WS = `${process.env.REACT_APP_API_WS ?? 'ws://localhost:3000'}`;

export const skinTypeList = Object.values(SkinType);
export const skinConcernList = Object.values(SkinConcern);
export const productTagList = Object.values(ProductTag);

// matches the backend rules in reneva-api libs/config.ts
export const FREE_DELIVERY_FROM = 30000;

export const Messages = {
	error1: 'Something went wrong!',
	error2: 'Please login first!',
	error3: 'Please fill in all inputs!',
	error4: 'Message is empty!',
	error5: 'Only images with jpeg, jpg, png format allowed!',
};

// shown in the footer; change it to your real customer center number
export const CS_PHONE = '1588-0000';

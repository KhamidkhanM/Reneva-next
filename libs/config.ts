import { SkinConcern, SkinType } from './enums/member.enum';
import { ProductTag } from './enums/product.enum';

// values come from .env (see .env.example); the defaults match a backend running locally on port 3000
export const REACT_APP_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
export const REACT_APP_API_GRAPHQL_URL = process.env.REACT_APP_API_GRAPHQL_URL || `${REACT_APP_API_URL}/graphql`;
export const REACT_APP_GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';
export const REACT_APP_API_WS = process.env.REACT_APP_API_WS || REACT_APP_API_URL.replace(/^http/, 'ws');

export const skinTypeList = Object.values(SkinType);
export const skinConcernList = Object.values(SkinConcern);
export const productTagList = Object.values(ProductTag);

// matches the backend rules in reneva-api libs/config.ts
export const FREE_DELIVERY_FROM = 300000;
export const DELIVERY_FEE = 20000;

// same as UNPAID_ORDER_MINUTES in the backend .env
export const UNPAID_ORDER_MINUTES = 120;

export const Messages = {
	error1: 'Something went wrong!',
	error2: 'Please login first!',
	error3: 'Please fill in all inputs!',
	error4: 'Message is empty!',
	error5: 'Only images with jpeg, jpg, png format allowed!',
};

// shown in the footer; change it to your real customer center number
export const CS_PHONE = '1588-0000';

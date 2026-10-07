import { OptionStatus, ProductStatus, ProductTag } from '../enums/product.enum';
import { SkinConcern, SkinType } from '../enums/member.enum';
import { BrandStatus } from '../enums/brand.enum';
import { CategoryStatus } from '../enums/category.enum';
import { MeLiked } from './common';
import { Member } from './member';

export interface Brand {
	_id: string;
	brandName: string;
	brandLogo: string;
	brandBanner?: string;
	brandDesc?: string;
	brandCountry: string;
	brandStatus: BrandStatus;
	brandProducts: number;
	brandLikes: number;
	memberId: string;
	createdAt: Date;
	memberData?: Member;
	meLiked?: MeLiked[];
}

export interface Category {
	_id: string;
	categoryName: string;
	categorySlug: string;
	categoryParentId?: string | null;
	categoryOrder: number;
	categoryImage?: string;
	categoryStatus: CategoryStatus;
}

export interface ProductOption {
	_id: string;
	productId: string;
	optionName: string;
	optionColor?: string;
	optionImage?: string;
	optionExtraPrice: number;
	optionStock: number;
	optionStatus: OptionStatus;
}

export interface Product {
	_id: string;
	productStatus: ProductStatus;
	productTitle: string;
	productDesc?: string;
	productPrice: number;
	productSalePrice: number;
	productVolume: string;
	productImages: string[];
	productIngredients: string[];
	productSkinTypes: SkinType[];
	productConcerns: SkinConcern[];
	productTags: ProductTag[];
	productReviewSummary?: string;
	productRating: number;
	productReviews: number;
	productViews: number;
	productLikes: number;
	productComments: number;
	productSold: number;
	productRank: number;
	brandId: string;
	categoryId: string;
	memberId: string;
	createdAt: Date;
	productOptions?: ProductOption[];
	brandData?: Brand;
	categoryData?: Category;
	memberData?: Member;
	meLiked?: MeLiked[];
}

export interface ProductsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: string;
	search: {
		memberId?: string;
		brandList?: string[];
		categoryList?: string[];
		skinTypeList?: SkinType[];
		concernList?: SkinConcern[];
		tagList?: ProductTag[];
		pricesRange?: { start: number; end: number };
		text?: string;
	};
}

export interface ProductOptionInput {
	optionName: string;
	optionColor?: string;
	optionImage?: string;
	optionExtraPrice?: number;
	optionStock: number;
}

export interface ProductInput {
	productTitle: string;
	productDesc?: string;
	productPrice: number;
	productSalePrice: number;
	productVolume: string;
	productImages: string[];
	productIngredients?: string[];
	productSkinTypes?: SkinType[];
	productConcerns?: SkinConcern[];
	productTags?: ProductTag[];
	brandId: string;
	categoryId: string;
	productOptions: ProductOptionInput[];
}

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { Checkbox, FormControlLabel, Slider, Stack } from '@mui/material';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import { useQuery } from '@apollo/client';
import { GET_BRANDS, GET_CATEGORIES } from '../../../apollo/user/query';
import { Brand, Category, ProductsInquiry } from '../../types/product';
import { SkinConcern, SkinType } from '../../enums/member.enum';
import { ProductTag } from '../../enums/product.enum';
import { productTagList, skinConcernList, skinTypeList } from '../../config';
import { formatPrice, labelOf } from '../../utils';
import { useTranslation } from 'next-i18next';

interface FilterType {
	searchFilter: ProductsInquiry;
	setSearchFilter: any;
	initialInput: ProductsInquiry;
}

const PRICE_MAX = 1000000; // so'm

const Filter = ({ searchFilter, setSearchFilter, initialInput }: FilterType) => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const [text, setText] = useState<string>(searchFilter.search.text ?? '');
	const [price, setPrice] = useState<number[]>([
		searchFilter.search.pricesRange?.start ?? 0,
		searchFilter.search.pricesRange?.end ?? PRICE_MAX,
	]);

	/** APOLLO REQUESTS **/
	const { data: categoryData } = useQuery(GET_CATEGORIES, { fetchPolicy: 'cache-and-network' });
	const { data: brandData } = useQuery(GET_BRANDS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: { page: 1, limit: 12, sort: 'brandProducts', direction: 'DESC', search: {} } },
	});
	const categories: Category[] = categoryData?.getCategories ?? [];
	const brands: Brand[] = brandData?.getBrands?.list ?? [];

	const tree = useMemo(() => {
		const parents = categories.filter((ele) => !ele.categoryParentId);
		return parents.map((parent) => ({ parent, children: categories.filter((ele) => ele.categoryParentId === parent._id) }));
	}, [categories]);

	/** LIFECYCLES **/
	useEffect(() => {
		setText(searchFilter.search.text ?? '');
		setPrice([searchFilter.search.pricesRange?.start ?? 0, searchFilter.search.pricesRange?.end ?? PRICE_MAX]);
	}, [searchFilter.search.text, searchFilter.search.pricesRange?.start, searchFilter.search.pricesRange?.end]);

	/** HANDLERS **/
	const pushFilter = async (search: ProductsInquiry['search']) => {
		const next: ProductsInquiry = { ...searchFilter, page: 1, search };
		// empty lists would filter out everything, so drop them
		Object.keys(next.search).forEach((key) => {
			const value: any = (next.search as any)[key];
			if (value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) delete (next.search as any)[key];
		});
		setSearchFilter(next);
		await router.push(`/product?input=${JSON.stringify(next)}`, `/product?input=${JSON.stringify(next)}`, { scroll: false });
	};

	const toggleIn = <V,>(list: V[] | undefined, value: V): V[] =>
		list?.includes(value) ? list.filter((ele) => ele !== value) : [...(list ?? []), value];

	const textHandler = (e: React.FormEvent) => {
		e.preventDefault();
		pushFilter({ ...searchFilter.search, text: text.trim() || undefined });
	};

	const priceCommitHandler = () => {
		const [start, end] = price;
		pushFilter({
			...searchFilter.search,
			pricesRange: start === 0 && end === PRICE_MAX ? undefined : { start, end: end === PRICE_MAX ? 1000000000 : end },
		});
	};

	const resetHandler = async () => {
		setSearchFilter(initialInput);
		await router.push(`/product?input=${JSON.stringify(initialInput)}`, `/product?input=${JSON.stringify(initialInput)}`, {
			scroll: false,
		});
	};

	return (
		<Stack className={'filter-main'}>
			<form className={'find-your-product'} onSubmit={textHandler}>
				<label htmlFor={'filter-text'} className={'title'}>
					{t('Find your product')}
				</label>
				<input
					id={'filter-text'}
					type={'search'}
					value={text}
					placeholder={t('Product name')}
					onChange={(e) => setText(e.target.value)}
				/>
				<button type={'button'} className={'reset'} onClick={resetHandler} aria-label={t('Reset filters')}>
					<RefreshRoundedIcon fontSize={'small'} /> {t('Reset')}
				</button>
			</form>

			<fieldset className={'find-your-product'}>
				<legend className={'title'}>{t('Skin type')}</legend>
				<div className={'chip-list'}>
					{skinTypeList.map((type: SkinType) => {
						const on = !!searchFilter.search.skinTypeList?.includes(type);
						return (
							<button
								key={type}
								type={'button'}
								className={`chip ${on ? 'on' : ''}`}
								aria-pressed={on}
								onClick={() => pushFilter({ ...searchFilter.search, skinTypeList: toggleIn(searchFilter.search.skinTypeList, type) })}
							>
								{t(labelOf(type))}
							</button>
						);
					})}
				</div>
			</fieldset>

			<fieldset className={'find-your-product'}>
				<legend className={'title'}>{t('Concern')}</legend>
				<div className={'chip-list'}>
					{skinConcernList.map((concern: SkinConcern) => {
						const on = !!searchFilter.search.concernList?.includes(concern);
						return (
							<button
								key={concern}
								type={'button'}
								className={`chip ${on ? 'on' : ''}`}
								aria-pressed={on}
								onClick={() => pushFilter({ ...searchFilter.search, concernList: toggleIn(searchFilter.search.concernList, concern) })}
							>
								{t(labelOf(concern))}
							</button>
						);
					})}
				</div>
			</fieldset>

			{tree.length > 0 && (
				<fieldset className={'find-your-product'}>
					<legend className={'title'}>{t('Category')}</legend>
					{tree.map(({ parent, children }) => (
						<div key={parent._id} className={'category-group'}>
							<FormControlLabel
								control={
									<Checkbox
										size={'small'}
										checked={!!searchFilter.search.categoryList?.includes(parent._id)}
										onChange={() => pushFilter({ ...searchFilter.search, categoryList: toggleIn(searchFilter.search.categoryList, parent._id) })}
									/>
								}
								label={t(parent.categoryName)}
							/>
							{children.map((child) => (
								<FormControlLabel
									key={child._id}
									className={'child'}
									control={
										<Checkbox
											size={'small'}
											checked={!!searchFilter.search.categoryList?.includes(child._id)}
											onChange={() => pushFilter({ ...searchFilter.search, categoryList: toggleIn(searchFilter.search.categoryList, child._id) })}
										/>
									}
									label={t(child.categoryName)}
								/>
							))}
						</div>
					))}
				</fieldset>
			)}

			{brands.length > 0 && (
				<fieldset className={'find-your-product'}>
					<legend className={'title'}>{t('Brand')}</legend>
					{brands.map((brand) => (
						<FormControlLabel
							key={brand._id}
							control={
								<Checkbox
									size={'small'}
									checked={!!searchFilter.search.brandList?.includes(brand._id)}
									onChange={() => pushFilter({ ...searchFilter.search, brandList: toggleIn(searchFilter.search.brandList, brand._id) })}
								/>
							}
							label={`${brand.brandName} (${brand.brandProducts})`}
						/>
					))}
				</fieldset>
			)}

			<fieldset className={'find-your-product'}>
				<legend className={'title'}>{t('Price')}</legend>
				<Slider
					value={price}
					onChange={(e, value) => setPrice(value as number[])}
					onChangeCommitted={priceCommitHandler}
					min={0}
					max={PRICE_MAX}
					step={10000}
					getAriaLabel={(index) => (index === 0 ? 'Lowest price' : 'Highest price')}
					getAriaValueText={(value) => formatPrice(value)}
				/>
				<div className={'price-text'}>
					<span>{formatPrice(price[0])}</span>
					<span>{price[1] === PRICE_MAX ? `${formatPrice(PRICE_MAX)}+` : formatPrice(price[1])}</span>
				</div>
			</fieldset>

			<fieldset className={'find-your-product'}>
				<legend className={'title'}>{t('Tags')}</legend>
				<div className={'chip-list'}>
					{productTagList.map((tag: ProductTag) => {
						const on = !!searchFilter.search.tagList?.includes(tag);
						return (
							<button
								key={tag}
								type={'button'}
								className={`chip ${on ? 'on' : ''}`}
								aria-pressed={on}
								onClick={() => pushFilter({ ...searchFilter.search, tagList: toggleIn(searchFilter.search.tagList, tag) })}
							>
								{t(labelOf(tag))}
							</button>
						);
					})}
				</div>
			</fieldset>
		</Stack>
	);
};

export default Filter;

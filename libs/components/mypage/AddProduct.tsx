import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Stack } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { GET_BRANDS, GET_CATEGORIES, GET_PRODUCT } from '../../../apollo/user/query';
import { ADD_PRODUCT_OPTION, CREATE_PRODUCT, IMAGES_UPLOADER, UPDATE_PRODUCT, UPDATE_PRODUCT_OPTION } from '../../../apollo/user/mutation';
import { Brand, Category, Product, ProductOption } from '../../types/product';
import { SkinConcern, SkinType } from '../../enums/member.enum';
import { ProductTag } from '../../enums/product.enum';
import { imageUrl, labelOf } from '../../utils';
import { Messages, productTagList, skinConcernList, skinTypeList } from '../../config';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { useTranslation } from 'next-i18next';

interface OptionRow {
	_id?: string;
	optionName: string;
	optionColor: string;
	optionExtraPrice: string;
	optionStock: string;
}

const emptyOption = (): OptionRow => ({ optionName: '', optionColor: '', optionExtraPrice: '0', optionStock: '10' });

const emptyForm = {
	productTitle: '',
	productDesc: '',
	productPrice: '',
	productSalePrice: '',
	productVolume: '',
	productIngredients: '',
	brandId: '',
	categoryId: '',
};

const toggle = <T,>(list: T[], value: T): T[] => (list.includes(value) ? list.filter((ele) => ele !== value) : [...list, value]);

// one form for "add product" and "edit product" (?productId=...)
const AddProduct = () => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const productId = router.query.productId as string | undefined;
	const [form, setForm] = useState({ ...emptyForm });
	const [images, setImages] = useState<string[]>([]);
	const [skinTypes, setSkinTypes] = useState<SkinType[]>([]);
	const [concerns, setConcerns] = useState<SkinConcern[]>([]);
	const [tags, setTags] = useState<ProductTag[]>([]);
	const [options, setOptions] = useState<OptionRow[]>([emptyOption()]);

	/** APOLLO REQUESTS **/
	const { data: brandData } = useQuery(GET_BRANDS, {
		fetchPolicy: 'network-only',
		skip: !user._id,
		variables: { input: { page: 1, limit: 50, search: { memberId: user._id } } },
	});
	const { data: categoryData } = useQuery(GET_CATEGORIES, { fetchPolicy: 'cache-and-network' });
	const { data: productData } = useQuery(GET_PRODUCT, { fetchPolicy: 'network-only', skip: !productId, variables: { input: productId } });
	const [imagesUploader, { loading: uploading }] = useMutation(IMAGES_UPLOADER);
	const [createProduct, { loading: creating }] = useMutation(CREATE_PRODUCT);
	const [updateProduct, { loading: updating }] = useMutation(UPDATE_PRODUCT);
	const [updateProductOption] = useMutation(UPDATE_PRODUCT_OPTION);
	const [addProductOption] = useMutation(ADD_PRODUCT_OPTION);
	const brands: Brand[] = brandData?.getBrands?.list ?? [];
	const categories: Category[] = categoryData?.getCategories ?? [];

	/** LIFECYCLES **/
	useEffect(() => {
		const product: Product | undefined = productData?.getProduct;
		if (!productId || !product) {
			if (!productId) resetForm();
			return;
		}
		setForm({
			productTitle: product.productTitle,
			productDesc: product.productDesc ?? '',
			productPrice: String(product.productPrice),
			productSalePrice: String(product.productSalePrice),
			productVolume: product.productVolume,
			productIngredients: (product.productIngredients ?? []).join(', '),
			brandId: product.brandId,
			categoryId: product.categoryId,
		});
		setImages(product.productImages ?? []);
		setSkinTypes(product.productSkinTypes ?? []);
		setConcerns(product.productConcerns ?? []);
		setTags(product.productTags ?? []);
		setOptions(
			(product.productOptions ?? []).map((ele: ProductOption) => ({
				_id: ele._id,
				optionName: ele.optionName,
				optionColor: ele.optionColor ?? '',
				optionExtraPrice: String(ele.optionExtraPrice),
				optionStock: String(ele.optionStock),
			})),
		);
	}, [productId, productData]);

	useEffect(() => {
		if (!productId && !form.brandId && brands[0]) setForm((prev) => ({ ...prev, brandId: brands[0]._id }));
	}, [brands.length]);

	/** HANDLERS **/
	const resetForm = () => {
		setForm({ ...emptyForm, brandId: brands[0]?._id ?? '' });
		setImages([]);
		setSkinTypes([]);
		setConcerns([]);
		setTags([]);
		setOptions([emptyOption()]);
	};

	const change = (key: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
		setForm({ ...form, [key]: e.target.value });

	const changeOption = (index: number, key: keyof OptionRow, value: string) =>
		setOptions(options.map((ele, i) => (i === index ? { ...ele, [key]: value } : ele)));

	const uploadImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
		try {
			const files = Array.from(e.target.files ?? []).slice(0, 5 - images.length);
			if (!files.length) return;
			if (files.some((file) => !['image/png', 'image/jpg', 'image/jpeg'].includes(file.type))) throw new Error(Messages.error5);
			const result = await imagesUploader({ variables: { files, target: 'product' } });
			setImages([...images, ...result.data.imagesUploader]);
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		} finally {
			e.target.value = '';
		}
	};

	const submitHandler = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const price = Number(form.productPrice);
			const salePrice = Number(form.productSalePrice || form.productPrice);
			if (!form.productTitle || !price || !form.productVolume || !form.brandId || !form.categoryId) throw new Error(Messages.error3);
			if (!images.length) throw new Error('Please add at least one photo');
			if (salePrice > price) throw new Error('Sale price must not be higher than the price');
			const named = options.filter((ele) => ele.optionName.trim());
			if (!named.length) throw new Error('Please add at least one option, e.g. "50ml"');

			const base: any = {
				productTitle: form.productTitle.trim(),
				productDesc: form.productDesc.trim() || undefined,
				productPrice: price,
				productSalePrice: salePrice,
				productVolume: form.productVolume.trim(),
				productImages: images,
				productIngredients: form.productIngredients
					.split(',')
					.map((ele) => ele.trim())
					.filter(Boolean),
				productSkinTypes: skinTypes,
				productConcerns: concerns,
				productTags: tags,
				categoryId: form.categoryId,
			};

			if (productId) {
				await updateProduct({ variables: { input: { _id: productId, ...base } } });
				// options that already exist get updated one by one
				for (const option of named.filter((ele) => ele._id)) {
					await updateProductOption({
						variables: {
							input: {
								_id: option._id,
								optionName: option.optionName.trim(),
								optionColor: option.optionColor || undefined,
								optionExtraPrice: Number(option.optionExtraPrice || 0),
								optionStock: Number(option.optionStock || 0),
							},
						},
					});
				}
				// rows added while editing become new options
				for (const option of named.filter((ele) => !ele._id)) {
					await addProductOption({
						variables: {
							productId,
							input: {
								optionName: option.optionName.trim(),
								optionColor: option.optionColor || undefined,
								optionExtraPrice: Number(option.optionExtraPrice || 0),
								optionStock: Number(option.optionStock || 0),
							},
						},
					});
				}
				await sweetTopSmallSuccessAlert('Product saved', 900);
			} else {
				await createProduct({
					variables: {
						input: {
							...base,
							brandId: form.brandId,
							productOptions: named.map((ele) => ({
								optionName: ele.optionName.trim(),
								optionColor: ele.optionColor || undefined,
								optionExtraPrice: Number(ele.optionExtraPrice || 0),
								optionStock: Number(ele.optionStock || 0),
							})),
						},
					},
				});
				await sweetTopSmallSuccessAlert('Product added', 900);
			}
			await router.push('/mypage?category=myProducts');
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	// wait for the product before showing the edit form, so nothing typed gets overwritten when it arrives
	if (productId && !productData?.getProduct) {
		return (
			<div className={'my-section'}>
				<div className={'no-data'}>{t('Loading product…')}</div>
			</div>
		);
	}

	if (user._id && brandData && brands.length === 0) {
		return (
			<div className={'my-section'}>
				<div className={'section-head'}>
					<h2>{t('Add product')}</h2>
				</div>
				<div className={'no-data'}>
					{t('Create a brand first, then add its products.')}
					<button className={'primary-btn'} onClick={() => router.push('/mypage?category=myBrands')}>
						{t('Go to my brands')}
					</button>
				</div>
			</div>
		);
	}

	return (
		<form className={'my-section'} onSubmit={submitHandler}>
			<div className={'section-head'}>
				<h2>{productId ? t('Edit product') : t('Add product')}</h2>
				<p>{t('Clear photos and skin tags help Rena recommend your product to the right people.')}</p>
			</div>

			<div className={'box'}>
				<h2>{t('Basics')}</h2>
				<div className={'form-grid'}>
					<label className={'field wide'}>
						<span>{t('Product name')}</span>
						<input value={form.productTitle} onChange={change('productTitle')} placeholder={t('Green Tea Seed Serum')} required />
					</label>
					<label className={'field'}>
						<span>{t('Brand')}</span>
						<select value={form.brandId} onChange={change('brandId')} disabled={!!productId} required>
							{brands.map((brand) => (
								<option key={brand._id} value={brand._id}>
									{brand.brandName}
								</option>
							))}
						</select>
					</label>
					<label className={'field'}>
						<span>{t('Category')}</span>
						<select value={form.categoryId} onChange={change('categoryId')} required>
							<option value={''}>{t('Choose…')}</option>
							{categories.map((category) => (
								<option key={category._id} value={category._id}>
									{category.categoryName}
								</option>
							))}
						</select>
					</label>
					<label className={'field'}>
						<span>{t('Price (₩)')}</span>
						<input type={'number'} min={0} value={form.productPrice} onChange={change('productPrice')} required />
					</label>
					<label className={'field'}>
						<span>{t('Sale price (₩)')}</span>
						<input type={'number'} min={0} value={form.productSalePrice} onChange={change('productSalePrice')} placeholder={t('Same as price')} />
					</label>
					<label className={'field'}>
						<span>{t('Volume')}</span>
						<input value={form.productVolume} onChange={change('productVolume')} placeholder={t('50ml')} required />
					</label>
					<label className={'field wide'}>
						<span>{t('Description')}</span>
						<textarea rows={4} value={form.productDesc} onChange={change('productDesc')} />
					</label>
					<label className={'field wide'}>
						<span>{t('Key ingredients (comma separated)')}</span>
						<input value={form.productIngredients} onChange={change('productIngredients')} placeholder={t('Green tea, Niacinamide, Panthenol')} />
					</label>
				</div>
			</div>

			<div className={'box'}>
				<h2>{t('Photos')}</h2>
				<p className={'hint'}>{t('Up to 5 photos. The first one is the cover.')}</p>
				<div className={'photo-row'}>
					{images.map((image, index) => (
						<div key={image} className={'photo'}>
							<img src={imageUrl(image)} alt={''} />
							<button type={'button'} aria-label={t('Remove photo')} onClick={() => setImages(images.filter((ele, i) => i !== index))}>
								<CloseRoundedIcon fontSize={'small'} />
							</button>
						</div>
					))}
					{images.length < 5 && (
						<label className={'photo add'}>
							{uploading ? t('Uploading…') : t('+ Add')}
							<input type={'file'} hidden multiple accept={'image/png, image/jpg, image/jpeg'} onChange={uploadImages} />
						</label>
					)}
				</div>
			</div>

			<div className={'box'}>
				<h2>{t('Skin match')}</h2>
				<span className={'label'}>{t('Good for skin types')}</span>
				<Stack className={'chips'}>
					{skinTypeList.map((type) => (
						<button type={'button'} key={type} className={`chip ${skinTypes.includes(type) ? 'on' : ''}`} onClick={() => setSkinTypes(toggle(skinTypes, type))}>
							{t(labelOf(type))}
						</button>
					))}
				</Stack>
				<span className={'label'}>{t('Targets concerns')}</span>
				<Stack className={'chips'}>
					{skinConcernList.map((concern) => (
						<button
							type={'button'}
							key={concern}
							className={`chip ${concerns.includes(concern) ? 'on' : ''}`}
							onClick={() => setConcerns(toggle(concerns, concern))}
						>
							{t(labelOf(concern))}
						</button>
					))}
				</Stack>
				<span className={'label'}>{t('Tags')}</span>
				<Stack className={'chips'}>
					{productTagList.map((tag) => (
						<button type={'button'} key={tag} className={`chip ${tags.includes(tag) ? 'on' : ''}`} onClick={() => setTags(toggle(tags, tag))}>
							{t(labelOf(tag))}
						</button>
					))}
				</Stack>
			</div>

			<div className={'box'}>
				<h2>{t('Options')}</h2>
				<p className={'hint'}>{t('Sizes or shades. Shoppers choose one when they add to cart.')}</p>
				{options.map((option, index) => (
					<div key={option._id ?? index} className={'option-row'}>
						<label className={'field'}>
							<span>{t('Name')}</span>
							<input value={option.optionName} onChange={(e) => changeOption(index, 'optionName', e.target.value)} placeholder={t('50ml')} />
						</label>
						<label className={'field'}>
							<span>{t('Color')}</span>
							<input type={'color'} value={option.optionColor || '#c9bdeb'} onChange={(e) => changeOption(index, 'optionColor', e.target.value)} />
						</label>
						<label className={'field'}>
							<span>{t('Extra price (₩)')}</span>
							<input type={'number'} min={0} value={option.optionExtraPrice} onChange={(e) => changeOption(index, 'optionExtraPrice', e.target.value)} />
						</label>
						<label className={'field'}>
							<span>{t('Stock')}</span>
							<input type={'number'} min={0} value={option.optionStock} onChange={(e) => changeOption(index, 'optionStock', e.target.value)} />
						</label>
						{!option._id && options.length > 1 && (
							<button type={'button'} className={'ghost-btn small'} onClick={() => setOptions(options.filter((ele, i) => i !== index))}>
								{t('Remove')}
							</button>
						)}
					</div>
				))}
				<button type={'button'} className={'soft-btn'} onClick={() => setOptions([...options, emptyOption()])}>
					{t('+ Add option')}
				</button>
			</div>

			<div className={'actions'}>
				<button type={'submit'} className={'primary-btn'} disabled={creating || updating || uploading}>
					{productId ? t('Save product') : t('Publish product')}
				</button>
				<button type={'button'} className={'ghost-btn'} onClick={() => router.push('/mypage?category=myProducts')}>
					{t('Cancel')}
				</button>
			</div>
		</form>
	);
};

export default AddProduct;

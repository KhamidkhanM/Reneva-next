import React, { ChangeEvent, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Pagination, Stack } from '@mui/material';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { BrandCircle } from '../../libs/components/homepage/TopBrands';
import { userVar } from '../../apollo/store';
import { GET_BRANDS } from '../../apollo/user/query';
import { LIKE_TARGET_BRAND } from '../../apollo/user/mutation';
import { Brand } from '../../libs/types/product';
import { T } from '../../libs/types/common';
import { isLiked, likeHandler } from '../../libs/utils';
import { useTranslation } from 'next-i18next';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const sorts = [
	{ id: 'brandLikes', label: 'Most followed' },
	{ id: 'brandProducts', label: 'Most products' },
	{ id: 'createdAt', label: 'Newest' },
	{ id: 'brandName', label: 'A–Z' },
];

const BrandList: NextPage = () => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [text, setText] = useState<string>('');
	const [inquiry, setInquiry] = useState<T>({ page: 1, limit: 12, sort: 'brandLikes', direction: 'DESC', search: {} });

	/** APOLLO REQUESTS **/
	const [likeTargetBrand] = useMutation(LIKE_TARGET_BRAND);
	const { data, refetch } = useQuery(GET_BRANDS, { fetchPolicy: 'network-only', variables: { input: inquiry } });
	const brands: Brand[] = data?.getBrands?.list ?? [];
	const total: number = data?.getBrands?.metaCounter?.[0]?.total ?? 0;

	/** HANDLERS **/
	const searchHandler = (e: React.FormEvent) => {
		e.preventDefault();
		setInquiry({ ...inquiry, page: 1, search: text.trim() ? { text: text.trim() } : {} });
	};

	const sortHandler = (sort: string) =>
		setInquiry({ ...inquiry, page: 1, sort, direction: sort === 'brandName' ? 'ASC' : 'DESC' });

	return (
		<div id={'brand-list-page'}>
			<div className={'container column'}>
				<div className={'brand-toolbar'}>
					<form onSubmit={searchHandler} className={'search'}>
						<label className={'sr-only'} htmlFor={'brand-search'}>
							{t('Search brands')}
						</label>
						<input id={'brand-search'} type={'search'} value={text} onChange={(e) => setText(e.target.value)} placeholder={t('Search brands')} />
						<button type={'submit'} className={'primary-btn'}>
							{t('Search')}
						</button>
					</form>
					<div className={'sorts'}>
						{sorts.map((sort) => (
							<button key={sort.id} className={`chip ${inquiry.sort === sort.id ? 'on' : ''}`} onClick={() => sortHandler(sort.id)}>
								{t(sort.label)}
							</button>
						))}
					</div>
				</div>

				{brands.length === 0 ? (
					<div className={'no-data'}>{t('No brands found.')}</div>
				) : (
					<div className={'brand-grid'}>
						{brands.map((brand, index) => (
							<article key={brand._id} className={'brand-card'}>
								<button className={'open'} onClick={() => router.push({ pathname: '/brand/detail', query: { id: brand._id } })}>
									<BrandCircle brand={brand} index={index} size={96} />
									<b>{brand.brandName}</b>
									<span>
										{brand.brandCountry} · {brand.brandProducts} {t('products')}
									</span>
								</button>
								<button
									className={`follow ${isLiked(brand) ? 'on' : ''}`}
									onClick={() => likeHandler(likeTargetBrand, user, brand._id, () => refetch())}
									aria-pressed={isLiked(brand)}
								>
									{isLiked(brand) ? <FavoriteRoundedIcon fontSize={'small'} /> : <FavoriteBorderRoundedIcon fontSize={'small'} />}
									{brand.brandLikes}
								</button>
							</article>
						))}
					</div>
				)}

				{total > inquiry.limit && (
					<Stack className={'pagination-box'}>
						<Pagination
							page={inquiry.page}
							count={Math.ceil(total / inquiry.limit)}
							onChange={(e: ChangeEvent<unknown>, value: number) => setInquiry({ ...inquiry, page: value })}
							shape={'circular'}
							color={'primary'}
						/>
					</Stack>
				)}
			</div>
		</div>
	);
};

export default withLayoutBasic(BrandList);

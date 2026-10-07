import React, { ChangeEvent, MouseEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Box, Button, Menu, MenuItem, Pagination, Stack, Typography } from '@mui/material';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useMutation, useQuery } from '@apollo/client';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import Filter from '../../libs/components/product/Filter';
import ProductCard from '../../libs/components/common/ProductCard';
import { GET_PRODUCTS } from '../../apollo/user/query';
import { LIKE_TARGET_PRODUCT } from '../../apollo/user/mutation';
import { Product, ProductsInquiry } from '../../libs/types/product';
import { T } from '../../libs/types/common';
import { Direction } from '../../libs/enums/common.enum';
import { likeHandler } from '../../libs/utils';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const initialInput: ProductsInquiry = {
	page: 1,
	limit: 9,
	sort: 'createdAt',
	direction: Direction.DESC,
	search: {},
};

const sorts = [
	{ id: 'new', label: 'Newest', sort: 'createdAt', direction: Direction.DESC },
	{ id: 'rank', label: 'Ranking', sort: 'productRank', direction: Direction.DESC },
	{ id: 'rating', label: 'Top rated', sort: 'productRating', direction: Direction.DESC },
	{ id: 'reviews', label: 'Most reviewed', sort: 'productReviews', direction: Direction.DESC },
	{ id: 'lowest', label: 'Lowest price', sort: 'productSalePrice', direction: Direction.ASC },
	{ id: 'highest', label: 'Highest price', sort: 'productSalePrice', direction: Direction.DESC },
];

// supports /product?input={...} and the short links /product?tag=BEST or ?text=cream
const readInput = (query: T): ProductsInquiry => {
	if (query.input) {
		try {
			return JSON.parse(query.input as string);
		} catch (err) {
			return initialInput;
		}
	}
	const search: ProductsInquiry['search'] = {};
	if (query.tag) search.tagList = [query.tag];
	if (query.text) search.text = query.text;
	if (query.brand) search.brandList = [query.brand];
	return { ...initialInput, search };
};

const ProductList: NextPage = () => {
	const router = useRouter();
	const [searchFilter, setSearchFilter] = useState<ProductsInquiry>(readInput(router.query));
	const [products, setProducts] = useState<Product[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

	/** APOLLO REQUESTS **/
	const [likeTargetProduct] = useMutation(LIKE_TARGET_PRODUCT);
	const { loading, refetch: getProductsRefetch } = useQuery(GET_PRODUCTS, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setProducts(data?.getProducts?.list || []);
			setTotal(data?.getProducts?.metaCounter[0]?.total ?? 0);
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (router.isReady) setSearchFilter(readInput(router.query));
	}, [router.isReady, router.query]);

	/** HANDLERS **/
	const likeProductHandler = (user: T, id: string) =>
		likeHandler(likeTargetProduct, user, id, () => getProductsRefetch({ input: searchFilter }));

	const pushInput = async (input: ProductsInquiry) => {
		setSearchFilter(input);
		await router.push(`/product?input=${JSON.stringify(input)}`, `/product?input=${JSON.stringify(input)}`, { scroll: false });
	};

	const handlePaginationChange = async (event: ChangeEvent<unknown>, value: number) => {
		await pushInput({ ...searchFilter, page: value });
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	const sortingHandler = async (e: MouseEvent<HTMLLIElement>) => {
		const choice = sorts.find((ele) => ele.id === e.currentTarget.id);
		setAnchorEl(null);
		if (choice) await pushInput({ ...searchFilter, page: 1, sort: choice.sort, direction: choice.direction });
	};

	const sortName =
		sorts.find((ele) => ele.sort === searchFilter.sort && ele.direction === searchFilter.direction)?.label ?? 'Newest';

	return (
		<div id={'product-list-page'}>
			<div className={'container'}>
				<Stack className={'product-page'}>
					<Stack className={'filter-config'}>
						<Filter searchFilter={searchFilter} setSearchFilter={setSearchFilter} initialInput={initialInput} />
					</Stack>
					<Stack className={'main-config'}>
						<Box component={'div'} className={'list-top'}>
							<Typography className={'total'}>{loading ? 'Loading…' : `${total} product${total === 1 ? '' : 's'}`}</Typography>
							<div className={'sort-box'}>
								<span>Sort by</span>
								<Button onClick={(e) => setAnchorEl(e.currentTarget)} endIcon={<KeyboardArrowDownRoundedIcon />}>
									{sortName}
								</Button>
								<Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
									{sorts.map((ele) => (
										<MenuItem key={ele.id} id={ele.id} onClick={sortingHandler} selected={ele.label === sortName}>
											{ele.label}
										</MenuItem>
									))}
								</Menu>
							</div>
						</Box>
						<Stack className={'list-config'}>
							{products.length === 0 && !loading ? (
								<div className={'no-data'}>
									<img src={'/img/logo/rena-ai.svg'} alt={''} width={56} />
									<p>No products match these filters.</p>
									<button className={'soft-btn'} onClick={() => pushInput(initialInput)}>
										Clear filters
									</button>
								</div>
							) : (
								<div className={'product-grid three'}>
									{products.map((product: Product) => (
										<ProductCard key={product._id} product={product} likeProductHandler={likeProductHandler} />
									))}
								</div>
							)}
						</Stack>
						{products.length !== 0 && total > searchFilter.limit && (
							<Stack className={'pagination-box'}>
								<Pagination
									page={searchFilter.page}
									count={Math.ceil(total / searchFilter.limit)}
									onChange={handlePaginationChange}
									shape={'circular'}
									color={'primary'}
								/>
							</Stack>
						)}
					</Stack>
				</Stack>
			</div>
		</div>
	);
};

export default withLayoutBasic(ProductList);

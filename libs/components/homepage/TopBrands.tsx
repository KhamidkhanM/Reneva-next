import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Box, Stack } from '@mui/material';
import { useQuery } from '@apollo/client';
import { GET_BRANDS } from '../../../apollo/user/query';
import { Brand } from '../../types/product';
import { T } from '../../types/common';
import { imageUrl } from '../../utils';

const tones = ['lilac', 'peach', 'light', 'peach-light'];

export const BrandCircle = ({ brand, index, size = 110 }: { brand: Brand; index: number; size?: number }) => {
	const logo = imageUrl(brand.brandLogo);
	return (
		<span className={`brand-circle ${tones[index % tones.length]}`} style={{ width: size, height: size }}>
			{logo ? <img src={logo} alt={''} /> : brand.brandName.charAt(0).toUpperCase()}
		</span>
	);
};

const TopBrands = () => {
	const router = useRouter();
	const [brands, setBrands] = useState<Brand[]>([]);

	useQuery(GET_BRANDS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: { page: 1, limit: 6, sort: 'brandLikes', direction: 'DESC', search: {} } },
		onCompleted: (data: T) => setBrands(data?.getBrands?.list ?? []),
	});

	return (
		<Stack className={'top-brands'}>
			<Stack className={'container column'}>
				<Stack className={'info-box'}>
					<h2 className={'section-title'}>Top brands</h2>
					<Link href={'/brand'} className={'more-link'}>
						All brands →
					</Link>
				</Stack>
				{brands.length === 0 ? (
					<Box component={'div'} className={'empty-list'}>
						No brands yet
					</Box>
				) : (
					<div className={'brand-row'}>
						{brands.map((brand, index) => (
							<button key={brand._id} className={'brand-item'} onClick={() => router.push({ pathname: '/brand/detail', query: { id: brand._id } })}>
								<BrandCircle brand={brand} index={index} />
								<b>{brand.brandName}</b>
								<span>{brand.brandLikes} followers</span>
							</button>
						))}
					</div>
				)}
			</Stack>
		</Stack>
	);
};

export default TopBrands;

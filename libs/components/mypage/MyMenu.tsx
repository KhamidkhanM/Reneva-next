import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Stack } from '@mui/material';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { logOut } from '../../auth';
import { labelOf, memberImage } from '../../utils';
import { MemberType } from '../../enums/member.enum';
import { sweetConfirmAlert } from '../../sweetAlert';

interface MenuGroup {
	title: string;
	items: { category: string; label: string }[];
}

const buyerGroups: MenuGroup[] = [
	{
		title: 'Shopping',
		items: [
			{ category: 'myOrders', label: 'My orders' },
			{ category: 'myFavorites', label: 'Wishlist' },
			{ category: 'recentlyVisited', label: 'Recently viewed' },
			{ category: 'myCoupons', label: 'Coupons' },
			{ category: 'myAddresses', label: 'Addresses' },
		],
	},
];

const sellerGroups: MenuGroup[] = [
	{
		title: 'My store',
		items: [
			{ category: 'myBrands', label: 'My brands' },
			{ category: 'myProducts', label: 'My products' },
			{ category: 'addProduct', label: 'Add product' },
			{ category: 'sellerOrders', label: 'Store orders' },
			{ category: 'issuedCoupons', label: 'Store coupons' },
		],
	},
];

const commonGroups: MenuGroup[] = [
	{
		title: 'Community',
		items: [
			{ category: 'myArticles', label: 'My articles' },
			{ category: 'writeArticle', label: 'Write article' },
			{ category: 'followers', label: 'Followers' },
			{ category: 'followings', label: 'Followings' },
		],
	},
	{
		title: 'Account',
		items: [{ category: 'myProfile', label: 'My profile' }],
	},
];

const MyMenu = () => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const category = (router.query.category as string) ?? 'myProfile';
	const groups = [...(user.memberType === MemberType.SELLER ? sellerGroups : buyerGroups), ...commonGroups];

	const logoutHandler = async () => {
		if (await sweetConfirmAlert('Do you want to log out?')) logOut();
	};

	return (
		<Stack className={'my-menu'}>
			<div className={'profile'}>
				<img src={memberImage(user.memberImage)} alt={''} />
				<div>
					<b>{user.memberNick}</b>
					<span>{user.memberType === MemberType.USER ? `${labelOf(user.memberLevel)} member` : labelOf(user.memberType)}</span>
				</div>
			</div>
			{user.memberType === MemberType.USER && (
				<div className={'points'}>
					<span>
						<b>{user.memberPoints ?? 0}P</b> points
					</span>
					<span>
						<b>{user.memberOrders ?? 0}</b> orders
					</span>
				</div>
			)}
			{groups.map((group) => (
				<nav key={group.title} className={'group'} aria-label={group.title}>
					<span className={'title'}>{group.title}</span>
					{group.items.map((item) => (
						<Link
							key={item.category}
							href={{ pathname: '/mypage', query: { category: item.category } }}
							scroll={false}
							className={category === item.category ? 'on' : ''}
						>
							{item.label}
						</Link>
					))}
				</nav>
			))}
			<button className={'logout'} onClick={logoutHandler}>
				Log out
			</button>
		</Stack>
	);
};

export default MyMenu;

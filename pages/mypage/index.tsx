import React, { useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Stack } from '@mui/material';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useMutation, useReactiveVar } from '@apollo/client';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import MyMenu from '../../libs/components/mypage/MyMenu';
import MyProfile from '../../libs/components/mypage/MyProfile';
import MyOrders from '../../libs/components/mypage/MyOrders';
import MyProductList from '../../libs/components/mypage/MyProductList';
import MyCoupons from '../../libs/components/mypage/MyCoupons';
import MyAddresses from '../../libs/components/mypage/MyAddresses';
import MyArticles from '../../libs/components/mypage/MyArticles';
import WriteArticle from '../../libs/components/mypage/WriteArticle';
import MyBrands from '../../libs/components/mypage/MyBrands';
import MyProducts from '../../libs/components/mypage/MyProducts';
import AddProduct from '../../libs/components/mypage/AddProduct';
import CouponManager from '../../libs/components/mypage/CouponManager';
import MemberFollows from '../../libs/components/member/MemberFollows';
import { userVar } from '../../apollo/store';
import { LIKE_TARGET_MEMBER, SUBSCRIBE, UNSUBSCRIBE } from '../../apollo/user/mutation';
import { Messages } from '../../libs/config';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const MyPage: NextPage = () => {
	const user = useReactiveVar(userVar);
	const router = useRouter();
	const category: any = router.query?.category ?? 'myProfile';

	/** APOLLO REQUESTS **/
	const [subscribe] = useMutation(SUBSCRIBE);
	const [unsubscribe] = useMutation(UNSUBSCRIBE);
	const [likeTargetMember] = useMutation(LIKE_TARGET_MEMBER);

	/** LIFECYCLES **/
	useEffect(() => {
		// give the saved token a moment to fill userVar before sending guests to login
		const timer = setTimeout(() => {
			if (!userVar()._id) router.push({ pathname: '/account/join', query: { referrer: router.asPath } }).then();
		}, 300);
		return () => clearTimeout(timer);
	}, [user._id]);

	/** HANDLERS **/
	const subscribeHandler = async (id: string, refetch: any) => {
		try {
			if (!id) throw new Error(Messages.error1);
			if (!user._id) throw new Error(Messages.error2);
			await subscribe({ variables: { input: id } });
			await sweetTopSmallSuccessAlert('Following!', 800);
			await refetch();
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const unsubscribeHandler = async (id: string, refetch: any) => {
		try {
			if (!id) throw new Error(Messages.error1);
			if (!user._id) throw new Error(Messages.error2);
			await unsubscribe({ variables: { input: id } });
			await sweetTopSmallSuccessAlert('Unfollowed', 800);
			await refetch();
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const likeMemberHandler = async (id: string, refetch: any) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Messages.error2);
			await likeTargetMember({ variables: { input: id } });
			await sweetTopSmallSuccessAlert('Saved', 800);
			await refetch();
		} catch (err: any) {
			console.log('ERROR, likeMemberHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const redirectToMemberPageHandler = async (memberId: string) => {
		try {
			if (memberId === user?._id) await router.push('/mypage?category=myProfile');
			else await router.push(`/member?memberId=${memberId}`);
		} catch (error) {
			await sweetErrorHandling(error);
		}
	};

	if (!user._id) return <div id={'my-page'}></div>;

	const followProps = { memberId: user._id, subscribeHandler, unsubscribeHandler, likeMemberHandler, redirectToMemberPageHandler };

	return (
		<div id={'my-page'}>
			<div className={'container'}>
				<Stack className={'my-page'}>
					<Stack className={'left-config'}>
						<MyMenu />
					</Stack>
					<Stack className={'main-config'}>
						{category === 'myProfile' && <MyProfile />}
						{category === 'myOrders' && <MyOrders />}
						{category === 'myFavorites' && <MyProductList kind={'favorites'} />}
						{category === 'recentlyVisited' && <MyProductList kind={'visited'} />}
						{category === 'myCoupons' && <MyCoupons />}
						{category === 'myAddresses' && <MyAddresses />}
						{category === 'myArticles' && <MyArticles />}
						{category === 'writeArticle' && <WriteArticle />}
						{category === 'followers' && <MemberFollows kind={'followers'} {...followProps} />}
						{category === 'followings' && <MemberFollows kind={'followings'} {...followProps} />}
						{category === 'myBrands' && <MyBrands />}
						{category === 'myProducts' && <MyProducts />}
						{category === 'addProduct' && <AddProduct />}
						{category === 'sellerOrders' && <MyOrders seller />}
						{category === 'issuedCoupons' && <CouponManager />}
					</Stack>
				</Stack>
			</div>
		</div>
	);
};

export default withLayoutBasic(MyPage);

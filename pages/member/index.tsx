import React from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Stack } from '@mui/material';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import MyArticles from '../../libs/components/mypage/MyArticles';
import MemberFollows from '../../libs/components/member/MemberFollows';
import ProductCard from '../../libs/components/common/ProductCard';
import Comments from '../../libs/components/common/Comments';
import { userVar } from '../../apollo/store';
import { GET_MEMBER, GET_PRODUCTS } from '../../apollo/user/query';
import { LIKE_TARGET_MEMBER, LIKE_TARGET_PRODUCT, SUBSCRIBE, UNSUBSCRIBE } from '../../apollo/user/mutation';
import { Member } from '../../libs/types/member';
import { Product } from '../../libs/types/product';
import { MemberType } from '../../libs/enums/member.enum';
import { CommentGroup } from '../../libs/enums/comment.enum';
import { isLiked, labelOf, likeHandler, memberImage } from '../../libs/utils';
import { Messages } from '../../libs/config';
import { openStoreChat } from '../../libs/components/chat/openChat';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { useTranslation } from 'next-i18next';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const MemberPage: NextPage = () => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const memberId = router.query.memberId as string;
	const category = (router.query.category as string) ?? 'articles';

	/** APOLLO REQUESTS **/
	const [subscribe] = useMutation(SUBSCRIBE);
	const [unsubscribe] = useMutation(UNSUBSCRIBE);
	const [likeTargetMember] = useMutation(LIKE_TARGET_MEMBER);
	const [likeTargetProduct] = useMutation(LIKE_TARGET_PRODUCT);
	const { data, refetch } = useQuery(GET_MEMBER, { fetchPolicy: 'network-only', skip: !memberId, variables: { input: memberId } });
	const member: Member | undefined = data?.getMember;
	const seller = member?.memberType === MemberType.SELLER;
	const { data: productData, refetch: productsRefetch } = useQuery(GET_PRODUCTS, {
		fetchPolicy: 'network-only',
		skip: !seller,
		variables: { input: { page: 1, limit: 8, sort: 'productRank', direction: 'DESC', search: { memberId } } },
	});
	const products: Product[] = productData?.getProducts?.list ?? [];
	const following = !!member?.meFollowed?.[0]?.myFollowing;

	/** HANDLERS **/
	const followHandler = async (id: string, listRefetch?: any, follow = !following) => {
		try {
			if (!user._id) throw new Error(Messages.error2);
			if (follow) await subscribe({ variables: { input: id } });
			else await unsubscribe({ variables: { input: id } });
			await sweetTopSmallSuccessAlert(follow ? 'Following!' : 'Unfollowed', 800);
			await refetch();
			if (listRefetch) await listRefetch();
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const likeMemberHandler = async (id: string, listRefetch?: any) => {
		try {
			if (!user._id) throw new Error(Messages.error2);
			await likeTargetMember({ variables: { input: id } });
			await refetch();
			if (listRefetch) await listRefetch();
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const redirectToMemberPageHandler = (id: string) =>
		router.push(id === user._id ? '/mypage' : { pathname: '/member', query: { memberId: id } });

	if (!member) return <div id={'member-page'}></div>;

	const tabs = [
		...(seller ? [{ id: 'products', label: 'Products' }] : []),
		{ id: 'articles', label: 'Articles' },
		{ id: 'followers', label: `${t('Followers')} ${member.memberFollowers}` },
		{ id: 'followings', label: `${t('Followings')} ${member.memberFollowings}` },
		{ id: 'guestbook', label: 'Guestbook' },
	];
	const active = seller && !router.query.category ? 'products' : category;
	const followProps = {
		memberId,
		subscribeHandler: (id: string, listRefetch: any) => followHandler(id, listRefetch, true),
		unsubscribeHandler: (id: string, listRefetch: any) => followHandler(id, listRefetch, false),
		likeMemberHandler,
		redirectToMemberPageHandler,
	};

	return (
		<div id={'member-page'}>
			<div className={'container column'}>
				<div className={'member-hero'}>
					<img src={memberImage(member.memberImage)} alt={''} />
					<div className={'txt'}>
						<span className={'eyebrow'}>{seller ? t('STORE') : `${member.memberLevel} MEMBER`}</span>
						<h2>{member.memberNick}</h2>
						{member.memberDesc && <p>{member.memberDesc}</p>}
						<div className={'stats'}>
							{seller && (
								<span>
									<b>{member.memberProducts}</b> {t('products')}
								</span>
							)}
							<span>
								<b>{member.memberArticles}</b> {t('articles')}
							</span>
							<span>
								<b>{member.memberFollowers}</b> {t('followers')}
							</span>
							<span>
								<b>{member.memberLikes}</b> {t('likes')}
							</span>
						</div>
						{member.memberSkinType && (
							<div className={'skin'}>
								<span className={'tag-pill'}>{t(labelOf(member.memberSkinType))} {t('skin')}</span>
								{member.memberSkinConcerns?.map((concern) => (
									<span key={concern} className={'tag-pill'}>
										{t(labelOf(concern))}
									</span>
								))}
							</div>
						)}
					</div>
					{user._id !== member._id && (
						<div className={'actions'}>
							<button className={following ? 'soft-btn' : 'primary-btn'} onClick={() => followHandler(member._id)}>
								{following ? t('Following') : t('Follow')}
							</button>
							<button className={'ghost-btn'} onClick={() => likeMemberHandler(member._id)} aria-pressed={isLiked(member)}>
								{isLiked(member) ? t('♥ Liked') : t('♡ Like')}
							</button>
							{seller && products[0] && (
								<button className={'ghost-btn'} onClick={() => openStoreChat(products[0]._id)}>
									{t('Chat with store')}
								</button>
							)}
						</div>
					)}
				</div>

				<Stack className={'chips member-tabs'}>
					{tabs.map((tab) => (
						<Link
							key={tab.id}
							href={{ pathname: '/member', query: { memberId, category: tab.id } }}
							scroll={false}
							className={`chip ${active === tab.id ? 'on' : ''}`}
						>
							{t(tab.label)}
						</Link>
					))}
				</Stack>

				{active === 'products' &&
					(products.length === 0 ? (
						<div className={'no-data'}>{t('No products yet.')}</div>
					) : (
						<div className={'product-grid'}>
							{products.map((product) => (
								<ProductCard
									key={product._id}
									product={product}
									likeProductHandler={(u: any, id: string) => likeHandler(likeTargetProduct, u, id, () => productsRefetch())}
								/>
							))}
						</div>
					))}
				{active === 'articles' && <MyArticles memberId={memberId} />}
				{active === 'followers' && <MemberFollows kind={'followers'} {...followProps} />}
				{active === 'followings' && <MemberFollows kind={'followings'} {...followProps} />}
				{active === 'guestbook' && (
					<div className={'box'}>
						<Comments commentGroup={CommentGroup.MEMBER} commentRefId={memberId} title={t('Guestbook')} placeholder={t('Say hi to {{name}}', { name: member.memberNick })} />
					</div>
				)}
			</div>
		</div>
	);
};

export default withLayoutBasic(MemberPage);

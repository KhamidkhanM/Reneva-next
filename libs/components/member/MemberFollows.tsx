import React, { useState } from 'react';
import { Pagination, Stack } from '@mui/material';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import { useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { GET_MEMBER_FOLLOWERS, GET_MEMBER_FOLLOWINGS } from '../../../apollo/user/query';
import { Follower, Following, Member } from '../../types/member';
import { isLiked, labelOf, memberImage } from '../../utils';

interface MemberFollowsProps {
	kind: 'followers' | 'followings';
	memberId: string;
	subscribeHandler: (id: string, refetch: any) => void;
	unsubscribeHandler: (id: string, refetch: any) => void;
	likeMemberHandler: (id: string, refetch: any) => void;
	redirectToMemberPageHandler: (id: string) => void;
}

// followers and followings look the same, only the side of the relation differs
const MemberFollows = (props: MemberFollowsProps) => {
	const { kind, memberId, subscribeHandler, unsubscribeHandler, likeMemberHandler, redirectToMemberPageHandler } = props;
	const user = useReactiveVar(userVar);
	const [page, setPage] = useState<number>(1);
	const limit = 8;
	const followers = kind === 'followers';

	/** APOLLO REQUESTS **/
	const { data, refetch } = useQuery(followers ? GET_MEMBER_FOLLOWERS : GET_MEMBER_FOLLOWINGS, {
		fetchPolicy: 'network-only',
		skip: !memberId,
		variables: { input: { page, limit, search: followers ? { followingId: memberId } : { followerId: memberId } } },
	});
	const result = followers ? data?.getMemberFollowers : data?.getMemberFollowings;
	const list: (Follower | Following)[] = result?.list ?? [];
	const total: number = result?.metaCounter?.[0]?.total ?? 0;

	return (
		<div className={'my-section'}>
			<div className={'section-head'}>
				<h2>{followers ? 'Followers' : 'Followings'}</h2>
			</div>
			{list.length === 0 ? (
				<div className={'no-data'}>{followers ? 'No followers yet.' : 'Not following anyone yet.'}</div>
			) : (
				<div className={'follow-list'}>
					{list.map((item) => {
						const member: Member | undefined = followers ? (item as Follower).followerData : (item as Following).followingData;
						if (!member) return null;
						const following = item.meFollowed?.[0]?.myFollowing;
						return (
							<div key={item._id} className={'follow-row'}>
								<button className={'who'} onClick={() => redirectToMemberPageHandler(member._id)}>
									<img src={memberImage(member.memberImage)} alt={''} />
									<span>
										<b>{member.memberNick}</b>
										<span>
											{labelOf(member.memberType)} · {member.memberFollowers} followers · {member.memberFollowings} followings
										</span>
									</span>
								</button>
								<button
									className={`like ${isLiked(item) ? 'on' : ''}`}
									onClick={() => likeMemberHandler(member._id, refetch)}
									aria-label={'Like member'}
									aria-pressed={isLiked(item)}
								>
									{isLiked(item) ? <FavoriteRoundedIcon fontSize={'small'} /> : <FavoriteBorderRoundedIcon fontSize={'small'} />}
								</button>
								{user._id && user._id !== member._id && (
									<button
										className={following ? 'ghost-btn small' : 'primary-btn small'}
										onClick={() => (following ? unsubscribeHandler(member._id, refetch) : subscribeHandler(member._id, refetch))}
									>
										{following ? 'Unfollow' : 'Follow'}
									</button>
								)}
							</div>
						);
					})}
				</div>
			)}
			{total > limit && (
				<Stack className={'pagination-box'}>
					<Pagination page={page} count={Math.ceil(total / limit)} onChange={(e, value) => setPage(value)} shape={'circular'} color={'primary'} />
				</Stack>
			)}
		</div>
	);
};

export default MemberFollows;

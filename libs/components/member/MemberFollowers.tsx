import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import { Button, Pagination } from '@mui/material';
import { useRouter } from 'next/router';
import { FollowInquiry } from '../../types/follow/follow.input';
import { useQuery, useReactiveVar } from '@apollo/client';
import { GET_MEMBER_FOLLOWERS } from '../../../apollo/user/query';
import { Follower } from '../../types/follow/follow';
import { REACT_APP_API_URL } from '../../config';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import { userVar } from '../../../apollo/store';
import { T } from '../../types/common';

interface MemberFollowsProps {
	initialInput: FollowInquiry;
	subscribeHandler: any;
	unsubscribeHandler: any;
	likeMemberHandler?: any;
	redirectToMemberPageHandler: any;
}

const MemberFollowers = (props: MemberFollowsProps) => {
	const { initialInput, subscribeHandler, unsubscribeHandler, likeMemberHandler, redirectToMemberPageHandler } = props;
	const router = useRouter();
	const [total, setTotal] = useState<number>(0);
	const [followInquiry, setFollowInquiry] = useState<FollowInquiry>(initialInput);
	const [memberFollowers, setMemberFollowers] = useState<Follower[]>([]);
	const user = useReactiveVar(userVar);
	// Optimistic overrides for follow-back/like state, keyed by the row's member id.
	// A refetch right after a toggle can briefly hand back stale data, and rows remount
	// by _id whenever this list reshuffles, so the override lives here — one level above
	// the rows — instead of inside each row.
	const [followOverrides, setFollowOverrides] = useState<Record<string, boolean>>({});
	const [likeOverrides, setLikeOverrides] = useState<Record<string, { liked: boolean; likes: number }>>({});
	const pendingIds = useRef<Set<string>>(new Set());

	/** APOLLO REQUESTS **/
	// Synced from `data` in an effect — Apollo 3.5 drops onCompleted on hard loads
	const { data: getMemberFollowersData, refetch: getMemberFollowersRefetch } = useQuery(GET_MEMBER_FOLLOWERS, {
		fetchPolicy: 'network-only',
		variables: { input: followInquiry },
		skip: !followInquiry?.search?.followingId,
		notifyOnNetworkStatusChange: true,
	});

	useEffect(() => {
		if (!getMemberFollowersData?.getMemberFollowers) return;
		setMemberFollowers(getMemberFollowersData.getMemberFollowers.list);
		setTotal(getMemberFollowersData.getMemberFollowers.metaCounter[0]?.total);
	}, [getMemberFollowersData]);

	/** LIFECYCLES **/
	useEffect(() => {
		if (router.query.memberId)
			setFollowInquiry({ ...followInquiry, search: { followingId: router.query.memberId as string } });
		else if (user?._id) setFollowInquiry({ ...followInquiry, search: { followingId: user._id } });
	}, [router, user?._id]);

	useEffect(() => {
		getMemberFollowersRefetch({ input: followInquiry });
	}, [followInquiry]);

	/** HANDLERS **/
	const paginationHandler = async (event: ChangeEvent<unknown>, value: number) => {
		followInquiry.page = value;
		setFollowInquiry({ ...followInquiry });
	};

	const wrappedSubscribe = async (id: string) => {
		if (!id || pendingIds.current.has(id)) return;
		pendingIds.current.add(id);
		setFollowOverrides((prev) => ({ ...prev, [id]: true }));
		const ok = await subscribeHandler(id, getMemberFollowersRefetch, followInquiry);
		if (ok === false) {
			setFollowOverrides((prev) => {
				const rest = { ...prev };
				delete rest[id];
				return rest;
			});
		}
		pendingIds.current.delete(id);
	};

	const wrappedUnsubscribe = async (id: string) => {
		if (!id || pendingIds.current.has(id)) return;
		pendingIds.current.add(id);
		setFollowOverrides((prev) => ({ ...prev, [id]: false }));
		const ok = await unsubscribeHandler(id, getMemberFollowersRefetch, followInquiry);
		if (ok === false) {
			setFollowOverrides((prev) => {
				const rest = { ...prev };
				delete rest[id];
				return rest;
			});
		}
		pendingIds.current.delete(id);
	};

	const wrappedLike = async (id: string, currentLiked: boolean, currentLikes: number) => {
		if (!id || pendingIds.current.has(id)) return;
		pendingIds.current.add(id);
		const next = { liked: !currentLiked, likes: Math.max(0, currentLikes + (currentLiked ? -1 : 1)) };
		setLikeOverrides((prev) => ({ ...prev, [id]: next }));
		const ok = await likeMemberHandler(id, getMemberFollowersRefetch, followInquiry, next.liked ? 'Member liked' : 'Like removed');
		if (ok === false) {
			setLikeOverrides((prev) => {
				const rest = { ...prev };
				delete rest[id];
				return rest;
			});
		}
		pendingIds.current.delete(id);
	};

	return (
		<div id="member-follows-page">
			<div className="section-header">
				<h2>Followers</h2>
				{total > 0 && <span>{total} follower{total > 1 ? 's' : ''}</span>}
			</div>

			{memberFollowers?.length === 0 ? (
				<div className="empty-state">
					<div className="empty-icon-wrap">
						<PeopleOutlineIcon className="empty-icon" />
					</div>
					<h3>No followers yet</h3>
					<p>Share valuable articles and interact with the community to grow your audience.</p>
				</div>
			) : (
				<div className="people-list">
					{memberFollowers.map((follower: Follower) => {
						const imagePath: string = follower?.followerData?.memberImage
							? `${REACT_APP_API_URL}/${follower.followerData.memberImage}`
							: '/img/profile/defaultUser.svg';
						const isSelf = user?._id === follower?.followerId;
						const followerId = follower?.followerData?._id as string;
						const isFollowingBack = followOverrides[followerId] ?? follower.meFollowed?.[0]?.myFollowing;
						const likeOverride = likeOverrides[followerId];
						const liked = likeOverride ? likeOverride.liked : !!follower?.meLiked?.[0]?.myFavorite;
						const likesCount = likeOverride ? likeOverride.likes : follower?.followerData?.memberLikes ?? 0;

						return (
							<div className="person-card" key={follower._id}>
								<div className="person-left" onClick={() => redirectToMemberPageHandler(followerId)}>
									<img src={imagePath} alt="" />
									<div className="person-info">
										<strong>{follower?.followerData?.memberNick}</strong>
										<div className="person-meta">
											<span>{follower?.followerData?.memberFollowers ?? 0} followers</span>
											<span className="dot">·</span>
											<span>{follower?.followerData?.memberFollowings ?? 0} following</span>
										</div>
									</div>
								</div>
								<div className="person-actions">
									<button
										type="button"
										className={`like-btn${liked ? ' liked' : ''}`}
										onClick={() => wrappedLike(followerId, liked, likesCount)}
									>
										{liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
										<span>{likesCount}</span>
									</button>
									{!isSelf && (
										isFollowingBack ? (
											<Button className="unfollow-btn" onClick={() => wrappedUnsubscribe(followerId)}>
												Following
											</Button>
										) : (
											<Button className="follow-btn" onClick={() => wrappedSubscribe(followerId)}>
												Follow
											</Button>
										)
									)}
								</div>
							</div>
						);
					})}
				</div>
			)}

			{memberFollowers.length !== 0 && (
				<div className="pagination-config">
					<Pagination
						page={followInquiry.page}
						count={Math.ceil(total / followInquiry.limit)}
						onChange={paginationHandler}
						shape="circular"
						color="primary"
					/>
					<span>{total} follower{total > 1 ? 's' : ''}</span>
				</div>
			)}
		</div>
	);
};

MemberFollowers.defaultProps = {
	initialInput: {
		page: 1,
		limit: 5,
		search: {
			followingId: '',
		},
	},
};

export default MemberFollowers;

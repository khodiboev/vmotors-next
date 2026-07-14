import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import { Button, Pagination } from '@mui/material';
import { useRouter } from 'next/router';
import { FollowInquiry } from '../../types/follow/follow.input';
import { useQuery, useReactiveVar } from '@apollo/client';
import { Following } from '../../types/follow/follow';
import { REACT_APP_API_URL } from '../../config';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import PersonSearchOutlinedIcon from '@mui/icons-material/PersonSearchOutlined';
import { userVar } from '../../../apollo/store';
import { T } from '../../types/common';
import { GET_MEMBER_FOLLOWINGS } from '../../../apollo/user/query';

interface MemberFollowingsProps {
	initialInput: FollowInquiry;
	subscribeHandler: any;
	unsubscribeHandler: any;
	likeMemberHandler?: any;
	redirectToMemberPageHandler: any;
}

const MemberFollowings = (props: MemberFollowingsProps) => {
	const { initialInput, subscribeHandler, unsubscribeHandler, likeMemberHandler, redirectToMemberPageHandler } = props;
	const router = useRouter();
	const [total, setTotal] = useState<number>(0);
	const [followInquiry, setFollowInquiry] = useState<FollowInquiry>(initialInput);
	const [memberFollowings, setMemberFollowings] = useState<Following[]>([]);
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
	const { data: getMemberFollowingsData, refetch: getMemberFollowingsRefetch } = useQuery(GET_MEMBER_FOLLOWINGS, {
		fetchPolicy: 'network-only',
		variables: { input: followInquiry },
		skip: !followInquiry?.search?.followerId,
		notifyOnNetworkStatusChange: true,
	});

	useEffect(() => {
		if (!getMemberFollowingsData?.getMemberFollowings) return;
		setMemberFollowings(getMemberFollowingsData.getMemberFollowings.list);
		setTotal(getMemberFollowingsData.getMemberFollowings.metaCounter[0]?.total);
	}, [getMemberFollowingsData]);

	/** LIFECYCLES **/
	useEffect(() => {
		if (router.query.memberId)
			setFollowInquiry({ ...followInquiry, search: { followerId: router.query.memberId as string } });
		else if (user?._id) setFollowInquiry({ ...followInquiry, search: { followerId: user._id } });
	}, [router, user?._id]);

	useEffect(() => {
		getMemberFollowingsRefetch({ input: followInquiry });
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
		const ok = await subscribeHandler(id, getMemberFollowingsRefetch, followInquiry);
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
		const ok = await unsubscribeHandler(id, getMemberFollowingsRefetch, followInquiry);
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
		const ok = await likeMemberHandler(id, getMemberFollowingsRefetch, followInquiry, next.liked ? 'Member liked' : 'Like removed');
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
				<h2>Following</h2>
				{total > 0 && <span>{total} following</span>}
			</div>

			{memberFollowings?.length === 0 ? (
				<div className="empty-state">
					<div className="empty-icon-wrap">
						<PersonSearchOutlinedIcon className="empty-icon" />
					</div>
					<h3>Not following anyone yet</h3>
					<p>Discover dealers and members to follow and stay updated on their latest listings and articles.</p>
				</div>
			) : (
				<div className="people-list">
					{memberFollowings.map((following: Following) => {
						const imagePath: string = following?.followingData?.memberImage
							? `${REACT_APP_API_URL}/${following.followingData.memberImage}`
							: '/img/profile/defaultUser.svg';
						const isSelf = user?._id === following?.followingId;
						const followingId = following?.followingData?._id as string;
						const isFollowingBack = followOverrides[followingId] ?? following.meFollowed?.[0]?.myFollowing;
						const likeOverride = likeOverrides[followingId];
						const liked = likeOverride ? likeOverride.liked : !!following?.meLiked?.[0]?.myFavorite;
						const likesCount = likeOverride ? likeOverride.likes : following?.followingData?.memberLikes ?? 0;

						return (
							<div className="person-card" key={following._id}>
								<div className="person-left" onClick={() => redirectToMemberPageHandler(followingId)}>
									<img src={imagePath} alt="" />
									<div className="person-info">
										<strong>{following?.followingData?.memberNick}</strong>
										<div className="person-meta">
											<span>{following?.followingData?.memberFollowers ?? 0} followers</span>
											<span className="dot">·</span>
											<span>{following?.followingData?.memberFollowings ?? 0} following</span>
										</div>
									</div>
								</div>
								<div className="person-actions">
									<button
										type="button"
										className={`like-btn${liked ? ' liked' : ''}`}
										onClick={() => wrappedLike(followingId, liked, likesCount)}
									>
										{liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
										<span>{likesCount}</span>
									</button>
									{!isSelf && (
										isFollowingBack ? (
											<Button className="unfollow-btn" onClick={() => wrappedUnsubscribe(followingId)}>
												Following
											</Button>
										) : (
											<Button className="follow-btn" onClick={() => wrappedSubscribe(followingId)}>
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

			{memberFollowings.length !== 0 && (
				<div className="pagination-config">
					<Pagination
						page={followInquiry.page}
						count={Math.ceil(total / followInquiry.limit)}
						onChange={paginationHandler}
						shape="circular"
						color="primary"
					/>
					<span>{total} following</span>
				</div>
			)}
		</div>
	);
};

MemberFollowings.defaultProps = {
	initialInput: {
		page: 1,
		limit: 5,
		search: {
			followerId: '',
		},
	},
};

export default MemberFollowings;

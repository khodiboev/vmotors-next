import React, { ChangeEvent, useEffect, useState } from 'react';
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

	/** APOLLO REQUESTS **/
	const { refetch: getMemberFollowersRefetch } = useQuery(GET_MEMBER_FOLLOWERS, {
		fetchPolicy: 'network-only',
		variables: { input: followInquiry },
		skip: !followInquiry?.search?.followingId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setMemberFollowers(data?.getMemberFollowers?.list);
			setTotal(data?.getMemberFollowers?.metaCounter[0]?.total);
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (router.query.memberId)
			setFollowInquiry({ ...followInquiry, search: { followingId: router.query.memberId as string } });
		else setFollowInquiry({ ...followInquiry, search: { followingId: user?._id } });
	}, [router]);

	useEffect(() => {
		getMemberFollowersRefetch({ input: followInquiry });
	}, [followInquiry]);

	/** HANDLERS **/
	const paginationHandler = async (event: ChangeEvent<unknown>, value: number) => {
		followInquiry.page = value;
		setFollowInquiry({ ...followInquiry });
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
						const isFollowingBack = follower.meFollowed?.[0]?.myFollowing;

						return (
							<div className="person-card" key={follower._id}>
								<div className="person-left" onClick={() => redirectToMemberPageHandler(follower?.followerData?._id)}>
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
										className={`like-btn${follower?.meLiked?.[0]?.myFavorite ? ' liked' : ''}`}
										onClick={() => likeMemberHandler(follower?.followerData?._id, getMemberFollowersRefetch, followInquiry)}
									>
										{follower?.meLiked?.[0]?.myFavorite ? (
											<FavoriteIcon />
										) : (
											<FavoriteBorderIcon />
										)}
										<span>{follower?.followerData?.memberLikes ?? 0}</span>
									</button>
									{!isSelf && (
										isFollowingBack ? (
											<Button
												className="unfollow-btn"
												onClick={() => unsubscribeHandler(follower?.followerData?._id, getMemberFollowersRefetch, followInquiry)}
											>
												Following
											</Button>
										) : (
											<Button
												className="follow-btn"
												onClick={() => subscribeHandler(follower?.followerData?._id, getMemberFollowersRefetch, followInquiry)}
											>
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

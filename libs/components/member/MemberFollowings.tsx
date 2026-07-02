import React, { ChangeEvent, useEffect, useState } from 'react';
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

	/** APOLLO REQUESTS **/
	const { refetch: getMemberFollowingsRefetch } = useQuery(GET_MEMBER_FOLLOWINGS, {
		fetchPolicy: 'network-only',
		variables: { input: followInquiry },
		skip: !followInquiry?.search?.followerId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setMemberFollowings(data?.getMemberFollowings?.list);
			setTotal(data?.getMemberFollowings?.metaCounter[0]?.total);
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (router.query.memberId)
			setFollowInquiry({ ...followInquiry, search: { followerId: router.query.memberId as string } });
		else setFollowInquiry({ ...followInquiry, search: { followerId: user?._id } });
	}, [router]);

	useEffect(() => {
		getMemberFollowingsRefetch({ input: followInquiry });
	}, [followInquiry]);

	/** HANDLERS **/
	const paginationHandler = async (event: ChangeEvent<unknown>, value: number) => {
		followInquiry.page = value;
		setFollowInquiry({ ...followInquiry });
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
						const isFollowingBack = following.meFollowed?.[0]?.myFollowing;

						return (
							<div className="person-card" key={following._id}>
								<div className="person-left" onClick={() => redirectToMemberPageHandler(following?.followingData?._id)}>
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
										className={`like-btn${following?.meLiked?.[0]?.myFavorite ? ' liked' : ''}`}
										onClick={() => likeMemberHandler(following?.followingData?._id, getMemberFollowingsRefetch, followInquiry)}
									>
										{following?.meLiked?.[0]?.myFavorite ? (
											<FavoriteIcon />
										) : (
											<FavoriteBorderIcon />
										)}
										<span>{following?.followingData?.memberLikes ?? 0}</span>
									</button>
									{!isSelf && (
										isFollowingBack ? (
											<Button
												className="unfollow-btn"
												onClick={() => unsubscribeHandler(following?.followingData?._id, getMemberFollowingsRefetch, followInquiry)}
											>
												Following
											</Button>
										) : (
											<Button
												className="follow-btn"
												onClick={() => subscribeHandler(following?.followingData?._id, getMemberFollowingsRefetch, followInquiry)}
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

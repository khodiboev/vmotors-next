import React, { ChangeEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import PropertyBigCard from '../../libs/components/common/PropertyBigCard';
import ReviewCard from '../../libs/components/agent/ReviewCard';
import { Button, Pagination } from '@mui/material';
import { useRouter } from 'next/router';
import { Vehicle } from '../../libs/types/vehicle/vehicle';
import { Member } from '../../libs/types/member/member';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { userVar } from '../../apollo/store';
import { VehiclesInquiry } from '../../libs/types/vehicle/vehicle.input';
import { CommentInput, CommentsInquiry } from '../../libs/types/comment/comment.input';
import { Comment } from '../../libs/types/comment/comment';
import { CommentGroup } from '../../libs/enums/comment.enum';
import { REACT_APP_API_URL, Messages } from '../../libs/config';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { CREATE_COMMENT, LIKE_TARGET_VEHICLE } from '../../apollo/user/mutation';
import { GET_COMMENTS, GET_MEMBER, GET_VEHICLES } from '../../apollo/user/query';
import { T } from '../../libs/types/common';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const AgentDetail: NextPage = ({ initialInput, initialComment, ...props }: any) => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [agentId, setAgentId] = useState<string | null>(null);
	const [agent, setAgent] = useState<Member | null>(null);
	const [searchFilter, setSearchFilter] = useState<VehiclesInquiry>(initialInput);
	const [agentProperties, setAgentProperties] = useState<Vehicle[]>([]);
	const [propertyTotal, setPropertyTotal] = useState<number>(0);
	const [commentInquiry, setCommentInquiry] = useState<CommentsInquiry>(initialComment);
	const [agentComments, setAgentComments] = useState<Comment[]>([]);
	const [commentTotal, setCommentTotal] = useState<number>(0);
	const [insertCommentData, setInsertCommentData] = useState<CommentInput>({
		commentGroup: CommentGroup.MEMBER,
		commentContent: '',
		commentRefId: '',
	});

	/** APOLLO REQUESTS **/
	const [createComment] = useMutation(CREATE_COMMENT);
	const [likeTargetVehicle] = useMutation(LIKE_TARGET_VEHICLE);

	const {
		loading: getMemberLoading,
		data: getMemberData,
		error: getMemberError,
		refetch: getMemberRefetch,
	} = useQuery(GET_MEMBER, {
		fetchPolicy: 'network-only',
		variables: { input: agentId },
		skip: !agentId,
		onCompleted: (data: T) => {
			setAgent(data?.getMember);

			setSearchFilter({
				...searchFilter,
				search: {
					memberId: data?.getMember?._id,
				},
			});

			setCommentInquiry({
				...commentInquiry,
				search: {
					commentRefId: data?.getMember?._id,
				},
			});

			setInsertCommentData({
				...insertCommentData,
				commentRefId: data?.getMember?._id,
			});
		},
	});

	const {
		loading: getVehiclesLoading,
		data: getVehiclesData,
		error: getVehiclesError,
		refetch: getVehiclesRefetch,
	} = useQuery(GET_VEHICLES, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		skip: !searchFilter.search.memberId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setAgentProperties(data?.getVehicles?.list);
			setPropertyTotal(data?.getVehicles?.metaCounter[0]?.total ?? 0);
		},
	});

	const {
		loading: getCommentsLoading,
		data: getCommentsData,
		error: getCommentsError,
		refetch: getCommentsRefetch,
	} = useQuery(GET_COMMENTS, {
		fetchPolicy: 'network-only',
		variables: { input: commentInquiry },
		skip: !commentInquiry.search.commentRefId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setAgentComments(data?.getComments?.list);
			setCommentTotal(data?.getComments?.metaCounter[0]?.total ?? 0);
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (router.query.agentId) setAgentId(router.query.agentId as string);
	}, [router]);

	useEffect(() => {
		if (searchFilter.search.memberId) {
			getVehiclesRefetch({ input: searchFilter }).then();
		}
	}, [searchFilter]);

	useEffect(() => {
		if (commentInquiry.search.commentRefId) {
			getCommentsRefetch({ input: commentInquiry }).then();
		}
	}, [commentInquiry]);

	/** HANDLERS **/
	const redirectToMemberPageHandler = async (memberId: string) => {
		try {
			if (memberId === user?._id) await router.push(`/mypage?memberId=${memberId}`);
			else await router.push(`/member?memberId=${memberId}`);
		} catch (error) {
			await sweetErrorHandling(error);
		}
	};

	const propertyPaginationChangeHandler = async (event: ChangeEvent<unknown>, value: number) => {
		searchFilter.page = value;
		setSearchFilter({ ...searchFilter });
	};

	const commentPaginationChangeHandler = async (event: ChangeEvent<unknown>, value: number) => {
		commentInquiry.page = value;
		setCommentInquiry({ ...commentInquiry });
	};

	const createCommentHandler = async () => {
		try {
			if (!user._id) throw new Error(Messages.error2);
			if (user._id === agentId) throw new Error('Cannot write a review for yourself');

			await createComment({
				variables: {
					input: insertCommentData,
				},
			});

			setInsertCommentData({ ...insertCommentData, commentContent: '' });
			await getCommentsRefetch({ input: commentInquiry });
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const likePropertyHandler = async (user: any, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Messages.error2);

			await likeTargetVehicle({
				variables: {
					input: id,
				},
			});

			await getVehiclesRefetch({ input: searchFilter });
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			console.log('ERROR, likePropertyHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	return (
		<div className="agent-detail-page">
			<div className="container">

				{/* ── DEALER HERO ── */}
				<section className="dealer-hero">
					<div className="hero-card">
						<div className="hero-avatar-wrap">
							<img
								src={agent?.memberImage ? `${REACT_APP_API_URL}/${agent.memberImage}` : '/img/profile/defaultUser.svg'}
								alt={agent?.memberFullName ?? agent?.memberNick ?? ''}
								onClick={() => redirectToMemberPageHandler(agent?._id as string)}
							/>
							<span className="verified-badge">
								<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path
										d="M8 1L10.09 5.26L14.8 5.97L11.4 9.28L12.18 14L8 11.77L3.82 14L4.6 9.28L1.2 5.97L5.91 5.26L8 1Z"
										fill="currentColor"
									/>
								</svg>
								Santa Verified
							</span>
						</div>
						<div className="hero-info">
							<h1 onClick={() => redirectToMemberPageHandler(agent?._id as string)}>
								{agent?.memberFullName ?? agent?.memberNick}
							</h1>
							<div className="hero-contact">
								<img src="/img/icons/call.svg" alt="" />
								<span>{agent?.memberPhone}</span>
							</div>
							{(agent as any)?.memberAddress && (
								<div className="hero-location">
									<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
										<path
											d="M8 1C5.79 1 4 2.79 4 5C4 8 8 13 8 13C8 13 12 8 12 5C12 2.79 10.21 1 8 1ZM8 6.5C7.17 6.5 6.5 5.83 6.5 5C6.5 4.17 7.17 3.5 8 3.5C8.83 3.5 9.5 4.17 9.5 5C9.5 5.83 8.83 6.5 8 6.5Z"
											fill="currentColor"
										/>
									</svg>
									<span>{(agent as any).memberAddress}</span>
								</div>
							)}
							{(agent as any)?.memberDesc && (
								<p className="hero-desc">{(agent as any).memberDesc}</p>
							)}
							<div className="hero-stats">
								<div className="stat">
									<strong>{propertyTotal}</strong>
									<span>Vehicles</span>
								</div>
								<div className="stat">
									<strong>{(agent as any)?.memberViews ?? 0}</strong>
									<span>Views</span>
								</div>
								<div className="stat">
									<strong>{(agent as any)?.memberLikes ?? 0}</strong>
									<span>Likes</span>
								</div>
								<div className="stat">
									<strong>{(agent as any)?.memberRank ?? 0}</strong>
									<span>Rank</span>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* ── VEHICLE INVENTORY ── */}
				<section className="dealer-inventory">
					<div className="section-header">
						<h2>Vehicle Inventory</h2>
						{propertyTotal > 0 && (
							<span>{propertyTotal} vehicle{propertyTotal > 1 ? 's' : ''}</span>
						)}
					</div>
					{agentProperties.length > 0 ? (
						<>
							<div className="vehicle-grid">
								{agentProperties.map((property: Vehicle) => (
									<PropertyBigCard
										property={property}
										key={property._id}
										likePropertyHandler={likePropertyHandler}
									/>
								))}
							</div>
							<div className="vehicle-pagination">
								<Pagination
									page={searchFilter.page}
									count={Math.ceil(propertyTotal / searchFilter.limit) || 1}
									onChange={propertyPaginationChangeHandler}
									shape="circular"
									color="primary"
								/>
								<span>Total {propertyTotal} vehicle{propertyTotal > 1 ? 's' : ''} available</span>
							</div>
						</>
					) : (
						<div className="empty-inventory">
							<img src="/img/icons/icoAlert.svg" alt="" />
							<h3>No vehicles available yet</h3>
							<p>This dealer hasn&apos;t listed any vehicles on Santa yet.</p>
						</div>
					)}
				</section>

				{/* ── REVIEWS ── */}
				<section className="dealer-reviews">
					<div className="reviews-header">
						<h2>Reviews</h2>
						{commentTotal > 0 && (
							<span className="review-count-badge">
								{commentTotal} review{commentTotal > 1 ? 's' : ''}
							</span>
						)}
					</div>

					{commentTotal > 0 ? (
						<div className="reviews-list">
							{agentComments?.map((comment: Comment) => (
								<ReviewCard comment={comment} key={comment?._id} />
							))}
							<div className="review-pagination">
								<Pagination
									page={commentInquiry.page}
									count={Math.ceil(commentTotal / commentInquiry.limit) || 1}
									onChange={commentPaginationChangeHandler}
									shape="circular"
									color="primary"
								/>
							</div>
						</div>
					) : (
						<div className="empty-reviews">
							<p>No reviews yet. Be the first to share your experience with this dealer.</p>
						</div>
					)}

					<div className="reviews-divider" />

					<div className="review-form">
						<h3>Write a Review</h3>
						<textarea
							placeholder="Share your experience with this dealer..."
							value={insertCommentData.commentContent}
							onChange={({ target: { value } }: any) =>
								setInsertCommentData({ ...insertCommentData, commentContent: value })
							}
						/>
						<div className="submit-row">
							<Button
								className="submit-btn"
								disabled={insertCommentData.commentContent === '' || user?._id === ''}
								onClick={createCommentHandler}
							>
								Submit Review
							</Button>
						</div>
					</div>
				</section>

			</div>
		</div>
	);
};

AgentDetail.defaultProps = {
	initialInput: {
		page: 1,
		limit: 9,
		search: {
			memberId: '',
		},
	},
	initialComment: {
		page: 1,
		limit: 5,
		sort: 'createdAt',
		direction: 'ASC',
		search: {
			commentRefId: '',
		},
	},
};

export default withLayoutBasic(AgentDetail);

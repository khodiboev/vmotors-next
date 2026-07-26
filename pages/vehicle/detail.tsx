import React, { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
	Backdrop,
	Button,
	Pagination as MuiPagination,
	Stack,
} from '@mui/material';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import DirectionsCarFilledOutlinedIcon from '@mui/icons-material/DirectionsCarFilledOutlined';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import CallOutlinedIcon from '@mui/icons-material/CallOutlined';
import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import moment from 'moment';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import { GET_COMMENTS, GET_VEHICLE, GET_VEHICLES } from '../../apollo/user/query';
import { CREATE_COMMENT, LIKE_TARGET_VEHICLE, SEND_MESSAGE, UPDATE_COMMENT } from '../../apollo/user/mutation';
import { Vehicle } from '../../libs/types/vehicle/vehicle';
import { CommentInput, CommentsInquiry } from '../../libs/types/comment/comment.input';
import { Comment } from '../../libs/types/comment/comment';
import { CommentUpdate } from '../../libs/types/comment/comment.update';
import { CommentGroup, CommentStatus } from '../../libs/enums/comment.enum';
import { Direction, Message } from '../../libs/enums/common.enum';
import { T } from '../../libs/types/common';
import { REACT_APP_API_URL, topPropertyRank } from '../../libs/config';
import { userVar } from '../../apollo/store';
import { formatterStr } from '../../libs/utils';
import { vehicleStockLabel, vehicleTitle } from '../../libs/vehicle';
import {
	sweetConfirmAlert,
	sweetErrorHandling,
	sweetMixinErrorAlert,
	sweetMixinSuccessAlert,
	sweetVehicleActionToast,
} from '../../libs/sweetAlert';
import VehicleDetailCommentCard from '../../libs/components/vehicle-detail/VehicleDetailCommentCard';
import VehicleDetailRelatedCard from '../../libs/components/vehicle-detail/VehicleDetailRelatedCard';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const formatStatusLabel = (status?: string) => {
	if (!status) return 'Available';
	return status.replace(/_/g, ' ');
};

const VehicleDetail: NextPage = ({ initialComment }: any) => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [vehicleId, setVehicleId] = useState<string | null>(null);
	const [vehicle, setVehicle] = useState<Vehicle | null>(null);
	const [slideImage, setSlideImage] = useState('');
	const [similarVehicles, setSimilarVehicles] = useState<Vehicle[]>([]);
	const [commentInquiry, setCommentInquiry] = useState<CommentsInquiry>(initialComment);
	const [vehicleComments, setVehicleComments] = useState<Comment[]>([]);
	const [commentTotal, setCommentTotal] = useState<number>(0);
	const [openCommentBackdrop, setOpenCommentBackdrop] = useState<boolean>(false);
	const [updatedComment, setUpdatedComment] = useState<string>('');
	const [updatedCommentId, setUpdatedCommentId] = useState<string>('');
	// Like/unlike is applied here, once, and merged into whatever vehicle data renders
	// below (main vehicle + related cards). The list refetch that follows a toggle can
	// briefly hand back a stale meLiked for the vehicle we just mutated, and since related
	// cards remount whenever that list reshuffles, keeping the override only in the child
	// wouldn't survive that remount — so it lives here instead.
	const [likeOverrides, setLikeOverrides] = useState<Record<string, { liked: boolean; likes: number }>>({});
	const pendingLikeIds = useRef<Set<string>>(new Set());
	const [insertCommentData, setInsertCommentData] = useState<CommentInput>({
		commentGroup: CommentGroup.VEHICLE,
		commentContent: '',
		commentRefId: '',
	});

	const [likeTargetVehicle] = useMutation(LIKE_TARGET_VEHICLE);
	const [createComment] = useMutation(CREATE_COMMENT);
	const [updateComment] = useMutation(UPDATE_COMMENT);
	const [sendMessage] = useMutation(SEND_MESSAGE);
	const [messageOpen, setMessageOpen] = useState<boolean>(false);
	const [messageText, setMessageText] = useState<string>('');
	const [messageSending, setMessageSending] = useState<boolean>(false);

	// State is synced from `data` in effects below instead of onCompleted:
	// Apollo 3.5 + React 18 strict mode drops onCompleted on hard loads.
	const {
		loading: getVehicleLoading,
		data: getVehicleData,
		refetch: getVehicleRefetch,
	} = useQuery(GET_VEHICLE, {
		fetchPolicy: 'network-only',
		variables: { input: vehicleId },
		skip: !vehicleId,
		notifyOnNetworkStatusChange: true,
	});

	useEffect(() => {
		if (getVehicleData?.getVehicle) {
			setVehicle(getVehicleData.getVehicle);
			setSlideImage(getVehicleData.getVehicle.vehicleImages?.[0] ?? '');
		}
	}, [getVehicleData]);

	const { data: getVehiclesData, refetch: getVehiclesRefetch } = useQuery(GET_VEHICLES, {
		fetchPolicy: 'cache-and-network',
		variables: {
			input: {
				page: 1,
				// one extra so six cards remain after the current vehicle is filtered out below
				limit: 7,
				sort: 'createdAt',
				direction: Direction.DESC,
				search: {
					brandList: vehicle?.vehicleBrand ? [vehicle.vehicleBrand] : undefined,
				},
			},
		},
		skip: !vehicle,
	});

	useEffect(() => {
		if (getVehiclesData?.getVehicles) setSimilarVehicles(getVehiclesData.getVehicles.list ?? []);
	}, [getVehiclesData]);

	const { data: getCommentsData, refetch: getCommentsRefetch } = useQuery(GET_COMMENTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: commentInquiry },
		skip: !commentInquiry?.search?.commentRefId,
		notifyOnNetworkStatusChange: true,
	});

	useEffect(() => {
		if (getCommentsData?.getComments) {
			setVehicleComments(getCommentsData.getComments.list ?? []);
			setCommentTotal(getCommentsData.getComments.metaCounter?.[0]?.total ?? 0);
		}
	}, [getCommentsData]);

	useEffect(() => {
		if (!router.query.id) return;
		const id = router.query.id as string;
		setVehicleId(id);
		setCommentInquiry((prev) => ({ ...prev, search: { ...prev.search, commentRefId: id } }));
		setInsertCommentData((prev) => ({ ...prev, commentRefId: id }));
	}, [router.query.id]);

	useEffect(() => {
		if (commentInquiry.search.commentRefId) getCommentsRefetch({ input: commentInquiry });
	}, [commentInquiry, getCommentsRefetch]);

	const applyLikeOverride = (item: T): T => {
		const override = item?._id ? likeOverrides[item._id] : undefined;
		if (!override) return item;
		return {
			...item,
			vehicleLikes: override.likes,
			meLiked: override.liked ? [{ memberId: user._id, likeRefId: item._id, myFavorite: true }] : [],
		};
	};

	const likeVehicleHandler = async (targetUser: T, id: string, message?: string) => {
		if (!id || pendingLikeIds.current.has(id)) return false;
		try {
			if (!targetUser._id) throw new Error(Message.NOT_AUTHENTICATED);
			pendingLikeIds.current.add(id);

			const current =
				likeOverrides[id] ??
				(vehicle?._id === id
					? { liked: !!vehicle?.meLiked?.[0]?.myFavorite, likes: vehicle?.vehicleLikes ?? 0 }
					: (() => {
							const item = similarVehicles.find((v) => v._id === id);
							return { liked: !!item?.meLiked?.[0]?.myFavorite, likes: item?.vehicleLikes ?? 0 };
						})());
			const next = { liked: !current.liked, likes: Math.max(0, current.likes + (current.liked ? -1 : 1)) };
			setLikeOverrides((prev) => ({ ...prev, [id]: next }));

			await likeTargetVehicle({ variables: { input: id } });
			await getVehicleRefetch({ input: vehicleId });
			await getVehiclesRefetch();
			sweetVehicleActionToast(message ?? (next.liked ? 'Vehicle liked' : 'Like removed'));
			return true;
		} catch (err: any) {
			setLikeOverrides((prev) => {
				const rest = { ...prev };
				delete rest[id];
				return rest;
			});
			sweetMixinErrorAlert(err.message).then();
			return false;
		} finally {
			pendingLikeIds.current.delete(id);
		}
	};

	const commentPaginationChangeHandler = async (event: ChangeEvent<unknown>, value: number) => {
		setCommentInquiry((prev) => ({ ...prev, page: value }));
	};

	const createCommentHandler = async () => {
		try {
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);
			await createComment({ variables: { input: insertCommentData } });
			setInsertCommentData((prev) => ({ ...prev, commentContent: '' }));
			await getCommentsRefetch({ input: commentInquiry });
		} catch (err: any) {
			sweetErrorHandling(err);
		}
	};

	const openMessageHandler = async () => {
		if (!user._id) {
			await router.push({ pathname: '/account/join', query: { referrer: router.asPath } });
			return;
		}
		setMessageOpen(true);
	};

	const sendMessageHandler = async () => {
		const receiverId = vehicle?.memberData?._id ?? vehicle?.memberId;
		if (!messageText.trim() || !receiverId || messageSending) return;
		try {
			setMessageSending(true);
			await sendMessage({
				variables: {
					input: {
						receiverId,
						notificationDesc: messageText.trim(),
						vehicleId: vehicle?._id,
					},
				},
			});
			setMessageOpen(false);
			setMessageText('');
			await sweetMixinSuccessAlert('Your message was sent to the dealer');
		} catch (err: any) {
			await sweetMixinErrorAlert(err.message);
		} finally {
			setMessageSending(false);
		}
	};

	const editCommentHandler = (comment: Comment) => {
		setUpdatedComment(comment.commentContent);
		setUpdatedCommentId(comment._id);
		setOpenCommentBackdrop(true);
	};

	const cancelCommentEditHandler = () => {
		setOpenCommentBackdrop(false);
		setUpdatedComment('');
		setUpdatedCommentId('');
	};

	const updateCommentHandler = async (commentId: string, commentStatus?: CommentStatus.DELETE) => {
		try {
			if (!user?._id) throw new Error(Message.NOT_AUTHENTICATED);
			if (!commentId) throw new Error('Select a comment to update!');

			const updateData: CommentUpdate = {
				_id: commentId,
				...(commentStatus && { commentStatus }),
				...(!commentStatus && { commentContent: updatedComment }),
			};

			if (!updateData?.commentContent && !updateData?.commentStatus) {
				throw new Error('Provide data to update your comment!');
			}

			if (commentStatus) {
				if (await sweetConfirmAlert('Do you want to delete the comment?')) {
					await updateComment({ variables: { input: updateData } });
					await sweetMixinSuccessAlert('Successfully deleted!');
				} else return;
			} else {
				await updateComment({ variables: { input: updateData } });
				await sweetMixinSuccessAlert('Successfully updated!');
			}

			await getCommentsRefetch({ input: commentInquiry });
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		} finally {
			setOpenCommentBackdrop(false);
			setUpdatedComment('');
			setUpdatedCommentId('');
		}
	};

	const isOwnVehicle = !!user?._id && user._id === (vehicle?.memberData?._id ?? vehicle?.memberId);
	const dealerName = vehicle?.memberData?.memberFullName ?? vehicle?.memberData?.memberNick;
	const dealerImage = vehicle?.memberData?.memberImage
		? `${REACT_APP_API_URL}/${vehicle.memberData.memberImage}`
		: '/img/profile/defaultUser.svg';
	const heroImage = slideImage ? `${REACT_APP_API_URL}/${slideImage}` : '/img/banner/header1.svg';
	const activeImages = vehicle?.vehicleImages?.length ? vehicle.vehicleImages : [];
	const displayVehicle = applyLikeOverride(vehicle as unknown as T) as unknown as Vehicle | null;
	const relatedVehicles = useMemo(
		() =>
			similarVehicles
				.filter((item) => item?._id !== vehicle?._id)
				.slice(0, 6)
				.map((item) => applyLikeOverride(item as unknown as T) as unknown as Vehicle),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[similarVehicles, vehicle?._id, likeOverrides],
	);
	const detailStats = [
		{ label: 'Brand', value: vehicle?.vehicleBrand || '-' },
		{ label: 'Model', value: vehicle?.vehicleModel || '-' },
		{ label: 'Trim', value: vehicle?.vehicleTrim || '-' },
		{ label: 'Year', value: vehicle?.vehicleYear ? String(vehicle.vehicleYear) : '-' },
		{ label: 'Fuel', value: vehicle?.vehicleFuel || '-' },
		{ label: 'Transmission', value: vehicle?.vehicleTransmission || '-' },
		{ label: 'Color', value: vehicle?.vehicleColor || '-' },
		{ label: 'Location', value: vehicle?.vehicleLocation || '-' },
	];

	if (getVehicleLoading) {
		return (
			<div id={'property-detail-page'} className={'loading-state'}>
				<div className={'container'}>
					<div className={'detail-loading-shell'}>
						<div className={'loading-hero shimmer'} />
						<div className={'loading-grid'}>
							<div className={'loading-gallery shimmer'} />
							<div className={'loading-summary'}>
								<div className={'loading-line xl shimmer'} />
								<div className={'loading-line md shimmer'} />
								<div className={'loading-line lg shimmer'} />
								<div className={'loading-card shimmer'} />
							</div>
						</div>
						<div className={'loading-section shimmer'} />
					</div>
				</div>
			</div>
		);
	}

	if (!vehicle) {
		return (
			<div id={'property-detail-page'}>
				<div className={'container'}>
					<div className={'detail-empty-state'}>
						<span className={'eyebrow'}>Santa vehicle search</span>
						<h1>We couldn&apos;t find that vehicle.</h1>
						<p>The listing may have been removed, reserved, or moved. Explore the latest Hyundai and Kia inventory instead.</p>
						<Link href={'/vehicle'} className={'primary-action'}>
							<span>Browse vehicles</span>
							<KeyboardArrowRightRoundedIcon />
						</Link>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div id={'property-detail-page'}>
			<div className={'detail-background-orb orb-one'} />
			<div className={'detail-background-orb orb-two'} />

			<div className={'container'}>
				<Stack className={'property-detail-config'}>
					<section className={'detail-hero-section'}>
						<div className={'hero-copy'}>
							<span className={'eyebrow'}>Santa verified listing</span>
							<h1>{vehicleTitle(vehicle)}</h1>
							<p>
								A cleaner way to review Hyundai and Kia inventory across Korea, with premium presentation,
								transparent specs, and direct dealer context.
							</p>
							<div className={'hero-meta'}>
								<span>
									<PlaceOutlinedIcon />
									{vehicle?.vehicleLocation}
								</span>
								<span>
									<CalendarMonthOutlinedIcon />
									{moment(vehicle?.createdAt).fromNow()}
								</span>
								<span>
									<LocalOfferOutlinedIcon />
									{vehicleStockLabel(vehicle)}
								</span>
							</div>
						</div>

						<div className={'hero-stats'}>
							<div className={'hero-stat-card'}>
								<strong>${formatterStr(vehicle?.vehiclePrice)}</strong>
								<span>Listed price</span>
							</div>
							<div className={'hero-stat-strip'}>
								<div className={'metric-pill'}>
									<RemoveRedEyeOutlinedIcon />
									<span>{vehicle?.vehicleViews ?? 0} views</span>
								</div>
								<div className={'metric-pill'}>
									<FavoriteBorderIcon />
									<span>{displayVehicle?.vehicleLikes ?? 0} favorites</span>
								</div>
								<div className={'metric-pill'}>
									<ChatBubbleOutlineRoundedIcon />
									<span>{vehicle?.vehicleComments ?? 0} comments</span>
								</div>
							</div>
						</div>
					</section>

					<section className={'property-info-config'}>
						<div className={'gallery-shell'}>
							<div className={'gallery-stage'}>
								<div className={'gallery-topline'}>
									<div className={'gallery-badges'}>
										{vehicle?.vehicleRank >= topPropertyRank && <span className={'badge featured'}>Top ranked</span>}
										<span className={'badge brand'}>{vehicle?.vehicleBrand}</span>
										<span className={`badge status ${String(vehicle?.vehicleStatus ?? '').toLowerCase()}`}>
											{formatStatusLabel(vehicle?.vehicleStatus)}
										</span>
									</div>
									<button
										type="button"
										className={'hero-like-button'}
										onClick={() =>
											likeVehicleHandler(
												user,
												vehicle?._id,
												displayVehicle?.meLiked?.[0]?.myFavorite ? 'Removed from favorites' : 'Added to favorites',
											)
										}
										aria-label={displayVehicle?.meLiked?.[0]?.myFavorite ? 'Saved to favorites' : 'Save to favorites'}
									>
										{displayVehicle?.meLiked?.[0]?.myFavorite ? <BookmarkIcon color={'primary'} /> : <BookmarkBorderIcon />}
										<span>{displayVehicle?.meLiked?.[0]?.myFavorite ? 'Saved to favorites' : 'Save to favorites'}</span>
									</button>
								</div>

								<img src={heroImage} alt={vehicleTitle(vehicle)} className={'main-image'} />
							</div>

							<div className={'thumbnail-row'}>
								{activeImages.map((image) => {
									const imagePath = `${REACT_APP_API_URL}/${image}`;
									const isActive = slideImage === image;

									return (
										<button
											type="button"
											className={`thumbnail-button ${isActive ? 'active' : ''}`}
											onClick={() => setSlideImage(image)}
											key={image}
											aria-label={'View vehicle image'}
										>
											<img src={imagePath} alt={vehicleTitle(vehicle)} />
										</button>
									);
								})}
							</div>
						</div>

						<aside className={'summary-panel'}>
							<div className={'summary-card price-card'}>
								<div className={'summary-head'}>
									<div>
										<span className={'label'}>Current listing</span>
										<strong>{vehicleTitle(vehicle)}</strong>
									</div>
									<span className={`status-pill ${String(vehicle?.vehicleStatus ?? '').toLowerCase()}`}>
										{formatStatusLabel(vehicle?.vehicleStatus)}
									</span>
								</div>

								<div className={'price-row'}>
									<strong>${formatterStr(vehicle?.vehiclePrice)}</strong>
									<span>{vehicleStockLabel(vehicle)}</span>
								</div>

								<div className={'action-row'}>
									<button
										type="button"
										className={'action-button primary'}
										onClick={() =>
											likeVehicleHandler(
												user,
												vehicle?._id,
												displayVehicle?.meLiked?.[0]?.myFavorite ? 'Removed from favorites' : 'Added to favorites',
											)
										}
									>
										{displayVehicle?.meLiked?.[0]?.myFavorite ? <BookmarkIcon color={'primary'} /> : <BookmarkBorderIcon />}
										<span>{displayVehicle?.meLiked?.[0]?.myFavorite ? 'Saved to favorites' : 'Save to favorites'}</span>
									</button>
									<Link
										href={{
											pathname: '/agent/detail',
											query: { agentId: vehicle?.memberData?._id ?? vehicle?.memberId },
										}}
										className={'action-button secondary'}
									>
										<WorkspacePremiumOutlinedIcon />
										<span>View dealer</span>
									</Link>
								</div>

								<div className={'meta-strip'}>
									<div className={'metric'}>
										<RemoveRedEyeOutlinedIcon />
										<span>{vehicle?.vehicleViews ?? 0}</span>
									</div>
									<div className={'metric'}>
										<FavoriteBorderIcon />
										<span>{displayVehicle?.vehicleLikes ?? 0}</span>
									</div>
									<div className={'metric'}>
										<ChatBubbleOutlineRoundedIcon />
										<span>{vehicle?.vehicleComments ?? 0}</span>
									</div>
								</div>
							</div>

							<div className={'summary-card spec-card'}>
								<div className={'section-heading'}>
									<span className={'label'}>Quick scan</span>
									<strong>Vehicle specifications</strong>
								</div>

								<div className={'spec-grid'}>
									{detailStats.map((item) => (
										<div className={'spec-item'} key={item.label}>
											<span>{item.label}</span>
											<strong>{item.value}</strong>
										</div>
									))}
								</div>
							</div>

						</aside>
					</section>

					<section className={'property-desc-config'}>
						<div className={'left-config'}>
							<div className={'detail-card overview-card'}>
								<div className={'section-heading'}>
									<span className={'label'}>Vehicle overview</span>
									<strong>Everything you need before contacting the dealer</strong>
								</div>
								<p>
									{vehicle?.vehicleDesc ||
										'No additional description was provided for this vehicle yet. You can still review the full specification set, dealer profile, and listing status above.'}
								</p>

								<div className={'detail-grid'}>
									<div className={'detail-grid-item'}>
										<span>Status</span>
										<strong>{formatStatusLabel(vehicle?.vehicleStatus)}</strong>
									</div>
									<div className={'detail-grid-item'}>
										<span>Listed</span>
										<strong>{moment(vehicle?.createdAt).format('DD MMM YYYY')}</strong>
									</div>
									<div className={'detail-grid-item'}>
										<span>Body type</span>
										<strong>{vehicle?.vehicleBodyType || '—'}</strong>
									</div>
									<div className={'detail-grid-item'}>
										<span>Mileage</span>
										<strong>
											{vehicle?.vehicleMileage != null ? `${vehicle.vehicleMileage.toLocaleString()} km` : '—'}
										</strong>
									</div>
								</div>
							</div>

							<div className={'summary-card dealer-card'}>
								<div className={'dealer-top'}>
									<img src={dealerImage} alt={dealerName || 'Santa dealer'} />
									<div>
										<span className={'label'}>Trusted dealer</span>
										<strong>{dealerName || 'Santa verified dealer'}</strong>
										<p>{vehicle?.memberData?.memberAddress || 'Supporting Hyundai and Kia buyers across Korea.'}</p>
									</div>
								</div>

								<div className={'dealer-highlights'}>
									<div className={'highlight-box'}>
										<DirectionsCarFilledOutlinedIcon />
										<div>
											<strong>{vehicle?.memberData?.memberVehicles ?? 0}</strong>
											<span>Vehicles</span>
										</div>
									</div>
									<div className={'highlight-box'}>
										<WorkspacePremiumOutlinedIcon />
										<div>
											<strong>{vehicle?.memberData?.memberRank ?? 0}</strong>
											<span>Rank</span>
										</div>
									</div>
								</div>

								<p className={'dealer-summary'}>
									{vehicle?.memberData?.memberDesc ||
										'Premium inventory support with cleaner communication and a more trusted buying journey.'}
								</p>

								<div className={'dealer-actions'}>
									{!isOwnVehicle && (
										<button type={'button'} className={'dealer-message-button'} onClick={openMessageHandler}>
											<MailOutlineRoundedIcon />
											<span>Message dealer</span>
										</button>
									)}
									<Link
										href={{
											pathname: '/agent/detail',
											query: { agentId: vehicle?.memberData?._id ?? vehicle?.memberId },
										}}
										className={'dealer-link-button'}
									>
										<span>Open dealer profile</span>
										<KeyboardArrowRightRoundedIcon />
									</Link>
									{vehicle?.memberData?.memberPhone && (
										<a href={`tel:${vehicle.memberData.memberPhone}`} className={'dealer-phone-link'}>
											<CallOutlinedIcon />
											<span>{vehicle.memberData.memberPhone}</span>
										</a>
									)}
								</div>
							</div>
							{messageOpen && (
								<div className={'dealer-message-modal'} role={'dialog'} aria-modal={'true'}>
									<div className={'modal-backdrop'} onClick={() => setMessageOpen(false)} />
									<div className={'modal-card'}>
										<div className={'modal-head'}>
											<div>
												<span className={'label'}>Message to {dealerName || 'dealer'}</span>
												<strong>{vehicleTitle(vehicle)}</strong>
											</div>
											<button type={'button'} aria-label={'Close'} onClick={() => setMessageOpen(false)}>
												<CloseRoundedIcon />
											</button>
										</div>
										<textarea
											autoFocus={true}
											placeholder={'Hi! Is this vehicle still available? I would like to learn more about it.'}
											value={messageText}
											onChange={(e) => setMessageText(e.target.value)}
											maxLength={500}
										/>
										<div className={'modal-foot'}>
											<span>{messageText.length}/500 · The dealer replies in your notifications</span>
											<Button
												variant={'contained'}
												endIcon={<SendRoundedIcon />}
												disabled={!messageText.trim() || messageSending}
												onClick={sendMessageHandler}
											>
												{messageSending ? 'Sending…' : 'Send message'}
											</Button>
										</div>
									</div>
								</div>
							)}
						</div>
					</section>

					<section className={'review-config'} id={'vehicle-comments'}>
						<div className={'section-heading'}>
							<span className={'label'}>Community notes</span>
							<strong>Comments and buyer conversation</strong>
						</div>

						<div className={'comment-compose'}>
							<textarea
								value={insertCommentData.commentContent}
								onChange={({ target: { value } }: any) =>
									setInsertCommentData((prev) => ({ ...prev, commentContent: value }))
								}
								placeholder={'Share a useful note or question about this vehicle'}
							/>
							<div className={'comment-compose-footer'}>
								<span>{user?._id ? 'Your comment will appear with your Santa profile.' : 'Sign in to join the conversation.'}</span>
								<div className={'comment-compose-actions'}>
									<Button
										disabled={!insertCommentData.commentContent}
										onClick={() => setInsertCommentData((prev) => ({ ...prev, commentContent: '' }))}
										className={'clear-comment'}
									>
										Clear
									</Button>
									<Button
										disabled={!insertCommentData.commentContent || !user?._id}
										onClick={createCommentHandler}
										className={'submit-comment'}
									>
										Submit comment
									</Button>
								</div>
							</div>
						</div>

						<div className={'comment-list'}>
							{vehicleComments.length ? (
								vehicleComments.map((comment) => (
									<VehicleDetailCommentCard
										key={comment._id}
										comment={comment}
										onEdit={editCommentHandler}
										onDelete={(commentId) => updateCommentHandler(commentId, CommentStatus.DELETE)}
									/>
								))
							) : (
								<div className={'comments-empty-state'}>
									<ChatBubbleOutlineRoundedIcon />
									<strong>No comments yet</strong>
									<p>Start the conversation with a useful note, delivery question, or buying tip for other shoppers.</p>
								</div>
							)}
						</div>

						{commentTotal > commentInquiry.limit && (
							<div className={'comments-pagination'}>
								<MuiPagination
									page={commentInquiry.page}
									count={Math.ceil(commentTotal / commentInquiry.limit)}
									onChange={commentPaginationChangeHandler}
								/>
							</div>
						)}
					</section>

					<section className={'similar-properties-config'}>
						<div className={'section-heading'}>
							<span className={'label'}>More from this brand</span>
							<strong>Related Hyundai and Kia inventory</strong>
						</div>

						<div className={'cards-box'}>
							{relatedVehicles.length ? (
								relatedVehicles.map((item) => (
									<VehicleDetailRelatedCard key={item._id} vehicle={item} likeVehicleHandler={likeVehicleHandler} />
								))
							) : (
								<div className={'related-empty-state'}>
									<strong>More vehicles coming soon</strong>
									<p>We&apos;ll surface more related inventory here as matching Hyundai and Kia listings are published.</p>
								</div>
							)}
						</div>
					</section>
				</Stack>

				<Backdrop className={'edit-comment-backdrop'} open={openCommentBackdrop} onClick={cancelCommentEditHandler}>
					<div className={'edit-comment-modal'} onClick={(e) => e.stopPropagation()}>
						<h4>Edit comment</h4>
						<textarea
							autoFocus
							value={updatedComment}
							onChange={(e) => setUpdatedComment(e.target.value)}
							placeholder={'Update your note about this vehicle'}
						/>
						<div className={'edit-comment-modal-footer'}>
							<Button variant={'outlined'} color={'inherit'} onClick={cancelCommentEditHandler}>
								Cancel
							</Button>
							<Button
								variant={'contained'}
								color={'inherit'}
								onClick={() => updateCommentHandler(updatedCommentId)}
							>
								Update
							</Button>
						</div>
					</div>
				</Backdrop>
			</div>
		</div>
	);
};

VehicleDetail.defaultProps = {
	initialComment: {
		page: 1,
		limit: 5,
		sort: 'createdAt',
		direction: Direction.ASC,
		search: {
			commentRefId: '',
		},
	},
};

export default withLayoutFull(VehicleDetail);

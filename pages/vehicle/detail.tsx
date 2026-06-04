import React, { ChangeEvent, useEffect, useState } from 'react';
import { Box, Button, CircularProgress, Pagination as MuiPagination, Stack, Typography } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import moment from 'moment';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import { GET_COMMENTS, GET_VEHICLE, GET_VEHICLES } from '../../apollo/user/query';
import { CREATE_COMMENT, LIKE_TARGET_VEHICLE } from '../../apollo/user/mutation';
import { Vehicle } from '../../libs/types/vehicle/vehicle';
import { CommentInput, CommentsInquiry } from '../../libs/types/comment/comment.input';
import { Comment } from '../../libs/types/comment/comment';
import { CommentGroup } from '../../libs/enums/comment.enum';
import { Direction, Message } from '../../libs/enums/common.enum';
import { T } from '../../libs/types/common';
import { REACT_APP_API_URL } from '../../libs/config';
import { userVar } from '../../apollo/store';
import { formatterStr } from '../../libs/utils';
import { vehicleSpecs, vehicleStockLabel, vehicleTitle } from '../../libs/vehicle';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import PropertyBigCard from '../../libs/components/common/PropertyBigCard';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const VehicleDetail: NextPage = ({ initialComment }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [vehicleId, setVehicleId] = useState<string | null>(null);
	const [vehicle, setVehicle] = useState<Vehicle | null>(null);
	const [slideImage, setSlideImage] = useState('');
	const [similarVehicles, setSimilarVehicles] = useState<Vehicle[]>([]);
	const [commentInquiry, setCommentInquiry] = useState<CommentsInquiry>(initialComment);
	const [vehicleComments, setVehicleComments] = useState<Comment[]>([]);
	const [commentTotal, setCommentTotal] = useState<number>(0);
	const [insertCommentData, setInsertCommentData] = useState<CommentInput>({
		commentGroup: CommentGroup.VEHICLE,
		commentContent: '',
		commentRefId: '',
	});

	const [likeTargetVehicle] = useMutation(LIKE_TARGET_VEHICLE);
	const [createComment] = useMutation(CREATE_COMMENT);

	const { loading: getVehicleLoading, refetch: getVehicleRefetch } = useQuery(GET_VEHICLE, {
		fetchPolicy: 'network-only',
		variables: { input: vehicleId },
		skip: !vehicleId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			if (data?.getVehicle) {
				setVehicle(data.getVehicle);
				setSlideImage(data.getVehicle.vehicleImages?.[0] ?? '');
			}
		},
	});

	const { refetch: getVehiclesRefetch } = useQuery(GET_VEHICLES, {
		fetchPolicy: 'cache-and-network',
		variables: {
			input: {
				page: 1,
				limit: 4,
				sort: 'createdAt',
				direction: Direction.DESC,
				search: {
					brandList: vehicle?.vehicleBrand ? [vehicle.vehicleBrand] : undefined,
				},
			},
		},
		skip: !vehicle,
		onCompleted: (data: T) => setSimilarVehicles(data?.getVehicles?.list ?? []),
	});

	const { refetch: getCommentsRefetch } = useQuery(GET_COMMENTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: commentInquiry },
		skip: !commentInquiry?.search?.commentRefId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setVehicleComments(data?.getComments?.list ?? []);
			setCommentTotal(data?.getComments?.metaCounter?.[0]?.total ?? 0);
		},
	});

	useEffect(() => {
		if (!router.query.id) return;
		const id = router.query.id as string;
		setVehicleId(id);
		setCommentInquiry({ ...commentInquiry, search: { commentRefId: id } });
		setInsertCommentData({ ...insertCommentData, commentRefId: id });
	}, [router.query.id]);

	useEffect(() => {
		if (commentInquiry.search.commentRefId) getCommentsRefetch({ input: commentInquiry });
	}, [commentInquiry]);

	const likeVehicleHandler = async (targetUser: T, id: string) => {
		try {
			if (!id) return;
			if (!targetUser._id) throw new Error(Message.NOT_AUTHENTICATED);
			await likeTargetVehicle({ variables: { input: id } });
			await getVehicleRefetch({ input: vehicleId });
			await getVehiclesRefetch();
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const commentPaginationChangeHandler = async (event: ChangeEvent<unknown>, value: number) => {
		setCommentInquiry({ ...commentInquiry, page: value });
	};

	const createCommentHandler = async () => {
		try {
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);
			await createComment({ variables: { input: insertCommentData } });
			setInsertCommentData({ ...insertCommentData, commentContent: '' });
			await getCommentsRefetch({ input: commentInquiry });
		} catch (err: any) {
			sweetErrorHandling(err);
		}
	};

	if (getVehicleLoading) {
		return (
			<Stack sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', width: '100%' }}>
				<CircularProgress size={'4rem'} />
			</Stack>
		);
	}

	if (device === 'mobile') return <div>VEHICLE DETAIL PAGE</div>;

	return (
		<div id={'property-detail-page'}>
			<div className={'container'}>
				<Stack className={'property-detail-config'}>
					<Stack className={'property-info-config'}>
						<Stack className={'info'}>
							<Stack className={'left-box'}>
								<Typography className={'title-main'}>{vehicleTitle(vehicle)}</Typography>
								<Stack className={'top-box'}>
									<Typography className={'city'}>{vehicle?.vehicleLocation}</Typography>
									<Stack className={'divider'} />
									<Typography className={'date'}>{moment().diff(vehicle?.createdAt, 'days')} days ago</Typography>
								</Stack>
								<Stack className={'bottom-box'}>
									{vehicleSpecs(vehicle).map((spec) => (
										<Stack className="option" key={spec}>
											<Typography>{spec}</Typography>
										</Stack>
									))}
									<Stack className="option">
										<Typography>{vehicleStockLabel(vehicle)}</Typography>
									</Stack>
								</Stack>
							</Stack>
							<Stack className={'right-box'}>
								<Stack className="buttons">
									<Stack className="button-box">
										<RemoveRedEyeIcon fontSize="medium" />
										<Typography>{vehicle?.vehicleViews}</Typography>
									</Stack>
									<Stack className="button-box">
										{vehicle?.meLiked && vehicle?.meLiked[0]?.myFavorite ? (
											<FavoriteIcon color="primary" fontSize={'medium'} />
										) : (
											<FavoriteBorderIcon fontSize={'medium'} onClick={() => likeVehicleHandler(user, vehicle?._id as string)} />
										)}
										<Typography>{vehicle?.vehicleLikes}</Typography>
									</Stack>
								</Stack>
								<Typography>${formatterStr(vehicle?.vehiclePrice)}</Typography>
							</Stack>
						</Stack>
						<Stack className={'images'}>
							<Stack className={'main-image'}>
								<img src={slideImage ? `${REACT_APP_API_URL}/${slideImage}` : '/img/banner/header1.svg'} alt={'main-image'} />
							</Stack>
							<Stack className={'sub-images'}>
								{vehicle?.vehicleImages.map((subImg) => (
									<Stack className={'sub-img-box'} onClick={() => setSlideImage(subImg)} key={subImg}>
										<img src={`${REACT_APP_API_URL}/${subImg}`} alt={'sub-image'} />
									</Stack>
								))}
							</Stack>
						</Stack>
					</Stack>
					<Stack className={'property-desc-config'}>
						<Stack className={'left-config'}>
							<Typography className={'main-title'}>Vehicle Details</Typography>
							<Typography>{vehicle?.vehicleDesc ?? 'No description provided.'}</Typography>
							<Typography sx={{ mt: '20px' }}>Status: {vehicle?.vehicleStatus}</Typography>
							<Typography>Dealer: {vehicle?.memberData?.memberNick ?? vehicle?.memberData?.memberFullName}</Typography>
						</Stack>
					</Stack>
					<Stack className={'review-config'}>
						<Typography className={'main-title'}>Comments</Typography>
						<textarea
							value={insertCommentData.commentContent}
							onChange={({ target: { value } }: any) => setInsertCommentData({ ...insertCommentData, commentContent: value })}
						/>
						<Button disabled={!insertCommentData.commentContent || !user?._id} onClick={createCommentHandler}>
							Submit Comment
						</Button>
						{vehicleComments.map((comment) => (
							<Box key={comment._id} sx={{ my: 1 }}>
								<Typography>{comment.commentContent}</Typography>
								<Typography variant="caption">{comment.memberData?.memberNick}</Typography>
							</Box>
						))}
						{commentTotal > commentInquiry.limit && (
							<MuiPagination
								page={commentInquiry.page}
								count={Math.ceil(commentTotal / commentInquiry.limit)}
								onChange={commentPaginationChangeHandler}
							/>
						)}
					</Stack>
					<Stack className={'similar-properties-config'}>
						<Typography className={'main-title'}>Similar Vehicles</Typography>
						<Stack className={'cards-box'}>
							{similarVehicles.map((item) => (
								<PropertyBigCard key={item._id} property={item} likePropertyHandler={likeVehicleHandler} />
							))}
						</Stack>
					</Stack>
				</Stack>
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

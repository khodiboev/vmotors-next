import React, { useState } from 'react';
import { NextPage } from 'next';
import { Pagination, Stack, Typography } from '@mui/material';
import BookmarkAddedRoundedIcon from '@mui/icons-material/BookmarkAddedRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import { useMutation, useQuery } from '@apollo/client';
import { Property } from '../../types/vehicle/vehicle';
import { T } from '../../types/common';
import { GET_FAVORITES } from '../../../apollo/user/query';
import { LIKE_TARGET_VEHICLE } from '../../../apollo/user/mutation';
import { Messages } from '../../config';
import { sweetMixinErrorAlert } from '../../sweetAlert';
import DashboardVehicleCard, { DashboardVehicleCardSkeleton } from './DashboardVehicleCard';

const MyFavorites: NextPage = () => {
	const [myFavorites, setMyFavorites] = useState<Property[]>([]);
	const [total, setTotal] = useState<number>(0);
	// limit: 9 fills a full 3x3 grid per page.
	const [searchFavorites, setSearchFavorites] = useState<T>({ page: 1, limit: 9 });

	const [likeTargetVehicle] = useMutation(LIKE_TARGET_VEHICLE);

	const { loading: getFavoritesLoading, refetch: getFavoritesRefetch } = useQuery(GET_FAVORITES, {
		fetchPolicy: 'network-only',
		variables: {
			input: searchFavorites,
		},
		notifyOnNetworkStatusChange: true,
		onCompleted(data: T) {
			setMyFavorites(data.getFavorites?.list ?? []);
			setTotal(data.getFavorites?.metaCounter?.[0]?.total || 0);
		},
	});

	const paginationHandler = (e: T, value: number) => {
		setSearchFavorites({ ...searchFavorites, page: value });
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

			await getFavoritesRefetch({ input: searchFavorites });
		} catch (err: any) {
			console.log('ERROR, likePropertyHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	return (
		<div id="my-favorites-page" className={'dashboard-collection-page'}>
			<Stack className="dashboard-section-shell">
				<Stack className="dashboard-shell-header">
					<div className={'copy'}>
						<span className={'section-kicker'}>Saved inventory</span>
						<Typography className="main-title">Favorites you want to keep close</Typography>
						<Typography className="sub-title">Review the Hyundai and Kia vehicles you saved, compare them again, and keep your shortlist clean as inventory changes.</Typography>
					</div>
					<div className={'shell-badge'}>
						<BookmarkAddedRoundedIcon />
						<span>{total} saved vehicle{total === 1 ? '' : 's'}</span>
					</div>
				</Stack>

				<Stack className="dashboard-mini-metrics">
					<article className={'mini-metric-card'}>
						<div className={'metric-icon'}>
							<FavoriteBorderRoundedIcon />
						</div>
						<div>
							<strong>{total}</strong>
							<span>Active shortlist entries</span>
						</div>
					</article>
					<article className={'mini-metric-card'}>
						<div className={'metric-icon'}>
							<BookmarkAddedRoundedIcon />
						</div>
						<div>
							<strong>{searchFavorites.page}</strong>
							<span>Current page</span>
						</div>
					</article>
				</Stack>

				<Stack className="favorites-list-box dashboard-collection-grid">
					{getFavoritesLoading && !myFavorites.length
						? Array.from({ length: 3 }).map((_, index) => <DashboardVehicleCardSkeleton key={`favorite-skeleton-${index}`} />)
						: null}

					{!getFavoritesLoading && myFavorites?.length
						? myFavorites.map((vehicle: Property) => (
								<DashboardVehicleCard
									key={vehicle._id}
									vehicle={vehicle}
									contextLabel={'Favorite'}
									likeVehicleHandler={likePropertyHandler}
								/>
						  ))
						: null}

					{!getFavoritesLoading && !myFavorites?.length ? (
						<div className={'dashboard-empty-state'}>
							<div className={'empty-icon'}>
								<BookmarkAddedRoundedIcon />
							</div>
							<strong>No saved vehicles yet</strong>
							<p>When you like a vehicle, it will appear here so you can revisit it faster during your buying journey.</p>
						</div>
					) : null}
				</Stack>

				{myFavorites?.length ? (
					<Stack className="pagination-config">
						<Stack className="pagination-box">
							<Pagination
								count={Math.ceil(total / searchFavorites.limit)}
								page={searchFavorites.page}
								shape="circular"
								color="primary"
								onChange={paginationHandler}
							/>
						</Stack>
						<Stack className="total-result">
							<Typography>Total {total} favorite vehicle{total === 1 ? '' : 's'}</Typography>
						</Stack>
					</Stack>
				) : null}
			</Stack>
		</div>
	);
};

export default MyFavorites;

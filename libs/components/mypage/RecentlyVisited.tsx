import React, { useState } from 'react';
import { NextPage } from 'next';
import { Pagination, Stack, Typography } from '@mui/material';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import { useQuery } from '@apollo/client';
import { Property } from '../../types/vehicle/vehicle';
import { T } from '../../types/common';
import { GET_VISITED } from '../../../apollo/user/query';
import DashboardVehicleCard, { DashboardVehicleCardSkeleton } from './DashboardVehicleCard';

const RecentlyVisited: NextPage = () => {
	const [recentlyVisited, setRecentlyVisited] = useState<Property[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [searchVisited, setSearchVisited] = useState<T>({ page: 1, limit: 6 });

	const { loading: getVisitedLoading } = useQuery(GET_VISITED, {
		fetchPolicy: 'network-only',
		variables: {
			input: searchVisited,
		},
		notifyOnNetworkStatusChange: true,
		onCompleted(data: T) {
			setRecentlyVisited(data.getVisited?.list ?? []);
			setTotal(data.getVisited?.metaCounter?.[0]?.total || 0);
		},
	});

	const paginationHandler = (e: T, value: number) => {
		setSearchVisited({ ...searchVisited, page: value });
	};

	return (
		<div id="recently-visited-page" className={'dashboard-collection-page'}>
			<Stack className="dashboard-section-shell">
				<Stack className="dashboard-shell-header">
					<div className={'copy'}>
						<span className={'section-kicker'}>Recently viewed</span>
						<Typography className="main-title">Continue comparing recent vehicles</Typography>
						<Typography className="sub-title">Return to the Hyundai and Kia listings you viewed most recently and pick up your research without starting over.</Typography>
					</div>
					<div className={'shell-badge'}>
						<HistoryRoundedIcon />
						<span>{total} recently viewed</span>
					</div>
				</Stack>

				<Stack className="dashboard-mini-metrics">
					<article className={'mini-metric-card'}>
						<div className={'metric-icon'}>
							<HistoryRoundedIcon />
						</div>
						<div>
							<strong>{total}</strong>
							<span>Vehicles in history</span>
						</div>
					</article>
					<article className={'mini-metric-card'}>
						<div className={'metric-icon'}>
							<AutoAwesomeOutlinedIcon />
						</div>
						<div>
							<strong>{searchVisited.page}</strong>
							<span>Current page</span>
						</div>
					</article>
				</Stack>

				<Stack className="favorites-list-box dashboard-collection-grid">
					{getVisitedLoading && !recentlyVisited.length
						? Array.from({ length: 3 }).map((_, index) => <DashboardVehicleCardSkeleton key={`visited-skeleton-${index}`} />)
						: null}

					{!getVisitedLoading && recentlyVisited?.length
						? recentlyVisited.map((vehicle: Property) => (
								<DashboardVehicleCard key={vehicle._id} vehicle={vehicle} contextLabel={'Recently viewed'} />
						  ))
						: null}

					{!getVisitedLoading && !recentlyVisited?.length ? (
						<div className={'dashboard-empty-state'}>
							<div className={'empty-icon'}>
								<HistoryRoundedIcon />
							</div>
							<strong>No recently viewed vehicles yet</strong>
							<p>Your browsing history will appear here after you explore more VMotors inventory.</p>
						</div>
					) : null}
				</Stack>

				{recentlyVisited?.length ? (
					<Stack className="pagination-config">
						<Stack className="pagination-box">
							<Pagination
								count={Math.ceil(total / searchVisited.limit)}
								page={searchVisited.page}
								shape="circular"
								color="primary"
								onChange={paginationHandler}
							/>
						</Stack>
						<Stack className="total-result">
							<Typography>Total {total} recently viewed vehicle{total === 1 ? '' : 's'}</Typography>
						</Stack>
					</Stack>
				) : null}
			</Stack>
		</div>
	);
};

export default RecentlyVisited;

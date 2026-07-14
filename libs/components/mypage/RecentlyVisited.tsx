import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { Stack, Typography } from '@mui/material';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import { useQuery } from '@apollo/client';
import { Property } from '../../types/vehicle/vehicle';
import { T } from '../../types/common';
import { GET_VISITED } from '../../../apollo/user/query';
import DashboardVehicleCard, { DashboardVehicleCardSkeleton } from './DashboardVehicleCard';

// Fixed at the last 9 most recently viewed vehicles (3x3 grid) — the backend
// already returns them newest-first, so a single un-paginated page of 9 covers it.
const RECENTLY_VISITED_LIMIT = 9;

const RecentlyVisited: NextPage = () => {
	const [recentlyVisited, setRecentlyVisited] = useState<Property[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [searchVisited] = useState<T>({ page: 1, limit: RECENTLY_VISITED_LIMIT });

	// Synced from `data` in an effect — Apollo 3.5 drops onCompleted on hard loads
	const { loading: getVisitedLoading, data: getVisitedData } = useQuery(GET_VISITED, {
		fetchPolicy: 'network-only',
		variables: {
			input: searchVisited,
		},
		notifyOnNetworkStatusChange: true,
	});

	useEffect(() => {
		if (!getVisitedData?.getVisited) return;
		setRecentlyVisited(getVisitedData.getVisited.list ?? []);
		setTotal(getVisitedData.getVisited.metaCounter?.[0]?.total || 0);
	}, [getVisitedData]);

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
							<strong>{Math.min(total, RECENTLY_VISITED_LIMIT)}</strong>
							<span>Shown here</span>
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
							<p>Your browsing history will appear here after you explore more Santa vehicle listings.</p>
						</div>
					) : null}
				</Stack>

				{recentlyVisited?.length && total > RECENTLY_VISITED_LIMIT ? (
					<Stack className="history-note">
						<Typography>Showing your {RECENTLY_VISITED_LIMIT} most recent views out of {total} total.</Typography>
					</Stack>
				) : null}
			</Stack>
		</div>
	);
};

export default RecentlyVisited;

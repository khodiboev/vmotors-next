import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { Pagination, Stack, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { PropertyCard } from './PropertyCard';
import { Vehicle } from '../../types/vehicle/vehicle';
import { DealerVehiclesInquiry } from '../../types/vehicle/vehicle.input';
import { VehicleStatus } from '../../enums/vehicle.enum';
import { T } from '../../types/common';
import { userVar } from '../../../apollo/store';
import { UPDATE_VEHICLE } from '../../../apollo/user/mutation';
import { GET_DEALER_VEHICLES } from '../../../apollo/user/query';
import { sweetConfirmAlert, sweetErrorHandling } from '../../sweetAlert';

const MyProperties: NextPage = ({ initialInput }: any) => {
	const [searchFilter, setSearchFilter] = useState<DealerVehiclesInquiry>(initialInput);
	const [dealerVehicles, setDealerVehicles] = useState<Vehicle[]>([]);
	const [total, setTotal] = useState<number>(0);
	const user = useReactiveVar(userVar);
	const router = useRouter();

	const [updateVehicle] = useMutation(UPDATE_VEHICLE);

	const { loading, refetch: getDealerVehiclesRefetch } = useQuery(GET_DEALER_VEHICLES, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setDealerVehicles(data?.getDealerVehicles?.list ?? []);
			setTotal(data?.getDealerVehicles?.metaCounter?.[0]?.total ?? 0);
		},
	});

	useEffect(() => {
		if (user?._id && user?.memberType !== 'AGENT') router.back();
	}, [router, user]);

	const paginationHandler = (e: T, value: number) => setSearchFilter({ ...searchFilter, page: value });
	const changeStatusHandler = (value: VehicleStatus) => setSearchFilter({ ...searchFilter, search: { vehicleStatus: value } });

	const updatePropertyHandler = async (status: VehicleStatus, id: string) => {
		try {
			if (await sweetConfirmAlert(`Change this vehicle to ${status}?`)) {
				await updateVehicle({ variables: { input: { _id: id, vehicleStatus: status } } });
				await getDealerVehiclesRefetch({ input: searchFilter });
			}
		} catch (err: any) {
			await sweetErrorHandling(err);
		}
	};

	return (
		<div id="my-property-page">
			<Stack className="dashboard-section-shell">
				<Stack className="dashboard-shell-header">
					<div className={'copy'}>
						<span className={'section-kicker'}>Dealer inventory</span>
						<Typography className="main-title">Manage your live vehicle listings</Typography>
						<Typography className="sub-title">Track availability, update status, and keep your Hyundai and Kia inventory ready for serious buyers on Santa.</Typography>
					</div>
					<div className={'shell-badge'}>
						<Inventory2OutlinedIcon />
						<span>{total} active vehicle{total === 1 ? '' : 's'}</span>
					</div>
				</Stack>

				<Stack className="dashboard-mini-metrics">
					<article className={'mini-metric-card'}>
						<div className={'metric-icon'}>
							<Inventory2OutlinedIcon />
						</div>
						<div>
							<strong>{total}</strong>
							<span>Visible inventory</span>
						</div>
					</article>
					<article className={'mini-metric-card'}>
						<div className={'metric-icon'}>
							<VerifiedOutlinedIcon />
						</div>
						<div>
							<strong>
								{searchFilter.search?.vehicleStatus
									? searchFilter.search.vehicleStatus.charAt(0) + searchFilter.search.vehicleStatus.slice(1).toLowerCase()
									: 'All'}
							</strong>
							<span>Current status filter</span>
						</div>
					</article>
					<article className={'mini-metric-card'}>
						<div className={'metric-icon'}>
							<VisibilityOutlinedIcon />
						</div>
						<div>
							<strong>{searchFilter.page}</strong>
							<span>Current page</span>
						</div>
					</article>
				</Stack>

				<Stack className="property-list-box">
					<Stack className="tab-name-box" direction="row">
						{Object.values(VehicleStatus).map((status) => (
							<button
								type="button"
								key={status}
								onClick={() => changeStatusHandler(status)}
								className={searchFilter.search.vehicleStatus === status ? 'active-tab-name' : 'tab-name'}
							>
								{status}
							</button>
						))}
					</Stack>

					<Stack className="list-box">
						<Stack className="listing-title-box">
							<Typography className="title-text">Vehicle</Typography>
							<Typography className="title-text">Published</Typography>
							<Typography className="title-text">Status</Typography>
							<Typography className="title-text">Views</Typography>
							<Typography className="title-text">Actions</Typography>
						</Stack>

						{loading && !dealerVehicles.length
							? Array.from({ length: 4 }).map((_, index) => (
									<div className={'inventory-row-skeleton'} key={`inventory-skeleton-${index}`}>
										<div className={'vehicle-block'} />
										<div className={'date-block'} />
										<div className={'status-block'} />
										<div className={'views-block'} />
										<div className={'actions-block'} />
									</div>
							  ))
							: null}

						{!loading && dealerVehicles.length === 0 ? (
							<div className={'dashboard-empty-state'}>
								<div className={'empty-icon'}>
									<Inventory2OutlinedIcon />
								</div>
								<strong>No vehicles found</strong>
								<p>Try another status filter or add a fresh vehicle listing to expand your dealer inventory.</p>
							</div>
						) : null}

						{dealerVehicles.length !== 0
							? dealerVehicles.map((vehicle) => (
									<PropertyCard key={vehicle._id} property={vehicle} updatePropertyHandler={updatePropertyHandler} />
							  ))
							: null}

						{dealerVehicles.length !== 0 && (
							<Stack className="pagination-config">
								<Stack className="pagination-box">
									<Pagination
										count={Math.ceil(total / searchFilter.limit)}
										page={searchFilter.page}
										shape="circular"
										color="primary"
										onChange={paginationHandler}
									/>
								</Stack>
								<Stack className="total-result">
									<Typography>{total} vehicle{total === 1 ? '' : 's'} available</Typography>
								</Stack>
							</Stack>
						)}
					</Stack>
				</Stack>
			</Stack>
		</div>
	);
};

MyProperties.defaultProps = {
	initialInput: {
		page: 1,
		limit: 5,
		sort: 'createdAt',
		search: {
			vehicleStatus: VehicleStatus.AVAILABLE,
		},
	},
};

export default MyProperties;

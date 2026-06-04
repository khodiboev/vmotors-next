import React, { useState } from 'react';
import { NextPage } from 'next';
import { Pagination, Stack, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import useDeviceDetect from '../../hooks/useDeviceDetect';
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
	const device = useDeviceDetect();
	const [searchFilter, setSearchFilter] = useState<DealerVehiclesInquiry>(initialInput);
	const [dealerVehicles, setDealerVehicles] = useState<Vehicle[]>([]);
	const [total, setTotal] = useState<number>(0);
	const user = useReactiveVar(userVar);
	const router = useRouter();

	const [updateVehicle] = useMutation(UPDATE_VEHICLE);

	const { refetch: getDealerVehiclesRefetch } = useQuery(GET_DEALER_VEHICLES, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setDealerVehicles(data?.getDealerVehicles?.list ?? []);
			setTotal(data?.getDealerVehicles?.metaCounter?.[0]?.total ?? 0);
		},
	});

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

	if (user?.memberType !== 'AGENT') router.back();
	if (device === 'mobile') return <div>VMOTORS VEHICLES MOBILE</div>;

	return (
		<div id="my-property-page">
			<Stack className="main-title-box">
				<Stack className="right-box">
					<Typography className="main-title">My Vehicles</Typography>
					<Typography className="sub-title">Manage your new-car inventory.</Typography>
				</Stack>
			</Stack>
			<Stack className="property-list-box">
				<Stack className="tab-name-box">
					{Object.values(VehicleStatus).map((status) => (
						<Typography
							key={status}
							onClick={() => changeStatusHandler(status)}
							className={searchFilter.search.vehicleStatus === status ? 'active-tab-name' : 'tab-name'}
						>
							{status}
						</Typography>
					))}
				</Stack>
				<Stack className="list-box">
					<Stack className="listing-title-box">
						<Typography className="title-text">Vehicle</Typography>
						<Typography className="title-text">Date Published</Typography>
						<Typography className="title-text">Status</Typography>
						<Typography className="title-text">Views</Typography>
						<Typography className="title-text">Action</Typography>
					</Stack>
					{dealerVehicles.length === 0 ? (
						<div className={'no-data'}>
							<img src="/img/icons/icoAlert.svg" alt="" />
							<p>No vehicle found!</p>
						</div>
					) : (
						dealerVehicles.map((vehicle) => (
							<PropertyCard key={vehicle._id} property={vehicle} updatePropertyHandler={updatePropertyHandler} />
						))
					)}
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
								<Typography>{total} vehicle{total > 1 ? 's' : ''} available</Typography>
							</Stack>
						</Stack>
					)}
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

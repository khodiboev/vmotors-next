import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { Pagination, Stack, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import VehicleCard from '../property/PropertyCard';
import { Vehicle } from '../../types/vehicle/vehicle';
import { VehiclesInquiry } from '../../types/vehicle/vehicle.input';
import { T } from '../../types/common';
import { GET_VEHICLES } from '../../../apollo/user/query';

const MemberProperties: NextPage = ({ initialInput }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const { memberId } = router.query;
	const [searchFilter, setSearchFilter] = useState<VehiclesInquiry>({ ...initialInput });
	const [dealerVehicles, setDealerVehicles] = useState<Vehicle[]>([]);
	const [total, setTotal] = useState<number>(0);

	const { refetch: getVehiclesRefetch } = useQuery(GET_VEHICLES, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		skip: !searchFilter?.search?.memberId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: any) => {
			setDealerVehicles(data?.getVehicles?.list ?? []);
			setTotal(data?.getVehicles?.metaCounter?.[0]?.total ?? 0);
		},
	});

	useEffect(() => {
		if (searchFilter.search.memberId) getVehiclesRefetch({ input: searchFilter });
	}, [searchFilter]);

	useEffect(() => {
		if (memberId) setSearchFilter({ ...initialInput, search: { ...initialInput.search, memberId: memberId as string } });
	}, [memberId]);

	const paginationHandler = (e: T, value: number) => setSearchFilter({ ...searchFilter, page: value });

	if (device === 'mobile') return <div>VMOTORS VEHICLES MOBILE</div>;

	return (
		<div id="member-properties-page">
			<Stack className="main-title-box">
				<Stack className="right-box">
					<Typography className="main-title">Vehicles</Typography>
				</Stack>
			</Stack>
			<Stack className="properties-list-box">
				<Stack className="list-box">
					{dealerVehicles.length === 0 ? (
						<div className={'no-data'}>
							<img src="/img/icons/icoAlert.svg" alt="" />
							<p>No vehicle found!</p>
						</div>
					) : (
						dealerVehicles.map((vehicle) => <VehicleCard property={vehicle} key={vehicle._id} recentlyVisited />)
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

MemberProperties.defaultProps = {
	initialInput: {
		page: 1,
		limit: 5,
		sort: 'createdAt',
		search: {
			memberId: '',
		},
	},
};

export default MemberProperties;

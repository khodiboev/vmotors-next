import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { Pagination } from '@mui/material';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import PropertyBigCard from '../common/PropertyBigCard';
import { Vehicle } from '../../types/vehicle/vehicle';
import { VehiclesInquiry } from '../../types/vehicle/vehicle.input';
import { T } from '../../types/common';
import { GET_VEHICLES } from '../../../apollo/user/query';

const MemberProperties: NextPage = ({ initialInput }: any) => {
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

	return (
		<div id="member-properties-page">
			<div className="section-header">
				<h2>Vehicles</h2>
				{total > 0 && <span>{total} vehicle{total > 1 ? 's' : ''}</span>}
			</div>

			{dealerVehicles.length === 0 ? (
				<div className="empty-state">
					<img src="/img/icons/icoAlert.svg" alt="" />
					<h3>No vehicles listed yet</h3>
					<p>This dealer hasn&apos;t added any inventory to their Santa profile.</p>
				</div>
			) : (
				<>
					<div className="vehicle-grid">
						{dealerVehicles.map((vehicle) => (
							<PropertyBigCard property={vehicle} key={vehicle._id} />
						))}
					</div>
					<div className="pagination-config">
						<Pagination
							count={Math.ceil(total / searchFilter.limit)}
							page={searchFilter.page}
							shape="circular"
							color="primary"
							onChange={paginationHandler}
						/>
						<span>{total} vehicle{total > 1 ? 's' : ''} available</span>
					</div>
				</>
			)}
		</div>
	);
};

MemberProperties.defaultProps = {
	initialInput: {
		page: 1,
		limit: 9,
		sort: 'createdAt',
		search: {
			memberId: '',
		},
	},
};

export default MemberProperties;

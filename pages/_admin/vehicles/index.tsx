import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import { Box, Divider, List, ListItem, MenuItem, Select, Stack, TablePagination, Typography } from '@mui/material';
import { TabContext } from '@mui/lab';
import { useMutation, useQuery } from '@apollo/client';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { PropertyPanelList } from '../../../libs/components/admin/properties/PropertyList';
import { AllVehiclesInquiry } from '../../../libs/types/vehicle/vehicle.input';
import { Vehicle } from '../../../libs/types/vehicle/vehicle';
import { VehicleBrand, VehicleStatus } from '../../../libs/enums/vehicle.enum';
import { VehicleUpdate } from '../../../libs/types/vehicle/vehicle.update';
import { GET_ALL_VEHICLES_BY_ADMIN } from '../../../apollo/admin/query';
import { REMOVE_VEHICLE_BY_ADMIN, UPDATE_VEHICLE_BY_ADMIN } from '../../../apollo/admin/mutation';
import { sweetConfirmAlert, sweetErrorHandling } from '../../../libs/sweetAlert';
import { T } from '../../../libs/types/common';

const AdminVehicles: NextPage = ({ initialInquiry }: any) => {
	const [anchorEl, setAnchorEl] = useState<Array<HTMLElement | undefined>>([]);
	const [vehiclesInquiry, setVehiclesInquiry] = useState<AllVehiclesInquiry>(initialInquiry);
	const [vehicles, setVehicles] = useState<Vehicle[]>([]);
	const [vehiclesTotal, setVehiclesTotal] = useState<number>(0);
	const [value, setValue] = useState(vehiclesInquiry?.search?.vehicleStatus ?? 'ALL');
	const [brandFilter, setBrandFilter] = useState('ALL');
	const [locationText, setLocationText] = useState('');

	const [updateVehicleByAdmin] = useMutation(UPDATE_VEHICLE_BY_ADMIN);
	const [removeVehicleByAdmin] = useMutation(REMOVE_VEHICLE_BY_ADMIN);

	const { refetch: getAllVehiclesByAdminRefetch } = useQuery(GET_ALL_VEHICLES_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: vehiclesInquiry },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setVehicles(data?.getAllVehiclesByAdmin?.list ?? []);
			setVehiclesTotal(data?.getAllVehiclesByAdmin?.metaCounter?.[0]?.total ?? 0);
		},
	});

	useEffect(() => {
		getAllVehiclesByAdminRefetch({ input: vehiclesInquiry }).then();
	}, [vehiclesInquiry]);

	const changePageHandler = async (event: unknown, newPage: number) => {
		const next = { ...vehiclesInquiry, page: newPage + 1 };
		setVehiclesInquiry(next);
		await getAllVehiclesByAdminRefetch({ input: next });
	};

	const changeRowsPerPageHandler = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const next = { ...vehiclesInquiry, limit: parseInt(event.target.value, 10), page: 1 };
		setVehiclesInquiry(next);
		await getAllVehiclesByAdminRefetch({ input: next });
	};

	const menuIconClickHandler = (e: any, index: number) => {
		const tempAnchor = anchorEl.slice();
		tempAnchor[index] = e.currentTarget;
		setAnchorEl(tempAnchor);
	};

	const menuIconCloseHandler = () => setAnchorEl([]);

	const tabChangeHandler = async (event: any, newValue: string) => {
		setValue(newValue);
		const search = { ...vehiclesInquiry.search };
		if (newValue === 'ALL') delete search.vehicleStatus;
		else search.vehicleStatus = newValue as VehicleStatus;
		setVehiclesInquiry({ ...vehiclesInquiry, page: 1, sort: 'createdAt', search });
	};

	const brandFilterHandler = async (newValue: string) => {
		setBrandFilter(newValue);
		const search = { ...vehiclesInquiry.search };
		if (newValue === 'ALL') delete search.vehicleBrandList;
		else search.vehicleBrandList = [newValue as VehicleBrand];
		setVehiclesInquiry({ ...vehiclesInquiry, page: 1, sort: 'createdAt', search });
	};

	const locationFilterHandler = async () => {
		const search = { ...vehiclesInquiry.search };
		if (locationText) search.vehicleLocationList = [locationText];
		else delete search.vehicleLocationList;
		setVehiclesInquiry({ ...vehiclesInquiry, page: 1, sort: 'createdAt', search });
	};

	const removePropertyHandler = async (id: string) => {
		try {
			if (await sweetConfirmAlert('Are you sure to remove this vehicle?')) {
				await removeVehicleByAdmin({ variables: { input: id } });
				await getAllVehiclesByAdminRefetch({ input: vehiclesInquiry });
			}
			menuIconCloseHandler();
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const updatePropertyHandler = async (updateData: VehicleUpdate) => {
		try {
			await updateVehicleByAdmin({ variables: { input: updateData } });
			await getAllVehiclesByAdminRefetch({ input: vehiclesInquiry });
			menuIconCloseHandler();
		} catch (err: any) {
			menuIconCloseHandler();
			sweetErrorHandling(err).then();
		}
	};

	return (
		<Box component={'div'} className={'content'}>
			<Typography variant={'h2'} className={'tit'} sx={{ mb: '24px' }}>
				Vehicle List
			</Typography>
			<Box component={'div'} className={'table-wrap'}>
				<Box component={'div'} sx={{ width: '100%', typography: 'body1' }}>
					<TabContext value={value}>
						<Box component={'div'}>
							<List className={'tab-menu'}>
								<ListItem onClick={(e) => tabChangeHandler(e, 'ALL')} value="ALL" className={value === 'ALL' ? 'li on' : 'li'}>
									All
								</ListItem>
								{Object.values(VehicleStatus).map((status) => (
									<ListItem
										key={status}
										onClick={(e) => tabChangeHandler(e, status)}
										value={status}
										className={value === status ? 'li on' : 'li'}
									>
										{status}
									</ListItem>
								))}
							</List>
							<Divider />
							<Stack className={'search-area'} direction="row" sx={{ m: '24px' }} gap={2}>
								<Select sx={{ width: '160px' }} value={brandFilter}>
									<MenuItem value={'ALL'} onClick={() => brandFilterHandler('ALL')}>ALL BRANDS</MenuItem>
									{Object.values(VehicleBrand).map((brand) => (
										<MenuItem value={brand} onClick={() => brandFilterHandler(brand)} key={brand}>{brand}</MenuItem>
									))}
								</Select>
								<input
									value={locationText}
									placeholder="Location"
									onChange={(e) => setLocationText(e.target.value)}
									onBlur={locationFilterHandler}
								/>
							</Stack>
							<Divider />
						</Box>
						<PropertyPanelList
							properties={vehicles}
							anchorEl={anchorEl}
							menuIconClickHandler={menuIconClickHandler}
							menuIconCloseHandler={menuIconCloseHandler}
							updatePropertyHandler={updatePropertyHandler}
							removePropertyHandler={removePropertyHandler}
						/>
						<TablePagination
							rowsPerPageOptions={[10, 20, 40, 60]}
							component="div"
							count={vehiclesTotal}
							rowsPerPage={vehiclesInquiry.limit}
							page={vehiclesInquiry.page - 1}
							onPageChange={changePageHandler}
							onRowsPerPageChange={changeRowsPerPageHandler}
						/>
					</TabContext>
				</Box>
			</Box>
		</Box>
	);
};

AdminVehicles.defaultProps = {
	initialInquiry: {
		page: 1,
		limit: 10,
		sort: 'createdAt',
		direction: 'DESC',
		search: {},
	},
};

export default withAdminLayout(AdminVehicles);

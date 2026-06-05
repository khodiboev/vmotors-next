import React, { useState } from 'react';
import { Button, FormControl, MenuItem, Select, Stack } from '@mui/material';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { Direction } from '../../enums/common.enum';
import { VehicleBrand, VehicleFuel, VehicleTransmission } from '../../enums/vehicle.enum';
import { VehiclesInquiry } from '../../types/vehicle/vehicle.input';

const initialInput: VehiclesInquiry = {
	page: 1,
	limit: 9,
	sort: 'createdAt',
	direction: Direction.DESC,
	search: {},
};

const HeaderFilter = () => {
	const router = useRouter();
	const { t } = useTranslation('common');
	const [searchFilter, setSearchFilter] = useState<VehiclesInquiry>(initialInput);

	const pushSearchHandler = async () => {
		await router.push(`/vehicle?input=${JSON.stringify(searchFilter)}`, `/vehicle?input=${JSON.stringify(searchFilter)}`);
	};

	return (
		<Stack className={'search-box'}>
			<Stack className={'select-box'}>
					<div className={'box'}>
					<FormControl fullWidth>
						<Select
							displayEmpty
							value={searchFilter.search.brandList?.[0] ?? ''}
							onChange={(e) =>
								setSearchFilter({
									...searchFilter,
									search: {
										...searchFilter.search,
										brandList: e.target.value ? [e.target.value as VehicleBrand] : undefined,
									},
								})
							}
						>
							<MenuItem value="">{t('Brand')}</MenuItem>
							{Object.values(VehicleBrand).map((brand) => (
								<MenuItem value={brand} key={brand}>
									{brand}
								</MenuItem>
							))}
						</Select>
					</FormControl>
					</div>
					<div className={'box'}>
					<FormControl fullWidth>
						<Select
							displayEmpty
							value={searchFilter.search.fuelList?.[0] ?? ''}
							onChange={(e) =>
								setSearchFilter({
									...searchFilter,
									search: {
										...searchFilter.search,
										fuelList: e.target.value ? [e.target.value as VehicleFuel] : undefined,
									},
								})
							}
						>
							<MenuItem value="">{t('Fuel')}</MenuItem>
							{Object.values(VehicleFuel).map((fuel) => (
								<MenuItem value={fuel} key={fuel}>
									{fuel}
								</MenuItem>
							))}
						</Select>
					</FormControl>
					</div>
					<div className={'box'}>
					<FormControl fullWidth>
						<Select
							displayEmpty
							value={searchFilter.search.transmissionList?.[0] ?? ''}
							onChange={(e) =>
								setSearchFilter({
									...searchFilter,
									search: {
										...searchFilter.search,
										transmissionList: e.target.value ? [e.target.value as VehicleTransmission] : undefined,
									},
								})
							}
						>
							<MenuItem value="">{t('Transmission')}</MenuItem>
							{Object.values(VehicleTransmission).map((transmission) => (
								<MenuItem value={transmission} key={transmission}>
									{transmission}
								</MenuItem>
							))}
						</Select>
					</FormControl>
					</div>
			</Stack>
			<Stack className={'search-box-other'}>
				<Button className={'search-btn'} onClick={pushSearchHandler}>
					<img src="/img/icons/search_white.svg" alt="" />
				</Button>
			</Stack>
		</Stack>
	);
};

export default HeaderFilter;

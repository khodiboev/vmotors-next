import React, { useState } from 'react';
import { Button, FormControl, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { VehicleBrand, VehicleFuel, VehicleTransmission } from '../../enums/vehicle.enum';
import { VehiclesInquiry } from '../../types/vehicle/vehicle.input';

interface FilterType {
	searchFilter: VehiclesInquiry;
	setSearchFilter: (input: VehiclesInquiry) => void;
	initialInput: VehiclesInquiry;
}

const Filter = ({ searchFilter, setSearchFilter, initialInput }: FilterType) => {
	const router = useRouter();
	const [location, setLocation] = useState(searchFilter.search.locationList?.[0] ?? '');
	const activeFilterCount = [
		searchFilter.search.text,
		searchFilter.search.brandList?.[0],
		searchFilter.search.fuelList?.[0],
		searchFilter.search.transmissionList?.[0],
		searchFilter.search.locationList?.[0],
	].filter(Boolean).length;

	const pushFilter = async (next: VehiclesInquiry) => {
		setSearchFilter(next);
		await router.push(`/vehicle?input=${JSON.stringify(next)}`, `/vehicle?input=${JSON.stringify(next)}`, { scroll: false });
	};

	const updateSearch = async (search: VehiclesInquiry['search']) => {
		await pushFilter({ ...searchFilter, page: 1, search });
	};

	const resetHandler = async () => {
		setLocation('');
		await pushFilter(initialInput);
	};

	return (
		<Stack className={'filter-main'}>
			<div className={'filter-header'}>
				<div>
					<Typography className={'title'}>Refine inventory</Typography>
					<Typography className={'subtitle'}>Filter premium Hyundai and Kia listings in real time.</Typography>
				</div>
				<span className={'active-count'}>{activeFilterCount} active</span>
			</div>

			<div className={`filter-group ${searchFilter.search.text ? 'active' : ''}`}>
				<label className={'field-label'}>Keyword</label>
				<TextField
					size="small"
					placeholder="Model, trim, keyword"
					value={searchFilter.search.text ?? ''}
					onChange={(e) => updateSearch({ ...searchFilter.search, text: e.target.value || undefined })}
				/>
			</div>

			<div className={`filter-group ${searchFilter.search.brandList?.[0] ? 'active' : ''}`}>
				<label className={'field-label'}>Brand</label>
				<FormControl size="small">
					<Select
						displayEmpty
						value={searchFilter.search.brandList?.[0] ?? ''}
						onChange={(e) =>
							updateSearch({ ...searchFilter.search, brandList: e.target.value ? [e.target.value as VehicleBrand] : undefined })
						}
					>
						<MenuItem value="">All brands</MenuItem>
						{Object.values(VehicleBrand).map((brand) => (
							<MenuItem value={brand} key={brand}>
								{brand}
							</MenuItem>
						))}
					</Select>
				</FormControl>
			</div>

			<div className={'filter-group triple'}>
				<div className={searchFilter.search.fuelList?.[0] ? 'active' : ''}>
					<label className={'field-label'}>Fuel</label>
					<FormControl size="small">
						<Select
							displayEmpty
							value={searchFilter.search.fuelList?.[0] ?? ''}
							onChange={(e) =>
								updateSearch({ ...searchFilter.search, fuelList: e.target.value ? [e.target.value as VehicleFuel] : undefined })
							}
						>
							<MenuItem value="">All fuels</MenuItem>
							{Object.values(VehicleFuel).map((fuel) => (
								<MenuItem value={fuel} key={fuel}>
									{fuel}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</div>
				<div className={searchFilter.search.transmissionList?.[0] ? 'active' : ''}>
					<label className={'field-label'}>Transmission</label>
					<FormControl size="small">
						<Select
							displayEmpty
							value={searchFilter.search.transmissionList?.[0] ?? ''}
							onChange={(e) =>
								updateSearch({
									...searchFilter.search,
									transmissionList: e.target.value ? [e.target.value as VehicleTransmission] : undefined,
								})
							}
						>
							<MenuItem value="">All transmissions</MenuItem>
							{Object.values(VehicleTransmission).map((transmission) => (
								<MenuItem value={transmission} key={transmission}>
									{transmission}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</div>
				<div className={location ? 'active' : ''}>
					<label className={'field-label'}>Location</label>
					<TextField
						size="small"
						placeholder="Location"
						value={location}
						onChange={(e) => setLocation(e.target.value)}
						onBlur={() => updateSearch({ ...searchFilter.search, locationList: location ? [location] : undefined })}
					/>
				</div>
			</div>

			<div className={'filter-actions'}>
				<Button variant="outlined" onClick={resetHandler}>
					Reset filters
				</Button>
			</div>
		</Stack>
	);
};

export default Filter;

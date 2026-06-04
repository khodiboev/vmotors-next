import React from 'react';
import { Button, Stack, Typography } from '@mui/material';
import moment from 'moment';
import { useRouter } from 'next/router';
import { REACT_APP_API_URL } from '../../config';
import { Vehicle } from '../../types/vehicle/vehicle';
import { VehicleStatus } from '../../enums/vehicle.enum';
import { formatterStr } from '../../utils';
import { vehicleTitle } from '../../vehicle';

interface PropertyCardProps {
	property: Vehicle;
	updatePropertyHandler: (status: VehicleStatus, id: string) => void;
}

export const PropertyCard = ({ property, updatePropertyHandler }: PropertyCardProps) => {
	const router = useRouter();
	const image = property.vehicleImages?.[0] ? `${REACT_APP_API_URL}/${property.vehicleImages[0]}` : '/img/banner/header1.svg';

	return (
		<Stack className="property-card-box">
			<Stack className="image-title-box" onClick={() => router.push(`/vehicle/detail?id=${property._id}`)}>
				<img src={image} alt="" />
				<Stack>
					<Typography className="title">{vehicleTitle(property)}</Typography>
					<Typography className="address">{property.vehicleLocation}</Typography>
					<Typography className="price">${formatterStr(property.vehiclePrice)}</Typography>
				</Stack>
			</Stack>
			<Typography>{moment(property.createdAt).format('DD MMM YYYY')}</Typography>
			<Typography>{property.vehicleStatus}</Typography>
			<Typography>{property.vehicleViews}</Typography>
			<Stack direction="row" gap={1}>
				<Button onClick={() => router.push({ pathname: '/mypage', query: { category: 'addVehicle', vehicleId: property._id } })}>
					Edit
				</Button>
				{property.vehicleStatus !== VehicleStatus.RESERVED && (
					<Button onClick={() => updatePropertyHandler(VehicleStatus.RESERVED, property._id)}>Reserve</Button>
				)}
				{property.vehicleStatus !== VehicleStatus.SOLD && (
					<Button onClick={() => updatePropertyHandler(VehicleStatus.SOLD, property._id)}>Sold</Button>
				)}
				{property.vehicleStatus !== VehicleStatus.AVAILABLE && (
					<Button onClick={() => updatePropertyHandler(VehicleStatus.AVAILABLE, property._id)}>Available</Button>
				)}
			</Stack>
		</Stack>
	);
};

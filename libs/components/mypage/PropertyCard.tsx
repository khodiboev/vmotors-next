import React from 'react';
import { Button, Stack, Typography } from '@mui/material';
import moment from 'moment';
import { useRouter } from 'next/router';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import { REACT_APP_API_URL } from '../../config';
import { Vehicle } from '../../types/vehicle/vehicle';
import { VehicleStatus } from '../../enums/vehicle.enum';
import { formatterStr } from '../../utils';
import { vehicleSpecs, vehicleStockLabel, vehicleTitle } from '../../vehicle';

interface PropertyCardProps {
	property: Vehicle;
	updatePropertyHandler: (status: VehicleStatus, id: string) => void;
}

const formatStatusLabel = (status?: string) => {
	if (!status) return 'Available';
	return status.replace(/_/g, ' ');
};

export const PropertyCard = ({ property, updatePropertyHandler }: PropertyCardProps) => {
	const router = useRouter();
	const image = property.vehicleImages?.[0] ? `${REACT_APP_API_URL}/${property.vehicleImages[0]}` : '/img/banner/header1.svg';
	const specs = vehicleSpecs(property).slice(0, 3);

	return (
		<Stack className="property-card-box">
			<Stack className="image-title-box" direction="row" onClick={() => router.push(`/vehicle/detail?id=${property._id}`)}>
				<div className={'image-box'}>
					<img src={image} alt={vehicleTitle(property)} />
				</div>

				<Stack className={'information-box'}>
					<div className={'heading-row'}>
						<Typography className="title">{vehicleTitle(property)}</Typography>
						<span className={`status-chip ${String(property?.vehicleStatus ?? '').toLowerCase()}`}>
							{formatStatusLabel(property?.vehicleStatus)}
						</span>
					</div>

					<div className={'meta-row'}>
						<PlaceOutlinedIcon />
						<Typography className="address">{property.vehicleLocation}</Typography>
					</div>

					<div className={'spec-row'}>
						{specs.map((spec) => (
							<span key={`${property._id}-${spec}`}>{spec}</span>
						))}
					</div>

					<div className={'supporting-row'}>
						<div className={'supporting-pill'}>
							<LocalOfferOutlinedIcon />
							<Typography>{vehicleStockLabel(property)}</Typography>
						</div>
					</div>

					<Typography className="price">${formatterStr(property.vehiclePrice)}</Typography>
				</Stack>
			</Stack>

			<div className={'date-box'}>
				<Typography className={'field-label'}>Published</Typography>
				<Typography className="date">{moment(property.createdAt).format('DD MMM YYYY')}</Typography>
			</div>

			<div className={'status-box'}>
				<Typography className={'field-label'}>Status</Typography>
				<div className={`coloured-box ${String(property?.vehicleStatus ?? '').toLowerCase()}`}>
					<Typography className="status">{formatStatusLabel(property.vehicleStatus)}</Typography>
				</div>
			</div>

			<div className={'views-box'}>
				<Typography className={'field-label'}>Views</Typography>
				<div className={'views-inline'}>
					<RemoveRedEyeOutlinedIcon />
					<Typography className="views">{property.vehicleViews}</Typography>
				</div>
			</div>

			<Stack className={'action-box'} direction="row">
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

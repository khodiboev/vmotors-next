import React from 'react';
import { Button, Stack, Typography } from '@mui/material';
import moment from 'moment';
import { useRouter } from 'next/router';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
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
	const goToDetail = () => router.push(`/vehicle/detail?id=${property._id}`);

	return (
		<Stack className="property-card-box">
			<div className={'card-media'} onClick={goToDetail}>
				<img src={image} alt={vehicleTitle(property)} />
				<span className={`status-pill ${String(property?.vehicleStatus ?? '').toLowerCase()}`}>
					{formatStatusLabel(property?.vehicleStatus)}
				</span>
			</div>

			<Stack className={'card-body'}>
				<Typography className="title" onClick={goToDetail}>
					{vehicleTitle(property)}
				</Typography>

				<div className={'meta-row'}>
					<PlaceOutlinedIcon />
					<Typography className="address">{property.vehicleLocation}</Typography>
				</div>

				<div className={'spec-row'}>
					{specs.map((spec) => (
						<span key={`${property._id}-${spec}`}>{spec}</span>
					))}
				</div>

				<div className={'stock-price-row'}>
					<div className={'supporting-pill'}>
						<LocalOfferOutlinedIcon />
						<Typography>{vehicleStockLabel(property)}</Typography>
					</div>
					<Typography className="price">${formatterStr(property.vehiclePrice)}</Typography>
				</div>
			</Stack>

			<Stack className={'card-footer'}>
				<div className={'footer-stats'}>
					<div className={'stat'}>
						<EventOutlinedIcon />
						<Typography>{moment(property.createdAt).format('DD MMM YYYY')}</Typography>
					</div>
					<div className={'stat'}>
						<RemoveRedEyeOutlinedIcon />
						<Typography>{property.vehicleViews}</Typography>
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
		</Stack>
	);
};

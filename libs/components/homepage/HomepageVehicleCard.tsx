import React from 'react';
import Link from 'next/link';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { REACT_APP_API_URL, topPropertyRank } from '../../config';
import { Vehicle } from '../../types/vehicle/vehicle';
import { formatterStr } from '../../utils';
import { vehicleSpecs, vehicleStockLabel, vehicleTitle } from '../../vehicle';

interface HomepageVehicleCardProps {
	property: Vehicle;
	likePropertyHandler?: any;
}

const formatStatusLabel = (status?: string) => {
	if (!status) return 'Available';
	return status.replace(/_/g, ' ');
};

const HomepageVehicleCard = ({ property, likePropertyHandler }: HomepageVehicleCardProps) => {
	const user = useReactiveVar(userVar);
	const imagePath = property?.vehicleImages?.[0]
		? `${REACT_APP_API_URL}/${property.vehicleImages[0]}`
		: '/img/banner/header1.svg';
	const specs = vehicleSpecs(property).slice(0, 3);

	return (
		<div className={'homepage-vehicle-card'}>
			<div className={'card-media'}>
				<Link
					href={{
						pathname: '/vehicle/detail',
						query: { id: property?._id },
					}}
				>
					<img src={imagePath} alt={vehicleTitle(property)} />
				</Link>

				<div className={'card-badges'}>
					{property?.vehicleRank >= topPropertyRank && <span className={'badge badge-top'}>Top ranked</span>}
					<span className={'badge badge-brand'}>{property?.vehicleBrand}</span>
				</div>

				<div className={'price-chip'}>
					<span>${formatterStr(property?.vehiclePrice)}</span>
				</div>
			</div>

			<div className={'card-body'}>
				<div className={'card-copy'}>
					<Link
						href={{
							pathname: '/vehicle/detail',
							query: { id: property?._id },
						}}
					>
						<span className={'vehicle-title'}>{vehicleTitle(property)}</span>
					</Link>
					<div className={'meta-row'}>
						<span className={'vehicle-location'}>{property?.vehicleLocation}</span>
						<span className={`status-pill ${String(property?.vehicleStatus ?? '').toLowerCase()}`}>
							{formatStatusLabel(property?.vehicleStatus)}
						</span>
					</div>
				</div>

				<div className={'spec-list'}>
					{specs.map((spec) => (
						<span className={'spec-chip'} key={`${property?._id}-${spec}`}>
							{spec}
						</span>
					))}
				</div>

				<div className={'card-footer'}>
					<div className={'inventory-meta'}>
						<span className={'stock-copy'}>{vehicleStockLabel(property)}</span>
						<span className={'dealer-copy'}>Santa verified listing</span>
					</div>

					<div className={'engagement'}>
						<div className={'metric'}>
							<RemoveRedEyeOutlinedIcon />
							<span>{property?.vehicleViews ?? 0}</span>
						</div>
						<button
							type="button"
							className={'like-button'}
							disabled={!likePropertyHandler}
							onClick={() => likePropertyHandler?.(user, property?._id)}
						>
							{property?.meLiked?.[0]?.myFavorite ? <FavoriteIcon color={'primary'} /> : <FavoriteBorderIcon />}
						</button>
						<span className={'likes-count'}>{property?.vehicleLikes ?? 0}</span>
					</div>
				</div>
			</div>
		</div>
	);
};

export default HomepageVehicleCard;

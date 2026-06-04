import React from 'react';
import { Stack, Typography, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { Vehicle } from '../../types/vehicle/vehicle';
import Link from 'next/link';
import { formatterStr } from '../../utils';
import { REACT_APP_API_URL, topPropertyRank } from '../../config';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import IconButton from '@mui/material/IconButton';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { vehicleSpecs, vehicleStockLabel, vehicleTitle } from '../../vehicle';

interface PropertyCardType {
	property: Vehicle;
	likePropertyHandler?: any;
	myFavorites?: boolean; 
	recentlyVisited?: boolean;
}

const PropertyCard = (props: PropertyCardType) => {
	const { property, likePropertyHandler, myFavorites, recentlyVisited } = props;
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const imagePath: string = property?.vehicleImages[0]
		? `${REACT_APP_API_URL}/${property?.vehicleImages[0]}`
		: '/img/banner/header1.svg';
	const specs = vehicleSpecs(property);

	if (device === 'mobile') {
		return <div>VEHICLE CARD</div>;
	} else {
		return (
			<Stack className="card-config">
				<Stack className="top">
					<Link
						href={{
							pathname: '/vehicle/detail',
							query: { id: property?._id },
						}}
					>
						<img src={imagePath} alt="" />
					</Link>
					{property && property?.vehicleRank >= topPropertyRank && (
						<Box component={'div'} className={'top-badge'}>
							<img src="/img/icons/electricity.svg" alt="" />
							<Typography>TOP</Typography>
						</Box>
					)}
					<Box component={'div'} className={'price-box'}>
						<Typography>${formatterStr(property?.vehiclePrice)}</Typography>
					</Box>
				</Stack>
				<Stack className="bottom">
					<Stack className="name-address">
						<Stack className="name">
							<Link
								href={{
									pathname: '/vehicle/detail',
									query: { id: property?._id },
								}}
							>
								<Typography>{vehicleTitle(property)}</Typography>
							</Link>
						</Stack>
						<Stack className="address">
							<Typography>{property.vehicleLocation}</Typography>
						</Stack>
					</Stack>
					<Stack className="options">
						{specs.slice(0, 3).map((spec) => (
							<Stack className="option" key={spec}>
								<Typography>{spec}</Typography>
							</Stack>
						))}
					</Stack>
					<Stack className="divider"></Stack>
					<Stack className="type-buttons">
						<Stack className="type">
							<Typography sx={{ fontWeight: 500, fontSize: '13px' }}>{property.vehicleStatus}</Typography>
							<Typography sx={{ fontWeight: 500, fontSize: '13px' }}>{vehicleStockLabel(property)}</Typography>
						</Stack>
						{!recentlyVisited && (
							<Stack className="buttons">
								<IconButton color={'default'}>
									<RemoveRedEyeIcon />
								</IconButton>
								<Typography className="view-cnt">{property?.vehicleViews}</Typography>
								<IconButton color={'default'} onClick={() => likePropertyHandler?.(user, property?._id)}>
									{myFavorites ? (
										<FavoriteIcon color="primary" />
									) : property?.meLiked && property?.meLiked[0]?.myFavorite ? (
										<FavoriteIcon color="primary" />
									) : (
										<FavoriteBorderIcon />
									)}
								</IconButton>
								<Typography className="view-cnt">{property?.vehicleLikes}</Typography>
							</Stack>
						)}
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default PropertyCard;

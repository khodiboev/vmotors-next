import React from 'react';
import { Stack, Box, Divider, Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { Vehicle } from '../../types/vehicle/vehicle';
import { REACT_APP_API_URL, topPropertyRank } from '../../config';
import { formatterStr } from '../../utils';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { useRouter } from 'next/router';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { vehicleSpecs, vehicleStockLabel, vehicleTitle } from '../../vehicle';

interface PropertyBigCardProps {
	property: Vehicle;
	likePropertyHandler: any;
}

const PropertyBigCard = (props: PropertyBigCardProps) => {
	const { property, likePropertyHandler } = props;
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const router = useRouter();

	/** HANDLERS **/
	const goPropertyDetatilPage = (propertyId: string) => {
		router.push(`/vehicle/detail?id=${propertyId}`);
	};
	const specs = vehicleSpecs(property);

	if (device === 'mobile') {
		return <div>VEHICLE BIG CARD</div>;
	} else {
		return (
			<Stack className="property-big-card-box" onClick={() => goPropertyDetatilPage(property?._id)}>
				<Box
					component={'div'}
					className={'card-img'}
					style={{ backgroundImage: `url(${REACT_APP_API_URL}/${property?.vehicleImages?.[0]})` }}
				>
					{property && property?.vehicleRank >= topPropertyRank && (
						<div className={'status'}>
							<img src="/img/icons/electricity.svg" alt="" />
							<span>top</span>
						</div>
					)}

					<div className={'price'}>${formatterStr(property?.vehiclePrice)}</div>
				</Box>
				<Box component={'div'} className={'info'}>
					<strong className={'title'}>{vehicleTitle(property)}</strong>
					<p className={'desc'}>{property?.vehicleLocation}</p>
					<div className={'options'}>
						{specs.slice(0, 3).map((spec) => (
							<div key={spec}>
								<span>{spec}</span>
							</div>
						))}
					</div>
					<Divider sx={{ mt: '15px', mb: '17px' }} />
					<div className={'bott'}>
						<div>
							<p>{property?.vehicleStatus}</p>
							<p>{vehicleStockLabel(property)}</p>
						</div>
						<div className="buttons-box">
							<IconButton color={'default'}>
								<RemoveRedEyeIcon />
							</IconButton>
							<Typography className="view-cnt">{property?.vehicleViews}</Typography>
							<IconButton
								color={'default'}
								onClick={(e) => {
									e.stopPropagation();
									likePropertyHandler(user, property._id);
								}}
							>
								{property?.meLiked && property?.meLiked[0]?.myFavorite ? (
									<FavoriteIcon style={{ color: 'red' }} />
								) : (
									<FavoriteIcon />
								)}
							</IconButton>
							<Typography className="view-cnt">{property?.vehicleLikes}</Typography>
						</div>
					</div>
				</Box>
			</Stack>
		);
	}
};

export default PropertyBigCard;

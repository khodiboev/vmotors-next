import React from 'react';
import FavoriteIcon from '@mui/icons-material/Favorite';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { useReactiveVar } from '@apollo/client';
import { useRouter } from 'next/router';
import { Vehicle } from '../../types/vehicle/vehicle';
import { REACT_APP_API_URL, topPropertyRank } from '../../config';
import { formatterStr } from '../../utils';
import { userVar } from '../../../apollo/store';
import { vehicleSpecs, vehicleStockLabel, vehicleTitle } from '../../vehicle';

interface PropertyBigCardProps {
	property: Vehicle;
	likePropertyHandler?: any;
}

const PropertyBigCard = (props: PropertyBigCardProps) => {
	const { property, likePropertyHandler } = props;
	const user = useReactiveVar(userVar);
	const router = useRouter();
	const specs = vehicleSpecs(property);

	const goPropertyDetailPage = (propertyId: string) => {
		router.push(`/vehicle/detail?id=${propertyId}`);
	};

	return (
		<article className="dealer-vehicle-card" onClick={() => goPropertyDetailPage(property?._id)}>
			<div className="card-media">
				<div
					className="card-media-inner"
					style={{
						backgroundImage: property?.vehicleImages?.[0]
							? `url(${REACT_APP_API_URL}/${property.vehicleImages[0]})`
							: 'none',
					}}
				/>
				<div className="card-badges">
					{property?.vehicleRank >= topPropertyRank && (
						<span className="badge badge-top">Top</span>
					)}
					{(property as any)?.vehicleBrand && (
						<span className="badge badge-brand">{(property as any).vehicleBrand}</span>
					)}
				</div>
				<div className="price-chip">${formatterStr(property?.vehiclePrice)}</div>
			</div>
			<div className="card-body">
				<div className="card-copy">
					<h3 className="vehicle-title">{vehicleTitle(property)}</h3>
					<div className="meta-row">
						<span className="vehicle-location">{property?.vehicleLocation}</span>
						{property?.vehicleStatus && (
							<span className="status-pill">{property.vehicleStatus}</span>
						)}
					</div>
				</div>
				{specs.length > 0 && (
					<div className="spec-list">
						{specs.slice(0, 3).map((spec) => (
							<span key={spec} className="spec-chip">{spec}</span>
						))}
					</div>
				)}
				<div className="card-footer">
					<span className="stock-info">{vehicleStockLabel(property)}</span>
					<div className="engagement">
						<span className="metric">
							<RemoveRedEyeIcon />
							{property?.vehicleViews}
						</span>
						{likePropertyHandler && (
							<button
								type="button"
								className={`like-btn${property?.meLiked?.[0]?.myFavorite ? ' liked' : ''}`}
								onClick={(e) => {
									e.stopPropagation();
									likePropertyHandler(user, property._id);
								}}
								aria-label={'Like vehicle'}
							>
								<FavoriteIcon />
								{property?.vehicleLikes}
							</button>
						)}
					</div>
				</div>
			</div>
		</article>
	);
};

export default PropertyBigCard;

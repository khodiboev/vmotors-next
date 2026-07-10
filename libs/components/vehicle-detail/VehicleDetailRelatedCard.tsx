import React, { useRef } from 'react';
import Link from 'next/link';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { REACT_APP_API_URL, topPropertyRank } from '../../config';
import { Vehicle } from '../../types/vehicle/vehicle';
import { formatterStr } from '../../utils';
import { vehicleSpecs, vehicleStockLabel, vehicleTitle } from '../../vehicle';

interface VehicleDetailRelatedCardProps {
	vehicle: Vehicle;
	likeVehicleHandler?: any;
}

const formatStatusLabel = (status?: string) => {
	if (!status) return 'Available';
	return status.replace(/_/g, ' ');
};

const VehicleDetailRelatedCard = ({ vehicle, likeVehicleHandler }: VehicleDetailRelatedCardProps) => {
	const user = useReactiveVar(userVar);

	// Like state is derived straight from props. The parent page owns the optimistic
	// override (merged into this vehicle before it reaches us) so it survives this
	// card remounting when the related-vehicles list reshuffles after a refetch.
	const liked = !!vehicle?.meLiked?.[0]?.myFavorite;
	const likes = vehicle?.vehicleLikes ?? 0;

	// Guards against a double-fire (double-click, dev-mode double-invocation) sending
	// two toggle mutations back to back, which would like-then-unlike and cancel out.
	const pendingRef = useRef(false);

	const likeClickHandler = async () => {
		if (!likeVehicleHandler || pendingRef.current) return;
		pendingRef.current = true;
		await likeVehicleHandler(user, vehicle?._id, liked ? 'Like removed' : 'Vehicle liked');
		pendingRef.current = false;
	};

	const imagePath = vehicle?.vehicleImages?.[0]
		? `${REACT_APP_API_URL}/${vehicle.vehicleImages[0]}`
		: '/img/banner/header1.svg';
	const specs = vehicleSpecs(vehicle).slice(0, 3);
	const dealerName = vehicle?.memberData?.memberFullName ?? vehicle?.memberData?.memberNick;

	return (
		<article className={'vehicle-detail-related-card'}>
			<div className={'card-media'}>
				<Link
					href={{
						pathname: '/vehicle/detail',
						query: { id: vehicle?._id },
					}}
				>
					<img src={imagePath} alt={vehicleTitle(vehicle)} />
				</Link>

				<div className={'media-topline'}>
					{vehicle?.vehicleRank >= topPropertyRank && <span className={'media-badge featured'}>Top ranked</span>}
					<span className={'media-badge brand'}>{vehicle?.vehicleBrand}</span>
				</div>

				<div className={'price-chip'}>
					<span>${formatterStr(vehicle?.vehiclePrice)}</span>
				</div>
			</div>

			<div className={'card-body'}>
				<div className={'title-row'}>
					<div className={'title-copy'}>
						<Link
							href={{
								pathname: '/vehicle/detail',
								query: { id: vehicle?._id },
							}}
						>
							<span className={'vehicle-title'}>{vehicleTitle(vehicle)}</span>
						</Link>
						<div className={'location-row'}>
							<PlaceOutlinedIcon />
							<span>{vehicle?.vehicleLocation}</span>
						</div>
					</div>
					<span className={`status-pill ${String(vehicle?.vehicleStatus ?? '').toLowerCase()}`}>
						{formatStatusLabel(vehicle?.vehicleStatus)}
					</span>
				</div>

				<div className={'spec-row'}>
					{specs.map((spec) => (
						<span className={'spec-pill'} key={`${vehicle?._id}-${spec}`}>
							{spec}
						</span>
					))}
				</div>

				<div className={'stock-row'}>
					<LocalOfferOutlinedIcon />
					<span>{vehicleStockLabel(vehicle)}</span>
				</div>

				<div className={'card-footer'}>
					<div className={'dealer-copy'}>
						<strong>{dealerName || 'Santa market listing'}</strong>
						<span>{vehicle?.memberData?.memberAddress || 'Curated new-car inventory'}</span>
					</div>

					<div className={'engagement-box'}>
						<div className={'metric'}>
							<RemoveRedEyeOutlinedIcon />
							<span>{vehicle?.vehicleViews ?? 0}</span>
						</div>
						<button
							type="button"
							className={'like-button'}
							onClick={likeClickHandler}
							disabled={!likeVehicleHandler}
							aria-label={'Like vehicle'}
						>
							{liked ? <FavoriteIcon sx={{ color: '#e92c28' }} /> : <FavoriteBorderIcon />}
						</button>
						<span className={'metric-count'}>{likes}</span>
					</div>
				</div>
			</div>
		</article>
	);
};

export default VehicleDetailRelatedCard;

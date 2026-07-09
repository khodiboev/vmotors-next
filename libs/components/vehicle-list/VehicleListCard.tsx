import React, { useEffect, useState } from 'react';
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

interface VehicleListCardProps {
	vehicle: Vehicle;
	likeVehicleHandler?: any;
}

const formatStatusLabel = (status?: string) => {
	if (!status) return 'Available';
	return status.replace(/_/g, ' ');
};

const VehicleListCard = ({ vehicle, likeVehicleHandler }: VehicleListCardProps) => {
	const user = useReactiveVar(userVar);
	const likedFromServer = !!vehicle?.meLiked?.[0]?.myFavorite;
	const likesFromServer = vehicle?.vehicleLikes ?? 0;
	// Optimistic like state: toggled immediately on click, cleared when fresh server data arrives
	const [optimistic, setOptimistic] = useState<{ liked: boolean; likes: number } | null>(null);

	useEffect(() => {
		setOptimistic(null);
	}, [likedFromServer, likesFromServer]);

	const liked = optimistic?.liked ?? likedFromServer;
	const likes = optimistic?.likes ?? likesFromServer;

	const likeClickHandler = async () => {
		if (!likeVehicleHandler) return;
		setOptimistic({ liked: !liked, likes: Math.max(0, likes + (liked ? -1 : 1)) });
		const ok = await likeVehicleHandler(user, vehicle?._id, liked ? 'Like removed' : 'Vehicle liked');
		if (ok === false) setOptimistic(null);
	};

	const imagePath = vehicle?.vehicleImages?.[0]
		? `${REACT_APP_API_URL}/${vehicle.vehicleImages[0]}`
		: '/img/banner/header1.svg';
	const specs = vehicleSpecs(vehicle).slice(0, 3);
	const dealerName = vehicle.memberData?.memberFullName ?? vehicle.memberData?.memberNick;
	const dealerImage = vehicle.memberData?.memberImage
		? `${REACT_APP_API_URL}/${vehicle.memberData.memberImage}`
		: '/img/profile/defaultUser.svg';

	return (
		<article className={'vehicle-list-card'}>
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
				<div className={'title-copy'}>
					<Link
						href={{
							pathname: '/vehicle/detail',
							query: { id: vehicle?._id },
						}}
					>
						<span className={'vehicle-title'}>{vehicleTitle(vehicle)}</span>
					</Link>
					<div className={'meta-row'}>
						<div className={'location-row'}>
							<PlaceOutlinedIcon />
							<span>{vehicle?.vehicleLocation}</span>
						</div>
						<span className={`status-pill ${String(vehicle?.vehicleStatus ?? '').toLowerCase()}`}>
							{formatStatusLabel(vehicle?.vehicleStatus)}
						</span>
					</div>
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
					{dealerName ? (
						<Link
							href={{
								pathname: '/agent/detail',
								query: { agentId: vehicle?.memberData?._id ?? vehicle?.memberId },
							}}
						>
							<div className={'dealer-box'}>
								<img src={dealerImage} alt={dealerName} />
								<div>
									<strong>{dealerName}</strong>
									<span>{vehicle.memberData?.memberAddress || 'Santa verified dealer'}</span>
								</div>
							</div>
						</Link>
					) : (
						<div className={'dealer-box placeholder'}>
							<div>
								<strong>Santa market listing</strong>
								<span>Curated new-car inventory</span>
							</div>
						</div>
					)}

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

export default VehicleListCard;

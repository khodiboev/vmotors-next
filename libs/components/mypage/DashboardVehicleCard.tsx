import React from 'react';
import Link from 'next/link';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import BookmarkAddedRoundedIcon from '@mui/icons-material/BookmarkAddedRounded';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { REACT_APP_API_URL, topPropertyRank } from '../../config';
import { Vehicle } from '../../types/vehicle/vehicle';
import { formatterStr } from '../../utils';
import { vehicleSpecs, vehicleStockLabel, vehicleTitle } from '../../vehicle';

interface DashboardVehicleCardProps {
	vehicle: Vehicle;
	contextLabel: 'Favorite' | 'Recently viewed';
	likeVehicleHandler?: any;
}

const formatStatusLabel = (status?: string) => {
	if (!status) return 'Available';
	return status.replace(/_/g, ' ');
};

const DashboardVehicleCard = ({ vehicle, contextLabel, likeVehicleHandler }: DashboardVehicleCardProps) => {
	const user = useReactiveVar(userVar);
	const imagePath = vehicle?.vehicleImages?.[0]
		? `${REACT_APP_API_URL}/${vehicle.vehicleImages[0]}`
		: '/img/banner/header1.svg';
	const dealerName = vehicle?.memberData?.memberFullName ?? vehicle?.memberData?.memberNick;
	const dealerImage = vehicle?.memberData?.memberImage
		? `${REACT_APP_API_URL}/${vehicle.memberData.memberImage}`
		: '/img/profile/defaultUser.svg';
	const specs = vehicleSpecs(vehicle).slice(0, 3);

	return (
		<article className={'dashboard-vehicle-card'}>
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

				<div className={'media-context-pill'}>
					{contextLabel === 'Favorite' ? <BookmarkAddedRoundedIcon /> : <HistoryRoundedIcon />}
					<span>{contextLabel}</span>
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
									<span>{vehicle?.memberData?.memberAddress || 'Santa verified dealer'}</span>
								</div>
							</div>
						</Link>
					) : (
						<div className={'dealer-box placeholder'}>
							<div>
								<strong>Santa market listing</strong>
								<span>Curated Hyundai and Kia inventory</span>
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
							onClick={() => likeVehicleHandler?.(user, vehicle?._id)}
							disabled={!likeVehicleHandler}
							aria-label={'Like vehicle'}
						>
							{vehicle?.meLiked?.[0]?.myFavorite ? <FavoriteIcon color={'primary'} /> : <FavoriteBorderIcon />}
						</button>
						<span className={'metric-count'}>{vehicle?.vehicleLikes ?? 0}</span>
					</div>
				</div>
			</div>
		</article>
	);
};

export const DashboardVehicleCardSkeleton = () => {
	return (
		<div className={'dashboard-vehicle-card skeleton'}>
			<div className={'card-media'} />
			<div className={'card-body'}>
				<div className={'skeleton-line large'} />
				<div className={'skeleton-line medium'} />
				<div className={'skeleton-pill-row'}>
					<span />
					<span />
					<span />
				</div>
				<div className={'skeleton-line short'} />
				<div className={'skeleton-footer'}>
					<div className={'dealer-skeleton'}>
						<i />
						<div>
							<span />
							<span />
						</div>
					</div>
					<div className={'metric-skeleton'}>
						<span />
						<span />
					</div>
				</div>
			</div>
		</div>
	);
};

export default DashboardVehicleCard;

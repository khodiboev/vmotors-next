import React from 'react';
import Link from 'next/link';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import DirectionsCarFilledOutlinedIcon from '@mui/icons-material/DirectionsCarFilledOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import CallOutlinedIcon from '@mui/icons-material/CallOutlined';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { REACT_APP_API_URL } from '../../config';
import { Member } from '../../types/member/member';

interface DealerDirectoryCardProps {
	agent: Member;
	likeMemberHandler?: any;
}

const DealerDirectoryCard = ({ agent, likeMemberHandler }: DealerDirectoryCardProps) => {
	const user = useReactiveVar(userVar);
	const imagePath = agent?.memberImage ? `${REACT_APP_API_URL}/${agent.memberImage}` : '/img/profile/defaultUser.svg';
	const dealerName = agent?.memberFullName ?? agent?.memberNick;

	return (
		<article className={'dealer-directory-card'}>
			<div className={'dealer-card-top'}>
				<Link
					href={{
						pathname: '/agent/detail',
						query: { agentId: agent?._id },
					}}
				>
					<div className={'dealer-avatar-wrap'}>
						<img src={imagePath} alt={dealerName} className={'dealer-avatar'} />
					</div>
				</Link>

				<div className={'dealer-identity'}>
					<div className={'dealer-badges'}>
						<span className={'badge verified'}>
							<WorkspacePremiumOutlinedIcon />
							VMotors partner
						</span>
						<span className={'badge inventory'}>
							<DirectionsCarFilledOutlinedIcon />
							{agent?.memberVehicles ?? 0} vehicles
						</span>
					</div>

					<Link
						href={{
							pathname: '/agent/detail',
							query: { agentId: agent?._id },
						}}
					>
						<strong>{dealerName}</strong>
					</Link>
					<span className={'dealer-role'}>{agent?.memberNick && agent?.memberFullName ? agent.memberNick : 'Trusted dealer'}</span>
				</div>
			</div>

			<p className={'dealer-summary'}>
				{agent?.memberDesc || 'Premium Hyundai and Kia inventory support with a cleaner, more trusted buying experience.'}
			</p>

			<div className={'dealer-meta'}>
				{agent?.memberAddress && (
					<div className={'meta-row'}>
						<PlaceOutlinedIcon />
						<span>{agent.memberAddress}</span>
					</div>
				)}
				{agent?.memberPhone && (
					<div className={'meta-row'}>
						<CallOutlinedIcon />
						<span>{agent.memberPhone}</span>
					</div>
				)}
			</div>

			<div className={'dealer-stats'}>
				<div className={'stat-box'}>
					<span className={'stat-value'}>{agent?.memberVehicles ?? 0}</span>
					<span className={'stat-label'}>Inventory</span>
				</div>
				<div className={'stat-box'}>
					<span className={'stat-value'}>{agent?.memberViews ?? 0}</span>
					<span className={'stat-label'}>Views</span>
				</div>
				<div className={'stat-box'}>
					<span className={'stat-value'}>{agent?.memberRank ?? 0}</span>
					<span className={'stat-label'}>Rank</span>
				</div>
			</div>

			<div className={'dealer-card-footer'}>
				<Link
					href={{
						pathname: '/agent/detail',
						query: { agentId: agent?._id },
					}}
				>
					<span className={'explore-link'}>View dealer profile</span>
				</Link>

				<div className={'engagement-box'}>
					<div className={'metric'}>
						<RemoveRedEyeOutlinedIcon />
						<span>{agent?.memberViews ?? 0}</span>
					</div>
					<button
						type="button"
						className={'like-button'}
						onClick={() => likeMemberHandler?.(user, agent?._id)}
						aria-label={'Like dealer'}
					>
						{agent?.meLiked?.[0]?.myFavorite ? <FavoriteIcon color={'primary'} /> : <FavoriteBorderIcon />}
					</button>
					<span className={'metric-count'}>{agent?.memberLikes ?? 0}</span>
				</div>
			</div>
		</article>
	);
};

export default DealerDirectoryCard;

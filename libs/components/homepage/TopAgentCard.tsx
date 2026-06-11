import React from 'react';
import Link from 'next/link';
import { Member } from '../../types/member/member';
import { REACT_APP_API_URL } from '../../config';

interface TopAgentProps {
	agent: Member;
}

const DEFAULT_SUPPORT_LINE = 'Premium Hyundai & Kia inventory support.';

const getAgentSupportLine = (description?: string) => {
	const normalized = description?.replace(/\s+/g, ' ').trim();
	if (!normalized) return DEFAULT_SUPPORT_LINE;

	const wordCount = normalized.split(' ').length;
	const looksTooShort = normalized.length < 24;
	const looksLikeLocation = !/[.!?]/.test(normalized) && wordCount <= 3;

	return looksTooShort || looksLikeLocation ? DEFAULT_SUPPORT_LINE : normalized;
};

const TopAgentCard = (props: TopAgentProps) => {
	const { agent } = props;
	const agentName = agent?.memberFullName ?? agent?.memberNick;
	const agentImage = agent?.memberImage
		? `${REACT_APP_API_URL}/${agent?.memberImage}`
		: '/img/profile/defaultUser.svg';
	const supportLine = getAgentSupportLine(agent?.memberDesc);

	return (
		<div className="top-agent-card">
			<div className={'agent-avatar'}>
				<img src={agentImage} alt={agentName} />
			</div>

			<div className={'agent-copy'}>
				<span className={'agent-role'}>TRUSTED DEALER</span>
				<strong>{agentName}</strong>
				<p>{supportLine}</p>
			</div>

			<div className={'agent-stats'}>
				<div className={'stat-item'}>
					<span className={'stat-value'}>{agent?.memberVehicles ?? 0}</span>
					<span className={'stat-label'}>VEHICLES</span>
				</div>
				<div className={'stat-item'}>
					<span className={'stat-value'}>#{agent?.memberRank ?? 0}</span>
					<span className={'stat-label'}>RANK</span>
				</div>
			</div>

			<Link
				href={{
					pathname: '/agent/detail',
					query: { agentId: agent?._id },
				}}
				className={'agent-link'}
			>
				VIEW DEALER
			</Link>
		</div>
	);
};

export default TopAgentCard;

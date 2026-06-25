import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Member } from '../../types/member/member';

interface MemberMenuProps {
	member: Member | null;
}

const MemberMenu = ({ member }: MemberMenuProps) => {
	const router = useRouter();
	const category = router.query?.category as string;

	const navItems: { key: string; label: string; count: number }[] = [];

	if ((member as any)?.memberType === 'AGENT') {
		navItems.push({ key: 'vehicles', label: 'Vehicles', count: (member as any)?.memberVehicles ?? 0 });
	}
	navItems.push(
		{ key: 'followers', label: 'Followers', count: (member as any)?.memberFollowers ?? 0 },
		{ key: 'followings', label: 'Following', count: (member as any)?.memberFollowings ?? 0 },
		{ key: 'articles', label: 'Articles', count: (member as any)?.memberArticles ?? 0 },
	);

	return (
		<nav className="member-nav-card">
			<ul className="nav-list">
				{navItems.map(({ key, label, count }) => (
					<li key={key}>
						<Link
							href={{ pathname: '/member', query: { ...router.query, category: key } }}
							scroll={false}
						>
							<div className={`nav-item${category === key ? ' active' : ''}`}>
								<span className="nav-label">{label}</span>
								<span className="nav-count">{count}</span>
							</div>
						</Link>
					</li>
				))}
			</ul>
		</nav>
	);
};

export default MemberMenu;

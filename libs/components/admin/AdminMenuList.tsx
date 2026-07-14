import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import DirectionsCarFilledOutlinedIcon from '@mui/icons-material/DirectionsCarFilledOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';

const MENU_SECTIONS = [
	{
		label: 'Marketplace',
		items: [
			{ title: 'Members', url: '/_admin/users', icon: <GroupOutlinedIcon /> },
			{ title: 'Vehicles', url: '/_admin/vehicles', icon: <DirectionsCarFilledOutlinedIcon /> },
			{ title: 'Community', url: '/_admin/community', icon: <ForumOutlinedIcon /> },
		],
	},
	{
		label: 'Customer Support',
		items: [
			{ title: 'FAQ', url: '/_admin/cs/faq', icon: <QuizOutlinedIcon /> },
			{ title: 'Notices', url: '/_admin/cs/notice', icon: <CampaignOutlinedIcon /> },
		],
	},
];

const AdminMenuList = () => {
	const router = useRouter();

	return (
		<nav className={'admin-menu'}>
			{MENU_SECTIONS.map((section) => (
				<div className={'menu-section'} key={section.label}>
					<span className={'section-label'}>{section.label}</span>
					{section.items.map((item) => {
						const active = router.pathname.startsWith(item.url);
						return (
							<Link href={item.url} key={item.url} className={`menu-item ${active ? 'active' : ''}`}>
								{item.icon}
								<span>{item.title}</span>
							</Link>
						);
					})}
				</div>
			))}
		</nav>
	);
};

export default AdminMenuList;

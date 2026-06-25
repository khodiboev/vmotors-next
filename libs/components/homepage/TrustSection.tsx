import React from 'react';
import { Stack, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import VerifiedIcon from '@mui/icons-material/Verified';
import SearchIcon from '@mui/icons-material/Search';
import HandshakeIcon from '@mui/icons-material/Handshake';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';

interface TrustItem {
	icon: React.ReactNode;
	title: string;
	description: string;
}

const trustItems: TrustItem[] = [
	{
		icon: <VerifiedIcon />,
		title: 'Verified Inventory',
		description: 'Every vehicle listing is reviewed before it appears on Santa, keeping the shopping experience cleaner and more trustworthy.',
	},
	{
		icon: <DirectionsCarIcon />,
		title: 'Hyundai & Kia Focused',
		description: 'A tighter catalog means clearer decisions for buyers comparing Korea’s most trusted mainstream brands.',
	},
	{
		icon: <SearchIcon />,
		title: 'Smarter Search Flow',
		description: 'Brand, fuel, and transmission filters stay front and center so high-intent buyers move faster.',
	},
	{
		icon: <HandshakeIcon />,
		title: 'Trusted Dealer Support',
		description: 'Connect directly with certified dealers who can guide you from shortlist to delivery-ready conversation.',
	},
];

const TrustSection = () => {
	const device = useDeviceDetect();

	if (device === 'mobile') {
		return (
			<Stack className={'trust-section'}>
				<Stack className={'container'}>
					<Stack className={'info-box'}>
						<Box component={'div'} className={'left'}>
							<span className={'white'}>Built for confident buyers</span>
							<p className={'white'}>A more trusted way to browse Korea’s Hyundai and Kia market.</p>
						</Box>
					</Stack>
					<Stack className={'trust-grid'}>
						{trustItems.map((item) => (
							<Box component={'div'} className={'trust-card'} key={item.title}>
								<div className={'trust-icon'}>{item.icon}</div>
								<strong>{item.title}</strong>
							</Box>
						))}
					</Stack>
				</Stack>
			</Stack>
		);
	}

	return (
		<Stack className={'trust-section'}>
			<Stack className={'container'}>
				<Stack className={'info-box'}>
					<Box component={'div'} className={'left'}>
						<span className={'white'}>Built for confident buyers</span>
						<p className={'white'}>A more trusted way to browse Korea’s Hyundai and Kia market.</p>
					</Box>
				</Stack>
				<Stack className={'trust-grid'}>
					{trustItems.map((item) => (
						<Box component={'div'} className={'trust-card'} key={item.title}>
							<div className={'trust-icon'}>{item.icon}</div>
							<strong>{item.title}</strong>
							<p>{item.description}</p>
						</Box>
					))}
				</Stack>
			</Stack>
		</Stack>
	);
};

export default TrustSection;

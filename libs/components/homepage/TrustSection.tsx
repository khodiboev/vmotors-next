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
		title: 'Verified Listings',
		description: 'Every vehicle listing is reviewed and verified by our team before going live on the platform.',
	},
	{
		icon: <DirectionsCarIcon />,
		title: 'Hyundai & Kia Certified',
		description: 'We partner exclusively with authorized Hyundai and Kia dealers across Korea.',
	},
	{
		icon: <SearchIcon />,
		title: 'Easy Online Browsing',
		description: 'Search by brand, fuel type, transmission, and more — find exactly what you need in seconds.',
	},
	{
		icon: <HandshakeIcon />,
		title: 'Dealer Support',
		description: 'Connect directly with certified dealers who are ready to guide you through your purchase.',
	},
];

const TrustSection = () => {
	const device = useDeviceDetect();

	if (device === 'mobile') {
		return (
			<Stack className={'trust-section'}>
				<Stack className={'container'}>
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
						<span className={'white'}>Why Choose VMotors</span>
						<p className={'white'}>Your trusted partner in finding the perfect vehicle</p>
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

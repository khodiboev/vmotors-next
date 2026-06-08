import React from 'react';
import { Stack, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { useRouter } from 'next/router';

const CTASection = () => {
	const device = useDeviceDetect();
	const router = useRouter();

	const handleBrowse = () => {
		router.push('/vehicle');
	};

	if (device === 'mobile') {
		return (
			<Stack className={'cta-section'}>
				<Box component={'div'} className={'cta-content'}>
					<h2>Ready to Find Your Car?</h2>
					<button className={'cta-btn'} onClick={handleBrowse}>
						Browse Vehicles
					</button>
				</Box>
			</Stack>
		);
	}

	return (
		<Stack className={'cta-section'}>
			<Box component={'div'} className={'cta-content'}>
				<span className={'cta-tag'}>Korea's Premier Car Marketplace</span>
				<h2 className={'cta-headline'}>Ready to Find Your Perfect Car?</h2>
				<p className={'cta-sub'}>
					Thousands of certified Hyundai and Kia vehicles are waiting for you.
					<br />
					Start browsing today and drive home tomorrow.
				</p>
				<div className={'cta-actions'}>
					<button className={'cta-btn primary'} onClick={handleBrowse}>
						Browse All Vehicles
					</button>
					<button className={'cta-btn secondary'} onClick={() => router.push('/agent')}>
						Find a Dealer
					</button>
				</div>
			</Box>
		</Stack>
	);
};

export default CTASection;

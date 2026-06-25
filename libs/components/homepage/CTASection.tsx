import React from 'react';
import { Stack } from '@mui/material';
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
				<Stack className={'container'}>
					<span className={'cta-tag'}>Santa Verified Search</span>
					<h2 className={'cta-headline'}>Your next Hyundai or Kia starts here.</h2>
					<p className={'cta-sub'}>
						Compare live listings, review premium details, and connect with a trusted dealer in a few taps.
					</p>
					<div className={'cta-actions'}>
						<button className={'cta-btn primary'} onClick={handleBrowse}>
							Browse Vehicles
						</button>
						<button className={'cta-btn secondary'} onClick={() => router.push('/agent')}>
							Find Dealers
						</button>
					</div>
				</Stack>
			</Stack>
		);
	}

	return (
		<Stack className={'cta-section'}>
			<Stack className={'container'}>
				<span className={'cta-tag'}>Santa Verified Search</span>
				<h2 className={'cta-headline'}>Your next Hyundai or Kia starts here.</h2>
				<p className={'cta-sub'}>
					Compare live listings, review premium details, and connect with a trusted dealer without the noise of a generic marketplace.
				</p>
				<div className={'cta-actions'}>
					<button className={'cta-btn primary'} onClick={handleBrowse}>
						Browse Vehicles
					</button>
					<button className={'cta-btn secondary'} onClick={() => router.push('/agent')}>
						Find Dealers
					</button>
				</div>
			</Stack>
		</Stack>
	);
};

export default CTASection;

import React, { useEffect } from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import Head from 'next/head';
import Top from '../Top';
import Footer from '../Footer';
import { Stack } from '@mui/material';
import HeaderFilter from '../homepage/HeaderFilter';
import { userVar } from '../../../apollo/store';
import { useReactiveVar } from '@apollo/client';
import { getJwtToken, updateUserInfo } from '../../auth';
import Chat from '../Chat';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const withLayoutMain = (Component: any) => {
	return (props: any) => {
		const device = useDeviceDetect();
		const user = useReactiveVar(userVar);

		/** LIFECYCLES **/
		useEffect(() => {
			const jwt = getJwtToken();
			if (jwt) updateUserInfo(jwt);
		}, []);

		/** HANDLERS **/

		if (device == 'mobile') {
			return (
				<>
					<Head>
						<title>VMotors</title>
						<meta name={'title'} content={`VMotors`} />
					</Head>
					<Stack id="mobile-wrap">
						<Stack id={'top'}>
							<Top />
						</Stack>

						<Stack className={'header-main mobile-home'}>
							<div className={'hero-gradient'} />
							<div className={'hero-grid'} />
							<div className={'hero-content'}>
								<span className={'hero-pill'}>VMotors Curated Marketplace</span>
								<h1 className={'hero-headline'}>Find the Hyundai or Kia that fits your next move.</h1>
								<p className={'hero-sub'}>
									Certified dealers, cleaner filters, and a modern car-buying journey built for Korea.
								</p>
								<div className={'hero-trust-row'}>
									<span>Trusted dealers</span>
									<span>Real inventory</span>
									<span>Fast search</span>
								</div>
							</div>
							<Stack className={'container'}>
								<HeaderFilter />
							</Stack>
						</Stack>

						<Stack id={'main'}>
							<Component {...props} />
						</Stack>

						<Stack id={'footer'}>
							<Footer />
						</Stack>
					</Stack>
				</>
			);
		} else {
			return (
				<>
					<Head>
						<title>VMotors</title>
						<meta name={'title'} content={`VMotors`} />
					</Head>
					<Stack id="pc-wrap">
						<Stack id={'top'}>
							<Top />
						</Stack>

						<Stack className={'header-main'}>
							<div className={'hero-gradient'} />
							<div className={'hero-grid'} />
							<div className={'hero-radial hero-radial-left'} />
							<div className={'hero-radial hero-radial-right'} />
							<div className={'hero-content'}>
								<div className={'hero-copy'}>
									<span className={'hero-pill'}>VMotors Intelligence</span>
									<h1 className={'hero-headline'}>Modern car discovery for Hyundai and Kia buyers in Korea.</h1>
									<p className={'hero-sub'}>
										Search curated inventory, compare premium listings, and connect with trusted dealers through
										a cleaner automotive marketplace experience.
									</p>
									<div className={'hero-trust-row'}>
										<span>Certified dealer network</span>
										<span>Live vehicle inventory</span>
										<span>Premium buying journey</span>
									</div>
								</div>
								<div className={'hero-side-panel'}>
									<div className={'side-eyebrow'}>Why buyers start here</div>
									<div className={'side-title'}>Greatness in simplicity</div>
									<p>
										Focused filters, premium presentation, and trustworthy dealer inventory designed for
										high-intent car shoppers.
									</p>
									<div className={'side-tags'}>
										<span>Hyundai</span>
										<span>Kia</span>
										<span>AI-ready search</span>
									</div>
								</div>
							</div>
							<Stack className={'container'}>
								<HeaderFilter />
							</Stack>
						</Stack>

						<Stack id={'main'}>
							<Component {...props} />
						</Stack>

						<Chat />

						<Stack id={'footer'}>
							<Footer />
						</Stack>
					</Stack>
				</>
			);
		}
	};
};

export default withLayoutMain;

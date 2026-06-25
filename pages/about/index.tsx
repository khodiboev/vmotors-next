import React from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Stack, Box } from '@mui/material';

const About: NextPage = () => {
	const device = useDeviceDetect();

	if (device === 'mobile') {
		return <div>ABOUT PAGE MOBILE</div>;
	} else {
		return (
			<Stack className={'about-page'}>
				<Stack className={'intro'}>
					<Stack className={'container'}>
						<Stack className={'left'}>
							<strong>Santa is building a clearer Hyundai and Kia marketplace for buyers in Korea.</strong>
						</Stack>
						<Stack className={'right'}>
							<p>
								Santa brings together premium new-car inventory, trusted dealer relationships, and a cleaner search
								experience for buyers who want more clarity before they reach out.
								<br />
								<br />
								We focus on Hyundai and Kia only, with a product experience designed to feel modern, direct, and
								easy to trust from the first search through the final shortlist.
							</p>
							<Stack className={'boxes'}>
								<div className={'box'}>
									<div>
										<img src="/img/icons/garden.svg" alt="" />
									</div>
									<span>Focused inventory</span>
									<p>Browse new Hyundai and Kia listings without the noise of a broad marketplace.</p>
								</div>
								<div className={'box'}>
									<div>
										<img src="/img/icons/securePayment.svg" alt="" />
									</div>
									<span>Trusted dealer access</span>
									<p>Connect with verified partners and review clearer listing details before you inquire.</p>
								</div>
							</Stack>
						</Stack>
					</Stack>
				</Stack>
				<Stack className={'statistics'}>
					<Stack className={'container'}>
						<Stack className={'banner'}>
							<img src="/img/banner/header1.svg" alt="" />
						</Stack>
						<Stack className={'info'}>
							<Box component={'div'}>
								<strong>4M</strong>
								<p>Award Winning</p>
							</Box>
							<Box component={'div'}>
								<strong>12K</strong>
								<p>Vehicles ready</p>
							</Box>
							<Box component={'div'}>
								<strong>20M</strong>
								<p>Happy Customer</p>
							</Box>
						</Stack>
					</Stack>
				</Stack>
				<Stack className={'agents'}>
					<Stack className={'container'}>
						<span className={'title'}>Our trusted dealers</span>
						<p className={'desc'}>A curated network built around confident Hyundai and Kia buying.</p>
						<Stack className={'wrap'}>
							{/*{[1, 2, 3, 4, 5].map(() => {*/}
							{/*	return <AgentCard />;*/}
							{/*})}*/}
						</Stack>
					</Stack>
				</Stack>
				<Stack className={'options'}>
					<img src="/img/banner/aboutBanner.svg" alt="" className={'about-banner'} />
					<Stack className={'container'}>
						<strong>Let’s find the right next vehicle for you</strong>
						<Stack>
							<div className={'icon-box'}>
								<img src="/img/icons/security.svg" alt="" />
							</div>
							<div className={'text-box'}>
								<span>Dealer-backed listings</span>
								<p>Every listing is presented with cleaner details, pricing context, and direct dealer access.</p>
							</div>
						</Stack>
						<Stack>
							<div className={'icon-box'}>
								<img src="/img/icons/keywording.svg" alt="" />
							</div>
							<div className={'text_-box'}>
								<span>Smarter search</span>
								<p>Filter by brand, fuel, transmission, and location to move from browsing to a shortlist faster.</p>
							</div>
						</Stack>
						<Stack>
							<div className={'icon-box'}>
								<img src="/img/icons/investment.svg" alt="" />
							</div>
							<div className={'text-box'}>
								<span>Buyer confidence</span>
								<p>Santa is designed to help buyers compare with confidence before opening a conversation.</p>
							</div>
						</Stack>
						<Stack className={'btn'}>
							Learn More
							<img src="/img/icons/rightup.svg" alt="" />
						</Stack>
					</Stack>
				</Stack>
				<Stack className={'partners'}>
					<Stack className={'container'}>
						<span>Trusted by buyers who value clarity</span>
						<Stack className={'wrap'}>
							<img src="/img/icons/brands/amazon.svg" alt="" />
							<img src="/img/icons/brands/amd.svg" alt="" />
							<img src="/img/icons/brands/cisco.svg" alt="" />
							<img src="/img/icons/brands/dropcam.svg" alt="" />
							<img src="/img/icons/brands/spotify.svg" alt="" />
						</Stack>
					</Stack>
				</Stack>
				<Stack className={'help'}>
					<Stack className={'container'}>
						<Box component={'div'} className={'left'}>
							<strong>Need help? Talk to our expert.</strong>
							<p>Talk to our experts or browse through more Hyundai and Kia inventory.</p>
						</Box>
						<Box component={'div'} className={'right'}>
							<div className={'white'}>
								Contact Us
								<img src="/img/icons/rightup.svg" alt="" />
							</div>
							<div className={'black'}>
								<img src="/img/icons/call.svg" alt="" />
								920 851 9087
							</div>
						</Box>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default withLayoutBasic(About);

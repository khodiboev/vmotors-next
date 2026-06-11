import React from 'react';
import Link from 'next/link';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Box, Stack } from '@mui/material';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import Notice from '../../libs/components/cs/Notice';
import Faq from '../../libs/components/cs/Faq';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';
import DirectionsCarFilledOutlinedIcon from '@mui/icons-material/DirectionsCarFilledOutlined';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const supportHighlights = [
	{
		label: 'Buyer help',
		description: 'Delivery, inventory, account, and ownership support designed for Hyundai and Kia shoppers.',
		icon: <DirectionsCarFilledOutlinedIcon />,
	},
	{
		label: 'Dealer support',
		description: 'Guidance for dealer accounts, listings, and trusted marketplace participation on VMotors.',
		icon: <WorkspacePremiumOutlinedIcon />,
	},
	{
		label: 'Platform support',
		description: 'Clear policies, notices, and FAQ guidance in a calmer support experience.',
		icon: <SupportAgentRoundedIcon />,
	},
];

const CS: NextPage = () => {
	const router = useRouter();

	const changeTabHandler = (tab: string) => {
		router.push(
			{
				pathname: '/cs',
				query: { tab },
			},
			undefined,
			{ scroll: false },
		);
	};

	const tab = String(router.query.tab ?? 'notice');

	return (
		<Stack className={'cs-page'}>
			<Stack className={'container'}>
				<section className={'support-hero'}>
					<div className={'hero-copy'}>
						<span className={'eyebrow'}>VMotors support center</span>
						<h1>Clear support for buyers, members, and dealers.</h1>
						<p>
							Find platform notices, automotive-focused FAQ guidance, and the fastest path to answers for Hyundai
							and Kia shoppers across Korea.
						</p>
						<div className={'hero-trust-row'}>
							<span>Clean support experience</span>
							<span>Buyer and dealer guidance</span>
							<span>Trusted VMotors policies</span>
						</div>
					</div>

					<div className={'hero-sidecard'}>
						<div className={'hero-count-card'}>
							<strong>{tab === 'notice' ? 'Notice' : 'FAQ'}</strong>
							<span>Current support view</span>
						</div>
						<div className={'hero-side-note'}>
							<p>Start with notices for platform updates, then move into FAQ for account, inventory, payment, and community help.</p>
							<Link href={'/community'} className={'hero-link'}>
								<span>Go to community</span>
								<KeyboardArrowRightRoundedIcon />
							</Link>
						</div>
					</div>
				</section>

				<section className={'support-highlight-grid'}>
					{supportHighlights.map((item) => (
						<article className={'support-highlight-card'} key={item.label}>
							<div className={'support-icon'}>{item.icon}</div>
							<strong>{item.label}</strong>
							<p>{item.description}</p>
						</article>
					))}
				</section>

				<Box component={'div'} className={'cs-main-info'}>
					<Box component={'div'} className={'info'}>
						<span>Support center</span>
						<p>Guidance for VMotors buyers, members, and dealers without the noise of a generic help page.</p>
					</Box>
					<Box component={'div'} className={'btns'}>
						<button
							type="button"
							className={tab === 'notice' ? 'active' : ''}
							onClick={() => {
								changeTabHandler('notice');
							}}
						>
							Notice
						</button>
						<button
							type="button"
							className={tab === 'faq' ? 'active' : ''}
							onClick={() => {
								changeTabHandler('faq');
							}}
						>
							FAQ
						</button>
					</Box>
				</Box>

				<Box component={'div'} className={'cs-content'}>
					{tab === 'notice' && <Notice />}
					{tab === 'faq' && <Faq />}
				</Box>
			</Stack>
		</Stack>
	);
};

export default withLayoutBasic(CS);

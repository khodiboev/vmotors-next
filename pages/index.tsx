import { NextPage } from 'next';
import useDeviceDetect from '../libs/hooks/useDeviceDetect';
import withLayoutMain from '../libs/components/layout/LayoutHome';
import CommunityBoards from '../libs/components/homepage/CommunityBoards';
import TopAgents from '../libs/components/homepage/TopAgents';
import TrendProperties from '../libs/components/homepage/TrendProperties';
import TopProperties from '../libs/components/homepage/TopProperties';
import { Stack } from '@mui/material';
import Advertisement from '../libs/components/homepage/Advertisement';
import BrandSection from '../libs/components/homepage/BrandSection';
import TrustSection from '../libs/components/homepage/TrustSection';
import CTASection from '../libs/components/homepage/CTASection';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const Home: NextPage = () => {
	const device = useDeviceDetect();

	if (device === 'mobile') {
		return (
			<Stack className={'home-page'}>
				<BrandSection />
				<TrendProperties />
				<TopProperties />
				<TopAgents />
				<Advertisement />
				<TrustSection />
				<CommunityBoards />
				<CTASection />
			</Stack>
		);
	} else {
		return (
			<Stack className={'home-page'}>
				<BrandSection />
				<TrendProperties />
				<TopProperties />
				<TopAgents />
				<Advertisement />
				<TrustSection />
				<CommunityBoards />
				<CTASection />
			</Stack>
		);
	}
};

export default withLayoutMain(Home);
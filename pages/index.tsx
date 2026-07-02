import { NextPage } from 'next';
import withLayoutMain from '../libs/components/layout/LayoutHome';
import CommunityBoards from '../libs/components/homepage/CommunityBoards';
import TopAgents from '../libs/components/homepage/TopAgents';
// import TrendProperties from '../libs/components/homepage/TrendProperties'; // preserved — revert by uncommenting this line and the JSX below
import NewArrivalsOrbital from '../libs/components/homepage/NewArrivalsOrbital';
// import TopProperties from '../libs/components/homepage/TopProperties'; // preserved — revert by uncommenting
import BuyerFavoritesOrbital from '../libs/components/homepage/BuyerFavoritesOrbital';
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
	return (
		<Stack className={'home-page'}>
			<BrandSection />
			<NewArrivalsOrbital /> {/* experimental orbital — to revert, restore TrendProperties import and replace this line */}
			<BuyerFavoritesOrbital /> {/* experimental orbital — to revert, restore TopProperties import and replace this line */}
			<TopAgents />
			<Advertisement />
			<TrustSection />
			<CommunityBoards />
			<CTASection />
		</Stack>
	);
};

export default withLayoutMain(Home);
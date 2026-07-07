import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import Head from 'next/head';
import Top from '../Top';
import Footer from '../Footer';
import { Stack } from '@mui/material';
import { getJwtToken, updateUserInfo } from '../../auth';
import Chat from '../Chat';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { useTranslation } from 'next-i18next';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const withLayoutBasic = (Component: any) => {
	return (props: any) => {
		const router = useRouter();
		const { t, i18n } = useTranslation('common');
		const device = useDeviceDetect();
		const [authHeader, setAuthHeader] = useState<boolean>(false);
		const user = useReactiveVar(userVar);

		const memoizedValues = useMemo(() => {
			let title = '',
				desc = '',
				heroClass = 'hero-default';

			switch (router.pathname) {
				case '/vehicle':
					title = 'Vehicle Search';
					desc = 'New Hyundai and Kia inventory';
					heroClass = 'hero-vehicles';
					break;
				case '/agent':
					title = 'Dealers';
					desc = 'Home / Vehicles';
					heroClass = 'hero-dealers';
					break;
				case '/agent/detail':
					title = 'Dealer Page';
					desc = 'Home / Vehicles';
					heroClass = 'hero-dealers';
					break;
				case '/mypage':
					title = 'my page';
					desc = 'Home / Vehicles';
					heroClass = 'hero-mypage';
					break;
				case '/community':
					title = 'Community';
					desc = 'Home / Vehicles';
					heroClass = 'hero-community';
					break;
				case '/community/detail':
					title = 'Community Detail';
					desc = 'Community / Article Detail';
					heroClass = 'hero-community';
					break;
				case '/cs':
					title = 'CS';
					desc = 'We are glad to see you again!';
					heroClass = 'hero-cs';
					break;
				case '/account/join':
					title = 'Login/Signup';
					desc = 'Authentication Process';
					heroClass = 'hero-cs';
					setAuthHeader(true);
					break;
				case '/member':
					title = 'Member Page';
					desc = 'Home / Vehicles';
					heroClass = 'hero-mypage';
					break;
				default:
					break;
			}

			return { title, desc, heroClass };
		}, [router.pathname]);

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
						<title>Santa | Premium Hyundai & Kia Marketplace</title>
						<meta name={'title'} content={`Santa | Premium Hyundai & Kia Marketplace`} />
					</Head>
					<Stack id="mobile-wrap">
						<Stack id={'top'}>
							<Top />
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
						<title>Santa | Premium Hyundai & Kia Marketplace</title>
						<meta name={'title'} content={`Santa | Premium Hyundai & Kia Marketplace`} />
					</Head>
					<Stack id="pc-wrap">
						<Stack id={'top'}>
							<Top />
						</Stack>

						<Stack className={`header-basic ${memoizedValues.heroClass} ${authHeader ? 'auth' : ''}`}>
							<div className={'hero-abstract'} aria-hidden={'true'}>
								<span className={'hero-mesh'} />
								<span className={'hero-orb orb-one'} />
								<span className={'hero-orb orb-two'} />
								<span className={'hero-streak streak-one'} />
								<span className={'hero-streak streak-two'} />
								<span className={'hero-vignette'} />
							</div>
							<Stack className={'container'}>
								<strong>{t(memoizedValues.title)}</strong>
								<span>{t(memoizedValues.desc)}</span>
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

export default withLayoutBasic;

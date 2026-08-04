import React, { useEffect, useMemo, useState } from 'react';
import { useRouter, withRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { getJwtToken, logOut, updateUserInfo } from '../auth';
import { Stack, Box } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import useDeviceDetect from '../hooks/useDeviceDetect';
import Link from 'next/link';
import NotificationsMenu from './common/NotificationsMenu';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import { Logout } from '@mui/icons-material';
import { REACT_APP_API_URL } from '../config';
import { motion, useReducedMotion } from 'framer-motion';

type JourneyItem = {
	key: string;
	label: string;
	href: string;
};

type JourneyState = 'future' | 'completed' | 'active';
type SegmentState = 'future' | 'completed' | 'active';

const JOURNEY_ITEMS: JourneyItem[] = [
	{ key: 'home', label: 'Home', href: '/' },
	{ key: 'vehicles', label: 'Vehicles', href: '/vehicle' },
	{ key: 'dealers', label: 'Dealers', href: '/agent' },
	{ key: 'community', label: 'Community', href: '/community?articleCategory=FREE' },
	{ key: 'cs', label: 'CS', href: '/cs' },
];

const DETACHED_PATHS = new Set(['/account/join', '/member', '/mypage', '/about']);

const getJourneyIndex = (pathname: string): number | null => {
	switch (pathname) {
		case '/':
			return 0;
		case '/vehicle':
		case '/vehicle/detail':
			return 1;
		case '/agent':
		case '/agent/detail':
			return 2;
		case '/community':
		case '/community/detail':
			return 3;
		case '/cs':
			return 4;
		default:
			return null;
	}
};

const isDetachedRoute = (pathname: string, journeyIndex: number | null): boolean => {
	return journeyIndex === null || DETACHED_PATHS.has(pathname) || pathname.startsWith('/_admin');
};

const getJourneyState = (itemIndex: number, currentIndex: number | null, detached: boolean): JourneyState => {
	if (detached || currentIndex === null) return 'future';
	if (itemIndex < currentIndex) return 'completed';
	if (itemIndex === currentIndex) return 'active';
	return 'future';
};

const getSegmentState = (segmentIndex: number, currentIndex: number | null, detached: boolean): SegmentState => {
	if (detached || currentIndex === null) return 'future';
	if (currentIndex === 0) return 'future';
	if (segmentIndex < currentIndex - 1) return 'completed';
	if (segmentIndex === currentIndex - 1) return 'active';
	return 'future';
};

const Top = () => {
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const { t } = useTranslation('common');
	const router = useRouter();
	const shouldReduceMotion = useReducedMotion();
	const [colorChange, setColorChange] = useState(false);
	const [logoutAnchor, setLogoutAnchor] = useState<null | HTMLElement>(null);
	const logoutOpen = Boolean(logoutAnchor);
	const pathname = router.pathname;
	const isHome = pathname === '/';
	const hasJourneyContext = pathname !== '/mypage' && pathname !== '/account/join';
	const journeyIndex = useMemo(() => getJourneyIndex(pathname), [pathname]);
	const detachedJourney = useMemo(() => isDetachedRoute(pathname, journeyIndex), [pathname, journeyIndex]);

	/** LIFECYCLES **/
	useEffect(() => {
		const jwt = getJwtToken();
		if (jwt) updateUserInfo(jwt);
	}, []);

	useEffect(() => {
		const syncNavbarColor = () => {
			setColorChange(window.scrollY >= 50);
		};

		syncNavbarColor();
		window.addEventListener('scroll', syncNavbarColor);

		return () => {
			window.removeEventListener('scroll', syncNavbarColor);
		};
	}, []);

	/** HANDLERS **/
	const renderLangToggle = (mobile = false) => (
		<div className={`lang-toggle ${mobile ? 'is-mobile' : ''}`} role="group" aria-label="Language">
			<button type="button" className="lang-option is-active" aria-pressed="true">
				ENG
			</button>
			<button type="button" className="lang-option is-disabled" aria-pressed="false" disabled title="Korean — coming soon">
				KOR
			</button>
		</div>
	);

	const renderMilestone = (item: JourneyItem, itemIndex: number, mobile = false) => {
		const state = getJourneyState(itemIndex, journeyIndex, detachedJourney);
		const milestoneClassName = [
			'journey-link',
			`is-${state}`,
			detachedJourney ? 'is-detached' : '',
			mobile ? 'is-mobile' : '',
		]
			.filter(Boolean)
			.join(' ');

		return (
			<Link
				href={item.href}
				key={`${mobile ? 'mobile' : 'desktop'}-${item.key}`}
				className={milestoneClassName}
				aria-current={!detachedJourney && state === 'active' ? 'page' : undefined}
			>
				<span className="journey-node-wrap" aria-hidden="true">
					{state === 'active' && !shouldReduceMotion ? (
						<motion.span
							key={`${item.key}-active`}
							className="journey-node"
							initial={{ scale: 0.88, opacity: 0.72 }}
							animate={{ scale: [0.94, 1.08, 1], opacity: 1 }}
							transition={{ duration: 0.72, times: [0, 0.58, 1], ease: [0.22, 1, 0.36, 1] }}
						>
							<span className="journey-node-core">{String(itemIndex + 1).padStart(2, '0')}</span>
						</motion.span>
					) : (
						<span className="journey-node">
							<span className="journey-node-core">{String(itemIndex + 1).padStart(2, '0')}</span>
						</span>
					)}
				</span>
				<span className="journey-copy">
					<span className="journey-step-index">{String(itemIndex + 1).padStart(2, '0')}</span>
					<span className="journey-label">{t(item.label)}</span>
				</span>
			</Link>
		);
	};

	const renderSegment = (segmentIndex: number, mobile = false) => {
		const state = getSegmentState(segmentIndex, journeyIndex, detachedJourney);
		const segmentClassName = [
			'journey-segment',
			`is-${state}`,
			detachedJourney ? 'is-detached' : '',
			shouldReduceMotion ? 'reduced-motion' : '',
			mobile ? 'is-mobile' : '',
		]
			.filter(Boolean)
			.join(' ');

		return (
			<div className={segmentClassName} key={`${mobile ? 'mobile' : 'desktop'}-segment-${segmentIndex}`} aria-hidden="true">
				<span className="journey-segment-base" />
				<motion.span
					className="journey-segment-fill"
					initial={false}
					animate={{ scaleX: state === 'future' ? 0 : 1, opacity: state === 'future' ? 0 : 1 }}
					transition={
						shouldReduceMotion
							? { duration: 0 }
							: { type: 'spring', stiffness: 170, damping: 30, mass: 0.95 }
					}
				/>
			</div>
		);
	};

	const journeyClassName = [
		'journey-shell',
		detachedJourney ? 'is-detached' : '',
		hasJourneyContext ? 'has-context' : 'is-reduced',
		shouldReduceMotion ? 'reduced-motion' : '',
	]
		.filter(Boolean)
		.join(' ');

	if (device === 'mobile') {
		return (
			<Stack className={`mobile-top-shell ${colorChange ? 'scrolled' : ''} ${detachedJourney ? 'is-detached' : ''}`}>
				<div className="mobile-top-bar">
					<Link href="/" className="mobile-logo-box" aria-label="Santa home">
						<img src="/img/logo/logo-white.svg" alt="Santa" />
					</Link>

					<div className="mobile-utility-box">
						{user?._id && (
							<Link href="/mypage" className={`mobile-utility-link ${pathname === '/mypage' ? 'active' : ''}`}>
								{t('My Page')}
							</Link>
						)}

						{user?._id && <NotificationsMenu />}

						{user?._id ? (
							<button type="button" className="login-user mobile" onClick={(event) => setLogoutAnchor(event.currentTarget)}>
								<img
									src={
										user?.memberImage ? `${REACT_APP_API_URL}/${user?.memberImage}` : '/img/profile/defaultUser.svg'
									}
									alt={user?.memberNick || 'Santa member'}
								/>
							</button>
						) : (
							<Link href="/account/join" className="join-box mobile">
								<AccountCircleOutlinedIcon />
								<span>
									{t('Login')} / {t('Register')}
								</span>
							</Link>
						)}

						{renderLangToggle(true)}
					</div>
				</div>

				<nav className={`${journeyClassName} mobile`} aria-label="Santa journey navigation">
					<div className="journey-grid">
						{JOURNEY_ITEMS.map((item, index) => (
							<React.Fragment key={`mobile-fragment-${item.key}`}>
								{renderMilestone(item, index, true)}
								{index < JOURNEY_ITEMS.length - 1 && renderSegment(index, true)}
							</React.Fragment>
						))}
					</div>
				</nav>

				<Menu
					id="mobile-account-menu"
					anchorEl={logoutAnchor}
					open={logoutOpen}
					onClose={() => {
						setLogoutAnchor(null);
					}}
					sx={{ mt: '5px' }}
				>
					<MenuItem onClick={() => logOut()}>
						<Logout fontSize="small" style={{ color: 'blue', marginRight: '10px' }} />
						Logout
					</MenuItem>
				</Menu>
			</Stack>
		);
	}

	return (
		<Stack className={'navbar'}>
			<Stack
				className={`navbar-main ${colorChange ? 'transparent' : ''} ${isHome ? 'home-nav' : ''}`}
			>
				<Stack className={'container'}>
					<Box component={'div'} className={'logo-box'}>
						<Link href={'/'} aria-label="Santa home">
							<img src="/img/logo/logo-white.svg" alt="Santa" />
						</Link>
					</Box>

					<Box component="div" className={`router-box ${detachedJourney ? 'is-detached' : ''}`}>
						<nav className={journeyClassName} aria-label="Santa journey navigation">
							<div className="journey-grid">
								{JOURNEY_ITEMS.map((item, index) => (
									<React.Fragment key={`desktop-fragment-${item.key}`}>
										{renderMilestone(item, index)}
										{index < JOURNEY_ITEMS.length - 1 && renderSegment(index)}
									</React.Fragment>
								))}
							</div>
						</nav>
					</Box>

					<Box component={'div'} className={'user-box'}>
						{user?._id ? (
							<>
								<Link href={'/mypage'} className={`utility-link my-page-link ${pathname === '/mypage' ? 'active' : ''}`}>
									{t('My Page')}
								</Link>

								<NotificationsMenu />

								<button type="button" className={'login-user'} onClick={(event) => setLogoutAnchor(event.currentTarget)}>
									<img
										src={
											user?.memberImage ? `${REACT_APP_API_URL}/${user?.memberImage}` : '/img/profile/defaultUser.svg'
										}
										alt={user?.memberNick || 'Santa member'}
									/>
								</button>

								<Menu
									id="basic-menu"
									anchorEl={logoutAnchor}
									open={logoutOpen}
									onClose={() => {
										setLogoutAnchor(null);
									}}
									sx={{ mt: '5px' }}
								>
									<MenuItem onClick={() => logOut()}>
										<Logout fontSize="small" style={{ color: 'blue', marginRight: '10px' }} />
										Logout
									</MenuItem>
								</Menu>
							</>
						) : (
							<Link href={'/account/join'} className={'join-box'}>
								<AccountCircleOutlinedIcon />
								<span>
									{t('Login')} / {t('Register')}
								</span>
							</Link>
						)}

						{renderLangToggle()}
					</Box>
				</Stack>
			</Stack>
		</Stack>
	);
};

export default withRouter(Top);

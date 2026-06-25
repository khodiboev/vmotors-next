import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, withRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { getJwtToken, logOut, updateUserInfo } from '../auth';
import { Stack, Box } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import { alpha, styled } from '@mui/material/styles';
import Menu, { MenuProps } from '@mui/material/Menu';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import { CaretDown } from 'phosphor-react';
import useDeviceDetect from '../hooks/useDeviceDetect';
import Link from 'next/link';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
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
	const [anchorEl2, setAnchorEl2] = useState<null | HTMLElement>(null);
	const [lang, setLang] = useState<string | null>('en');
	const [colorChange, setColorChange] = useState(false);
	const [logoutAnchor, setLogoutAnchor] = useState<null | HTMLElement>(null);
	const drop = Boolean(anchorEl2);
	const logoutOpen = Boolean(logoutAnchor);
	const pathname = router.pathname;
	const isHome = pathname === '/';
	const hasJourneyContext = pathname !== '/mypage' && pathname !== '/account/join';
	const journeyIndex = useMemo(() => getJourneyIndex(pathname), [pathname]);
	const detachedJourney = useMemo(() => isDetachedRoute(pathname, journeyIndex), [pathname, journeyIndex]);

	/** LIFECYCLES **/
	useEffect(() => {
		if (localStorage.getItem('locale') === null) {
			localStorage.setItem('locale', 'en');
			setLang('en');
		} else {
			setLang(localStorage.getItem('locale'));
		}
	}, [router]);

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
	const langClick = (e: React.MouseEvent<HTMLElement>) => {
		setAnchorEl2(e.currentTarget);
	};

	const langClose = () => {
		setAnchorEl2(null);
	};

	const langChoice = useCallback(
		async (e: React.MouseEvent<HTMLElement>) => {
			const nextLocale = e.currentTarget.id;
			setLang(nextLocale);
			localStorage.setItem('locale', nextLocale);
			setAnchorEl2(null);
			await router.push(router.asPath, router.asPath, { locale: nextLocale });
		},
		[router],
	);

	const StyledMenu = styled((props: MenuProps) => (
		<Menu
			elevation={0}
			anchorOrigin={{
				vertical: 'bottom',
				horizontal: 'right',
			}}
			transformOrigin={{
				vertical: 'top',
				horizontal: 'right',
			}}
			{...props}
		/>
	))(({ theme }) => ({
		'& .MuiPaper-root': {
			borderRadius: 18,
			marginTop: theme.spacing(1),
			minWidth: 174,
			padding: '6px',
			color: theme.palette.mode === 'light' ? 'rgb(55, 65, 81)' : theme.palette.grey[300],
			background: 'rgba(255, 255, 255, 0.96)',
			backdropFilter: 'blur(18px)',
			boxShadow:
				'0 18px 40px rgba(6, 19, 46, 0.16), rgba(15, 23, 42, 0.08) 0px 0px 0px 1px',
			'& .MuiMenu-list': {
				padding: 0,
			},
			'& .MuiMenuItem-root': {
				borderRadius: 12,
				fontSize: 14,
				fontWeight: 600,
				'& .MuiSvgIcon-root': {
					fontSize: 18,
					color: theme.palette.text.secondary,
					marginRight: theme.spacing(1.5),
				},
				'&:active': {
					backgroundColor: alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity),
				},
			},
		},
	}));

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

						{user?._id && <NotificationsOutlinedIcon className="notification-icon mobile" />}

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

						<Button disableRipple className="btn-lang mobile-btn-lang" onClick={langClick} endIcon={<CaretDown size={14} weight="fill" />}>
							<Box component={'div'} className={'flag'}>
								{lang !== null ? (
									<img src={`/img/flag/lang${lang}.png`} alt={'selected language'} />
								) : (
									<img src={`/img/flag/langen.png`} alt={'English'} />
									)}
								</Box>
							</Button>
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

				<StyledMenu anchorEl={anchorEl2} open={drop} onClose={langClose}>
					<MenuItem disableRipple onClick={langChoice} id="en">
						<img className="img-flag" src={'/img/flag/langen.png'} alt={'usaFlag'} />
						{t('English')}
					</MenuItem>
					<MenuItem disableRipple onClick={langChoice} id="kr">
						<img className="img-flag" src={'/img/flag/langkr.png'} alt={'koreanFlag'} />
						{t('Korean')}
					</MenuItem>
					<MenuItem disableRipple onClick={langChoice} id="ru">
						<img className="img-flag" src={'/img/flag/langru.png'} alt={'russiaFlag'} />
						{t('Russian')}
					</MenuItem>
				</StyledMenu>
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

								<NotificationsOutlinedIcon className={'notification-icon'} />

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

						<div className={'lan-box'}>
							<Button disableRipple className="btn-lang" onClick={langClick} endIcon={<CaretDown size={14} weight="fill" />}>
								<Box component={'div'} className={'flag'}>
									{lang !== null ? (
										<img src={`/img/flag/lang${lang}.png`} alt={'selected language'} />
									) : (
										<img src={`/img/flag/langen.png`} alt={'English'} />
									)}
								</Box>
							</Button>

							<StyledMenu anchorEl={anchorEl2} open={drop} onClose={langClose}>
								<MenuItem disableRipple onClick={langChoice} id="en">
									<img className="img-flag" src={'/img/flag/langen.png'} alt={'usaFlag'} />
									{t('English')}
								</MenuItem>
								<MenuItem disableRipple onClick={langChoice} id="kr">
									<img className="img-flag" src={'/img/flag/langkr.png'} alt={'koreanFlag'} />
									{t('Korean')}
								</MenuItem>
								<MenuItem disableRipple onClick={langChoice} id="ru">
									<img className="img-flag" src={'/img/flag/langru.png'} alt={'russiaFlag'} />
									{t('Russian')}
								</MenuItem>
							</StyledMenu>
						</div>
					</Box>
				</Stack>
			</Stack>
		</Stack>
	);
};

export default withRouter(Top);

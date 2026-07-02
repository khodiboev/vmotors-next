import React, { useEffect, useRef, useState } from 'react';
import { Box, Stack } from '@mui/material';
import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import WestIcon from '@mui/icons-material/West';
import EastIcon from '@mui/icons-material/East';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper';
import { useMutation, useQuery } from '@apollo/client';
import { Property } from '../../types/vehicle/vehicle';
import { PropertiesInquiry } from '../../types/vehicle/vehicle.input';
import { T } from '../../types/common';
import { Message } from '../../enums/common.enum';
import { GET_VEHICLES } from '../../../apollo/user/query';
import { LIKE_TARGET_VEHICLE } from '../../../apollo/user/mutation';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import HomepageVehicleCard from './HomepageVehicleCard';

// ─── 3D orbital constants ───────────────────────────────────
const X_STEP        = 260;   // px between card centres
const ROTATE_Y      = 28;    // Y-rotation degrees per offset unit
const Z_DEPTH       = 90;    // px pushed back per offset unit
const SCALE_STEP    = 0.08;  // scale reduction per offset
const OPACITY_STEP  = 0.20;  // opacity reduction per offset

const SPRING = { type: 'spring', stiffness: 260, damping: 30, mass: 0.85 } as const;

// ─── Framer Motion variants (matches TrendProperties style) ─
const premiumEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

function getCardAnimate(offset: number, reduced: boolean) {
	const abs = Math.abs(offset);
	if (reduced) {
		return {
			x:       offset * X_STEP,
			rotateY: 0,
			z:       0,
			scale:   1,
			opacity: Math.max(0, 1 - abs * OPACITY_STEP),
		};
	}
	return {
		x:       offset * X_STEP,
		rotateY: offset * -ROTATE_Y,
		z:       -abs * Z_DEPTH,
		scale:   Math.max(0.6, 1 - abs * SCALE_STEP),
		opacity: Math.max(0, 1 - abs * OPACITY_STEP),
	};
}

// ─── Component ──────────────────────────────────────────────
interface NewArrivalsOrbitalProps {
	initialInput: PropertiesInquiry;
}

const NewArrivalsOrbital = ({ initialInput }: NewArrivalsOrbitalProps) => {
	const device           = useDeviceDetect();
	const shouldReduce     = useReducedMotion() ?? false;
	const [vehicles, setVehicles]       = useState<Property[]>([]);
	const [activeIndex, setActiveIndex] = useState(0);
	const wheelLock      = useRef(false);
	const touchStartX    = useRef(0);
	const viewportRef    = useRef<HTMLDivElement>(null);
	const wheelHandlerRef = useRef<((e: WheelEvent) => void) | null>(null);

	// ── Apollo (identical to TrendProperties) ──────────────
	const [likeTargetVehicle] = useMutation(LIKE_TARGET_VEHICLE);

	const { refetch } = useQuery(GET_VEHICLES, {
		fetchPolicy: 'cache-and-network',
		variables: { input: initialInput },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setVehicles(data?.getVehicles?.list ?? []);
		},
	});

	const likePropertyHandler = async (user: T, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);
			await likeTargetVehicle({ variables: { input: id } });
			await refetch({ input: initialInput });
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			console.log('ERROR, likePropertyHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	// ── Navigation ─────────────────────────────────────────
	const goNext = () => setActiveIndex((i) => Math.min(i + 1, vehicles.length - 1));
	const goPrev = () => setActiveIndex((i) => Math.max(i - 1, 0));

	// Refresh the wheel handler on every render so it captures the latest
	// goNext/goPrev/vehicles.length without stale closures.
	wheelHandlerRef.current = (e: WheelEvent) => {
		e.preventDefault(); // only works in a non-passive listener (see useEffect below)
		if (wheelLock.current) return;
		wheelLock.current = true;
		e.deltaY > 0 ? goNext() : goPrev();
		setTimeout(() => { wheelLock.current = false; }, 650);
	};

	// Attach as non-passive so e.preventDefault() is honoured by the browser.
	// React's onWheel is always passive in React 17+, so we must go through the DOM.
	useEffect(() => {
		const el = viewportRef.current;
		if (!el) return;
		const handler = (e: WheelEvent) => wheelHandlerRef.current?.(e);
		el.addEventListener('wheel', handler, { passive: false });
		return () => el.removeEventListener('wheel', handler);
	}, []);

	const handleTouchStart = (e: React.TouchEvent) => {
		touchStartX.current = e.touches[0].clientX;
	};

	const handleTouchEnd = (e: React.TouchEvent) => {
		const delta = touchStartX.current - e.changedTouches[0].clientX;
		if (Math.abs(delta) > 50) delta > 0 ? goNext() : goPrev();
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'ArrowRight') goNext();
		if (e.key === 'ArrowLeft')  goPrev();
	};

	// ── Framer variants (matches TrendProperties) ──────────
	const sectionVariants = shouldReduce
		? { hidden: { opacity: 1 }, visible: { opacity: 1, transition: { staggerChildren: 0 } } }
		: { hidden: { opacity: 1 }, visible: { opacity: 1, transition: { staggerChildren: 0.09, delayChildren: 0.08 } } };

	const headerVariants = shouldReduce
		? { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0, transition: { duration: 0.01 } } }
		: { hidden: { opacity: 0, y: 24  }, visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: premiumEase } } };

	const stageVariants = shouldReduce
		? { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0, transition: { duration: 0.01 } } }
		: { hidden: { opacity: 0, y: 28  }, visible: { opacity: 1, y: 0, transition: { duration: 0.62, ease: premiumEase } } };

	const transition = shouldReduce
		? { duration: 0.01 }
		: SPRING;

	if (!vehicles) return null;

	// ── Mobile: standard Swiper (identical to TrendProperties) ──
	if (device === 'mobile') {
		return (
			<Stack className={'trend-vehicles'}>
				<Stack className={'container'}>
					<motion.div
						className={'section-motion-shell'}
						variants={sectionVariants}
						initial={'hidden'}
						whileInView={'visible'}
						viewport={{ once: true, amount: 0.2 }}
					>
						<motion.div className={'section-motion-header'} variants={headerVariants}>
							<Stack className={'info-box'}>
								<span>New Arrivals</span>
							</Stack>
						</motion.div>
						<Stack className={'card-box'}>
							{vehicles.length === 0 ? (
								<motion.div className={'section-motion-empty'} variants={headerVariants}>
									<Box component={'div'} className={'empty-list'}>Trends Empty</Box>
								</motion.div>
							) : (
								<Swiper
									className={'trend-property-swiper'}
									slidesPerView={'auto'}
									centeredSlides={true}
									spaceBetween={15}
									modules={[Autoplay]}
								>
									{vehicles.map((property: Property) => (
										<SwiperSlide key={property._id} className={'trend-property-slide'}>
											<motion.div className={'section-motion-card'} variants={stageVariants}>
												<HomepageVehicleCard property={property} likePropertyHandler={likePropertyHandler} />
											</motion.div>
										</SwiperSlide>
									))}
								</Swiper>
							)}
						</Stack>
					</motion.div>
				</Stack>
			</Stack>
		);
	}

	// ── Desktop: 3D Orbital Carousel ────────────────────────
	return (
		<Stack className={'new-arrivals-orbital'}>
			<Stack className={'container'}>
				<motion.div
					className={'section-motion-shell'}
					variants={sectionVariants}
					initial={'hidden'}
					whileInView={'visible'}
					viewport={{ once: true, amount: 0.2 }}
				>
					{/* Section header */}
					<motion.div className={'section-motion-header'} variants={headerVariants}>
						<Stack className={'info-box'}>
							<Box component={'div'} className={'left'}>
								<span>New Arrivals</span>
								<p>The latest Hyundai and Kia listings just added to the Santa marketplace.</p>
							</Box>
							<Box component={'div'} className={'right'}>
								<div className={'more-box'}>
									<Link href={'/vehicle'}>
										<span>Browse all vehicles</span>
									</Link>
									<img src="/img/icons/rightup.svg" alt="" />
								</div>
								<div className={'orbital-nav'}>
									<button
										className={'orbital-btn'}
										onClick={goPrev}
										disabled={activeIndex === 0}
										aria-label="Previous vehicle"
									>
										<WestIcon />
									</button>
									<div className={'orbital-dots'}>
										{vehicles.map((_, i) => (
											<button
												key={i}
												className={`dot${i === activeIndex ? ' active' : ''}`}
												onClick={() => setActiveIndex(i)}
												aria-label={`Go to vehicle ${i + 1}`}
											/>
										))}
									</div>
									<button
										className={'orbital-btn'}
										onClick={goNext}
										disabled={activeIndex === vehicles.length - 1}
										aria-label="Next vehicle"
									>
										<EastIcon />
									</button>
								</div>
							</Box>
						</Stack>
					</motion.div>

					{/* 3D Stage */}
					{vehicles.length === 0 ? (
						<motion.div className={'section-motion-empty'} variants={headerVariants}>
							<Box component={'div'} className={'empty-list'}>Trends Empty</Box>
						</motion.div>
					) : (
						<motion.div className={'section-motion-card'} variants={stageVariants}>
							<div className={'orbital-showcase-shell'}>
								<div
									ref={viewportRef}
									className={'orbital-viewport'}
									onTouchStart={handleTouchStart}
									onTouchEnd={handleTouchEnd}
									onKeyDown={handleKeyDown}
									tabIndex={0}
									role="region"
									aria-label="New arrivals carousel"
								>
									<div className={'orbital-stage'}>
										{vehicles.map((vehicle: Property, idx: number) => {
											const offset = idx - activeIndex;
											return (
												<motion.div
													key={vehicle._id}
													className={`orbital-card${offset === 0 ? ' is-active' : ''}`}
													animate={getCardAnimate(offset, shouldReduce)}
													transition={transition}
													onClick={() => setActiveIndex(idx)}
													style={{ zIndex: Math.max(0, 20 - Math.abs(offset)) }}
												>
													<HomepageVehicleCard
														property={vehicle}
														likePropertyHandler={likePropertyHandler}
													/>
												</motion.div>
											);
										})}
									</div>
								</div>
							</div>
						</motion.div>
					)}

				</motion.div>
			</Stack>
		</Stack>
	);
};

NewArrivalsOrbital.defaultProps = {
	initialInput: {
		page:      1,
		limit:     12,
		sort:      'createdAt',
		direction: 'DESC',
		search:    {},
	},
};

export default NewArrivalsOrbital;

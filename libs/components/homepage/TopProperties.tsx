import React, { useState } from 'react';
import { Stack, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import WestIcon from '@mui/icons-material/West';
import EastIcon from '@mui/icons-material/East';
import { motion, useReducedMotion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper';
import TopPropertyCard from './TopPropertyCard';
import Link from 'next/link';
import { PropertiesInquiry } from '../../types/vehicle/vehicle.input';
import { Property } from '../../types/vehicle/vehicle';
import { GET_VEHICLES } from '../../../apollo/user/query';
import { useMutation, useQuery } from '@apollo/client';
import { T } from '../../types/common';
import { LIKE_TARGET_VEHICLE } from '../../../apollo/user/mutation';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { Message } from '../../enums/common.enum';
// Message icon import removed; using string constant for auth error

interface TopPropertiesProps {
	initialInput: PropertiesInquiry;
}

const premiumEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

const TopProperties = (props: TopPropertiesProps) => {
	const { initialInput } = props;
	const device = useDeviceDetect();
	const shouldReduceMotion = useReducedMotion();
	const [topProperties, setTopProperties] = useState<Property[]>([]);

	/** APOLLO REQUESTS **/
	const [likeTargetVehicle] = useMutation(LIKE_TARGET_VEHICLE);

	const {
		loading: getVehiclesLoading,
		data: getVehiclesData,
		error: getVehiclesError,
		refetch: getVehiclesRefetch,
	} = useQuery(GET_VEHICLES, {
		fetchPolicy: 'cache-and-network',
		variables: {
			input: initialInput,
		},
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setTopProperties(data?.getVehicles?.list);
		},
	});
	/** HANDLERS **/
	const likePropertyHandler = async (user: T, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);

			await likeTargetVehicle({
				variables: {
					input: id,
				},
			});
			await getVehiclesRefetch({ input: initialInput });
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			console.log('ERROR, likePropertyHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const sectionVariants = shouldReduceMotion
		? {
				hidden: { opacity: 1 },
				visible: {
					opacity: 1,
					transition: {
						staggerChildren: 0,
						delayChildren: 0,
					},
				},
		  }
		: {
				hidden: { opacity: 1 },
				visible: {
					opacity: 1,
					transition: {
						staggerChildren: 0.09,
						delayChildren: 0.08,
					},
				},
		  };

	const headerVariants = shouldReduceMotion
		? {
				hidden: { opacity: 1, y: 0 },
				visible: {
					opacity: 1,
					y: 0,
					transition: { duration: 0.01 },
				},
		  }
		: {
				hidden: { opacity: 0, y: 24 },
				visible: {
					opacity: 1,
					y: 0,
					transition: {
						duration: 0.55,
						ease: premiumEase,
					},
				},
		  };

	const cardVariants = shouldReduceMotion
		? {
				hidden: { opacity: 1, y: 0 },
				visible: {
					opacity: 1,
					y: 0,
					transition: { duration: 0.01 },
				},
		  }
		: {
				hidden: { opacity: 0, y: 28 },
				visible: {
					opacity: 1,
					y: 0,
					transition: {
						duration: 0.62,
						ease: premiumEase,
					},
				},
		  };

	if (device === 'mobile') {
		return (
			<Stack className={'top-vehicles'}>
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
								<span>Buyer Favorites</span>
							</Stack>
						</motion.div>
						<Stack className={'card-box'}>
							<Swiper
								className={'top-property-swiper'}
								slidesPerView={'auto'}
								centeredSlides={true}
								spaceBetween={15}
								modules={[Autoplay]}
							>
								{topProperties.map((property: Property) => {
									return (
										<SwiperSlide className={'top-property-slide'} key={property?._id}>
											<motion.div className={'section-motion-card'} variants={cardVariants}>
												<TopPropertyCard property={property} likePropertyHandler={likePropertyHandler} />
											</motion.div>
										</SwiperSlide>
									);
								})}
							</Swiper>
						</Stack>
					</motion.div>
				</Stack>
			</Stack>
		);
	} else {
		return (
			<Stack className={'top-vehicles'}>
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
								<Box component={'div'} className={'left'}>
									<span>Buyer Favorites</span>
									<p>The most liked Hyundai and Kia listings chosen by VMotors buyers.</p>
								</Box>
								<Box component={'div'} className={'right'}>
									<div className={'more-box'}>
										<Link href={'/vehicle'}>
											<span>See premium inventory</span>
										</Link>
										<img src="/img/icons/rightup.svg" alt="" />
									</div>
									<div className={'pagination-box'}>
										<WestIcon className={'swiper-top-prev'} />
										<div className={'swiper-top-pagination'}></div>
										<EastIcon className={'swiper-top-next'} />
									</div>
								</Box>
							</Stack>
						</motion.div>
						<Stack className={'card-box'}>
							<Swiper
								className={'top-property-swiper'}
								slidesPerView={4}
								spaceBetween={20}
								watchOverflow={true}
								modules={[Autoplay, Navigation, Pagination]}
								navigation={{
									nextEl: '.swiper-top-next',
									prevEl: '.swiper-top-prev',
								}}
								pagination={{
									el: '.swiper-top-pagination',
									clickable: true,
								}}
							>
								{topProperties.map((property: Property) => {
									return (
										<SwiperSlide className={'top-property-slide'} key={property?._id}>
											<motion.div className={'section-motion-card'} variants={cardVariants}>
												<TopPropertyCard property={property} likePropertyHandler={likePropertyHandler} />
											</motion.div>
										</SwiperSlide>
									);
								})}
							</Swiper>
						</Stack>
					</motion.div>
				</Stack>
			</Stack>
		);
	}
};

TopProperties.defaultProps = {
	initialInput: {
		page: 1,
		limit: 8,
		sort: 'vehicleLikes',
		direction: 'DESC',
		search: {},
	},
};

export default TopProperties;

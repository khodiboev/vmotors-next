import React from 'react';
import { Stack, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { useRouter } from 'next/router';
import { VehicleBrand } from '../../enums/vehicle.enum';
import { Direction } from '../../enums/common.enum';

const BrandSection = () => {
	const device = useDeviceDetect();
	const router = useRouter();

	const browseBrand = (brand: VehicleBrand) => {
		const input = {
			page: 1,
			limit: 9,
			sort: 'createdAt',
			direction: Direction.DESC,
			search: { brandList: [brand] },
		};
		router.push(`/vehicle?input=${JSON.stringify(input)}`);
	};

	if (device === 'mobile') {
		return (
			<Stack className={'brand-section'}>
				<Stack className={'container'}>
					<Stack className={'info-box'}>
						<Box component={'div'} className={'left'}>
							<span>Choose Your Brand</span>
							<p>Focused Hyundai and Kia inventory, presented with a premium buying flow.</p>
						</Box>
					</Stack>
					<Stack className={'brand-cards'}>
						<Box component={'div'} className={'brand-card hyundai'} onClick={() => browseBrand(VehicleBrand.HYUNDAI)}>
							<div className={'brand-badge'}>Certified network</div>
							<div className={'brand-name'}>HYUNDAI</div>
							<div className={'brand-tagline'}>Progressive design, everyday confidence</div>
							<div className={'brand-cta'}>Browse Hyundai</div>
						</Box>
						<Box component={'div'} className={'brand-card kia'} onClick={() => browseBrand(VehicleBrand.KIA)}>
							<div className={'brand-badge'}>Certified network</div>
							<div className={'brand-name'}>KIA</div>
							<div className={'brand-tagline'}>Clean lines, forward-thinking mobility</div>
							<div className={'brand-cta'}>Browse Kia</div>
						</Box>
					</Stack>
				</Stack>
			</Stack>
		);
	}

	return (
		<Stack className={'brand-section'}>
			<Stack className={'container'}>
				<Stack className={'info-box'}>
					<Box component={'div'} className={'left'}>
						<span>Choose Your Brand</span>
						<p>Focused Hyundai and Kia inventory, curated for a cleaner premium marketplace experience.</p>
					</Box>
				</Stack>
				<Stack className={'brand-cards'}>
					<Box component={'div'} className={'brand-card hyundai'} onClick={() => browseBrand(VehicleBrand.HYUNDAI)}>
						<div className={'brand-badge'}>Certified dealer network</div>
						<div className={'brand-name'}>HYUNDAI</div>
						<div className={'brand-tagline'}>Progressive design, everyday confidence.</div>
						<div className={'brand-cta'}>
							<span>Browse Hyundai</span>
							<img src="/img/icons/rightup.svg" alt="" />
						</div>
					</Box>
					<Box component={'div'} className={'brand-card kia'} onClick={() => browseBrand(VehicleBrand.KIA)}>
						<div className={'brand-badge'}>Certified dealer network</div>
						<div className={'brand-name'}>KIA</div>
						<div className={'brand-tagline'}>Clean lines, bold detail, future-ready mobility.</div>
						<div className={'brand-cta'}>
							<span>Browse Kia</span>
							<img src="/img/icons/rightup.svg" alt="" />
						</div>
					</Box>
				</Stack>
			</Stack>
		</Stack>
	);
};

export default BrandSection;

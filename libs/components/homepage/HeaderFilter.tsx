import React, { useState } from 'react';
import { Button, FormControl, MenuItem, Select } from '@mui/material';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { motion } from 'framer-motion';
import { Direction } from '../../enums/common.enum';
import { VehicleBrand, VehicleFuel, VehicleTransmission } from '../../enums/vehicle.enum';
import { VehiclesInquiry } from '../../types/vehicle/vehicle.input';

const initialInput: VehiclesInquiry = {
	page: 1,
	limit: 9,
	sort: 'createdAt',
	direction: Direction.DESC,
	search: {},
};

const premiumEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

const searchShellVariants = {
	hidden: { opacity: 0, y: 28, scale: 0.98, filter: 'blur(14px)' },
	visible: {
		opacity: 1,
		y: 0,
		scale: 1,
		filter: 'blur(0px)',
		transition: {
			duration: 0.82,
			ease: premiumEase,
			staggerChildren: 0.11,
			delayChildren: 0.18,
		},
	},
};

const filterItemVariants = {
	hidden: { opacity: 0, y: 18, scale: 0.985 },
	visible: {
		opacity: 1,
		y: 0,
		scale: 1,
		transition: { duration: 0.58, ease: premiumEase },
	},
};

const HeaderFilter = () => {
	const router = useRouter();
	const { t } = useTranslation('common');
	const [searchFilter, setSearchFilter] = useState<VehiclesInquiry>(initialInput);

	const pushSearchHandler = async () => {
		await router.push(`/vehicle?input=${JSON.stringify(searchFilter)}`, `/vehicle?input=${JSON.stringify(searchFilter)}`);
	};

	return (
		<motion.div
			className={'search-box'}
			variants={searchShellVariants}
			initial="hidden"
			animate="visible"
		>
			<div className={'liquid-sheen'} />
			<div className={'select-box'}>
				<motion.div className={'box'} variants={filterItemVariants} whileHover={{ y: -3 }} transition={{ duration: 0.22 }}>
					<span className={'filter-label'}>{t('Brand')}</span>
					<FormControl fullWidth>
						<Select
							className={'glass-select'}
							displayEmpty
							inputProps={{ 'aria-label': t('Brand') }}
							value={searchFilter.search.brandList?.[0] ?? ''}
							onChange={(e) =>
								setSearchFilter({
									...searchFilter,
									search: {
										...searchFilter.search,
										brandList: e.target.value ? [e.target.value as VehicleBrand] : undefined,
									},
								})
							}
						>
							<MenuItem value="">{t('Brand')}</MenuItem>
							{Object.values(VehicleBrand).map((brand) => (
								<MenuItem value={brand} key={brand}>
									{brand}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</motion.div>
				<motion.div className={'box'} variants={filterItemVariants} whileHover={{ y: -3 }} transition={{ duration: 0.22 }}>
					<span className={'filter-label'}>{t('Fuel')}</span>
					<FormControl fullWidth>
						<Select
							className={'glass-select'}
							displayEmpty
							inputProps={{ 'aria-label': t('Fuel') }}
							value={searchFilter.search.fuelList?.[0] ?? ''}
							onChange={(e) =>
								setSearchFilter({
									...searchFilter,
									search: {
										...searchFilter.search,
										fuelList: e.target.value ? [e.target.value as VehicleFuel] : undefined,
									},
								})
							}
						>
							<MenuItem value="">{t('Fuel')}</MenuItem>
							{Object.values(VehicleFuel).map((fuel) => (
								<MenuItem value={fuel} key={fuel}>
									{fuel}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</motion.div>
				<motion.div className={'box'} variants={filterItemVariants} whileHover={{ y: -3 }} transition={{ duration: 0.22 }}>
					<span className={'filter-label'}>{t('Transmission')}</span>
					<FormControl fullWidth>
						<Select
							className={'glass-select'}
							displayEmpty
							inputProps={{ 'aria-label': t('Transmission') }}
							value={searchFilter.search.transmissionList?.[0] ?? ''}
							onChange={(e) =>
								setSearchFilter({
									...searchFilter,
									search: {
										...searchFilter.search,
										transmissionList: e.target.value ? [e.target.value as VehicleTransmission] : undefined,
									},
								})
							}
						>
							<MenuItem value="">{t('Transmission')}</MenuItem>
							{Object.values(VehicleTransmission).map((transmission) => (
								<MenuItem value={transmission} key={transmission}>
									{transmission}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</motion.div>
			</div>
			<div className={'search-box-other'}>
				<motion.div
					className={'search-action-wrap'}
					variants={filterItemVariants}
					whileHover={{ y: -3, scale: 1.04 }}
					whileTap={{ scale: 0.96 }}
					transition={{ duration: 0.22 }}
				>
					<Button className={'search-btn'} onClick={pushSearchHandler} aria-label={t('Search')}>
						<img src="/img/icons/search_white.svg" alt="" />
					</Button>
				</motion.div>
			</div>
		</motion.div>
	);
};

export default HeaderFilter;

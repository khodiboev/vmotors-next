import React, { ChangeEvent, MouseEvent, useEffect, useRef, useState } from 'react';
import { NextPage } from 'next';
import { Box, Button, Menu, MenuItem, Pagination, Stack, Typography } from '@mui/material';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import ViewModuleRoundedIcon from '@mui/icons-material/ViewModuleRounded';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useMutation, useQuery } from '@apollo/client';
import Filter from '../../libs/components/property/Filter';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { VehiclesInquiry } from '../../libs/types/vehicle/vehicle.input';
import { Vehicle } from '../../libs/types/vehicle/vehicle';
import { Direction, Message } from '../../libs/enums/common.enum';
import { GET_VEHICLES } from '../../apollo/user/query';
import { LIKE_TARGET_VEHICLE } from '../../apollo/user/mutation';
import { T } from '../../libs/types/common';
import { sweetMixinErrorAlert, sweetVehicleActionToast } from '../../libs/sweetAlert';
import VehicleListCard from '../../libs/components/vehicle-list/VehicleListCard';
import VehicleListSkeleton from '../../libs/components/vehicle-list/VehicleListSkeleton';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const VehicleList: NextPage = ({ initialInput }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const [searchFilter, setSearchFilter] = useState<VehiclesInquiry>(
		router?.query?.input ? JSON.parse(router?.query?.input as string) : initialInput,
	);
	const [vehicles, setVehicles] = useState<Vehicle[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [sortingOpen, setSortingOpen] = useState(false);
	const [filterSortName, setFilterSortName] = useState('Newest');
	const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
	const [viewMode, setViewMode] = useState<'comfort' | 'compact'>(searchFilter.limit === 9 ? 'compact' : 'comfort');
	// Like/unlike is applied here, once, and merged into whatever vehicle data renders
	// below. The list refetch that follows a toggle can briefly hand back a stale
	// meLiked for the vehicle we just mutated, and since cards remount whenever that
	// list reshuffles, keeping the override only in the child wouldn't survive it.
	const [likeOverrides, setLikeOverrides] = useState<Record<string, { liked: boolean; likes: number }>>({});
	const pendingLikeIds = useRef<Set<string>>(new Set());

	const [likeTargetVehicle] = useMutation(LIKE_TARGET_VEHICLE);

	const { loading, refetch: getVehiclesRefetch } = useQuery(GET_VEHICLES, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setVehicles(data?.getVehicles?.list ?? []);
			setTotal(data?.getVehicles?.metaCounter?.[0]?.total ?? 0);
		},
	});

	useEffect(() => {
		if (router.query.input) setSearchFilter(JSON.parse(router.query.input as string));
		setCurrentPage(searchFilter.page ?? 1);
	}, [router.query.input]);

	useEffect(() => {
		if (device !== 'mobile') setMobileFilterOpen(false);
	}, [device]);

	const applyLikeOverride = (item: T): T => {
		const override = item?._id ? likeOverrides[item._id] : undefined;
		if (!override) return item;
		return {
			...item,
			vehicleLikes: override.likes,
			meLiked: override.liked ? [{ memberId: '', likeRefId: item._id, myFavorite: true }] : [],
		};
	};

	const likeVehicleHandler = async (user: T, id: string, message?: string) => {
		if (!id || pendingLikeIds.current.has(id)) return false;
		try {
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);
			pendingLikeIds.current.add(id);

			const current =
				likeOverrides[id] ??
				(() => {
					const item = vehicles.find((v) => v._id === id);
					return { liked: !!item?.meLiked?.[0]?.myFavorite, likes: item?.vehicleLikes ?? 0 };
				})();
			const next = { liked: !current.liked, likes: Math.max(0, current.likes + (current.liked ? -1 : 1)) };
			setLikeOverrides((prev) => ({ ...prev, [id]: next }));

			await likeTargetVehicle({ variables: { input: id } });
			await getVehiclesRefetch({ input: searchFilter });
			sweetVehicleActionToast(message ?? (next.liked ? 'Vehicle liked' : 'Like removed'));
			return true;
		} catch (err: any) {
			setLikeOverrides((prev) => {
				const rest = { ...prev };
				delete rest[id];
				return rest;
			});
			sweetMixinErrorAlert(err.message).then();
			return false;
		} finally {
			pendingLikeIds.current.delete(id);
		}
	};

	const handlePaginationChange = async (event: ChangeEvent<unknown>, value: number) => {
		const next = { ...searchFilter, page: value };
		setSearchFilter(next);
		await router.push(`/vehicle?input=${JSON.stringify(next)}`, `/vehicle?input=${JSON.stringify(next)}`, { scroll: false });
		setCurrentPage(value);
	};

	const viewModeChangeHandler = (mode: 'comfort' | 'compact') => {
		if (mode === viewMode) return;
		setViewMode(mode);
		// Compact fills 3 columns evenly (3×3); Comfort keeps the original 8 (2×4)
		const next = { ...searchFilter, page: 1, limit: mode === 'compact' ? 9 : 8 };
		setSearchFilter(next);
		setCurrentPage(1);
		router.push(`/vehicle?input=${JSON.stringify(next)}`, `/vehicle?input=${JSON.stringify(next)}`, { scroll: false }).then();
	};

	const sortingClickHandler = (e: MouseEvent<HTMLElement>) => {
		setAnchorEl(e.currentTarget);
		setSortingOpen(true);
	};

	const sortingHandler = (e: React.MouseEvent<HTMLLIElement>) => {
		const sortMap: Record<string, Pick<VehiclesInquiry, 'sort' | 'direction'> & { label: string }> = {
			new: { sort: 'createdAt', direction: Direction.DESC, label: 'Newest' },
			lowest: { sort: 'vehiclePrice', direction: Direction.ASC, label: 'Lowest Price' },
			highest: { sort: 'vehiclePrice', direction: Direction.DESC, label: 'Highest Price' },
			year: { sort: 'vehicleYear', direction: Direction.DESC, label: 'Newest Model Year' },
		};
		const nextSort = sortMap[e.currentTarget.id];
		if (nextSort) {
			const next = { ...searchFilter, page: 1, sort: nextSort.sort, direction: nextSort.direction };
			setSearchFilter(next);
			setFilterSortName(nextSort.label);
			router.push(`/vehicle?input=${JSON.stringify(next)}`, `/vehicle?input=${JSON.stringify(next)}`, { scroll: false }).then();
		}
		setSortingOpen(false);
		setAnchorEl(null);
	};

	return (
		<div id="property-list-page" style={{ position: 'relative' }}>
			<div className="container">
				<Stack className={'vehicles-page-shell'}>
					<Stack className={'vehicles-page-header'}>
						<div className={'eyebrow'}>Santa curated inventory</div>
						<div className={'heading-row'}>
							<div className={'copy'}>
								<h1>Discover Hyundai and Kia vehicles across Korea</h1>
								<p>
									Explore premium new-car inventory with trusted dealer listings, cleaner filters, and a more
									confident marketplace experience.
								</p>
							</div>
							<div className={'count-card'}>
								<strong>{total}</strong>
								<span>Vehicles available now</span>
							</div>
						</div>
						<div className={'toolbar-row'}>
							<div className={'filter-summary'}>
								<span>Premium search</span>
								<p>Brand, fuel, transmission, location, and keyword filters stay fully live.</p>
							</div>
							<div className={'sort-actions'}>
								{device === 'mobile' && (
									<Button
										className={'mobile-filter-toggle'}
										onClick={() => setMobileFilterOpen((prev) => !prev)}
										startIcon={<TuneRoundedIcon />}
									>
										{mobileFilterOpen ? 'Hide Filters' : 'Show Filters'}
									</Button>
								)}
								{device !== 'mobile' && (
									<div className={'view-toggle'} role={'group'} aria-label={'Card layout'}>
										<button
											type={'button'}
											className={viewMode === 'comfort' ? 'active' : ''}
											onClick={() => viewModeChangeHandler('comfort')}
											aria-label={'Comfort view (2 columns)'}
											aria-pressed={viewMode === 'comfort'}
										>
											<GridViewRoundedIcon />
										</button>
										<button
											type={'button'}
											className={viewMode === 'compact' ? 'active' : ''}
											onClick={() => viewModeChangeHandler('compact')}
											aria-label={'Compact view (3 columns)'}
											aria-pressed={viewMode === 'compact'}
										>
											<ViewModuleRoundedIcon />
										</button>
									</div>
								)}
								<Box component={'div'} className={'sort-box'}>
									<span>Sort by</span>
									<div>
										<Button onClick={sortingClickHandler} endIcon={<KeyboardArrowDownRoundedIcon />}>
											{filterSortName}
										</Button>
										<Menu
											anchorEl={anchorEl}
											open={sortingOpen}
											onClose={() => setSortingOpen(false)}
											disableScrollLock
											sx={{ paddingTop: '5px' }}
										>
											<MenuItem onClick={sortingHandler} id={'new'} disableRipple>
												Newest
											</MenuItem>
											<MenuItem onClick={sortingHandler} id={'lowest'} disableRipple>
												Lowest Price
											</MenuItem>
											<MenuItem onClick={sortingHandler} id={'highest'} disableRipple>
												Highest Price
											</MenuItem>
											<MenuItem onClick={sortingHandler} id={'year'} disableRipple>
												Newest Model Year
											</MenuItem>
										</Menu>
									</div>
								</Box>
							</div>
						</div>
					</Stack>
				</Stack>
				<Stack className={'property-page'}>
					<Stack className={`filter-config ${device === 'mobile' && !mobileFilterOpen ? 'mobile-hidden' : ''}`}>
						<Filter searchFilter={searchFilter} setSearchFilter={setSearchFilter} initialInput={initialInput} />
					</Stack>
					<Stack className="main-config" mb={'76px'}>
						<Stack className={`list-config ${viewMode === 'compact' ? 'compact' : ''} ${loading ? 'loading' : ''}`}>
							{loading && vehicles.length === 0 ? (
								Array.from({ length: device === 'mobile' ? 4 : searchFilter.limit }).map((_, index) => (
									<VehicleListSkeleton key={`vehicle-skeleton-${index}`} />
								))
							) : vehicles.length === 0 ? (
								<div className={'no-data'}>
									<img src="/img/icons/icoAlert.svg" alt="" />
									<h3>No vehicles matched your search.</h3>
									<p>Try broadening the filters or reset the search to explore the full Santa inventory.</p>
									<Button
										className={'reset-empty-state'}
										onClick={() =>
											router.push(`/vehicle?input=${JSON.stringify(initialInput)}`, `/vehicle?input=${JSON.stringify(initialInput)}`, {
												scroll: false,
											})
										}
									>
										Reset filters
									</Button>
								</div>
							) : (
								vehicles.map((vehicle) => (
									<VehicleListCard
										vehicle={applyLikeOverride(vehicle as unknown as T) as unknown as Vehicle}
										likeVehicleHandler={likeVehicleHandler}
										key={vehicle._id}
									/>
								))
							)}
						</Stack>
						<Stack className="pagination-config">
							{vehicles.length !== 0 && (
								<Stack className="pagination-box">
									<Pagination
										page={currentPage}
										count={Math.ceil(total / searchFilter.limit)}
										onChange={handlePaginationChange}
										shape="circular"
										color="primary"
									/>
								</Stack>
							)}
							{vehicles.length !== 0 && (
								<Stack className="total-result">
									<Typography>Total {total} vehicle{total > 1 ? 's' : ''} available</Typography>
								</Stack>
							)}
						</Stack>
					</Stack>
				</Stack>
			</div>
		</div>
	);
};

VehicleList.defaultProps = {
	initialInput: {
		page: 1,
		limit: 8,
		sort: 'createdAt',
		direction: Direction.DESC,
		search: {
			pricesRange: {
				start: 0,
				end: 200000000,
			},
		},
	},
};

export default withLayoutBasic(VehicleList);

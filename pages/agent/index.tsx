import React, { ChangeEvent, MouseEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Stack, Box, Button, Pagination } from '@mui/material';
import { Menu, MenuItem } from '@mui/material';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Member } from '../../libs/types/member/member';
import { useMutation, useQuery } from '@apollo/client';
import { LIKE_TARGET_MEMBER } from '../../apollo/user/mutation';
import { GET_AGENTS } from '../../apollo/user/query';
import { T } from '../../libs/types/common';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { Messages } from '../../libs/config';
import DealerDirectoryCard from '../../libs/components/dealer-list/DealerDirectoryCard';
import DealerDirectorySkeleton from '../../libs/components/dealer-list/DealerDirectorySkeleton';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const AgentList: NextPage = ({ initialInput, ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const [anchorEl2, setAnchorEl2] = useState<null | HTMLElement>(null);
	const [filterSortName, setFilterSortName] = useState('Recent');
	const [sortingOpen, setSortingOpen] = useState(false);
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [searchFilter, setSearchFilter] = useState<any>(
		router?.query?.input ? JSON.parse(router?.query?.input as string) : initialInput,
	);
	const [agents, setAgents] = useState<Member[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [searchText, setSearchText] = useState<string>(
		router?.query?.input ? JSON.parse(router?.query?.input as string)?.search?.text ?? '' : initialInput?.search?.text ?? '',
	);

/** APOLLO REQUESTS **/
const [likeTargetMember] = useMutation(LIKE_TARGET_MEMBER);

	const { loading: getAgentsLoading, refetch: getAgentsRefetch } = useQuery(GET_AGENTS, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setAgents(data?.getAgents?.list);
			setTotal(data?.getAgents?.metaCounter[0]?.total);
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (router.query.input) {
			const input_obj = JSON.parse(router?.query?.input as string);
			setSearchFilter(input_obj);
			setSearchText(input_obj?.search?.text ?? '');
		} else
			router.replace(`/agent?input=${JSON.stringify(searchFilter)}`, `/agent?input=${JSON.stringify(searchFilter)}`);

		setCurrentPage(searchFilter.page === undefined ? 1 : searchFilter.page);
	}, [router]);

	/** HANDLERS **/
	const sortingClickHandler = (e: MouseEvent<HTMLElement>) => {
		setAnchorEl(e.currentTarget);
		setSortingOpen(true);
	};

	const sortingCloseHandler = () => {
		setSortingOpen(false);
		setAnchorEl(null);
	};

	const sortingHandler = (e: React.MouseEvent<HTMLLIElement>) => {
		switch (e.currentTarget.id) {
			case 'recent':
				setSearchFilter({ ...searchFilter, sort: 'createdAt', direction: 'DESC' });
				setFilterSortName('Recent');
				break;
			case 'old':
				setSearchFilter({ ...searchFilter, sort: 'createdAt', direction: 'ASC' });
				setFilterSortName('Oldest order');
				break;
			case 'likes':
				setSearchFilter({ ...searchFilter, sort: 'memberLikes', direction: 'DESC' });
				setFilterSortName('Likes');
				break;
			case 'views':
				setSearchFilter({ ...searchFilter, sort: 'memberViews', direction: 'DESC' });
				setFilterSortName('Views');
				break;
		}
		setSortingOpen(false);
		setAnchorEl2(null);
	};

	const paginationChangeHandler = async (event: ChangeEvent<unknown>, value: number) => {
		searchFilter.page = value;
		await router.push(`/agent?input=${JSON.stringify(searchFilter)}`, `/agent?input=${JSON.stringify(searchFilter)}`, {
			scroll: false,
		});
		setCurrentPage(value);
	};

	const likeMemberHandler = async (user: any, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Messages.error2);

			await likeTargetMember({
				variables: {
					input: id,
				},
			});

			await getAgentsRefetch({ input: searchFilter });
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			console.log('ERROR, likePropertyHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	return (
		<Stack className={'agent-list-page'}>
			<Stack className={'container'}>
				<Stack className={'dealers-page-header'}>
					<div className={'eyebrow'}>VMotors dealer network</div>
					<div className={'heading-row'}>
						<div className={'copy'}>
							<h1>Connect with trusted Hyundai and Kia dealers across Korea.</h1>
							<p>
								Discover professional dealer partners, explore inventory strength, and connect with the people
								behind Korea&apos;s premium new-car marketplace.
							</p>
						</div>
						<div className={'count-card'}>
							<strong>{total}</strong>
							<span>Dealer partners available</span>
						</div>
					</div>
					<div className={'trust-row'}>
						<span>Trusted dealer network</span>
						<span>Live inventory visibility</span>
						<span>Premium automotive support</span>
					</div>
				</Stack>

				<Stack className={'filter'}>
					<Box component={'div'} className={'left'}>
						<div className={'search-box'}>
							<SearchRoundedIcon />
							<input
								type="text"
								placeholder={'Search for a dealer, company, or location'}
								value={searchText}
								onChange={(e: any) => {
									setSearchText(e.target.value);
									setSearchFilter({
										...searchFilter,
										search: { ...searchFilter.search, text: e.target.value },
									});
								}}
							/>
						</div>
					</Box>
					<Box component={'div'} className={'right'}>
						<div className={'sort-box'}>
							<span>Sort by</span>
							<div>
								<Button onClick={sortingClickHandler} endIcon={<KeyboardArrowDownRoundedIcon />}>
									{filterSortName}
								</Button>
								<Menu anchorEl={anchorEl} open={sortingOpen} onClose={sortingCloseHandler} sx={{ paddingTop: '5px' }}>
									<MenuItem onClick={sortingHandler} id={'recent'} disableRipple>
										Recent
									</MenuItem>
									<MenuItem onClick={sortingHandler} id={'old'} disableRipple>
										Oldest
									</MenuItem>
									<MenuItem onClick={sortingHandler} id={'likes'} disableRipple>
										Likes
									</MenuItem>
									<MenuItem onClick={sortingHandler} id={'views'} disableRipple>
										Views
									</MenuItem>
								</Menu>
							</div>
						</div>
					</Box>
				</Stack>

				<Stack className={`card-wrap ${getAgentsLoading ? 'loading' : ''}`}>
					{getAgentsLoading && agents.length === 0 ? (
						Array.from({ length: device === 'mobile' ? 4 : 6 }).map((_, index) => (
							<DealerDirectorySkeleton key={`dealer-skeleton-${index}`} />
						))
					) : agents?.length === 0 ? (
						<div className={'no-data'}>
							<img src="/img/icons/icoAlert.svg" alt="" />
							<h3>No dealers matched your search.</h3>
							<p>Try a broader search term or check back later as more trusted VMotors dealers join the network.</p>
						</div>
					) : (
						agents.map((agent: Member) => {
							return <DealerDirectoryCard agent={agent} key={agent._id} likeMemberHandler={likeMemberHandler} />;
						})
					)}
				</Stack>
				<Stack className={'pagination'}>
					<Stack className="pagination-box">
						{agents.length !== 0 && Math.ceil(total / searchFilter.limit) > 1 && (
							<Stack className="pagination-box">
								<Pagination
									page={currentPage}
									count={Math.ceil(total / searchFilter.limit)}
									onChange={paginationChangeHandler}
									shape="circular"
									color="primary"
								/>
							</Stack>
						)}
					</Stack>

					{agents.length !== 0 && (
						<span>
							Total {total} dealer{total > 1 ? 's' : ''} available
						</span>
					)}
				</Stack>
			</Stack>
		</Stack>
	);
};

AgentList.defaultProps = {
	initialInput: {
		page: 1,
		limit: 10,
		sort: 'createdAt',
		direction: 'DESC',
		search: {},
	},
};

export default withLayoutBasic(AgentList);

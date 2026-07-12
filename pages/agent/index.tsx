import React, { ChangeEvent, MouseEvent, useEffect, useRef, useState } from 'react';
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
import { sweetDealerActionToast, sweetMixinErrorAlert } from '../../libs/sweetAlert';
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
	// Like is applied here, once, and merged into whatever agent data renders below.
	// The list refetch that follows a toggle can briefly hand back a stale meLiked for
	// the agent we just mutated, and since dealer cards remount whenever that list
	// reshuffles, keeping the override only in the child card wouldn't survive that.
	const [likeOverrides, setLikeOverrides] = useState<Record<string, { liked: boolean; likes: number }>>({});
	const pendingLikeIds = useRef<Set<string>>(new Set());

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

	const applyLikeOverride = (item: T): T => {
		const override = item?._id ? likeOverrides[item._id] : undefined;
		if (!override) return item;
		return {
			...item,
			memberLikes: override.likes,
			meLiked: override.liked ? [{ memberId: '', likeRefId: item._id, myFavorite: true }] : [],
		};
	};

	const likeMemberHandler = async (user: any, id: string) => {
		if (!id || pendingLikeIds.current.has(id)) return;
		try {
			if (!user._id) throw new Error(Messages.error2);
			pendingLikeIds.current.add(id);

			const current =
				likeOverrides[id] ??
				(() => {
					const item = agents.find((a) => a._id === id);
					return { liked: !!item?.meLiked?.[0]?.myFavorite, likes: item?.memberLikes ?? 0 };
				})();
			const next = { liked: !current.liked, likes: Math.max(0, current.likes + (current.liked ? -1 : 1)) };
			setLikeOverrides((prev) => ({ ...prev, [id]: next }));

			await likeTargetMember({
				variables: {
					input: id,
				},
			});

			await getAgentsRefetch({ input: searchFilter });
			sweetDealerActionToast(next.liked ? 'Dealer liked' : 'Like removed');
		} catch (err: any) {
			setLikeOverrides((prev) => {
				const rest = { ...prev };
				delete rest[id];
				return rest;
			});
			console.log('ERROR, likeMemberHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		} finally {
			pendingLikeIds.current.delete(id);
		}
	};

	return (
		<Stack className={'agent-list-page'}>
			<Stack className={'container'}>
				<Stack className={'dealers-page-header'}>
					<div className={'header-shell'}>
						<div className={'copy-column'}>
							<div className={'eyebrow'}>Santa verified dealer network</div>
							<div className={'copy'}>
								<h1>Meet the dealer side of Korea&apos;s premium Hyundai and Kia marketplace.</h1>
								<p>
									Browse trusted dealer partners, compare who is actively listing inventory, and start your next
									conversation with a clearer sense of credibility before you ever open a profile.
								</p>
							</div>
							<div className={'trust-row'}>
								<span>Verified marketplace presence</span>
								<span>Live inventory visibility</span>
								<span>Professional buyer support</span>
							</div>
						</div>
						<div className={'insight-column'}>
							<div className={'count-card'}>
								<span className={'card-label'}>Directory snapshot</span>
								<strong>{total}</strong>
								<span className={'card-copy'}>Verified dealer partners currently visible on Santa</span>
							</div>
							<div className={'info-card'}>
								<span className={'info-label'}>Verification first</span>
								<p>Profile identity, location details, and direct contact points stay visible before outreach.</p>
							</div>
							<div className={'info-card accent'}>
								<span className={'info-label'}>Built for discovery</span>
								<p>Use the search bar below to narrow by dealer name, company, or where they operate.</p>
							</div>
						</div>
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
								<Menu anchorEl={anchorEl} open={sortingOpen} onClose={sortingCloseHandler} disableScrollLock sx={{ paddingTop: '5px' }}>
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
							<p>Try a broader search term or check back later as more trusted Santa dealers join the network.</p>
						</div>
					) : (
						agents.map((agent: Member) => {
							return (
								<DealerDirectoryCard
									agent={applyLikeOverride(agent as unknown as T) as unknown as Member}
									key={agent._id}
									likeMemberHandler={likeMemberHandler}
								/>
							);
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

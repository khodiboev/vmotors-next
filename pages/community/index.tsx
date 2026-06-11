import React, { useEffect, useMemo, useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Stack, Pagination } from '@mui/material';
import AutoStoriesRoundedIcon from '@mui/icons-material/AutoStoriesRounded';
import DirectionsCarFilledOutlinedIcon from '@mui/icons-material/DirectionsCarFilledOutlined';
import NewspaperRoundedIcon from '@mui/icons-material/NewspaperRounded';
import MoodRoundedIcon from '@mui/icons-material/MoodRounded';
import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { BoardArticle } from '../../libs/types/board-article/board-article';
import { T } from '../../libs/types/common';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { BoardArticlesInquiry } from '../../libs/types/board-article/board-article.input';
import { BoardArticleCategory } from '../../libs/enums/board-article.enum';
import { useMutation, useQuery } from '@apollo/client';
import { GET_BOARD_ARTICLES } from '../../apollo/user/query';
import { Messages } from '../../libs/config';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { LIKE_TARGET_BOARD_ARTICLE } from '../../apollo/user/mutation';
import CommunityListingCard from '../../libs/components/community/CommunityListingCard';
import CommunityListingSkeleton from '../../libs/components/community/CommunityListingSkeleton';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const categoryMeta: Record<
	BoardArticleCategory,
	{ label: string; title: string; description: string; icon: JSX.Element }
> = {
	FREE: {
		label: 'Open board',
		title: 'Talk buying, ownership, and daily Hyundai or Kia life.',
		description: 'A clean space for questions, ownership notes, delivery updates, and real buyer conversation across Korea.',
		icon: <AutoStoriesRoundedIcon />,
	},
	RECOMMEND: {
		label: 'Recommendations',
		title: 'Share trusted picks, dealer tips, and standout models.',
		description: 'Curated recommendations for trims, delivery-ready choices, dealer experiences, and practical car-buying advice.',
		icon: <DirectionsCarFilledOutlinedIcon />,
	},
	NEWS: {
		label: 'Industry news',
		title: 'Follow Hyundai and Kia launches, policy updates, and market moves.',
		description: 'Keep up with the Korean automotive market through product news, launch coverage, and community reactions.',
		icon: <NewspaperRoundedIcon />,
	},
	HUMOR: {
		label: 'Car culture',
		title: 'A lighter side of Korean car enthusiasm.',
		description: 'Community humor, relatable ownership moments, and playful conversation for enthusiasts and daily drivers alike.',
		icon: <MoodRoundedIcon />,
	},
};

const Community: NextPage = ({ initialInput, ...props }: T) => {
	const router = useRouter();
	const articleCategory = (router?.query?.articleCategory as BoardArticleCategory) || initialInput.search.articleCategory;
	const [searchCommunity, setSearchCommunity] = useState<BoardArticlesInquiry>({
		...initialInput,
		search: { ...initialInput.search, articleCategory },
	});
	const [boardArticles, setBoardArticles] = useState<BoardArticle[]>([]);
	const [totalCount, setTotalCount] = useState<number>(0);

	const [likeTargetBoardArticle] = useMutation(LIKE_TARGET_BOARD_ARTICLE);

	const { loading: boardArticlesLoading, refetch: boardArticlesRefetch } = useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'cache-and-network',
		variables: {
			input: searchCommunity,
		},
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setBoardArticles(data?.getBoardArticles?.list ?? []);
			setTotalCount(data?.getBoardArticles?.metaCounter?.[0]?.total ?? 0);
		},
	});

	useEffect(() => {
		if (!router?.query?.articleCategory) {
			router.replace(
				{
					pathname: '/community',
					query: { articleCategory: initialInput.search.articleCategory },
				},
				undefined,
				{ shallow: true },
			);
		}
	}, [router, initialInput.search.articleCategory]);

	useEffect(() => {
		if (!articleCategory) return;
		setSearchCommunity((prev) => ({
			...prev,
			page: 1,
			search: { ...prev.search, articleCategory },
		}));
	}, [articleCategory]);

	const currentCategory = (searchCommunity.search.articleCategory || BoardArticleCategory.FREE) as BoardArticleCategory;
	const currentCategoryMeta = categoryMeta[currentCategory];

	const tabChangeHandler = async (value: BoardArticleCategory) => {
		setSearchCommunity((prev) => ({
			...prev,
			page: 1,
			search: { ...prev.search, articleCategory: value },
		}));
		await router.push(
			{
				pathname: '/community',
				query: { articleCategory: value },
			},
			undefined,
			{ shallow: true },
		);
	};

	const paginationHandler = (e: T, value: number) => {
		setSearchCommunity((prev) => ({ ...prev, page: value }));
	};

	const likeArticleHandler = async (e: any, user: any, id: string) => {
		try {
			e.stopPropagation();
			if (!id) return;
			if (!user._id) throw new Error(Messages.error2);

			await likeTargetBoardArticle({
				variables: {
					input: id,
				},
			});

			await boardArticlesRefetch({ input: searchCommunity });
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const heroStats = useMemo(
		() => [
			{ label: 'Live articles', value: totalCount },
			{ label: 'Active board', value: currentCategoryMeta.label },
		],
		[totalCount, currentCategoryMeta.label],
	);

	return (
		<div id="community-list-page">
			<div className="container">
				<section className="community-hero">
					<div className="hero-copy">
						<span className="eyebrow">VMotors community</span>
						<h1>Join Korea&apos;s cleaner Hyundai and Kia conversation.</h1>
						<p>
							Explore buyer stories, dealer tips, industry updates, and enthusiast discussion in a community shaped
							for high-intent automotive conversation.
						</p>
						<div className="hero-trust-row">
							<span>Automotive-focused discussion</span>
							<span>Buyer and dealer insight</span>
							<span>News, culture, and recommendations</span>
						</div>
					</div>

					<div className="hero-sidecard">
						<div className="hero-count-card">
							<strong>{totalCount}</strong>
							<span>Articles in this board</span>
						</div>
						<div className="hero-mini-stats">
							{heroStats.map((item) => (
								<div className="hero-mini-stat" key={item.label}>
									<span>{item.label}</span>
									<strong>{item.value}</strong>
								</div>
							))}
						</div>
					</div>
				</section>

				<div className="community-layout">
					<aside className="community-sidebar">
						<div className="sidebar-card">
							<div className="sidebar-topline">
								<span className="label">Board categories</span>
								<strong>Choose your lane</strong>
							</div>

							<div className="category-rail">
								{Object.entries(categoryMeta).map(([value, meta]) => (
									<button
										type="button"
										key={value}
										className={`category-button ${currentCategory === value ? 'active' : ''}`}
										onClick={() => tabChangeHandler(value as BoardArticleCategory)}
									>
										<span className="category-icon">{meta.icon}</span>
										<span className="category-copy">
											<strong>{meta.label}</strong>
											<span>{meta.title}</span>
										</span>
									</button>
								))}
							</div>
						</div>
					</aside>

					<section className="community-main">
						<div className="board-header-card">
							<div className="board-header-copy">
								<span className="label">{currentCategoryMeta.label}</span>
								<h2>{currentCategoryMeta.title}</h2>
								<p>{currentCategoryMeta.description}</p>
							</div>

							<Link
								href={{
									pathname: '/mypage',
									query: { category: 'writeArticle' },
								}}
								className="write-link"
							>
								<span>Write article</span>
								<KeyboardArrowRightRoundedIcon />
							</Link>
						</div>

						<div className={`community-grid ${boardArticlesLoading ? 'loading' : ''}`}>
							{boardArticlesLoading && boardArticles.length === 0 ? (
								Array.from({ length: 6 }).map((_, index) => <CommunityListingSkeleton key={`community-skeleton-${index}`} />)
							) : boardArticles.length ? (
								boardArticles.map((boardArticle: BoardArticle) => (
									<CommunityListingCard
										article={boardArticle}
										key={boardArticle?._id}
										likeArticleHandler={likeArticleHandler}
									/>
								))
							) : (
								<div className={'no-data'}>
									<img src="/img/icons/icoAlert.svg" alt="" />
									<h3>No automotive stories in this board yet.</h3>
									<p>Check another board or come back soon as the VMotors community adds more Hyundai and Kia discussion.</p>
								</div>
							)}
						</div>
					</section>
				</div>

				{totalCount > 0 && (
					<Stack className="pagination-config">
						<Stack className="pagination-box">
							<Pagination
								count={Math.ceil(totalCount / searchCommunity.limit)}
								page={searchCommunity.page}
								shape="circular"
								color="primary"
								onChange={paginationHandler}
							/>
						</Stack>
						<Stack className="total-result">
							<p>
								Total {totalCount} article{totalCount > 1 ? 's' : ''} available
							</p>
						</Stack>
					</Stack>
				)}
			</div>
		</div>
	);
};

Community.defaultProps = {
	initialInput: {
		page: 1,
		limit: 6,
		sort: 'createdAt',
		direction: 'ASC',
		search: {
			articleCategory: 'FREE',
		},
	},
};

export default withLayoutBasic(Community);

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
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import Moment from 'react-moment';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { BoardArticle } from '../../libs/types/board-article/board-article';
import { T } from '../../libs/types/common';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { BoardArticlesInquiry } from '../../libs/types/board-article/board-article.input';
import { BoardArticleCategory } from '../../libs/enums/board-article.enum';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { GET_BOARD_ARTICLES } from '../../apollo/user/query';
import { Messages, REACT_APP_API_URL } from '../../libs/config';
import { sweetLoginConfirmAlert, sweetMixinErrorAlert } from '../../libs/sweetAlert';
import { LIKE_TARGET_BOARD_ARTICLE } from '../../apollo/user/mutation';
import { userVar } from '../../apollo/store';
import ArticleLikeFeedback, {
	ArticleLikeFeedbackState,
	getArticleLikeFeedbackCopy,
} from '../../libs/components/community/ArticleLikeFeedback';
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

const topicalHighlights = [
	'Ownership stories',
	'Hyundai discussions',
	'Kia discussions',
	'Dealer experiences',
	'Recommendations',
	'News & updates',
];

const categoryLabelMap: Record<string, string> = {
	FREE: 'Open board',
	RECOMMEND: 'Recommendations',
	NEWS: 'Industry news',
	HUMOR: 'Car culture',
};

const stripHtml = (value?: string) => {
	if (!value) return '';
	return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
};

const getArticleSummary = (value?: string, maxLength = 180) => {
	const clean = stripHtml(value);
	if (!clean) return '';
	return clean.length > maxLength ? `${clean.slice(0, maxLength - 3).trimEnd()}...` : clean;
};

const getArticleHref = (article: BoardArticle) => ({
	pathname: '/community/detail',
	query: { articleCategory: article?.articleCategory, id: article?._id },
});

const Community: NextPage = ({ initialInput, ...props }: T) => {
	const router = useRouter();
	const articleCategory = (router?.query?.articleCategory as BoardArticleCategory) || initialInput.search.articleCategory;
	const [searchCommunity, setSearchCommunity] = useState<BoardArticlesInquiry>({
		...initialInput,
		search: { ...initialInput.search, articleCategory },
	});
	const [boardArticles, setBoardArticles] = useState<BoardArticle[]>([]);
	const [totalCount, setTotalCount] = useState<number>(0);
	const [articleFeedback, setArticleFeedback] = useState<ArticleLikeFeedbackState | null>(null);

	const user = useReactiveVar(userVar);
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

	const writeArticleHandler = async () => {
		if (!user._id) {
			const confirmed = await sweetLoginConfirmAlert('Please log in to write an article.');
			if (confirmed) await router.push('/account/join');
			return;
		}
		await router.push({ pathname: '/mypage', query: { category: 'writeArticle' } });
	};

	const showArticleFeedback = (wasLiked: boolean) => {
		const feedbackCopy = getArticleLikeFeedbackCopy(wasLiked);
		setArticleFeedback((prev) => ({
			id: (prev?.id ?? 0) + 1,
			...feedbackCopy,
		}));
	};

	const likeArticleHandler = async (e: any, user: any, id: string, wasLiked = false) => {
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
			showArticleFeedback(wasLiked);
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const featuredArticle = useMemo(() => {
		return [...boardArticles].sort((left, right) => {
			if ((right?.articleComments ?? 0) !== (left?.articleComments ?? 0)) {
				return (right?.articleComments ?? 0) - (left?.articleComments ?? 0);
			}

			if ((right?.articleLikes ?? 0) !== (left?.articleLikes ?? 0)) {
				return (right?.articleLikes ?? 0) - (left?.articleLikes ?? 0);
			}

			if ((right?.articleViews ?? 0) !== (left?.articleViews ?? 0)) {
				return (right?.articleViews ?? 0) - (left?.articleViews ?? 0);
			}

			return new Date(right?.createdAt ?? 0).getTime() - new Date(left?.createdAt ?? 0).getTime();
		})[0];
	}, [boardArticles]);

	const recentActivityItems = useMemo(() => {
		return [...boardArticles]
			.sort((left, right) => new Date(right?.createdAt ?? 0).getTime() - new Date(left?.createdAt ?? 0).getTime())
			.slice(0, 3);
	}, [boardArticles]);

	const featuredImagePath = featuredArticle?.articleImage
		? `${REACT_APP_API_URL}/${featuredArticle.articleImage}`
		: '/img/community/communityImg.png';
	const featuredAuthor =
		featuredArticle?.memberData?.memberFullName ?? featuredArticle?.memberData?.memberNick ?? 'Santa community';
	const featuredSummary =
		getArticleSummary(featuredArticle?.articleContent, 210) ||
		'Start the conversation in this board with a clear perspective, useful owner context, and a headline other members will want to open.';

	return (
		<div id="community-list-page">
			<div className="container">
				<section className="community-hero">
					<div className="hero-grid">
						<div className="hero-intro">
							<span className="eyebrow">Santa Journal</span>
							<h1>Stories, advice, and real Hyundai-Kia conversation from across Korea.</h1>
							<p>
								Read owner notes, dealer experiences, model recommendations, and market updates in a community
								designed to feel more like an automotive publication than a generic discussion board.
							</p>
							<div className="hero-topic-row">
								{topicalHighlights.map((item) => (
									<span key={item} className="topic-chip">
										{item}
									</span>
								))}
							</div>
							<div className="hero-board-note">
								<span className="label">Current editorial lane</span>
								<strong>{currentCategoryMeta.title}</strong>
								<p>{currentCategoryMeta.description}</p>
							</div>
						</div>

						<article className={`hero-featured-card ${featuredArticle ? '' : 'empty'}`}>
							{featuredArticle ? (
								<>
									<Link href={getArticleHref(featuredArticle)} className="featured-media">
										<img src={featuredImagePath} alt={featuredArticle?.articleTitle} />
										<span className="featured-kicker">Featured discussion</span>
									</Link>

									<div className="featured-content">
										<div className="featured-topline">
											<span className="label">{categoryLabelMap[featuredArticle?.articleCategory] ?? featuredArticle?.articleCategory}</span>
											<div className="featured-meta">
												<span className="author">{featuredAuthor}</span>
												<span className="meta-divider" />
												<span className="date">
													<Moment format={'MMM DD, YYYY'}>{featuredArticle?.createdAt}</Moment>
												</span>
											</div>
										</div>

										<Link href={getArticleHref(featuredArticle)} className="featured-copy">
											<strong>{featuredArticle?.articleTitle}</strong>
											<p>{featuredSummary}</p>
										</Link>

										<div className="featured-footer">
											<div className="article-metrics compact">
												<div className="article-metric">
													<RemoveRedEyeOutlinedIcon />
													<span>{featuredArticle?.articleViews ?? 0}</span>
												</div>
												<div className="article-metric">
													<ChatBubbleOutlineRoundedIcon />
													<span>{featuredArticle?.articleComments ?? 0}</span>
												</div>
												<div className="article-metric">
													<FavoriteBorderIcon />
													<span>{featuredArticle?.articleLikes ?? 0}</span>
												</div>
											</div>

											<Link href={getArticleHref(featuredArticle)} className="article-link">
												<span>Read discussion</span>
												<KeyboardArrowRightRoundedIcon />
											</Link>
										</div>
									</div>
								</>
							) : (
								<div className="featured-empty">
									<span className="label">Featured discussion</span>
									<strong>Start the first standout story in this board.</strong>
									<p>
										There is no live article to spotlight yet, so this space is ready for a thoughtful owner note,
										recommendation, market reaction, or dealer experience.
									</p>
									<button onClick={writeArticleHandler} className="write-link">
										<span>Write article</span>
										<KeyboardArrowRightRoundedIcon />
									</button>
								</div>
							)}
						</article>
					</div>

					<div className="hero-activity-panel">
						<div className="activity-copy">
							<span className="label">Board focus</span>
							<strong>{currentCategoryMeta.label}</strong>
							<p>{currentCategoryMeta.description}</p>
						</div>

						<div className="activity-total-card">
							<span className="total-label">Articles in this board</span>
							<strong>{totalCount}</strong>
						</div>

						<div className="activity-rail">
							<span className="label">Recent activity</span>
							{recentActivityItems.length ? (
								recentActivityItems.map((article) => {
									const articleAuthor =
										article?.memberData?.memberFullName ?? article?.memberData?.memberNick ?? 'Santa community';

									return (
										<Link href={getArticleHref(article)} className="activity-item" key={`recent-${article?._id}`}>
											<strong>{article?.articleTitle}</strong>
											<div className="activity-meta">
												<span>{articleAuthor}</span>
												<span className="meta-divider" />
												<span>
													<Moment format={'MMM DD'}>{article?.createdAt}</Moment>
												</span>
											</div>
										</Link>
									);
								})
							) : (
								<p className="activity-empty">Fresh conversation starts with the first story published in this board.</p>
							)}
						</div>
					</div>
				</section>

				<section className="community-category-section">
					<div className="section-heading">
						<span className="label">Board categories</span>
						<h2>Choose the conversation you want to join.</h2>
					</div>

					<div className="category-grid">
						{Object.entries(categoryMeta).map(([value, meta]) => (
							<button
								type="button"
								key={value}
								className={`category-button ${currentCategory === value ? 'active' : ''}`}
								onClick={() => tabChangeHandler(value as BoardArticleCategory)}
								aria-pressed={currentCategory === value}
							>
								<span className="category-icon">{meta.icon}</span>
								<span className="category-copy">
									<span className="category-label">{meta.label}</span>
									<strong>{meta.title}</strong>
									<span className="category-description">{meta.description}</span>
								</span>
							</button>
						))}
					</div>
				</section>

				<section className="community-feed-section">
					<div className="community-main">
						<div className="board-header-card">
							<div className="board-header-copy">
								<span className="label">Current board</span>
								<h2>{currentCategoryMeta.title}</h2>
								<p>{currentCategoryMeta.description}</p>
							</div>

							<button onClick={writeArticleHandler} className="write-link">
								<span>Write article</span>
								<KeyboardArrowRightRoundedIcon />
							</button>
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
									<p>Check another board or come back soon as the Santa community adds more Hyundai and Kia discussion.</p>
								</div>
							)}
						</div>
					</div>
				</section>

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
			<ArticleLikeFeedback
				key={articleFeedback?.id ?? 'article-like-feedback'}
				feedback={articleFeedback}
				onDone={() => setArticleFeedback(null)}
			/>
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

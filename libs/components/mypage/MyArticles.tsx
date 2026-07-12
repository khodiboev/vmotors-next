import React, { useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Button, Pagination, Stack, Typography } from '@mui/material';
import CommunityCard from '../common/CommunityCard';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { T } from '../../types/common';
import { BoardArticle } from '../../types/board-article/board-article';
import { LIKE_TARGET_BOARD_ARTICLE, UPDATE_BOARD_ARTICLE } from '../../../apollo/user/mutation';
import { GET_BOARD_ARTICLES } from '../../../apollo/user/query';
import { Messages } from '../../config';
import { sweetConfirmAlert, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { useRouter } from 'next/router';
import { BoardArticleStatus } from '../../enums/board-article.enum';
import ArticleLikeFeedback, {
	ArticleLikeFeedbackState,
	getArticleLikeFeedbackCopy,
} from '../community/ArticleLikeFeedback';

const EDIT_DRAFT_STORAGE_KEY = 'santa-community-edit-draft';

const MyArticles: NextPage = ({ initialInput, ...props }: T) => {
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const router = useRouter();
	const [searchCommunity, setSearchCommunity] = useState({
		...initialInput,
		search: { memberId: user._id },
	});
	const [boardArticles, setBoardArticles] = useState<BoardArticle[]>([]);
	const [totalCount, setTotalCount] = useState<number>(0);
	const [articleFeedback, setArticleFeedback] = useState<ArticleLikeFeedbackState | null>(null);

	/** APOLLO REQUESTS **/
	const [likeTargetBoardArticle] = useMutation(LIKE_TARGET_BOARD_ARTICLE);
	const [updateBoardArticle] = useMutation(UPDATE_BOARD_ARTICLE);

	const {
		loading: boardArticlesLoading,
		data: boardArticlesData,
		error: getBoardArticlesError,
		refetch: boardArticlesRefetch,
	} = useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'network-only',
		variables: {
			input: searchCommunity,
		},
		notifyOnNetworkStatusChange: true,
		onCompleted(data: T) {
			setBoardArticles(data?.getBoardArticles?.list);
			setTotalCount(data?.getBoardArticles?.metaCounter[0]?.total);
		},
	});

	/** HANDLERS **/
	const paginationHandler = (e: T, value: number) => {
		setSearchCommunity({ ...searchCommunity, page: value });
	};

	const showArticleFeedback = (wasLiked: boolean) => {
		const feedbackCopy = getArticleLikeFeedbackCopy(wasLiked);
		setArticleFeedback((prev) => ({
			id: (prev?.id ?? 0) + 1,
			...feedbackCopy,
		}));
	};

	const likeBoArticleHandler = async (e: any, user: any, id: string, wasLiked = false) => {
		try {
			e.stopPropagation();
			if (!id) return;
			if (!user?._id) throw new Error(Messages.error2);

			await likeTargetBoardArticle({
				variables: {
					input: id,
				},
			});

			await boardArticlesRefetch({ input: searchCommunity });
			showArticleFeedback(wasLiked);
		} catch (err: any) {
			console.log('ERROR, likeBoArticleHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const editArticleHandler = async (e: React.MouseEvent, boardArticle: BoardArticle) => {
		try {
			e.stopPropagation();
			if (typeof window !== 'undefined') {
				window.sessionStorage.setItem(EDIT_DRAFT_STORAGE_KEY, JSON.stringify(boardArticle));
			}

			await router.push({
				pathname: '/mypage',
				query: {
					category: 'writeArticle',
					articleId: boardArticle._id,
				},
			});
		} catch (err: any) {
			sweetMixinErrorAlert(err.message ?? Messages.error1).then();
		}
	};

	const deleteArticleHandler = async (e: React.MouseEvent, id: string) => {
		try {
			e.stopPropagation();
			if (!id) throw new Error(Messages.error1);

			if (!(await sweetConfirmAlert('Are you sure you want to delete this article?'))) return;

			await updateBoardArticle({
				variables: {
					input: {
						_id: id,
						articleStatus: BoardArticleStatus.DELETE,
					},
				},
			});

			if (typeof window !== 'undefined') {
				const storedArticle = window.sessionStorage.getItem(EDIT_DRAFT_STORAGE_KEY);
				if (storedArticle) {
					const parsedArticle = JSON.parse(storedArticle);
					if (parsedArticle?._id === id) {
						window.sessionStorage.removeItem(EDIT_DRAFT_STORAGE_KEY);
					}
				}
			}

			await boardArticlesRefetch({ input: searchCommunity });
			await sweetTopSmallSuccessAlert('Article deleted!', 900);
		} catch (err: any) {
			sweetMixinErrorAlert(err.message ?? Messages.error1).then();
		}
	};

	if (device === 'mobile') {
		return <>ARTICLE PAGE MOBILE</>;
	} else
		return (
			<div id="my-articles-page">
				<Stack className="main-title-box">
					<Stack className="right-box">
						<Typography className="main-title">My Articles</Typography>
						<Typography className="sub-title">Manage and track your published community articles.</Typography>
					</Stack>
				</Stack>
				<Stack className="article-list-box">
					{boardArticles?.length > 0 ? (
						boardArticles?.map((boardArticle: BoardArticle) => {
							return (
								<Stack key={boardArticle?._id} className="article-item">
									<CommunityCard
										boardArticle={boardArticle}
										size={'small'}
										likeArticleHandler={likeBoArticleHandler}
									/>
									<Stack direction="row" className="article-actions">
										<Button
											className="edit-btn"
											onClick={(e) => editArticleHandler(e, boardArticle)}
										>
											Edit
										</Button>
										<Button
											className="delete-btn"
											onClick={(e) => deleteArticleHandler(e, boardArticle._id)}
										>
											Delete
										</Button>
									</Stack>
								</Stack>
							);
						})
					) : (
						<div className="no-data">
							<div className="no-data-icon-wrap">
								<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
									<rect x="8" y="10" width="48" height="44" rx="6" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/>
									<path d="M20 22h24M20 30h24M20 38h16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
								</svg>
							</div>
							<h3>No articles yet</h3>
							<p>Your published community articles will appear here. Write your first article to get started.</p>
						</div>
					)}
				</Stack>

				{boardArticles?.length > 0 && (
					<Stack className="pagination-conf">
						<Stack className="pagination-box">
							<Pagination
								count={Math.ceil(totalCount / searchCommunity.limit)}
								page={searchCommunity.page}
								shape="circular"
								color="primary"
								onChange={paginationHandler}
							/>
						</Stack>
						<Stack className="total">
							<Typography>Total {totalCount ?? 0} article(s) available</Typography>
						</Stack>
					</Stack>
				)}
				<ArticleLikeFeedback
					key={articleFeedback?.id ?? 'article-like-feedback'}
					feedback={articleFeedback}
					onDone={() => setArticleFeedback(null)}
				/>
			</div>
		);
};

MyArticles.defaultProps = {
	initialInput: {
		page: 1,
		limit: 9,
		sort: 'createdAt',
		direction: 'DESC',
		search: {},
	},
};

export default MyArticles;

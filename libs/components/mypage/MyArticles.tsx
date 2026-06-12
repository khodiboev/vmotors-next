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

const EDIT_DRAFT_STORAGE_KEY = 'vmotors-community-edit-draft';

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

	const likeBoArticleHandler = async (e: any, user: any, id: string) => {
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
			await sweetTopSmallSuccessAlert('Success!', 750);
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
						<Typography className="main-title">Article</Typography>
						<Typography className="sub-title">We are glad to see you again!</Typography>
					</Stack>
				</Stack>
				<Stack className="article-list-box">
					{boardArticles?.length > 0 ? (
						boardArticles?.map((boardArticle: BoardArticle) => {
							return (
								<Stack key={boardArticle?._id} sx={{ width: '285px', gap: 1.5 }}>
									<CommunityCard
										boardArticle={boardArticle}
										size={'small'}
										likeArticleHandler={likeBoArticleHandler}
									/>
									<Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ px: 0.5 }}>
										<Button
											size="small"
											variant="outlined"
											onClick={(e) => editArticleHandler(e, boardArticle)}
										>
											Edit
										</Button>
										<Button
											size="small"
											variant="outlined"
											color="error"
											onClick={(e) => deleteArticleHandler(e, boardArticle._id)}
										>
											Delete
										</Button>
									</Stack>
								</Stack>
							);
						})
					) : (
						<div className={'no-data'}>
							<img src="/img/icons/icoAlert.svg" alt="" />
							<p>No Articles found!</p>
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
			</div>
		);
};

MyArticles.defaultProps = {
	initialInput: {
		page: 1,
		limit: 6,
		sort: 'createdAt',
		direction: 'DESC',
		search: {},
	},
};

export default MyArticles;

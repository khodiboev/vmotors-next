import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Button, Tab, Tabs, IconButton, Backdrop, Pagination } from '@mui/material';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import Moment from 'react-moment';
import { userVar } from '../../apollo/store';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import { CommentInput, CommentsInquiry } from '../../libs/types/comment/comment.input';
import { Comment } from '../../libs/types/comment/comment';
import { CommentUpdate } from '../../libs/types/comment/comment.update';
import dynamic from 'next/dynamic';
import { CommentGroup, CommentStatus } from '../../libs/enums/comment.enum';
import { T } from '../../libs/types/common';
import EditIcon from '@mui/icons-material/Edit';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { BoardArticle } from '../../libs/types/board-article/board-article';
import { Messages } from '../../libs/config';
import { sweetConfirmAlert, sweetLoginConfirmAlert, sweetMixinErrorAlert, sweetMixinSuccessAlert } from '../../libs/sweetAlert';
import { CREATE_COMMENT, LIKE_TARGET_BOARD_ARTICLE, UPDATE_COMMENT } from '../../apollo/user/mutation';
import { GET_BOARD_ARTICLE, GET_COMMENTS } from '../../apollo/user/query';
import ArticleLikeFeedback, {
	ArticleLikeFeedbackState,
	getArticleLikeFeedbackCopy,
} from '../../libs/components/community/ArticleLikeFeedback';
const ToastViewerComponent = dynamic(() => import('../../libs/components/community/TViewer'), { ssr: false });

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const CommunityDetail: NextPage = ({ initialInput, ...props }: T) => {
	const router = useRouter();
	const { query } = router;

	const articleId = query?.id as string;
	const articleCategory = query?.articleCategory as string;

	const [comment, setComment] = useState<string>('');
	const [wordsCnt, setWordsCnt] = useState<number>(0);
	const [updatedCommentWordsCnt, setUpdatedCommentWordsCnt] = useState<number>(0);
	const user = useReactiveVar(userVar);
	const [comments, setComments] = useState<Comment[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [searchFilter, setSearchFilter] = useState<CommentsInquiry>({
		...initialInput,
	});
	const [memberImage, setMemberImage] = useState<string>('/img/community/articleImg.png');
	const [openBackdrop, setOpenBackdrop] = useState<boolean>(false);
	const [updatedComment, setUpdatedComment] = useState<string>('');
	const [updatedCommentId, setUpdatedCommentId] = useState<string>('');
	const [likeLoading, setLikeLoading] = useState<boolean>(false);
	const [boardArticle, setBoardArticle] = useState<BoardArticle>();
	const [articleFeedback, setArticleFeedback] = useState<ArticleLikeFeedbackState | null>(null);

	/** APOLLO REQUESTS **/
	const [likeTargetBoardArticle] = useMutation(LIKE_TARGET_BOARD_ARTICLE);
	const [createComment] = useMutation(CREATE_COMMENT);
	const [updateComment] = useMutation(UPDATE_COMMENT);

	// State is synced from `data` in effects below instead of onCompleted:
	// Apollo 3.5 + React 18 strict mode drops onCompleted on hard loads.
	const { data: boardArticleData, refetch: boardArticleRefetch } = useQuery(GET_BOARD_ARTICLE, {
		fetchPolicy: 'network-only',
		variables: {
			input: articleId,
		},
		notifyOnNetworkStatusChange: true,
	});

	useEffect(() => {
		if (!boardArticleData?.getBoardArticle) return;
		setBoardArticle(boardArticleData.getBoardArticle);
		if (boardArticleData.getBoardArticle?.memberData?.memberImage) {
			setMemberImage(`${process.env.REACT_APP_API_URL}/${boardArticleData.getBoardArticle.memberData.memberImage}`);
		}
	}, [boardArticleData]);

	const { data: getCommentsData, refetch: getCommentsRefetch } = useQuery(GET_COMMENTS, {
		fetchPolicy: 'cache-and-network',
		variables: {
			input: searchFilter,
		},
		notifyOnNetworkStatusChange: true,
	});

	useEffect(() => {
		if (!getCommentsData?.getComments) return;
		setComments(getCommentsData.getComments.list);
		setTotal(getCommentsData.getComments.metaCounter?.[0]?.total || 0);
	}, [getCommentsData]);

	/** LIFECYCLES **/
	useEffect(() => {
		if (articleId) setSearchFilter({ ...searchFilter, search: { commentRefId: articleId } });
	}, [articleId]);

	/** HANDLERS **/
	const showArticleFeedback = (wasLiked: boolean) => {
		const feedbackCopy = getArticleLikeFeedbackCopy(wasLiked);
		setArticleFeedback((prev) => ({
			id: (prev?.id ?? 0) + 1,
			...feedbackCopy,
		}));
	};

	const tabChangeHandler = (event: React.SyntheticEvent, value: string) => {
		router.replace(
			{
				pathname: '/community',
				query: { articleCategory: value },
			},
			'/community',
			{ shallow: true },
		);
	};


	const likeBoArticleHandler = async (user: any, id: any) => {
		try {
			if (likeLoading) return;
			if (!id) return;
			if (!user._id) throw new Error(Messages.error2);

			const wasLiked = Boolean(boardArticle?.meLiked?.[0]?.myFavorite);
			setLikeLoading(true);

			await likeTargetBoardArticle({
				variables: {
					input: id,
				},
			});

			await boardArticleRefetch({ input: articleId });
			showArticleFeedback(wasLiked);
		} catch (err: any) {
			console.log('ERROR, likeBoArticleHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		} finally {
			setLikeLoading(false);
		}
	};


	const createCommentHandler = async () => {
		if (!comment) return;

		try {
			if (!user?._id) throw new Error(Messages.error2);

			const commentInput: CommentInput = {
				commentGroup: CommentGroup.ARTICLE,
				commentRefId: articleId,
				commentContent: comment,
			};

			await createComment({
				variables: {
					input: commentInput,
				},
			});


			await getCommentsRefetch({ input: searchFilter });
			await boardArticleRefetch({ input: articleId });
			setComment('');
			await sweetMixinSuccessAlert('Successfully commented!');
		} catch (error: any) {
			await sweetMixinErrorAlert(error.message);
		}
	};

	
	const updateButtonHandler = async (commentId: string, commentStatus?: CommentStatus.DELETE) => {
		try {
			if (!user?._id) throw new Error(Messages.error2);
			if (!commentId) throw new Error('Select a comment to update!');
			if (updatedComment === comments?.find((comment) => comment?._id === commentId)?.commentContent) return;

			const updateData: CommentUpdate = {
				_id: commentId,
				...(commentStatus && { commentStatus: commentStatus }),
				...(updatedComment && { commentContent: updatedComment }),
			};

			if (!updateData?.commentContent && !updateData?.commentStatus)
				throw new Error('Provide data to update your comment!');

			if (commentStatus) {
				if (await sweetConfirmAlert('Do you want to delete the comment?')) {
					await updateComment({
						variables: {
							input: updateData,
						},
					});

					await sweetMixinSuccessAlert('Successfully deleted!');
				} else return;
			} else {
				await updateComment({
					variables: {
						input: updateData,
					},
				});

				await sweetMixinSuccessAlert('Successfully updated!');
			}

			await getCommentsRefetch({ input: searchFilter });
		} catch (error: any) {
			await sweetMixinErrorAlert(error.message);
		} finally {
			setOpenBackdrop(false);
			setUpdatedComment('');
			setUpdatedCommentWordsCnt(0);
			setUpdatedCommentId('');
		}
	};

	const getCommentMemberImage = (imageUrl: string | undefined) => {
		if (imageUrl) return `${process.env.REACT_APP_API_URL}/${imageUrl}`;
		else return '/img/community/articleImg.png';
	};

	const goMemberPage = (id: any) => {
		if (id === user?._id) router.push('/mypage');
		else router.push(`/member?memberId=${id}`);
	};

	const cancelButtonHandler = () => {
		setOpenBackdrop(false);
		setUpdatedComment('');
		setUpdatedCommentWordsCnt(0);
	};

	const updateCommentInputHandler = (value: string) => {
		if (value.length > 100) return;
		setUpdatedCommentWordsCnt(value.length);
		setUpdatedComment(value);
	};

	const paginationHandler = (e: T, value: number) => {
		setSearchFilter({ ...searchFilter, page: value });
	};

	return (
			<div id="community-detail-page">
				<div className="container">
					{/* Horizontal category nav — replaces old sidebar */}
					<div className="article-category-nav">
						<div className="category-nav-label">
							<span className="nav-eyebrow">Community</span>
							<span className="nav-sep" />
							<span className="nav-sub">Article</span>
						</div>
						<Tabs
							orientation="horizontal"
							aria-label="article categories"
							TabIndicatorProps={{ style: { display: 'none' } }}
							onChange={tabChangeHandler}
							value={articleCategory}
						>
							<Tab value={'FREE'} label={'Open Board'} className={`tab-button ${articleCategory === 'FREE' ? 'active' : ''}`} />
							<Tab value={'RECOMMEND'} label={'Recommendations'} className={`tab-button ${articleCategory === 'RECOMMEND' ? 'active' : ''}`} />
							<Tab value={'NEWS'} label={'Industry News'} className={`tab-button ${articleCategory === 'NEWS' ? 'active' : ''}`} />
							<Tab value={'HUMOR'} label={'Car Culture'} className={`tab-button ${articleCategory === 'HUMOR' ? 'active' : ''}`} />
						</Tabs>
						<Button
							className="write-button"
							onClick={async () => {
								if (!user._id) {
									const confirmed = await sweetLoginConfirmAlert('Please log in to write an article.');
									if (confirmed) await router.push('/account/join');
									return;
								}
								await router.push({ pathname: '/mypage', query: { category: 'writeArticle' } });
							}}
						>
							Write article
						</Button>
					</div>

					<div className="article-detail-main">
						{/* Premium gradient article header */}
						<div className="article-header-card">
							<div className="article-header-inner">
								<span className="article-category-badge">{articleCategory} Board</span>
								<h1 className="article-title">{boardArticle?.articleTitle}</h1>
								<div className="article-meta-row">
									<img
										src={memberImage}
										alt=""
										className="meta-avatar"
										onClick={() => goMemberPage(boardArticle?.memberData?._id)}
									/>
									<span className="meta-nick" onClick={() => goMemberPage(boardArticle?.memberData?._id)}>
										{boardArticle?.memberData?.memberNick}
									</span>
									<span className="meta-dot" />
									<Moment className="meta-date" format={'MMM DD, YYYY'}>
										{boardArticle?.createdAt}
									</Moment>
								</div>
								<div className="article-stats-row">
									<div className="stat-chip">
										{boardArticle?.meLiked && boardArticle?.meLiked[0]?.myFavorite ? <ThumbUpAltIcon /> : <ThumbUpOffAltIcon />}
										<span>{boardArticle?.articleLikes ?? 0}</span>
									</div>
									<div className="stat-chip">
										<VisibilityIcon />
										<span>{boardArticle?.articleViews ?? 0}</span>
									</div>
									<div className="stat-chip">
										<ChatBubbleOutlineRoundedIcon />
										<span>{boardArticle?.articleComments ?? 0}</span>
									</div>
								</div>
							</div>
						</div>

						{/* Article body */}
						<div className="article-body-card">
							<div className="article-content">
								<ToastViewerComponent markdown={boardArticle?.articleContent} className={'ytb_play'} />
							</div>
							<div className="article-like-section">
								<Button
									className="like-action-button"
									onClick={() => likeBoArticleHandler(user, boardArticle?._id)}
								>
									{boardArticle?.meLiked && boardArticle?.meLiked[0]?.myFavorite ? <ThumbUpAltIcon /> : <ThumbUpOffAltIcon />}
									<span>{boardArticle?.articleLikes ?? 0} likes</span>
								</Button>
							</div>
						</div>

						{/* Comments section */}
						<div className="article-comments-card">
							<h3 className="comments-heading">Comments ({total})</h3>

							<div className="comment-input-area">
								<input
									type="text"
									placeholder="Leave a comment…"
									value={comment}
									onChange={(e) => {
										if (e.target.value.length > 100) return;
										setWordsCnt(e.target.value.length);
										setComment(e.target.value);
									}}
								/>
								<div className="comment-input-footer">
									<span>{wordsCnt}/100</span>
									<Button className="comment-submit" onClick={createCommentHandler}>
										Post comment
									</Button>
								</div>
							</div>

							{total > 0 && (
								<div className="comment-list">
									{comments?.map((commentData) => (
										<div className="comment-item" key={commentData?._id}>
											<div className="comment-author-row">
												<div
													className="comment-author-info"
													onClick={() => goMemberPage(commentData?.memberData?._id as string)}
												>
													<img
														src={getCommentMemberImage(commentData?.memberData?.memberImage)}
														alt=""
														className="comment-avatar"
													/>
													<div className="comment-author-meta">
														<span className="comment-author-name">{commentData?.memberData?.memberNick}</span>
														<span className="comment-author-date">
															<Moment format={'MMM DD, YYYY'}>{commentData?.createdAt}</Moment>
														</span>
													</div>
												</div>
												{commentData?.memberId === user?._id && (
													<div className="comment-actions">
														<IconButton
															onClick={() => {
																setUpdatedCommentId(commentData?._id);
																updateButtonHandler(commentData?._id, CommentStatus.DELETE);
															}}
														>
															<DeleteForeverIcon />
														</IconButton>
														<IconButton
															onClick={() => {
																setUpdatedComment(commentData?.commentContent);
																setUpdatedCommentWordsCnt(commentData?.commentContent?.length);
																setUpdatedCommentId(commentData?._id);
																setOpenBackdrop(true);
															}}
														>
															<EditIcon />
														</IconButton>
													</div>
												)}
											</div>
											<p className="comment-content">{commentData?.commentContent}</p>
										</div>
									))}
								</div>
							)}

							{total > 0 && (
								<div className="comment-pagination">
									<Pagination
										count={Math.ceil(total / searchFilter.limit) || 1}
										page={searchFilter.page}
										shape="circular"
										color="primary"
										onChange={paginationHandler}
									/>
								</div>
							)}
						</div>
					</div>

					{/* Edit comment modal — outside the loop, controlled by openBackdrop */}
					<Backdrop className="edit-backdrop" open={openBackdrop} onClick={cancelButtonHandler}>
						<div className="edit-modal" onClick={(e) => e.stopPropagation()}>
							<h4>Edit comment</h4>
							<input
								autoFocus
								value={updatedComment}
								onChange={(e) => updateCommentInputHandler(e.target.value)}
								type="text"
								className="edit-input"
							/>
							<div className="edit-modal-footer">
								<span>{updatedCommentWordsCnt}/100</span>
								<div className="edit-modal-actions">
									<Button variant="outlined" color="inherit" onClick={cancelButtonHandler}>
										Cancel
									</Button>
									<Button
										variant="contained"
										color="inherit"
										onClick={() => updateButtonHandler(updatedCommentId, undefined)}
									>
										Update
									</Button>
								</div>
							</div>
						</div>
					</Backdrop>
				</div>
				<ArticleLikeFeedback
					key={articleFeedback?.id ?? 'article-like-feedback'}
					feedback={articleFeedback}
					onDone={() => setArticleFeedback(null)}
				/>
			</div>
	);
};
CommunityDetail.defaultProps = {
	initialInput: {
		page: 1,
		limit: 5,
		sort: 'createdAt',
		direction: 'DESC',
		search: { commentRefId: '' },
	},
};

export default withLayoutBasic(CommunityDetail);

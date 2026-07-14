import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { Pagination } from '@mui/material';
import { useRouter } from 'next/router';
import CommunityListingCard from '../community/CommunityListingCard';
import { T } from '../../types/common';
import { BoardArticle } from '../../types/board-article/board-article';
import { BoardArticlesInquiry } from '../../types/board-article/board-article.input';
import { useMutation, useQuery } from '@apollo/client';
import { LIKE_TARGET_BOARD_ARTICLE } from '../../../apollo/user/mutation';
import { GET_BOARD_ARTICLES } from '../../../apollo/user/query';
import { Messages } from '../../config';
import { sweetMixinErrorAlert } from '../../sweetAlert';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import ArticleLikeFeedback, {
	ArticleLikeFeedbackState,
	getArticleLikeFeedbackCopy,
} from '../community/ArticleLikeFeedback';

const MemberArticles: NextPage = ({ initialInput, ...props }: any) => {
	const router = useRouter();
	const [total, setTotal] = useState<number>(0);
	const { memberId } = router.query;
	const [searchFilter, setSearchFilter] = useState<BoardArticlesInquiry>(initialInput);
	const [memberBoArticles, setMemberBoArticles] = useState<BoardArticle[]>([]);
	const [articleFeedback, setArticleFeedback] = useState<ArticleLikeFeedbackState | null>(null);
	const user = useReactiveVar(userVar);

	/** APOLLO REQUESTS **/
	const [likeTargetBoardArticle] = useMutation(LIKE_TARGET_BOARD_ARTICLE);

	// Synced from `data` in an effect — Apollo 3.5 drops onCompleted on hard loads
	const { data: boardArticlesData, refetch: boardArticlesRefetch } = useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
	});

	useEffect(() => {
		if (!boardArticlesData?.getBoardArticles) return;
		setMemberBoArticles(boardArticlesData.getBoardArticles.list);
		setTotal(boardArticlesData.getBoardArticles.metaCounter?.[0]?.total || 0);
	}, [boardArticlesData]);

	/** LIFECYCLES **/
	useEffect(() => {
		if (memberId) setSearchFilter({ ...initialInput, search: { memberId: memberId } });
	}, [memberId]);

	/** HANDLERS **/
	const paginationHandler = (e: T, value: number) => {
		setSearchFilter({ ...searchFilter, page: value });
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

			await likeTargetBoardArticle({ variables: { input: id } });
			await boardArticlesRefetch({ input: searchFilter });
			showArticleFeedback(wasLiked);
		} catch (err: any) {
			console.log('ERROR, likeArticleHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	return (
		<div id="member-articles-page">
			<div className="section-header">
				<h2>Articles</h2>
				{total > 0 && <span>{total} article{total > 1 ? 's' : ''}</span>}
			</div>

			{memberBoArticles?.length === 0 ? (
				<div className="empty-state">
					<img src="/img/icons/icoAlert.svg" alt="" />
					<h3>No articles yet</h3>
					<p>This member hasn&apos;t published any community articles.</p>
				</div>
			) : (
				<div className="articles-grid">
					{memberBoArticles?.map((boardArticle: BoardArticle) => (
						<CommunityListingCard
							article={boardArticle}
							likeArticleHandler={likeArticleHandler}
							key={boardArticle?._id}
						/>
					))}
				</div>
			)}

			{memberBoArticles?.length !== 0 && (
				<div className="pagination-config">
					<Pagination
						count={Math.ceil(total / searchFilter.limit) || 1}
						page={searchFilter.page}
						shape="circular"
						color="primary"
						onChange={paginationHandler}
					/>
					<span>{total} article{total > 1 ? 's' : ''} available</span>
				</div>
			)}
			<ArticleLikeFeedback
				key={articleFeedback?.id ?? 'article-like-feedback'}
				feedback={articleFeedback}
				onDone={() => setArticleFeedback(null)}
			/>
		</div>
	);
};

MemberArticles.defaultProps = {
	initialInput: {
		page: 1,
		limit: 6,
		sort: 'createdAt',
		direction: 'DESC',
		search: {},
	},
};

export default MemberArticles;

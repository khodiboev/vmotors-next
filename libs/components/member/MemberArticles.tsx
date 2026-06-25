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
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';

const MemberArticles: NextPage = ({ initialInput, ...props }: any) => {
	const router = useRouter();
	const [total, setTotal] = useState<number>(0);
	const { memberId } = router.query;
	const [searchFilter, setSearchFilter] = useState<BoardArticlesInquiry>(initialInput);
	const [memberBoArticles, setMemberBoArticles] = useState<BoardArticle[]>([]);
	const user = useReactiveVar(userVar);

	/** APOLLO REQUESTS **/
	const [likeTargetBoardArticle] = useMutation(LIKE_TARGET_BOARD_ARTICLE);

	const { refetch: boardArticlesRefetch } = useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: any) => {
			setMemberBoArticles(data?.getBoardArticles?.list);
			setTotal(data?.getBoardArticles?.metaCounter?.[0]?.total || 0);
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (memberId) setSearchFilter({ ...initialInput, search: { memberId: memberId } });
	}, [memberId]);

	/** HANDLERS **/
	const paginationHandler = (e: T, value: number) => {
		setSearchFilter({ ...searchFilter, page: value });
	};

	const likeArticleHandler = async (e: any, user: any, id: string) => {
		try {
			e.stopPropagation();
			if (!id) return;
			if (!user._id) throw new Error(Messages.error2);

			await likeTargetBoardArticle({ variables: { input: id } });
			await boardArticlesRefetch({ input: searchFilter });
			await sweetTopSmallSuccessAlert('success', 800);
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

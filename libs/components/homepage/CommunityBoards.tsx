import React, { useState } from 'react';
import Link from 'next/link';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Box, Stack } from '@mui/material';
import { BoardArticle } from '../../types/board-article/board-article';
import { GET_BOARD_ARTICLES } from '../../../apollo/user/query';
import { useQuery } from '@apollo/client';
import { BoardArticleCategory } from '../../enums/board-article.enum';
import { T } from '../../types/common';
import HomepageCommunityCard from './HomepageCommunityCard';

const CommunityBoards = () => {
	const device = useDeviceDetect();
	const [searchCommunity] = useState({
		page: 1,
		sort: 'articleViews',
		direction: 'DESC',
	});
	const [newsArticles, setNewsArticles] = useState<BoardArticle[]>([]);
	const [freeArticles, setFreeArticles] = useState<BoardArticle[]>([]);

	/** APOLLO REQUESTS **/
	useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'network-only',
		variables: {
			input: {
				...searchCommunity,
				limit: 3,
				search: { articleCategory: BoardArticleCategory.NEWS },
			},
		},
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setNewsArticles(data?.getBoardArticles?.list ?? []);
		},
	});

	useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'network-only',
		variables: {
			input: {
				...searchCommunity,
				limit: 3,
				search: { articleCategory: BoardArticleCategory.FREE },
			},
		},
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setFreeArticles(data?.getBoardArticles?.list ?? []);
		},
	});

	if (device === 'mobile') {
		return (
			<Stack className={'community-board'}>
				<Stack className={'container'}>
					<Stack className={'info-box'}>
						<Box component={'div'} className={'left'}>
							<span>Community Highlights</span>
							<p>News, owner stories, and updates from the Santa community.</p>
						</Box>
					</Stack>

					<Stack className={'community-main mobile'}>
						<Stack className={'community-column'}>
							<div className={'content-top'}>
								<span>News</span>
								<Link href={'/community?articleCategory=NEWS'}>See all</Link>
							</div>
							<Stack className={'card-wrap'}>
								{newsArticles.length > 0 ? (
									newsArticles.slice(0, 3).map((article) => (
										<HomepageCommunityCard article={article} key={article?._id} />
									))
								) : (
									<div className={'community-empty'}>No articles yet</div>
								)}
							</Stack>
						</Stack>

						<Stack className={'community-column'}>
							<div className={'content-top'}>
								<span>Stories</span>
								<Link href={'/community?articleCategory=FREE'}>See all</Link>
							</div>
							<Stack className={'card-wrap'}>
								{freeArticles.length > 0 ? (
									freeArticles.slice(0, 3).map((article) => (
										<HomepageCommunityCard article={article} key={article?._id} />
									))
								) : (
									<div className={'community-empty'}>No articles yet</div>
								)}
							</Stack>
						</Stack>
					</Stack>
				</Stack>
			</Stack>
		);
	}

	return (
		<Stack className={'community-board'}>
			<Stack className={'container'}>
				<Stack className={'info-box'}>
					<Box component={'div'} className={'left'}>
						<span>Community Highlights</span>
						<p>News, owner stories, and updates from the broader Santa automotive conversation.</p>
					</Box>
				</Stack>
				<Stack className={'community-main'}>
					<Stack className={'community-column'}>
						<div className={'content-top'}>
							<span>Market News</span>
							<Link href={'/community?articleCategory=NEWS'}>See all</Link>
						</div>
						<Stack className={'card-wrap'}>
							{newsArticles.length > 0 ? (
								newsArticles.slice(0, 3).map((article) => (
									<HomepageCommunityCard article={article} key={article?._id} />
								))
							) : (
								<div className={'community-empty'}>No articles yet</div>
							)}
						</Stack>
					</Stack>

					<Stack className={'community-column'}>
						<div className={'content-top'}>
							<span>Owner Stories</span>
							<Link href={'/community?articleCategory=FREE'}>See all</Link>
						</div>
						<Stack className={'card-wrap'}>
							{freeArticles.length > 0 ? (
								freeArticles.slice(0, 3).map((article) => (
									<HomepageCommunityCard article={article} key={article?._id} />
								))
							) : (
								<div className={'community-empty'}>No articles yet</div>
							)}
						</Stack>
					</Stack>
				</Stack>
			</Stack>
		</Stack>
	);
};

export default CommunityBoards;

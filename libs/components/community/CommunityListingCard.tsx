import React from 'react';
import Link from 'next/link';
import Moment from 'react-moment';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import ArrowOutwardRoundedIcon from '@mui/icons-material/ArrowOutwardRounded';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { BoardArticle } from '../../types/board-article/board-article';
import { REACT_APP_API_URL } from '../../config';

interface CommunityListingCardProps {
	article: BoardArticle;
	likeArticleHandler?: any;
}

const stripHtml = (value?: string) => {
	if (!value) return '';
	return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
};

const categoryLabelMap: Record<string, string> = {
	FREE: 'Open board',
	RECOMMEND: 'Recommendations',
	NEWS: 'Industry news',
	HUMOR: 'Car culture',
};

const CommunityListingCard = ({ article, likeArticleHandler }: CommunityListingCardProps) => {
	const user = useReactiveVar(userVar);
	const imagePath = article?.articleImage ? `${REACT_APP_API_URL}/${article.articleImage}` : '/img/community/communityImg.png';
	const articleAuthor = article?.memberData?.memberFullName ?? article?.memberData?.memberNick ?? 'Santa';
	const articleSummary = stripHtml(article?.articleContent);
	const isLiked = Boolean(article?.meLiked?.[0]?.myFavorite);
	const summary =
		articleSummary.length > 140 ? `${articleSummary.slice(0, 137).trimEnd()}...` : articleSummary || 'Explore discussion, dealer insight, and Hyundai or Kia buying context from the Santa community.';

	return (
		<article className={'community-listing-card'}>
			<Link
				href={{
					pathname: '/community/detail',
					query: { articleCategory: article?.articleCategory, id: article?._id },
				}}
				className={'article-media'}
			>
				<img src={imagePath} alt={article?.articleTitle} />
				<span className={'article-category'}>{categoryLabelMap[article?.articleCategory] ?? article?.articleCategory}</span>
			</Link>

			<div className={'article-body'}>
				<div className={'article-topline'}>
					<div className={'article-meta-line'}>
						<span className={'author'}>{articleAuthor}</span>
						<span className={'meta-divider'} />
						<span className={'date'}>
							<Moment format={'MMM DD, YYYY'}>{article?.createdAt}</Moment>
						</span>
					</div>
					<button
						type="button"
						className={'like-button'}
						onClick={(e) => likeArticleHandler?.(e, user, article?._id, isLiked)}
						aria-label={'Like article'}
					>
						{isLiked ? <FavoriteIcon color={'primary'} /> : <FavoriteBorderIcon />}
					</button>
				</div>

				<Link
					href={{
						pathname: '/community/detail',
						query: { articleCategory: article?.articleCategory, id: article?._id },
					}}
					className={'article-copy'}
				>
					<span className={'article-kicker'}>{categoryLabelMap[article?.articleCategory] ?? article?.articleCategory}</span>
					<strong className={'article-title'}>{article?.articleTitle}</strong>
					<p className={'article-summary'}>{summary}</p>
				</Link>

				<div className={'article-footer'}>
					<div className={'article-metrics'}>
						<div className={'article-metric'}>
							<RemoveRedEyeOutlinedIcon />
							<span>{article?.articleViews ?? 0}</span>
						</div>
						<div className={'article-metric'}>
							<ChatBubbleOutlineRoundedIcon />
							<span>{article?.articleComments ?? 0}</span>
						</div>
						<div className={'article-metric'}>
							<FavoriteBorderIcon />
							<span>{article?.articleLikes ?? 0}</span>
						</div>
					</div>

					<Link
						href={{
							pathname: '/community/detail',
							query: { articleCategory: article?.articleCategory, id: article?._id },
						}}
						className={'article-link'}
					>
						<span>Read article</span>
						<ArrowOutwardRoundedIcon />
					</Link>
				</div>
			</div>
		</article>
	);
};

export default CommunityListingCard;

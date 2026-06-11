import React from 'react';
import Link from 'next/link';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import ArrowOutwardRoundedIcon from '@mui/icons-material/ArrowOutwardRounded';
import Moment from 'react-moment';
import { BoardArticle } from '../../types/board-article/board-article';
import { REACT_APP_API_URL } from '../../config';

interface HomepageCommunityCardProps {
	article: BoardArticle;
}

const HomepageCommunityCard = ({ article }: HomepageCommunityCardProps) => {
	const imagePath = article?.articleImage ? `${REACT_APP_API_URL}/${article.articleImage}` : '/img/community/communityImg.png';

	return (
		<Link
			href={{
				pathname: '/community/detail',
				query: { articleCategory: article?.articleCategory, id: article?._id },
			}}
		>
			<div className={'homepage-community-card'}>
				<div className={'article-thumb'}>
					<img src={imagePath} alt={article?.articleTitle} />
					<span className={'article-category'}>{article?.articleCategory}</span>
				</div>

				<div className={'article-body'}>
					<div className={'article-topline'}>
						<span className={'author'}>{article?.memberData?.memberNick ?? 'VMotors'}</span>
						<span className={'date'}>
							<Moment format={'MMM DD'}>{article?.createdAt}</Moment>
						</span>
					</div>

					<div className={'article-title'}>{article?.articleTitle}</div>

					<div className={'article-footer'}>
						<div className={'article-metric'}>
							<RemoveRedEyeOutlinedIcon />
							<span>{article?.articleViews ?? 0}</span>
						</div>
						<div className={'article-link'}>
							<span>Read story</span>
							<ArrowOutwardRoundedIcon />
						</div>
					</div>
				</div>
			</div>
		</Link>
	);
};

export default HomepageCommunityCard;

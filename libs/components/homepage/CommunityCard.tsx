import React from 'react';
import Link from 'next/link';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Box } from '@mui/material';
import Moment from 'react-moment';
import { BoardArticle } from '../../types/board-article/board-article';
import { REACT_APP_API_URL } from '../../config';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';

interface CommunityCardProps {
	vertical: boolean;
	article: BoardArticle;
	index: number;
}

const CommunityCard = (props: CommunityCardProps) => {
	const { vertical, article, index } = props;
	const device = useDeviceDetect();
	const hasImage = Boolean(article?.articleImage);
	const articleImage = hasImage ? `${REACT_APP_API_URL}/${article?.articleImage}` : '';

	if (device === 'mobile') {
		return <div>COMMUNITY CARD (MOBILE)</div>;
	} else {
		if (vertical) {
			return (
				<Link href={`/community/detail?articleCategory=${article?.articleCategory}&id=${article?._id}`}>
					<Box component={'div'} className={'vertical-card'}>
						<div className={'community-img'} style={hasImage ? { backgroundImage: `url(${articleImage})` } : undefined}>
							{!hasImage && <ArticleOutlinedIcon className={'img-placeholder-icon'} />}
							<div>{index + 1}</div>
						</div>
						<strong>{article?.articleTitle}</strong>
						<span>Free Board</span>
					</Box>
				</Link>
			);
		} else {
			return (
				<>
					<Link href={`/community/detail?articleCategory=${article?.articleCategory}&id=${article?._id}`}>
						<Box component={'div'} className="horizontal-card">
							{hasImage ? (
								<img src={articleImage} alt="" />
							) : (
								<div className={'img-placeholder'}>
									<ArticleOutlinedIcon />
								</div>
							)}
							<div>
								<strong>{article.articleTitle}</strong>
								<span>
									<Moment format="DD.MM.YY">{article?.createdAt}</Moment>
								</span>
							</div>
						</Box>
					</Link>
				</>
			);
		}
	}
};

export default CommunityCard;

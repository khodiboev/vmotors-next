import React from 'react';
import { Comment } from '../../types/comment/comment';
import Moment from 'react-moment';
import { REACT_APP_API_URL } from '../../config';

interface ReviewCardProps {
	fromMyPage?: string;
	comment: Comment;
}

const ReviewCard = (props: ReviewCardProps) => {
	const { comment } = props;
	const imagePath: string = comment?.memberData?.memberImage
		? `${REACT_APP_API_URL}/${comment.memberData.memberImage}`
		: '/img/profile/defaultUser.svg';

	return (
		<div className="review-card">
			<div className="review-author">
				<img src={imagePath} alt="" />
				<div className="author-info">
					<strong>{comment.memberData?.memberNick}</strong>
					<time>
						<Moment format="DD MMM YYYY">{comment.createdAt}</Moment>
					</time>
				</div>
			</div>
			<p className="review-content">{comment.commentContent}</p>
		</div>
	);
};

export default ReviewCard;

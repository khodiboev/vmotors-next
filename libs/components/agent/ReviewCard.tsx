import React from 'react';
import { Comment } from '../../types/comment/comment';
import Moment from 'react-moment';
import { IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { REACT_APP_API_URL } from '../../config';

interface ReviewCardProps {
	comment: Comment;
	onEdit?: (comment: Comment) => void;
	onDelete?: (commentId: string) => void;
}

const ReviewCard = (props: ReviewCardProps) => {
	const { comment, onEdit, onDelete } = props;
	const user = useReactiveVar(userVar);
	const isOwnComment = !!user?._id && comment?.memberId === user._id;
	const imagePath: string = comment?.memberData?.memberImage
		? `${REACT_APP_API_URL}/${comment.memberData.memberImage}`
		: '/img/profile/defaultUser.svg';

	return (
		<div className="review-card">
			<div className="review-header">
				<div className="review-author">
					<img src={imagePath} alt="" />
					<div className="author-info">
						<strong>{comment.memberData?.memberNick}</strong>
						<time>
							<Moment format="DD MMM YYYY">{comment.createdAt}</Moment>
						</time>
					</div>
				</div>
				{isOwnComment && (
					<div className="review-actions">
						<IconButton onClick={() => onEdit?.(comment)} aria-label={'Edit review'}>
							<EditIcon />
						</IconButton>
						<IconButton onClick={() => onDelete?.(comment._id)} aria-label={'Delete review'}>
							<DeleteForeverIcon />
						</IconButton>
					</div>
				)}
			</div>
			<p className="review-content">{comment.commentContent}</p>
		</div>
	);
};

export default ReviewCard;

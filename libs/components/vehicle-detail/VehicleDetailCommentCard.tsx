import React from 'react';
import Link from 'next/link';
import moment from 'moment';
import { IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { REACT_APP_API_URL } from '../../config';
import { Comment } from '../../types/comment/comment';

interface VehicleDetailCommentCardProps {
	comment: Comment;
	onEdit?: (comment: Comment) => void;
	onDelete?: (commentId: string) => void;
}

const VehicleDetailCommentCard = ({ comment, onEdit, onDelete }: VehicleDetailCommentCardProps) => {
	const user = useReactiveVar(userVar);
	const isOwnComment = !!user?._id && comment?.memberId === user._id;
	const commenterName = comment?.memberData?.memberFullName ?? comment?.memberData?.memberNick ?? 'Santa member';
	const commenterImage = comment?.memberData?.memberImage
		? `${REACT_APP_API_URL}/${comment.memberData.memberImage}`
		: '/img/profile/defaultUser.svg';
	const profilePath = comment?.memberData?._id ? `/member?memberId=${comment.memberData._id}` : undefined;

	return (
		<article className={'vehicle-detail-comment-card'}>
			<div className={'comment-header'}>
				<div className={'comment-author'}>
					<img src={commenterImage} alt={commenterName} />
					<div className={'author-copy'}>
						{profilePath ? (
							<Link href={profilePath}>
								<strong>{commenterName}</strong>
							</Link>
						) : (
							<strong>{commenterName}</strong>
						)}
						<span>{moment(comment?.createdAt).format('DD MMM YYYY')}</span>
					</div>
				</div>
				<div className={'comment-header-right'}>
					{isOwnComment && (
						<div className={'comment-actions'}>
							<IconButton onClick={() => onEdit?.(comment)} aria-label={'Edit comment'}>
								<EditIcon />
							</IconButton>
							<IconButton onClick={() => onDelete?.(comment._id)} aria-label={'Delete comment'}>
								<DeleteForeverIcon />
							</IconButton>
						</div>
					)}
					<div className={'comment-tag'}>
						<ChatBubbleOutlineRoundedIcon />
						<span>Buyer note</span>
					</div>
				</div>
			</div>

			<p>{comment?.commentContent}</p>
		</article>
	);
};

export default VehicleDetailCommentCard;

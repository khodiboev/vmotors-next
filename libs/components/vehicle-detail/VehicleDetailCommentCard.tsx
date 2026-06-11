import React from 'react';
import Link from 'next/link';
import moment from 'moment';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import { REACT_APP_API_URL } from '../../config';
import { Comment } from '../../types/comment/comment';

interface VehicleDetailCommentCardProps {
	comment: Comment;
}

const VehicleDetailCommentCard = ({ comment }: VehicleDetailCommentCardProps) => {
	const commenterName = comment?.memberData?.memberFullName ?? comment?.memberData?.memberNick ?? 'VMotors member';
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
				<div className={'comment-tag'}>
					<ChatBubbleOutlineRoundedIcon />
					<span>Buyer note</span>
				</div>
			</div>

			<p>{comment?.commentContent}</p>
		</article>
	);
};

export default VehicleDetailCommentCard;

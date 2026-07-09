import React, { useEffect } from 'react';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

export interface ArticleLikeFeedbackState {
	id: number;
	message: string;
	action: 'saved' | 'removed';
}

export const getArticleLikeFeedbackCopy = (wasLiked: boolean) => ({
	action: wasLiked ? 'removed' : 'saved',
	message: wasLiked ? 'Article unliked' : 'Article liked',
} as const);

interface ArticleLikeFeedbackProps {
	feedback: ArticleLikeFeedbackState | null;
	onDone: () => void;
}

const ArticleLikeFeedback = ({ feedback, onDone }: ArticleLikeFeedbackProps) => {
	useEffect(() => {
		if (!feedback) return;

		const timer = window.setTimeout(onDone, 1800);
		return () => window.clearTimeout(timer);
	}, [feedback?.id]);

	if (!feedback) return null;

	return (
		<div className={`article-like-feedback ${feedback.action === 'saved' ? 'is-saved' : 'is-removed'}`} role="status" aria-live="polite">
			<span className="article-like-feedback-icon">
				{feedback.action === 'saved' ? <FavoriteIcon /> : <FavoriteBorderIcon />}
			</span>
			<span className="article-like-feedback-message">{feedback.message}</span>
		</div>
	);
};

export default ArticleLikeFeedback;

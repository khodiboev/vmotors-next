import React from 'react';

const CommunityListingSkeleton = () => {
	return (
		<div className={'community-listing-card skeleton'}>
			<div className={'article-media shimmer'} />
			<div className={'article-body'}>
				<div className={'article-topline'}>
					<div className={'skeleton-author'}>
						<div className={'skeleton-line sm shimmer'} />
						<div className={'skeleton-line xs shimmer'} />
					</div>
					<div className={'skeleton-like shimmer'} />
				</div>
				<div className={'skeleton-copy'}>
					<div className={'skeleton-line lg shimmer'} />
					<div className={'skeleton-line md shimmer'} />
					<div className={'skeleton-line md short shimmer'} />
				</div>
				<div className={'article-footer'}>
					<div className={'skeleton-metrics'}>
						<span className={'shimmer'} />
						<span className={'shimmer'} />
						<span className={'shimmer'} />
					</div>
					<div className={'skeleton-line xs shimmer'} />
				</div>
			</div>
		</div>
	);
};

export default CommunityListingSkeleton;

import React from 'react';

const DealerDirectorySkeleton = () => {
	return (
		<div className={'dealer-directory-card skeleton'}>
			<div className={'dealer-card-top'}>
				<div className={'dealer-avatar-wrap shimmer'} />
				<div className={'dealer-identity'}>
					<div className={'skeleton-pills'}>
						<span className={'shimmer'} />
						<span className={'shimmer'} />
					</div>
					<div className={'skeleton-line title shimmer'} />
					<div className={'skeleton-line subtitle shimmer'} />
				</div>
			</div>
			<div className={'skeleton-line body shimmer'} />
			<div className={'skeleton-line body short shimmer'} />
			<div className={'skeleton-meta'}>
				<div className={'skeleton-line meta shimmer'} />
				<div className={'skeleton-line meta shimmer'} />
			</div>
			<div className={'dealer-stats'}>
				<div className={'stat-box shimmer'} />
				<div className={'stat-box shimmer'} />
				<div className={'stat-box shimmer'} />
			</div>
			<div className={'dealer-card-footer'}>
				<div className={'skeleton-line footer shimmer'} />
				<div className={'skeleton-metrics'}>
					<span className={'shimmer'} />
					<span className={'shimmer'} />
				</div>
			</div>
		</div>
	);
};

export default DealerDirectorySkeleton;

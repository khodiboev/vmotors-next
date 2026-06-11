import React from 'react';

const VehicleListSkeleton = () => {
	return (
		<div className={'vehicle-list-card skeleton'}>
			<div className={'card-media shimmer'} />
			<div className={'card-body'}>
				<div className={'skeleton-line title shimmer'} />
				<div className={'skeleton-line subtitle shimmer'} />
				<div className={'skeleton-pills'}>
					<span className={'shimmer'} />
					<span className={'shimmer'} />
					<span className={'shimmer'} />
				</div>
				<div className={'skeleton-line small shimmer'} />
				<div className={'skeleton-footer'}>
					<div className={'skeleton-dealer shimmer'} />
					<div className={'skeleton-metrics'}>
						<span className={'shimmer'} />
						<span className={'shimmer'} />
					</div>
				</div>
			</div>
		</div>
	);
};

export default VehicleListSkeleton;

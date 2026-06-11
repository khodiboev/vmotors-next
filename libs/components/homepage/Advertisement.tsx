import React from 'react';
import { useRouter } from 'next/router';

const Advertisement = () => {
	const router = useRouter();

	return (
		<div className={'video-frame'}>
			<div className={'video-overlay'}>
				<span className={'video-eyebrow'}>Cinematic brand moment</span>
				<h3>Premium presentation, real vehicle discovery.</h3>
				<p>VMotors keeps the browsing experience elegant while your next shortlist takes shape.</p>
				<button onClick={() => router.push('/vehicle')}>Explore inventory</button>
			</div>
			<video
				autoPlay
				muted
				loop
				playsInline
				preload="auto"
			>
				<source src="/video/ads.mp4" type="video/mp4" />
			</video>
		</div>
	);
};

export default Advertisement;

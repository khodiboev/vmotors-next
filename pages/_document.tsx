import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
	return (
		<Html lang="en">
			<Head>
				<meta name="robots" content="index,follow" />
				<link rel="icon" type="image/svg+xml" href="/img/logo/favicon.svg" />
				<meta name="theme-color" content="#0A1F44" />

				{/* SEO */}
				<meta name="keyword" content={'Santa, Hyundai Korea, Kia Korea, premium car marketplace, verified dealers, new car inventory'} />
				<meta
					name={'description'}
					content={
						'Santa is Korea’s premium Hyundai and Kia marketplace. Browse verified dealer inventory, compare prices, and discover new vehicles with a cleaner buying experience.'
					}
				/>
				<meta property="og:title" content="Santa | Premium Hyundai & Kia Marketplace in Korea" />
				<meta
					property="og:description"
					content="Browse verified Hyundai and Kia dealer inventory across Korea with Santa."
				/>
				<meta property="og:type" content="website" />
				<meta name="twitter:card" content="summary" />
				<meta name="twitter:title" content="Santa | Premium Hyundai & Kia Marketplace in Korea" />
				<meta
					name="twitter:description"
					content="Browse verified Hyundai and Kia dealer inventory across Korea with Santa."
				/>
			</Head>
			<body>
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}

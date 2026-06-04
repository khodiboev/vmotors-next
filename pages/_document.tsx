import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
	return (
		<Html lang="en">
			<Head>
				<meta name="robots" content="index,follow" />
				<link rel="icon" type="image/png" href="/img/logo/favicon.svg" />

				{/* SEO */}
				<meta name="keyword" content={'vmotors, Hyundai, Kia, new cars, Korea car sales'} />
				<meta
					name={'description'}
					content={
						'Browse new Hyundai and Kia vehicles in South Korea with VMotors. Compare dealer inventory, prices, and availability. | ' +
						'VMotors помогает подобрать новые автомобили Hyundai и Kia в Южной Корее. | ' +
						'VMotors에서 대한민국 현대/기아 신차 재고와 가격을 확인하세요.'
					}
				/>
			</Head>
			<body>
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}

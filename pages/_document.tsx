import { Html, Head, Main, NextScript, DocumentProps } from 'next/document';

export default function Document(props: DocumentProps) {
	return (
		<Html lang={props.__NEXT_DATA__.locale ?? 'uz'}>
			<Head>
				<meta name="robots" content="index,follow" />
				<link rel="icon" type="image/svg+xml" href="/img/logo/favicon.svg" />
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
				<link
					rel="stylesheet"
					href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=DM+Serif+Display&display=swap"
				/>

				{/* SEO */}
				<meta name="keyword" content={'reneva, k-beauty, cosmetics, skincare, makeup, ai skin analysis'} />
				<meta
					name={'description'}
					content={
						'Reneva: K-beauty for every skin type. Shop skincare and makeup from many brands, check your skin with AI and get picks that suit you. | ' +
						'Reneva: косметика K-beauty для любого типа кожи. | ' +
						'Reneva: 모든 피부 타입을 위한 K-뷰티 쇼핑몰'
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

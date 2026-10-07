import React, { useState } from 'react';

// soft pastel tiles and bottle shapes used until a product has a real photo
const tiles = ['#F1EDFB', '#FBE3D6', '#E6E0F6', '#F9EBE3'];
const caps = ['#9C8BD6', '#E8A27E', '#26223A', '#C9BDEB'];

const hash = (seed: string) => seed.split('').reduce((sum, ch) => (sum * 31 + ch.charCodeAt(0)) >>> 0, 7);

interface ProductThumbProps {
	image?: string;
	size?: number | string;
	seed?: string;
	radius?: number;
	className?: string;
	alt?: string;
}

const ProductThumb = ({ image, size = '100%', seed = 'reneva', radius = 18, className = '', alt = '' }: ProductThumbProps) => {
	const [broken, setBroken] = useState<boolean>(false);
	const n = hash(seed);
	const tile = tiles[n % tiles.length];
	const cap = caps[(n >> 3) % caps.length];
	const kind = (n >> 5) % 3; // 0 jar, 1 tube, 2 bottle

	const box: React.CSSProperties = {
		width: size,
		height: size,
		borderRadius: radius,
		background: tile,
		display: 'flex',
		alignItems: 'flex-end',
		justifyContent: 'center',
		overflow: 'hidden',
		flexShrink: 0,
		position: 'relative',
	};

	if (image && !broken) {
		return (
			<div className={`product-thumb ${className}`} style={box}>
				<img
					src={image}
					alt={alt}
					onError={() => setBroken(true)}
					style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
				/>
			</div>
		);
	}

	const shapes = [
		{ cap: { w: 64, h: 18, r: 8 }, body: { w: 76, h: 54, r: 16 } },
		{ cap: { w: 26, h: 30, r: 6 }, body: { w: 54, h: 120, r: 18 } },
		{ cap: { w: 16, h: 34, r: 5 }, body: { w: 46, h: 104, r: 14 } },
	][kind];

	return (
		<div className={`product-thumb ${className}`} style={box} role={alt ? 'img' : undefined} aria-label={alt || undefined}>
			<svg viewBox={'0 0 160 160'} width={'100%'} height={'100%'} aria-hidden={'true'}>
				<g transform={`translate(${80 - shapes.body.w / 2} ${150 - shapes.body.h - 18})`}>
					<rect x={(shapes.body.w - shapes.cap.w) / 2} y={-shapes.cap.h + 2} width={shapes.cap.w} height={shapes.cap.h} rx={shapes.cap.r} fill={cap} />
					<rect width={shapes.body.w} height={shapes.body.h} rx={shapes.body.r} fill={'#FFFFFF'} />
				</g>
			</svg>
		</div>
	);
};

export default ProductThumb;

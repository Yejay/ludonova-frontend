/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'steamcommunity.com',
				pathname: '/public/images/signinthroughsteam/**',
			},
		],
	},
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'steamcommunity.com',
				pathname: '/public/images/signinthroughsteam/**',
			},
			{
				protocol: 'https',
				hostname: 'media.rawg.io',
				pathname: '/media/**',
			},
			{
				protocol: 'https',
				hostname: 'avatars.steamstatic.com',
				pathname: '/**',
			},
		],
	},
};

export default nextConfig;

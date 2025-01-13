/** @type {import('next').NextConfig} */
const nextConfig = {
	eslint: {
		// Warning: This allows production builds to successfully complete even if
		// your project has ESLint errors.
		ignoreDuringBuilds: true,
	},
	typescript: {
		// Warning: This allows production builds to successfully complete even if
		// your project has type errors.
		ignoreBuildErrors: true,
	},
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
			{
				protocol: 'https',
				hostname: 'steamcdn-a.akamaihd.net',
				pathname: '/**',
			},
		],
	},
};

export default nextConfig;

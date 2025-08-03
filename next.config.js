/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
        // Ignore les erreurs TypeScript pour les dépendances externes
        ignoreBuildErrors: process.env.NEXT_PUBLIC_ENVIRONMENT === 'production',
    },
    eslint: {
        // Ignore les erreurs ESLint pour les dépendances
        ignoreDuringBuilds: process.env.NEXT_PUBLIC_ENVIRONMENT === 'production',
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'pbs.twimg.com',
            },
            {
                protocol: 'https',
                hostname: 'abs.twimg.com',
            },
            {
                protocol: 'https',
                hostname: 'i.imgur.com',
            },
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
            },
            {
                protocol: 'https',
                hostname: 'avatars.githubusercontent.com',
            },
            {
                protocol: 'https',
                hostname: 'app.hyperliquid.xyz',
            },
            {
                protocol: 'https',
                hostname: 'substackcdn.com',
            },
            {
                protocol: 'https',
                hostname: 'substack-post-media.s3.amazonaws.com',
            },
            {
                protocol: 'https',
                hostname: 'cdn.substack.com',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: 'media.licdn.com',
            },
            {
                protocol: 'https',
                hostname: 'cdn-images-1.medium.com',
            },
            {
                protocol: 'https',
                hostname: 'miro.medium.com',
            },
            {
                protocol: 'https',
                hostname: 'cdn.hashnode.com',
            },
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
            },
            {
                protocol: 'https',
                hostname: 'images.ctfassets.net',
            },
            {
                protocol: 'https',
                hostname: 'cdn.discordapp.com',
            },
            {
                protocol: 'https',
                hostname: 'media.discordapp.net',
            },
            {
                protocol: 'https',
                hostname: 'cdn.prod.website-files.com',
            },
            {
                protocol: 'https',
                hostname: 'images.website-files.com',
            },
            {
                protocol: 'https',
                hostname: 'assets.website-files.com',
            },
            {
                protocol: 'https',
                hostname: 'via.placeholder.com',
            },
            {
                protocol: 'https',
                hostname: 'placehold.co',
            },
            {
                protocol: 'https',
                hostname: 'placehold.it',
            },
            {
                protocol: 'https',
                hostname: 'picsum.photos',
            },
            {
                protocol: 'https',
                hostname: 'loremflickr.com',
            },
            {
                protocol: 'https',
                hostname: 'dummyimage.com',
            },
            {
                protocol: 'https',
                hostname: 'placekitten.com',
            },
            {
                protocol: 'https',
                hostname: 'placeimg.com',
            },
            {
                protocol: 'http',
                hostname: 'localhost',
            },
            {
                protocol: 'http',
                hostname: '127.0.0.1',
            },
        ],
    },
};

module.exports = nextConfig;

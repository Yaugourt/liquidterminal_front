/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: [
            // Twitter
            "pbs.twimg.com",
            "abs.twimg.com",
            // Farcaster
            "i.imgur.com",
            "lh3.googleusercontent.com",
            // GitHub
            "avatars.githubusercontent.com",
            // Hyperliquid
            "app.hyperliquid.xyz",
            // Link previews
            "substackcdn.com",
            "substack-post-media.s3.amazonaws.com",
            "cdn.substack.com",
            "images.unsplash.com",
            "media.licdn.com",
            "cdn-images-1.medium.com",
            "miro.medium.com",
            "cdn.hashnode.com",
            "res.cloudinary.com",
            "images.ctfassets.net",
            "cdn.discordapp.com",
            "media.discordapp.net",
            "cdn.prod.website-files.com",
            "images.website-files.com",
            "assets.website-files.com",
        ],
    },
};

module.exports = nextConfig;

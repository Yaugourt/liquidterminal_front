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
        ],
    },
};

module.exports = nextConfig;

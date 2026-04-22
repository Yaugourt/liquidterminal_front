/** @type {import('next').NextConfig} */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
    async redirects() {
        return [
            { source: '/docs/hip4', destination: '/hip4/home', permanent: true },
            { source: '/docs/hip4/:path*', destination: '/hip4/:path*', permanent: true },
        ];
    },
    typescript: {
        ignoreBuildErrors: false,
    },
    // ✅ Ne pas ignorer ESLint - on garde la détection des vraies erreurs de code
    
    // 🔒 Security Headers
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin',
                    },
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=()',
                    },
                ],
            },
        ];
    },
    
    experimental: {
        optimizePackageImports: ['recharts', 'lucide-react', 'framer-motion'],
    },

    images: {
        // ✅ Image optimization enabled
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'app.hyperliquid.xyz',
                pathname: '/coins/**',
            },
            {
                protocol: 'https',
                hostname: 'pbs.twimg.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'pub-097cebbc75d04a3fbd5d0e416820c1a5.r2.dev',
                pathname: '/**',
            },
            {
                protocol: 'http',
                hostname: 'localhost',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'hyperliquid.gitbook.io',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'hyperliquid-co.gitbook.io',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'substackcdn.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'cdn.prod.website-files.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'luganodes.com',
                pathname: '/**',
            },
        ],
        dangerouslyAllowSVG: true,
        contentDispositionType: 'attachment',
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    },
};

module.exports = withBundleAnalyzer(nextConfig);

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
        unoptimized: true,
        dangerouslyAllowSVG: true,
        contentDispositionType: 'attachment',
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    },
};

module.exports = nextConfig;

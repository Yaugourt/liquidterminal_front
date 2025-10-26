/** @type {import('next').NextConfig} */
const nextConfig = {
    // ✅ Ne plus ignorer les erreurs TypeScript/ESLint en production
    // Cela permet de détecter les bugs critiques avant le déploiement
    images: {
        unoptimized: true,
        dangerouslyAllowSVG: true,
        contentDispositionType: 'attachment',
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    },
};

module.exports = nextConfig;

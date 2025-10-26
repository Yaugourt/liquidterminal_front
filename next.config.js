/** @type {import('next').NextConfig} */
const nextConfig = {

    // ✅ Ne pas ignorer ESLint - on garde la détection des vraies erreurs de code
    images: {
        unoptimized: true,
        dangerouslyAllowSVG: true,
        contentDispositionType: 'attachment',
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    },
};

module.exports = nextConfig;

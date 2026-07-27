/** @type {import('next').NextConfig} */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
    async redirects() {
        return [
            // /market has no page of its own but is linked from the landing
            // header/footer and the Cmd+K palette: land on the spot overview.
            // /market is a real page now (the Market hub) — no redirect.
            // /ecosystem has no page of its own; it was the (404) canonical
            // target of the project directory for months, so keep a redirect.
            { source: '/ecosystem', destination: '/ecosystem/project', permanent: true },
            { source: '/docs/hip4', destination: '/hip4/home', permanent: true },
            { source: '/docs/hip4/:path*', destination: '/hip4/:path*', permanent: true },
            // The wiki landing IS the introduction chapter now; keep the old
            // deep-link canonical by folding it back onto /wiki.
            { source: '/wiki/learn/introduction', destination: '/wiki', permanent: true },
            // /wiki/learn only ever existed as a path prefix (/wiki/learn/:chapter),
            // so the bare segment 404'd even though it reads like a real page.
            { source: '/wiki/learn', destination: '/wiki', permanent: true },
        ];
    },
    typescript: {
        ignoreBuildErrors: false,
    },
    // ✅ Ne pas ignorer ESLint - on garde la détection des vraies erreurs de code

    // Remove the `X-Powered-By: Next.js` version-disclosure header.
    poweredByHeader: false,

    // 🔒 Security Headers
    async headers() {
        // Staged CSP: enforced structurally (clickjacking / plugins / base), and
        // a script-src/connect-src policy shipped in REPORT-ONLY so it surfaces
        // violations in the console WITHOUT risking the Privy/WalletConnect login
        // flow. Flip this to an enforced `Content-Security-Policy` (ideally
        // nonce + 'strict-dynamic') once a QA pass confirms wallet login, Privy
        // iframe and WalletConnect all pass clean. The escaping in JsonLd.tsx is
        // the primary fix; this is defence-in-depth.
        const reportOnlyCsp = [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval'",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: blob: https:",
            "font-src 'self' data:",
            "frame-src 'self' https://auth.privy.io https://verify.walletconnect.com https://verify.walletconnect.org",
            "connect-src 'self' https: wss:",
            "frame-ancestors 'none'",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
        ].join('; ');

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
                        // includeSubDomains added. `preload` is intentionally NOT
                        // set — it is a hard-to-reverse commitment for every
                        // subdomain and should be an explicit ops decision.
                        key: 'Strict-Transport-Security',
                        value: 'max-age=63072000; includeSubDomains',
                    },
                    {
                        // interest-cohort opts out of FLoC. payment/usb left
                        // enabled: hardware wallets (WebUSB) and payment flows.
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
                    },
                    {
                        // Structural CSP only: anti-clickjacking (complements
                        // X-Frame-Options), no plugins, no <base> hijack.
                        key: 'Content-Security-Policy',
                        value: "frame-ancestors 'none'; object-src 'none'; base-uri 'self'",
                    },
                    {
                        // Staged script/connect policy — reports, does not block.
                        key: 'Content-Security-Policy-Report-Only',
                        value: reportOnlyCsp,
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
            // DefiLlama protocol logos (project page peers module).
            {
                protocol: 'https',
                hostname: 'icons.llamao.fi',
                pathname: '/icons/**',
            },
            // localhost is allowed ONLY in dev — in production it would turn the
            // image optimizer into a loopback SSRF / port-probe primitive.
            ...(process.env.NODE_ENV === 'development'
                ? [{ protocol: 'http', hostname: 'localhost', pathname: '/**' }]
                : []),
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

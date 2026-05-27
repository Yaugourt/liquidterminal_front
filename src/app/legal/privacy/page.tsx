import type { Metadata } from "next";
import { LegalPage } from "@/components/common";

export const metadata: Metadata = {
  title: "Privacy Policy · Liquid Terminal",
  description: "How Liquid Terminal collects, uses, and protects your personal data — GDPR-aligned.",
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      lastUpdated="May 23, 2026"
      intro="This Privacy Policy explains how Liquid Terminal (“we”, “us”) collects, uses, shares, and protects personal data when you visit liquidterminal.com or use our services. We aim to comply with the EU General Data Protection Regulation (GDPR) and equivalent frameworks."
    >
      <section>
        <h2>1. Data We Collect</h2>
        <h3>1.1 Information you provide</h3>
        <ul>
          <li><strong>Account information</strong>: email address, username, profile data, and authentication data when you sign in via Privy (including the wallet address you connect).</li>
          <li><strong>User-generated content</strong>: readlists, ecosystem project submissions, wallet lists, and any other content you publish on the Service.</li>
          <li><strong>Communications</strong>: messages you send us, including support requests.</li>
        </ul>

        <h3>1.2 Information collected automatically</h3>
        <ul>
          <li><strong>Usage data</strong>: pages visited, features used, timestamps, referrer, and approximate location derived from your IP address. Collected via Vercel Analytics in a privacy-friendly, cookieless mode (no individual tracking identifiers stored on your device).</li>
          <li><strong>Technical data</strong>: IP address, browser type, device type, operating system, language preferences, and timezone — used for security, debugging, and content delivery.</li>
          <li><strong>On-chain data</strong>: when you connect a wallet, we associate publicly available on-chain activity (e.g., positions, trades, balances) with your session to display your dashboard. We do not store this on-chain data beyond what is necessary to render it.</li>
        </ul>
      </section>

      <section>
        <h2>2. Legal Basis for Processing (GDPR)</h2>
        <p>We process your personal data on the following bases:</p>
        <ul>
          <li><strong>Contract performance</strong> — to provide you with the Service when you create an account or connect a wallet;</li>
          <li><strong>Legitimate interest</strong> — to secure the Service, prevent abuse, improve features, and produce aggregated analytics;</li>
          <li><strong>Consent</strong> — for optional features that require it (e.g., email communications you opt into);</li>
          <li><strong>Legal obligation</strong> — to comply with applicable laws, court orders, or sanctions regulations.</li>
        </ul>
        <p>
          Wallet addresses, when linked to an identifiable individual, are treated as personal data under GDPR (per the
          European Data Protection Board’s guidance on blockchain technology).
        </p>
      </section>

      <section>
        <h2>3. How We Use Your Data</h2>
        <ul>
          <li>operate, maintain, and improve the Service;</li>
          <li>authenticate you and secure your account;</li>
          <li>personalize your dashboard, watchlists, and notifications;</li>
          <li>communicate with you about service updates, security, and support;</li>
          <li>detect, prevent, and respond to fraud, abuse, or security incidents;</li>
          <li>produce aggregated, de-identified statistics about usage of the Service;</li>
          <li>comply with legal obligations.</li>
        </ul>
      </section>

      <section>
        <h2>4. Cookies and Similar Technologies</h2>
        <p>
          Liquid Terminal currently uses <strong>only strictly necessary technologies</strong> (session storage for
          authentication, preferences). Our analytics provider (Vercel Analytics) runs in a cookieless mode and does not
          set tracking cookies. We do not use advertising cookies, third-party trackers, or cross-site profiling tools.
        </p>
        <p>
          If we introduce non-essential cookies or trackers in the future, we will request your prior consent through a
          cookie banner, and you will be able to manage your preferences at any time.
        </p>
      </section>

      <section>
        <h2>5. Sharing of Data</h2>
        <p>We share data only with:</p>
        <ul>
          <li><strong>Service providers (processors)</strong> acting on our behalf, including Privy (authentication), Vercel (hosting and analytics), Cloudflare (CDN and security), and Railway (backend hosting). Each is bound by a data-processing agreement.</li>
          <li><strong>Third-party data providers</strong> we query on your behalf to render the Service (Hyperliquid, HypurrScan, DefiLlama). These calls may transmit your IP address but no account identifiers.</li>
          <li><strong>Public surfaces</strong> — content you publish (public readlists, public ecosystem submissions, public wallet lists) is visible to all users by design.</li>
          <li><strong>Legal recipients</strong> — courts, regulators, or law-enforcement authorities when required by valid legal process.</li>
          <li><strong>Successors</strong> — in the event of a merger, acquisition, or asset sale, subject to confidentiality protections.</li>
        </ul>
        <p>We do not sell your personal data.</p>
      </section>

      <section>
        <h2>6. International Data Transfers</h2>
        <p>
          Our infrastructure providers may host data in the European Union, the United States, or other regions. Where
          personal data is transferred outside the EU/EEA, we rely on appropriate safeguards such as the European
          Commission’s Standard Contractual Clauses (SCCs) or adequacy decisions.
        </p>
      </section>

      <section>
        <h2>7. Data Retention</h2>
        <ul>
          <li><strong>Account data</strong>: retained for as long as your account is active, plus a limited period after deletion for backups and legal obligations.</li>
          <li><strong>Usage and security logs</strong>: typically retained for up to 12 months.</li>
          <li><strong>User-generated public content</strong>: remains visible until you delete it or your account.</li>
        </ul>
        <p>You may request deletion at any time (see Section 9).</p>
      </section>

      <section>
        <h2>8. Security</h2>
        <p>
          We implement reasonable technical and organizational measures to protect personal data, including HTTPS/TLS
          encryption in transit, access controls, secret rotation, and minimal data retention. No system is perfectly
          secure; we cannot guarantee absolute security.
        </p>
      </section>

      <section>
        <h2>9. Your Rights (GDPR)</h2>
        <p>If you are in the EU/EEA, UK, or Switzerland, you have the right to:</p>
        <ul>
          <li><strong>access</strong> the personal data we hold about you;</li>
          <li><strong>rectify</strong> inaccurate or incomplete data;</li>
          <li><strong>erase</strong> your data (“right to be forgotten”), subject to legal exceptions;</li>
          <li><strong>restrict</strong> or <strong>object</strong> to processing based on legitimate interests;</li>
          <li><strong>data portability</strong> — receive your data in a structured, machine-readable format;</li>
          <li><strong>withdraw consent</strong> at any time, where processing is based on consent;</li>
          <li><strong>lodge a complaint</strong> with your local data-protection authority.</li>
        </ul>
        <p>
          To exercise any of these rights, contact us at{" "}
          <a href="mailto:privacy@liquidterminal.com">privacy@liquidterminal.com</a>. We respond within 30 days.
        </p>
        <p>
          <strong>On-chain data note</strong>: blockchain records (Hyperliquid transactions, wallet activity) are public
          and immutable. We cannot erase data from the blockchain — only the off-chain links and metadata we hold.
        </p>
      </section>

      <section>
        <h2>10. Children</h2>
        <p>
          The Service is not directed to individuals under 18. We do not knowingly collect data from children. If you
          believe a minor has provided us with personal data, contact us and we will delete it.
        </p>
      </section>

      <section>
        <h2>11. Changes to this Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Material changes will be indicated by updating the “Last
          updated” date. We encourage you to review this page periodically.
        </p>
      </section>

      <section>
        <h2>12. Contact</h2>
        <p>
          For any privacy-related question or to exercise your rights, contact us at{" "}
          <a href="mailto:privacy@liquidterminal.com">privacy@liquidterminal.com</a>.
        </p>
      </section>
    </LegalPage>
  );
}

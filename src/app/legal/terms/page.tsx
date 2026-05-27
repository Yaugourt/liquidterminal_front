import type { Metadata } from "next";
import { LegalPage } from "@/components/common";

export const metadata: Metadata = {
  title: "Terms of Service · Liquid Terminal",
  description: "Terms of Service for Liquid Terminal — a read-only data terminal for the Hyperliquid ecosystem.",
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      lastUpdated="May 23, 2026"
      intro="These Terms of Service (the “Terms”) govern your access to and use of Liquid Terminal (the “Service”), a read-only data and analytics terminal for the Hyperliquid ecosystem available at liquidterminal.com. By accessing or using the Service, you agree to be bound by these Terms."
    >
      <section>
        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing, browsing, or otherwise using the Service, you acknowledge that you have read, understood, and
          agree to be bound by these Terms and our <a href="/legal/privacy">Privacy Policy</a> and{" "}
          <a href="/legal/disclaimer">Disclaimer</a>. If you do not agree, you must not use the Service.
        </p>
        <p>You must be at least 18 years old to use the Service.</p>
      </section>

      <section>
        <h2>2. Description of the Service</h2>
        <p>
          Liquid Terminal aggregates and displays publicly available data from the Hyperliquid network and related
          third-party sources, including market data (spot, perpetuals, auctions), on-chain activity (transactions,
          blocks, validators), ecosystem information, educational content, and user-curated lists.
        </p>
        <p>
          The Service is informational. It does not custody funds, does not execute trades, and does not provide
          investment, financial, legal, tax, or accounting advice.
        </p>
      </section>

      <section>
        <h2>3. Eligibility and Restricted Persons</h2>
        <p>
          You represent and warrant that you are not a “Restricted Person.” Restricted Persons include any individual or
          entity that:
        </p>
        <ul>
          <li>is a resident of, located in, or organized under the laws of a jurisdiction subject to comprehensive sanctions administered by the United States Office of Foreign Assets Control (OFAC), the European Union, the United Kingdom, or the United Nations;</li>
          <li>is listed on any sanctions or restricted-party list (including OFAC SDN, EU consolidated list, UK HMT, or UN Security Council lists);</li>
          <li>is accessing the Service from Cuba, Iran, North Korea, Syria, the Crimea, Donetsk, Luhansk, or Zaporizhzhia regions, or any other comprehensively sanctioned jurisdiction.</li>
        </ul>
        <p>
          The Service is a data terminal only and does not facilitate transactions. You remain solely responsible for
          ensuring that your use complies with the laws of your jurisdiction.
        </p>
      </section>

      <section>
        <h2>4. No Financial Advice</h2>
        <p>
          Nothing on the Service constitutes investment advice, a recommendation, a solicitation, or an offer to buy or
          sell any digital asset, security, or financial instrument. Market data, prices, and analytics may be
          incomplete, delayed, or inaccurate. You are solely responsible for your decisions and assume all risk. See our
          full <a href="/legal/disclaimer">Disclaimer</a>.
        </p>
      </section>

      <section>
        <h2>5. Accounts and Wallet Connection</h2>
        <p>
          Certain features require an account or a connected wallet (via Privy). You are responsible for safeguarding
          your credentials, wallet, and private keys. We never request your seed phrase or private key. Any loss
          resulting from unauthorized access, lost keys, or compromised devices is your sole responsibility.
        </p>
      </section>

      <section>
        <h2>6. Acceptable Use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>use the Service in violation of any law, regulation, or third-party right;</li>
          <li>scrape, crawl, mirror, or otherwise extract data from the Service in bulk or in any automated way that exceeds normal browsing, except via interfaces we expressly designate for that purpose;</li>
          <li>reverse engineer, decompile, or attempt to derive the source code or underlying APIs;</li>
          <li>resell, sublicense, or otherwise commercialize data or content obtained from the Service;</li>
          <li>introduce viruses, worms, or other malicious code, or attempt to gain unauthorized access to our systems;</li>
          <li>impersonate any person or misrepresent your affiliation;</li>
          <li>upload unlawful, defamatory, infringing, or otherwise harmful content (including in wiki readlists, ecosystem submissions, or public lists).</li>
        </ul>
      </section>

      <section>
        <h2>7. User-Submitted Content</h2>
        <p>
          You retain ownership of content you submit (e.g., public readlists, ecosystem project submissions, public
          wallet lists). You grant us a worldwide, non-exclusive, royalty-free license to host, display, distribute, and
          adapt that content for the purpose of operating and improving the Service. We may remove any content at our
          sole discretion, including content that violates these Terms or applicable law.
        </p>
      </section>

      <section>
        <h2>8. Intellectual Property</h2>
        <p>
          The Service, including its design, code, branding, and aggregated content, is owned by Liquid Terminal and its
          licensors and is protected by intellectual property laws. We grant you a limited, non-exclusive,
          non-transferable, revocable license to access and use the Service for personal, non-commercial purposes,
          subject to these Terms.
        </p>
      </section>

      <section>
        <h2>9. Third-Party Services and Data</h2>
        <p>
          The Service relies on third-party data providers and infrastructure, including but not limited to Hyperliquid,
          HypurrScan, DefiLlama, Privy, Vercel, and Cloudflare. We do not control these third parties, do not guarantee
          their availability or accuracy, and are not liable for their actions or content. Links to external sites are
          provided for convenience only.
        </p>
      </section>

      <section>
        <h2>10. Disclaimer of Warranties</h2>
        <p>
          The Service is provided <strong>“as is” and “as available,”</strong> without warranties of any kind, whether
          express, implied, or statutory, including but not limited to warranties of merchantability, fitness for a
          particular purpose, non-infringement, accuracy, completeness, timeliness, or uninterrupted operation. We do
          not warrant that the Service will be free from errors, defects, security vulnerabilities, or that any data
          displayed is current or correct.
        </p>
      </section>

      <section>
        <h2>11. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, in no event shall Liquid Terminal, its contributors, or its operators
          be liable for any indirect, incidental, special, consequential, exemplary, or punitive damages, including but
          not limited to loss of profits, revenue, data, goodwill, trading losses, or business opportunities, arising
          out of or related to your use of (or inability to use) the Service, even if advised of the possibility of such
          damages.
        </p>
        <p>
          Our aggregate liability for any direct damages shall not exceed one hundred United States dollars (USD 100) or
          the amounts you paid us in the twelve months preceding the claim, whichever is greater.
        </p>
      </section>

      <section>
        <h2>12. Indemnification</h2>
        <p>
          You agree to defend, indemnify, and hold harmless Liquid Terminal and its operators from and against any
          claims, damages, liabilities, and expenses (including reasonable legal fees) arising out of your use of the
          Service, your violation of these Terms, or your violation of any third-party right.
        </p>
      </section>

      <section>
        <h2>13. Suspension and Termination</h2>
        <p>
          We may suspend, restrict, or terminate your access to the Service at any time, with or without notice, for any
          reason, including suspected violation of these Terms. Sections that by their nature should survive termination
          (including IP, disclaimers, liability limits, indemnity, and governing law) shall survive.
        </p>
      </section>

      <section>
        <h2>14. Changes to the Service and these Terms</h2>
        <p>
          We may modify the Service or these Terms at any time. Material changes will be reflected by updating the “Last
          updated” date above. Your continued use of the Service after changes are posted constitutes acceptance of the
          updated Terms.
        </p>
      </section>

      <section>
        <h2>15. Governing Law</h2>
        <p>
          These Terms shall be governed by and construed in accordance with the laws applicable to the entity operating
          the Service, without regard to its conflict-of-laws principles. Any dispute arising out of or relating to
          these Terms or the Service shall be resolved by the competent courts of that jurisdiction, unless otherwise
          required by applicable consumer-protection law.
        </p>
      </section>

      <section>
        <h2>16. Severability and Entire Agreement</h2>
        <p>
          If any provision of these Terms is held invalid or unenforceable, the remaining provisions shall remain in
          full force and effect. These Terms, together with the Privacy Policy and Disclaimer, constitute the entire
          agreement between you and Liquid Terminal regarding the Service.
        </p>
      </section>

      <section>
        <h2>17. Contact</h2>
        <p>
          Questions about these Terms? Contact us at <a href="mailto:legal@liquidterminal.com">legal@liquidterminal.com</a>.
        </p>
      </section>
    </LegalPage>
  );
}

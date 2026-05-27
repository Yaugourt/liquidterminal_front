import type { Metadata } from "next";
import { LegalPage } from "@/components/common";

export const metadata: Metadata = {
  title: "Disclaimer · Liquid Terminal",
  description: "Risk disclosure and informational notice for Liquid Terminal — not financial advice.",
  robots: { index: true, follow: true },
};

export default function DisclaimerPage() {
  return (
    <LegalPage
      title="Disclaimer & Risk Disclosure"
      lastUpdated="May 23, 2026"
      intro="Liquid Terminal is a read-only data terminal for the Hyperliquid ecosystem. The information displayed is for general informational purposes only and is not investment, financial, legal, tax, or accounting advice."
    >
      <section>
        <h2>1. Informational Purpose Only</h2>
        <p>
          All content on Liquid Terminal — including market prices, trading volumes, perpetuals and spot data, vaults,
          liquidations, validator information, builder analytics, ecosystem listings, educational articles, and wiki
          content — is provided <strong>solely for general information</strong>. Nothing on the Service should be
          construed as a recommendation, solicitation, endorsement, or offer to buy, sell, or hold any digital asset,
          security, or financial instrument.
        </p>
      </section>

      <section>
        <h2>2. Not Financial Advice</h2>
        <p>
          We are not registered as investment advisors, broker-dealers, or financial professionals in any jurisdiction.
          We do not know your personal financial situation, risk tolerance, objectives, or constraints. Before making
          any investment or trading decision, you should consult a qualified, licensed professional.
        </p>
      </section>

      <section>
        <h2>3. Data Accuracy and Availability</h2>
        <p>
          Data displayed on the Service is aggregated from third-party sources, including Hyperliquid, HypurrScan, and
          DefiLlama. We do not control these sources and <strong>do not guarantee</strong> the accuracy, completeness,
          timeliness, or availability of any data. Prices may be delayed, stale, or incorrect; charts may contain
          errors; on-chain data may be reorganized; and certain endpoints (e.g., Hypedexer) are explicitly unstable.
        </p>
        <p>
          You should independently verify any data before relying on it for any decision.
        </p>
      </section>

      <section>
        <h2>4. Crypto, DeFi, and Smart-Contract Risks</h2>
        <p>
          Cryptocurrencies and decentralized finance involve <strong>substantial and unpredictable risks</strong>,
          including but not limited to:
        </p>
        <ul>
          <li>extreme price volatility and total loss of capital;</li>
          <li>smart-contract bugs, exploits, and protocol failures;</li>
          <li>liquidation cascades, oracle failures, and front-running;</li>
          <li>bridge failures, custody failures, and counterparty risk;</li>
          <li>private-key loss, phishing, and wallet compromise;</li>
          <li>regulatory action that may restrict, freeze, or prohibit access to assets;</li>
          <li>network downtime, congestion, or chain reorganization.</li>
        </ul>
        <p>
          You should never invest more than you can afford to lose. Past performance does not indicate future results.
        </p>
      </section>

      <section>
        <h2>5. Third-Party Content and Links</h2>
        <p>
          The Service may display content, listings, or links from third-party projects (ecosystem listings, wiki
          articles, builder dashboards, vault information, etc.). Inclusion does not constitute endorsement. We do not
          audit, vet, or verify third-party projects. <strong>Do your own research (DYOR)</strong> before interacting
          with any protocol, vault, token, or builder displayed on the Service.
        </p>
      </section>

      <section>
        <h2>6. No Solicitation</h2>
        <p>
          Nothing on Liquid Terminal constitutes a solicitation to buy or sell any security or digital asset in any
          jurisdiction where such solicitation would be unlawful. The Service is not directed at residents of any
          jurisdiction where its use would be contrary to local laws or regulations.
        </p>
      </section>

      <section>
        <h2>7. Forward-Looking Statements</h2>
        <p>
          Any forward-looking statements — about token performance, ecosystem growth, protocol roadmaps, or otherwise —
          are inherently uncertain. Actual outcomes may differ materially. We disclaim any obligation to update
          forward-looking statements.
        </p>
      </section>

      <section>
        <h2>8. No Fiduciary Relationship</h2>
        <p>
          Your use of the Service does not create any fiduciary, advisory, or trust relationship between you and Liquid
          Terminal. We do not act on your behalf.
        </p>
      </section>

      <section>
        <h2>9. Acknowledgment</h2>
        <p>
          <strong>
            By using Liquid Terminal, you acknowledge that you have read, understood, and accepted this Disclaimer, and
            that you assume full responsibility for any decisions or actions you take based on information obtained from
            the Service.
          </strong>
        </p>
      </section>

      <section>
        <h2>10. Contact</h2>
        <p>
          Questions? Contact us at <a href="mailto:legal@liquidterminal.com">legal@liquidterminal.com</a>.
        </p>
      </section>
    </LegalPage>
  );
}

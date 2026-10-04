"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatEther, isHash, type Address, type EIP1193Provider } from "viem";
import { Check, Droplets, ExternalLink, FileSearch, Rocket, Wallet, Wrench } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { CardHeading } from "@/components/common";
import { ELYSIUM_ALT_RPC_URL, ELYSIUM_CHAIN } from "@/lib/elysium-chain";
import { elysiumClient } from "@/services/elysium/rpc";
import { connectWallet, injectedWallet, switchToElysium, walletChainId, walletError } from "@/lib/elysium/wallet";
import { EXPLORER, ExtLink, addressHref, short } from "./shared";

const FAUCET_URL = "https://elysium.kinetiq.xyz/testnet-faucet";

const FOUNDRY = `# Deploy with Foundry
forge create src/Counter.sol:Counter \\
  --rpc-url ${ELYSIUM_CHAIN.rpc} \\
  --private-key $PRIVATE_KEY \\
  --broadcast`;

const HARDHAT = `// hardhat.config.ts
networks: {
  elysium: {
    url: "${ELYSIUM_CHAIN.rpc}",
    chainId: ${ELYSIUM_CHAIN.chainId},
    accounts: [process.env.PRIVATE_KEY!],
  },
},`;

const VIEM = `import { defineChain } from "viem";

export const elysiumTestnet = defineChain({
  id: ${ELYSIUM_CHAIN.chainId},
  name: "Elysium Testnet",
  nativeCurrency: { name: "HYPE", symbol: "HYPE", decimals: 18 },
  rpcUrls: { default: { http: ["${ELYSIUM_CHAIN.rpc}"] } },
  blockExplorers: { default: { name: "Elysium Explorer", url: "${EXPLORER}" } },
  testnet: true,
});`;

function Code({ title, children }: { title: string; children: string }) {
  return (
    <div className="rounded-lg border border-border-subtle bg-surface-2 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-1.5 text-[11px] font-medium text-text-secondary border-b border-border-subtle">
        {title}
        <CopyButton text={children} className="ml-auto" />
      </div>
      <pre className="overflow-x-auto p-3 text-[11.5px] leading-relaxed mono text-text-secondary scrollbar-brand" tabIndex={0}>
        <code className="mono">{children}</code>
      </pre>
    </div>
  );
}

function Row({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div className="flex items-center gap-3 py-1.5 border-b border-border-subtle last:border-0 text-[12.5px]">
      <span className="w-28 shrink-0 text-text-tertiary">{label}</span>
      {href ? (
        <ExtLink href={href} className="mono text-text-primary truncate">
          {value}
        </ExtLink>
      ) : (
        <span className="mono text-text-primary truncate">{value}</span>
      )}
      <CopyButton text={value} className="ml-auto shrink-0" />
    </div>
  );
}

/** Numbered step card; `done` turns the number into a check once the step is verified live. */
function Step({
  n,
  title,
  icon,
  done,
  children,
}: {
  n: number;
  title: string;
  icon: React.ReactNode;
  done?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Card padding="none">
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border-subtle">
        <span
          className={`w-6 h-6 rounded-full grid place-items-center text-[12px] font-semibold shrink-0 ${
            done ? "bg-success/15 text-success" : "bg-brand/10 text-brand"
          }`}
          aria-label={done ? `Step ${n}, done` : `Step ${n}`}
        >
          {done ? <Check size={13} /> : n}
        </span>
        <h2 className="text-[14px] font-semibold text-text-primary">{title}</h2>
        <span className="ml-auto text-text-tertiary">{icon}</span>
      </div>
      <div className="space-y-3 p-4 text-[12.5px] leading-relaxed text-text-secondary">{children}</div>
    </Card>
  );
}

/**
 * Elysium · Start building: the testnet path in five steps, from adding the
 * network to reading your own transaction. Steps 1 and 2 are checked live
 * against the connected wallet and the chain; the rest hands over to the
 * deployer, the inspector and the usual toolchains.
 */
export function ElysiumStart() {
  const router = useRouter();
  const [provider, setProvider] = useState<EIP1193Provider | null>(null);
  const [account, setAccount] = useState<Address | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [balance, setBalance] = useState<bigint | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [hash, setHash] = useState("");

  const onElysium = chainId === ELYSIUM_CHAIN.chainId;

  useEffect(() => {
    const p = injectedWallet();
    setProvider(p);
    if (!p) return;
    const onAccounts = (a: unknown) => setAccount(((a as string[])[0] as Address) ?? null);
    const onChain = (c: unknown) => setChainId(Number(BigInt(c as string)));
    p.on("accountsChanged", onAccounts as never);
    p.on("chainChanged", onChain as never);
    // Pick up a wallet that is already connected without prompting.
    p.request({ method: "eth_accounts" })
      .then((a) => onAccounts(a))
      .catch(() => {});
    walletChainId(p).then(setChainId).catch(() => {});
    return () => {
      p.removeListener("accountsChanged", onAccounts as never);
      p.removeListener("chainChanged", onChain as never);
    };
  }, []);

  // Balance read from Elysium itself, whatever network the wallet is on.
  const refreshBalance = useCallback(() => {
    if (!account) return;
    elysiumClient
      .getBalance({ address: account })
      .then(setBalance)
      .catch(() => {});
  }, [account]);

  useEffect(() => {
    setBalance(null);
    if (!account) return;
    refreshBalance();
    const t = setInterval(refreshBalance, 10_000);
    return () => clearInterval(t);
  }, [account, refreshBalance]);

  const addNetwork = async () => {
    if (!provider) return;
    setErr(null);
    setBusy(true);
    try {
      if (!account) setAccount(await connectWallet(provider));
      await switchToElysium(provider);
      setChainId(await walletChainId(provider));
    } catch (e) {
      setErr(walletError(e));
    } finally {
      setBusy(false);
    }
  };

  const funded = balance != null && balance > BigInt(0);
  const goodHash = isHash(hash.trim());

  return (
    <div className="space-y-4">
      <Card padding="none">
        <div className="p-4 space-y-2">
          <h1 className="text-[18px] font-semibold text-text-primary">Start building on Elysium testnet</h1>
          <p className="text-[13px] leading-relaxed text-text-secondary max-w-[70ch]">
            Elysium is a chain that settles on HyperEVM, with HYPE as its gas token. Five steps take you from an empty
            wallet to a contract deployed and its transaction decoded. Steps 1 and 2 check themselves against your
            wallet and the chain as you go.
          </p>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2 items-start">
        <Step n={1} title="Add the network" icon={<Wallet size={14} />} done={onElysium}>
          <div>
            <Row label="Network" value="Elysium Testnet" />
            <Row label="Chain ID" value={String(ELYSIUM_CHAIN.chainId)} />
            <Row label="RPC" value={ELYSIUM_CHAIN.rpc} />
            <Row label="RPC (alt)" value={ELYSIUM_ALT_RPC_URL} />
            <Row label="Currency" value="HYPE" />
            <Row label="Explorer" value={EXPLORER} href={EXPLORER} />
          </div>
          {!provider ? (
            <p>Open this page in a browser with a wallet (Rabby, MetaMask…) to add the network in one click, or enter the values above by hand.</p>
          ) : onElysium ? (
            <p className="text-success">
              Your wallet is on Elysium testnet{account ? <> with <span className="mono">{short(account)}</span></> : null}.
            </p>
          ) : (
            <Button variant="ghostBrand" className="w-full" onClick={addNetwork} disabled={busy}>
              <Wallet /> {account ? "Switch to Elysium testnet" : "Connect and add Elysium testnet"}
            </Button>
          )}
          {err && <p className="text-danger">{err}</p>}
        </Step>

        <Step n={2} title="Get test HYPE" icon={<Droplets size={14} />} done={funded}>
          <p>
            Claim test HYPE from the faucet directly on Elysium: connect the same wallet there and it sends HYPE to your
            address on Elysium.
          </p>
          <a
            href={FAUCET_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-brand hover:underline"
          >
            Open the Elysium testnet faucet <ExternalLink size={12} />
          </a>
          <div className="rounded-lg border border-border-subtle bg-surface-2/50 px-3 py-2.5">
            {!account ? (
              <span className="text-text-tertiary">Connect a wallet in step 1 to watch your balance here.</span>
            ) : balance == null ? (
              <span className="text-text-tertiary">Reading your balance on Elysium…</span>
            ) : (
              <span className="flex flex-wrap items-baseline justify-between gap-2">
                <Link href={addressHref(account)} className="mono text-text-secondary hover:text-brand">
                  {short(account)}
                </Link>
                <span className={`mono text-[15px] font-semibold ${funded ? "text-success" : "text-text-primary"}`}>
                  {Number(formatEther(balance)).toLocaleString("en-US", { maximumFractionDigits: 4 })} HYPE
                </span>
              </span>
            )}
          </div>
          <p className="text-[11.5px] text-text-tertiary">Refreshed every 10 seconds from the Elysium RPC.</p>
        </Step>

        <Step n={3} title="Deploy a contract" icon={<Rocket size={14} />}>
          <p>
            The deployer comes loaded with a small Greeter contract. Simulate it first: you see the address it will get,
            the gas and the events, before anything is signed. Then deploy it from your wallet in one click. Paste your
            own Foundry or Hardhat artifact to deploy your code instead.
          </p>
          <Button variant="ghostBrand" className="w-full" asChild>
            <Link href="/elysium/simulate?kind=deploy">
              <Rocket /> Open the deployer
            </Link>
          </Button>
        </Step>

        <Step n={4} title="Read your transaction" icon={<FileSearch size={14} />}>
          <p>
            Every transaction opens in the inspector: status, gas and the fee split, decoded events and calls.
            The deployer links there once your deployment lands. You can also paste any hash.
          </p>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (goodHash) router.push(`/elysium/tx/${hash.trim()}`);
            }}
          >
            <label htmlFor="start-tx-hash" className="sr-only">
              Transaction hash
            </label>
            <input
              id="start-tx-hash"
              value={hash}
              onChange={(e) => setHash(e.target.value)}
              placeholder="0x… transaction hash"
              spellCheck={false}
              autoComplete="off"
              className="h-9 min-w-0 flex-1 rounded-lg border border-border-default bg-surface-2 px-3 mono text-[12px] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-brand/50"
            />
            <Button type="submit" variant="ghostBrand" disabled={!goodHash}>
              Inspect
            </Button>
          </form>
          {account && (
            <p>
              Or open{" "}
              <Link href={addressHref(account)} className="text-brand hover:underline">
                your address page
              </Link>{" "}
              to see everything your wallet did on Elysium.
            </p>
          )}
        </Step>
      </div>

      <Card padding="none">
        <CardHeading icon={<Wrench size={14} />} title="5 · Use your own tools" meta="Foundry · Hardhat · viem" />
        <div className="grid gap-3 p-4 lg:grid-cols-3">
          <Code title="Foundry">{FOUNDRY}</Code>
          <Code title="Hardhat">{HARDHAT}</Code>
          <Code title="viem">{VIEM}</Code>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 px-4 pb-4 text-[12.5px]">
          <Link href="/elysium/network" className="text-text-secondary hover:text-brand">
            Network parameters
          </Link>
          <Link href="/elysium/decode" className="text-text-secondary hover:text-brand">
            Decode any contract
          </Link>
          <Link href="/elysium/node" className="text-text-secondary hover:text-brand">
            Run your own node
          </Link>
          <ExtLink href={EXPLORER} className="text-text-secondary">
            Elysium explorer
          </ExtLink>
        </div>
      </Card>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { formatEther, formatGwei, isHash, parseAbi, parseEther, type Address, type EIP1193Provider, type Hash } from "viem";
import { ArrowLeftRight, Boxes, Check, Droplets, ExternalLink, FileSearch, Info, Rocket, Sparkles, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PillTabs } from "@/components/ui/pill-tabs";
import { InlineSpinner } from "@/components/ui/inline-spinner";
import { CopyButton } from "@/components/ui/copy-button";
import { CardHeading, KpiRibbon, type KpiCell } from "@/components/common";
import { ELYSIUM_ALT_RPC_URL, ELYSIUM_CHAIN } from "@/lib/elysium-chain";
import { PRECOMPILE, elysiumClient } from "@/services/elysium/rpc";
import { ELYSIUM_WHYPE, connectWallet, injectedWallet, sendWrapHype, switchToElysium, walletChainId, walletError } from "@/lib/elysium/wallet";
import { EXPLORER, ExtLink, addressHref, short } from "./shared";

const FAUCET_URL = "https://elysium.kinetiq.xyz/testnet-faucet";
const BRIDGE_URL = "https://elysium.kinetiq.xyz/testnet-bridge";
const KINETIQ_EXPLORER = "https://elysium.kinetiq.xyz/testnet-explorer";
const DOCS_URL = "https://elysium.kinetiq.xyz/docs";

// Both commands as published by the two explorers' own verification pages.
const VERIFY_BLOCKSCOUT = `# Kinetiq explorer (Blockscout)
forge verify-contract $ADDRESS src/Counter.sol:Counter \\
  --chain 99801 \\
  --verifier blockscout \\
  --verifier-url https://elysium.kinetiq.xyz/api/ \\
  --watch`;

const VERIFY_SOURCIFY = `# Conduit explorer (Sourcify)
forge verify-contract $ADDRESS src/Counter.sol:Counter \\
  --rpc-url ${ELYSIUM_CHAIN.rpc} \\
  --verifier sourcify \\
  --verifier-url https://contracts.conduit.xyz`;

const FOUNDRY_TOML = `# foundry.toml
[rpc_endpoints]
elysium = "${ELYSIUM_CHAIN.rpc}"`;

const CAST = `# Check the chain and your balance
cast chain-id --rpc-url elysium
cast balance $YOUR_ADDRESS --ether --rpc-url elysium

# The Elysium block number (block.number gives HyperEVM's)
cast call ${PRECOMPILE.ArbSys} "arbBlockNumber()(uint256)" --rpc-url elysium`;

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

const HARDHAT_DEPLOY = `# With Hardhat Ignition
npx hardhat ignition deploy ./ignition/modules/Counter.ts --network elysium`;

const VIEM = `import { defineChain } from "viem";

export const elysiumTestnet = defineChain({
  id: ${ELYSIUM_CHAIN.chainId},
  name: "Elysium Testnet",
  nativeCurrency: { name: "HYPE", symbol: "HYPE", decimals: 18 },
  rpcUrls: { default: { http: ["${ELYSIUM_CHAIN.rpc}"] } },
  blockExplorers: { default: { name: "Elysium Explorer", url: "${EXPLORER}" } },
  testnet: true,
});`;

/**
 * Contracts already on Elysium at their usual addresses, checked with
 * eth_getCode on 4 Oct 2026. Absent ones (ERC-4337 EntryPoint, Safe, CreateX)
 * are left out rather than listed as missing, since that can change any day.
 */
const DEPLOYED: { name: string; address: Address; note: string }[] = [
  { name: "WHYPE", address: "0xcd57f65c2b0e5881cfc2e609f7cd53b746e1f234", note: "Wrapped HYPE (ERC-20)" },
  { name: "Multicall3", address: "0xcA11bde05977b3631167028862bE2a173976CA11", note: "Batch reads in one call" },
  { name: "CREATE2 deployer", address: "0x4e59b44847b379578588920cA78FbF26c0B4956C", note: "Foundry's default for deterministic addresses" },
  { name: "Permit2", address: "0x000000000022D473030F116dDEE9F6B43aC78BA3", note: "Signature-based token approvals" },
];

const ARB_ABI = parseAbi([
  "function arbOSVersion() view returns (uint256)",
  "function stylusVersion() view returns (uint16)",
]);

interface ChainLive {
  block: bigint;
  /** What `block.number` returns inside a contract: the HyperEVM block. */
  parentBlock: bigint | null;
  baseFee: bigint | null;
  /** Average seconds per block over the last 10,000 blocks. */
  blockTime: number | null;
  arbOS: number | null;
  stylus: number | null;
}

/** Live chain facts quoted by the page, read from the Elysium RPC every 10 s. */
function useChainLive(): ChainLive | null {
  const [live, setLive] = useState<ChainLive | null>(null);
  useEffect(() => {
    let cancelled = false;
    const read = async () => {
      try {
        const head = await elysiumClient.getBlock();
        const [past, arbOS, stylus] = await Promise.all([
          elysiumClient.getBlock({ blockNumber: head.number - BigInt(10_000) }).catch(() => null),
          elysiumClient.readContract({ address: PRECOMPILE.ArbSys, abi: ARB_ABI, functionName: "arbOSVersion" }).catch(() => null),
          elysiumClient.readContract({ address: PRECOMPILE.ArbWasm, abi: ARB_ABI, functionName: "stylusVersion" }).catch(() => null),
        ]);
        const l1 = (head as unknown as { l1BlockNumber?: string }).l1BlockNumber;
        if (cancelled) return;
        setLive({
          block: head.number,
          parentBlock: l1 ? BigInt(l1) : null,
          baseFee: head.baseFeePerGas ?? null,
          blockTime: past ? Number(head.timestamp - past.timestamp) / 10_000 : null,
          // ArbSys reports the ArbOS version offset by 55.
          arbOS: arbOS != null ? Number(arbOS) - 55 : null,
          stylus: stylus != null ? Number(stylus) : null,
        });
      } catch {
        // Keep the last reading; the ribbon shows dashes until one lands.
      }
    };
    void read();
    const t = setInterval(read, 10_000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);
  return live;
}

const TOOLS: Record<"foundry" | "hardhat" | "viem", { label: string; blocks: { title: string; code: string }[] }> = {
  foundry: {
    label: "Foundry",
    blocks: [
      { title: "foundry.toml", code: FOUNDRY_TOML },
      { title: "Deploy", code: FOUNDRY },
      { title: "cast", code: CAST },
    ],
  },
  hardhat: {
    label: "Hardhat",
    blocks: [
      { title: "hardhat.config.ts", code: HARDHAT },
      { title: "Deploy", code: HARDHAT_DEPLOY },
    ],
  },
  viem: { label: "viem", blocks: [{ title: "chain.ts", code: VIEM }] },
};

function Code({ title, children }: { title: string; children: string }) {
  return (
    <div className="h-full rounded-lg border border-border-subtle bg-surface-2 overflow-hidden min-w-0">
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
    <div className="flex items-center gap-3 px-3 py-1.5 border-b border-border-subtle last:border-0 text-[12px]">
      <span className="w-24 shrink-0 text-text-tertiary">{label}</span>
      {href ? (
        <ExtLink href={href} className="mono min-w-0 truncate text-text-primary">
          {value}
        </ExtLink>
      ) : (
        <span className="mono min-w-0 truncate text-text-primary">{value}</span>
      )}
      <CopyButton text={value} className="ml-auto shrink-0" />
    </div>
  );
}

/** Right-hand panel of a step: where the action or the data lives. */
function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-lg border border-border-subtle bg-surface-2/50 ${className}`}>{children}</div>;
}

/**
 * One step, full width: the explanation on the left, the action or the data
 * on the right, so a row is as tall as its content and never padded out to
 * match a neighbour. `done` turns the number into a check once verified live.
 */
function Step({
  n,
  title,
  done,
  aside,
  children,
}: {
  n: number;
  title: string;
  done?: boolean;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card padding="none">
      <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:gap-6">
        <div className="flex gap-3 min-w-0">
          <span
            className={`mt-0.5 w-7 h-7 rounded-full grid place-items-center text-[12.5px] font-semibold shrink-0 ${
              done ? "bg-success/15 text-success" : "bg-brand/10 text-brand"
            }`}
            aria-label={done ? `Step ${n}, done` : `Step ${n}`}
          >
            {done ? <Check size={14} /> : n}
          </span>
          <div className="min-w-0 space-y-2">
            <h2 className="text-[15px] font-semibold text-text-primary">{title}</h2>
            <div className="space-y-2 text-[12.5px] leading-relaxed text-text-secondary">{children}</div>
          </div>
        </div>
        {aside && <div className="min-w-0 self-start">{aside}</div>}
      </div>
    </Card>
  );
}

type Track = "try" | "build";

/** Amount the first-transaction step wraps: small enough to leave gas for everything else. */
const WRAP_AMOUNT = "0.001";

/**
 * Elysium · Start here: one page for someone who wants to try the testnet and
 * for someone who wants to build on it. Both paths share the first two steps
 * (network, test HYPE), checked live against the wallet and the chain; the
 * try path then sends a first transaction from the page, the build path hands
 * over to the deployer, the inspector, source verification and the toolchains.
 */
export function ElysiumStart() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const track: Track = sp.get("track") === "build" ? "build" : "try";
  const setTrack = (t: Track) => router.replace(t === "build" ? `${pathname}?track=build` : pathname, { scroll: false });
  const [provider, setProvider] = useState<EIP1193Provider | null>(null);
  const [account, setAccount] = useState<Address | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [balance, setBalance] = useState<bigint | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [hash, setHash] = useState("");
  const [wrapHash, setWrapHash] = useState<Hash | null>(null);
  const [wrapErr, setWrapErr] = useState<string | null>(null);
  const [wrapping, setWrapping] = useState(false);
  const [tool, setTool] = useState<keyof typeof TOOLS>("foundry");

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

  const wrap = async () => {
    if (!provider) return;
    setWrapErr(null);
    setWrapping(true);
    try {
      const from = account ?? (await connectWallet(provider));
      setAccount(from);
      if ((await walletChainId(provider)) !== ELYSIUM_CHAIN.chainId) await switchToElysium(provider);
      const h = await sendWrapHype(provider, from, parseEther(WRAP_AMOUNT));
      setWrapHash(h);
      setHash(h);
      refreshBalance();
    } catch (e) {
      setWrapErr(walletError(e));
    } finally {
      setWrapping(false);
    }
  };

  const live = useChainLive();
  const funded = balance != null && balance > BigInt(0);
  const goodHash = isHash(hash.trim());
  const dash = "–";
  const cells: KpiCell[] = [
    { label: "Elysium block", value: live ? live.block.toLocaleString("en-US") : dash, sub: "head of the chain" },
    {
      label: "block.number in a contract",
      value: live?.parentBlock != null ? live.parentBlock.toLocaleString("en-US") : dash,
      sub: "the HyperEVM block",
    },
    { label: "Base fee", value: live?.baseFee != null ? `${formatGwei(live.baseFee)} gwei` : dash, sub: "per unit of gas" },
    {
      label: "Block time",
      value: live?.blockTime != null ? `${live.blockTime.toFixed(2)} s` : dash,
      sub: "average, last 10,000 blocks",
    },
    {
      label: "ArbOS",
      value: live?.arbOS != null ? String(live.arbOS) : dash,
      sub: live?.stylus != null ? `Stylus v${live.stylus} on` : "Nitro stack",
    },
  ];

  const progress =
    track === "try"
      ? [
          { label: "Network added", done: onElysium },
          { label: "Test HYPE", done: funded },
          { label: "First transaction", done: wrapHash != null },
        ]
      : [
          { label: "Network added", done: onElysium },
          { label: "Test HYPE", done: funded },
        ];

  return (
    <div className="space-y-3">
      {/* Intro: what Elysium is, the path picker, and live progress */}
      <Card padding="none">
        <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:gap-6 lg:items-center">
          <div className="space-y-2 min-w-0">
            <h1 className="text-[19px] font-semibold text-text-primary">
              {track === "build" ? "Build on Elysium testnet" : "Try Elysium testnet"}
            </h1>
            <p className="text-[13px] leading-relaxed text-text-secondary">
              Elysium is a new chain built by Kinetiq on top of HyperEVM, with HYPE as its gas. The testnet is free: the
              HYPE you use has no value. Both paths start with the same two steps, and each step checks itself against
              your wallet as you go.
            </p>
          </div>
          <div className="space-y-3 min-w-0">
            <PillTabs
              tabs={[
                { value: "try", label: "I want to try it" },
                { value: "build", label: "I'm a builder" },
              ]}
              activeTab={track}
              onTabChange={(v) => setTrack(v as Track)}
            />
            <ol className="flex flex-wrap gap-2" aria-label="Your progress">
              {progress.map((p) => (
                <li
                  key={p.label}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11.5px] ${
                    p.done ? "border-success/40 bg-success/10 text-success" : "border-border-subtle text-text-tertiary"
                  }`}
                >
                  {p.done ? <Check size={12} /> : <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />}
                  {p.label}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Card>

      {track === "build" && <KpiRibbon cells={cells} />}

      <Step
        n={1}
        title="Add the network to your wallet"
        done={onElysium}
        aside={
          <Panel>
            <Row label="Network" value="Elysium Testnet" />
            <Row label="Chain ID" value={String(ELYSIUM_CHAIN.chainId)} />
            <Row label="RPC" value={ELYSIUM_CHAIN.rpc} />
            {track === "build" && <Row label="RPC (alt)" value={ELYSIUM_ALT_RPC_URL} />}
            <Row label="Currency" value="HYPE" />
            <Row label="Explorer" value={KINETIQ_EXPLORER} href={KINETIQ_EXPLORER} />
            {track === "build" && <Row label="Explorer (alt)" value={EXPLORER} href={EXPLORER} />}
          </Panel>
        }
      >
        <p>
          One click adds Elysium to your wallet (Rabby, MetaMask…) and switches to it. You can also enter the network values by hand.
        </p>
        {!provider ? (
          <p className="text-text-tertiary">Open this page in a browser with a wallet to add it in one click.</p>
        ) : onElysium ? (
          <p className="text-success">
            Your wallet is on Elysium testnet{account ? <> with <span className="mono">{short(account)}</span></> : null}.
          </p>
        ) : (
          <Button variant="ghostBrand" onClick={addNetwork} disabled={busy}>
            <Wallet /> {account ? "Switch to Elysium testnet" : "Connect and add Elysium testnet"}
          </Button>
        )}
        {err && <p className="text-danger">{err}</p>}
      </Step>

      <Step
        n={2}
        title="Get free test HYPE"
        done={funded}
        aside={
          <Panel className="p-4">
            <div className="text-[11px] uppercase tracking-[0.06em] text-text-tertiary">Your HYPE on Elysium</div>
            {!account ? (
              <p className="mt-1.5 text-[12.5px] text-text-tertiary">Connect a wallet in step 1 to see it here.</p>
            ) : balance == null ? (
              <p className="mt-1.5 text-[12.5px] text-text-tertiary">Reading…</p>
            ) : (
              <>
                <div className={`mt-1 mono text-[22px] font-semibold ${funded ? "text-success" : "text-text-primary"}`}>
                  {Number(formatEther(balance)).toLocaleString("en-US", { maximumFractionDigits: 4 })}
                </div>
                <Link href={addressHref(account)} className="mono text-[11.5px] text-text-tertiary hover:text-brand">
                  {short(account)}
                </Link>
              </>
            )}
            <div className="mt-2 text-[11px] text-text-tertiary">Refreshed every 10 seconds from the Elysium RPC.</div>
          </Panel>
        }
      >
        <p>
          Claim test HYPE from the faucet directly on Elysium: connect the same wallet there and it sends HYPE to your
          address. Your Elysium balance updates by itself.
        </p>
        <Button variant="ghostBrand" asChild>
          <a href={FAUCET_URL} target="_blank" rel="noopener noreferrer">
            <Droplets /> Open the faucet <ExternalLink />
          </a>
        </Button>
        <p className="text-text-tertiary">
          Already holding HYPE on HyperEVM testnet? The{" "}
          <a href={BRIDGE_URL} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">
            Elysium bridge
          </a>{" "}
          moves it over 1:1, in about a minute according to the bridge.
        </p>
      </Step>

      {track === "try" ? (
        <>
          <Step
            n={3}
            title="Make your first transaction"
            done={wrapHash != null}
            aside={
              <Panel className="p-4 space-y-2.5">
                {!provider ? (
                  <p className="text-[12.5px] text-text-tertiary">Open this page in a browser with a wallet to send it.</p>
                ) : wrapHash ? (
                  <>
                    <p className="text-[12.5px] text-success">Sent. Your first transaction on Elysium.</p>
                    <Button variant="ghostBrand" className="w-full" asChild>
                      <Link href={`/elysium/tx/${wrapHash}`}>
                        <FileSearch /> See it in the inspector
                      </Link>
                    </Button>
                  </>
                ) : (
                  <Button variant="ghostBrand" className="w-full" onClick={wrap} disabled={wrapping || (account != null && !funded)}>
                    {wrapping ? <InlineSpinner /> : <Sparkles />}
                    {wrapping ? "Confirm in your wallet…" : `Wrap ${WRAP_AMOUNT} HYPE`}
                  </Button>
                )}
                {account != null && !funded && !wrapHash && (
                  <p className="text-[12px] text-text-tertiary">Claim test HYPE in step 2 first.</p>
                )}
                {wrapErr && <p className="text-[12px] text-danger">{wrapErr}</p>}
                <p className="text-[11px] text-text-tertiary">
                  WHYPE contract{" "}
                  <Link href={addressHref(ELYSIUM_WHYPE)} className="mono text-text-secondary hover:text-brand">
                    {short(ELYSIUM_WHYPE)}
                  </Link>
                </p>
              </Panel>
            }
          >
            <p>
              One click wraps {WRAP_AMOUNT} HYPE into WHYPE, the ERC-20 version of HYPE that apps use. It is a real
              transaction on Elysium: your wallet asks you to confirm it, and the gas is a tiny amount of test HYPE.
              Unwrapping gives the HYPE back.
            </p>
          </Step>

          <Step
            n={4}
            title="See it on the chain"
            aside={
              <Panel className="p-4 space-y-2">
                {wrapHash ? (
                  <Button variant="ghostBrand" className="w-full" asChild>
                    <Link href={`/elysium/tx/${wrapHash}`}>
                      <FileSearch /> Open my transaction
                    </Link>
                  </Button>
                ) : (
                  <p className="text-[12.5px] text-text-tertiary">Your transaction from step 3 shows up here.</p>
                )}
                {account && (
                  <Link href={addressHref(account)} className="block text-[12.5px] text-brand hover:underline">
                    Everything my wallet did on Elysium
                  </Link>
                )}
              </Panel>
            }
          >
            <p>
              Every transaction on Elysium is public. The inspector shows what yours did in plain words: who sent what,
              the fee paid, the events it produced. Your address page lists all of it.
            </p>
          </Step>

          <Step
            n={5}
            title="Look around"
            aside={
              <div className="grid grid-cols-2 gap-2">
                {[
                  { href: "/elysium", label: "Overview", hint: "Blocks and activity" },
                  { href: "/elysium/dex", label: "DEX", hint: "Pools and swaps" },
                  { href: "/elysium/tokens", label: "Tokens", hint: "What was launched" },
                  { href: "/elysium/users", label: "Users", hint: "Who is active" },
                ].map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="rounded-lg border border-border-subtle bg-surface-2/50 px-3 py-2 hover:border-brand/40 transition-colors"
                  >
                    <div className="text-[12.5px] font-medium text-text-primary">{l.label}</div>
                    <div className="text-[11px] text-text-tertiary">{l.hint}</div>
                  </Link>
                ))}
              </div>
            }
          >
            <p>See what is already running on the testnet, live: the chain&apos;s activity, the pools people trade in, the tokens launched and the most active wallets.</p>
          </Step>

          <Step
            n={6}
            title="Move HYPE between chains"
            aside={
              <Panel className="p-4 space-y-2">
                <Button variant="ghostBrand" className="w-full" asChild>
                  <a href={BRIDGE_URL} target="_blank" rel="noopener noreferrer">
                    <ArrowLeftRight /> Open the bridge <ExternalLink />
                  </a>
                </Button>
                <button type="button" onClick={() => setTrack("build")} className="block text-[12.5px] text-brand hover:underline">
                  Want to build? Switch to the builder path
                </button>
              </Panel>
            }
          >
            <p>
              The Elysium bridge moves test HYPE between HyperEVM testnet and Elysium, 1:1. A deposit to Elysium takes
              about a minute according to the bridge. A withdrawal back becomes claimable on HyperEVM once the rollup
              confirms it.
            </p>
          </Step>
        </>
      ) : (
        <>
          <Step
            n={3}
            title="Deploy a contract"
            aside={
              <Panel className="p-4">
                <Button variant="ghostBrand" className="w-full" asChild>
                  <Link href="/elysium/simulate?kind=deploy">
                    <Rocket /> Open the deployer
                  </Link>
                </Button>
              </Panel>
            }
          >
            <p>
              The deployer comes loaded with a small Greeter contract. Simulate it first: you see the address it will get,
              the gas and the events, before anything is signed. Then deploy it from your wallet in one click. Paste your
              own Foundry or Hardhat artifact to deploy your code instead.
            </p>
          </Step>

          <Step
            n={4}
            title="Read your transaction"
            aside={
              <Panel className="p-4 space-y-2">
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
                  <Link href={addressHref(account)} className="block text-[12.5px] text-brand hover:underline">
                    My address page
                  </Link>
                )}
              </Panel>
            }
          >
            <p>
              Every transaction opens in the inspector: status, gas and the fee split, decoded events and calls. The
              deployer links there once your deployment lands. You can also paste any hash.
            </p>
          </Step>

          <Card padding="none">
            <div className="p-4 space-y-3">
              <div className="flex gap-3">
                <span className="mt-0.5 w-7 h-7 rounded-full grid place-items-center text-[12.5px] font-semibold shrink-0 bg-brand/10 text-brand">
                  5
                </span>
                <div className="min-w-0 space-y-2">
                  <h2 className="text-[15px] font-semibold text-text-primary">Verify your source</h2>
                  <p className="text-[12.5px] leading-relaxed text-text-secondary max-w-[90ch]">
                    Publishing the source lets anyone read your contract on the explorers, and lets the{" "}
                    <Link href="/elysium/decode" className="text-brand hover:underline">
                      decoder
                    </Link>{" "}
                    name its functions. Each explorer runs its own verifier: the Kinetiq explorer through its Blockscout
                    API, the Conduit explorer through its Sourcify server. Hardhat and the web form are on the{" "}
                    <ExtLink href={`${KINETIQ_EXPLORER}/verify-contract`} className="text-brand">
                      Kinetiq verify page
                    </ExtLink>{" "}
                    and in the{" "}
                    <ExtLink href="https://docs.conduit.xyz/chains/explorer/verify-contracts" className="text-brand">
                      Conduit guide
                    </ExtLink>
                    .
                  </p>
                </div>
              </div>
              <div className="grid gap-3 lg:grid-cols-2">
                <Code title="Kinetiq explorer">{VERIFY_BLOCKSCOUT}</Code>
                <Code title="Conduit explorer">{VERIFY_SOURCIFY}</Code>
              </div>
            </div>
          </Card>

          <Card padding="none">
            <div className="p-4 space-y-3">
              <div className="flex flex-wrap items-start gap-3">
                <span className="mt-0.5 w-7 h-7 rounded-full grid place-items-center text-[12.5px] font-semibold shrink-0 bg-brand/10 text-brand">
                  6
                </span>
                <div className="min-w-0 flex-1 space-y-1">
                  <h2 className="text-[15px] font-semibold text-text-primary">Use your own tools</h2>
                  <p className="text-[12.5px] text-text-secondary">
                    Foundry, Hardhat, viem and ethers work as on any Arbitrum Orbit chain. Copy the setup:
                  </p>
                </div>
                <PillTabs
                  tabs={(Object.keys(TOOLS) as (keyof typeof TOOLS)[]).map((k) => ({ value: k, label: TOOLS[k].label }))}
                  activeTab={tool}
                  onTabChange={(v) => setTool(v as keyof typeof TOOLS)}
                />
              </div>
              <div className={`grid gap-3 ${TOOLS[tool].blocks.length > 1 ? "lg:grid-cols-2" : ""}`}>
                {TOOLS[tool].blocks.map((b, i) => (
                  <div key={b.title} className={TOOLS[tool].blocks.length === 3 && i === 2 ? "lg:col-span-2" : ""}>
                    <Code title={b.title}>{b.code}</Code>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card padding="none">
            <CardHeading icon={<Info size={14} />} title="What differs from Ethereum" meta="checked on the chain" />
            <ul className="grid gap-x-6 gap-y-3 p-4 text-[12.5px] leading-relaxed text-text-secondary lg:grid-cols-2">
              <li>
                <span className="font-medium text-text-primary">block.number is the HyperEVM block.</span> On the Arbitrum
                Nitro stack, <span className="mono">block.number</span>{" "}
                inside a contract returns the parent chain block.
                For Elysium&apos;s own, call <span className="mono">ArbSys(0x64).arbBlockNumber()</span>. Both live values
                are in the strip above.
              </li>
              <li>
                <span className="font-medium text-text-primary">Blocks are fast and cheap.</span> Gas is paid in HYPE at
                the base fee shown above, and blocks come every fraction of a second. Time-based logic should use{" "}
                <span className="mono">block.timestamp</span>, not block counts.
              </li>
              <li>
                <span className="font-medium text-text-primary">Recent opcodes work, blobs do not.</span> PUSH0, transient
                storage (TSTORE / TLOAD), MCOPY and CLZ all execute. BLOBBASEFEE is rejected: the chain posts its data to a
                data availability committee, not to blobs.
              </li>
              <li>
                <span className="font-medium text-text-primary">Rust and C contracts too.</span> Stylus is on, so contracts
                compiled to WebAssembly run next to Solidity ones and can call each other. ArbSys, ArbGasInfo and the other
                Arbitrum precompiles sit at their usual addresses; the{" "}
                <Link href="/elysium/network" className="text-brand hover:underline">
                  Network page
                </Link>{" "}
                reads them live.
              </li>
            </ul>
          </Card>

          <Card padding="none">
            <CardHeading icon={<Boxes size={14} />} title="Already deployed" meta="checked 4 Oct 2026" />
            <div className="grid gap-2 p-4 sm:grid-cols-2 lg:grid-cols-4">
              {DEPLOYED.map((c) => (
                <div key={c.address} className="rounded-lg border border-border-subtle bg-surface-2/50 px-3 py-2.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[12.5px] font-medium text-text-primary">{c.name}</span>
                    <CopyButton text={c.address} className="ml-auto shrink-0" />
                  </div>
                  <Link href={addressHref(c.address)} className="mono text-[11.5px] text-text-secondary hover:text-brand">
                    {short(c.address)}
                  </Link>
                  <div className="mt-0.5 text-[11px] text-text-tertiary">{c.note}</div>
                </div>
              ))}
            </div>
            <p className="px-4 pb-4 text-[11.5px] text-text-tertiary">
              Anything else (account abstraction, Safe…) you deploy yourself, for example through the CREATE2 deployer to
              keep the same address as on other chains.
            </p>
          </Card>

          <div className="flex flex-wrap gap-x-4 gap-y-1 px-1 text-[12.5px]">
            <Link href="/elysium/network" className="text-text-secondary hover:text-brand">
              Network parameters
            </Link>
            <Link href="/elysium/decode" className="text-text-secondary hover:text-brand">
              Decode any contract
            </Link>
            <Link href="/elysium/node" className="text-text-secondary hover:text-brand">
              Run your own node
            </Link>
            <ExtLink href={DOCS_URL} className="text-text-secondary">
              Elysium docs
            </ExtLink>
            <ExtLink href={KINETIQ_EXPLORER} className="text-text-secondary">
              Elysium explorer
            </ExtLink>
          </div>
        </>
      )}
    </div>
  );
}

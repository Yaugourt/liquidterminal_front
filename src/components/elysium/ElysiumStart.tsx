"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatEther, formatGwei, isHash, parseAbi, type Address, type EIP1193Provider } from "viem";
import { Boxes, Check, Droplets, ExternalLink, FileSearch, Info, Rocket, ShieldCheck, Wallet, Wrench } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { CardHeading, KpiRibbon, type KpiCell } from "@/components/common";
import { ELYSIUM_ALT_RPC_URL, ELYSIUM_CHAIN } from "@/lib/elysium-chain";
import { PRECOMPILE, elysiumClient } from "@/services/elysium/rpc";
import { connectWallet, injectedWallet, switchToElysium, walletChainId, walletError } from "@/lib/elysium/wallet";
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
 * Elysium · Start building: the testnet path in six steps, from adding the
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

  const live = useChainLive();
  const funded = balance != null && balance > BigInt(0);
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
  const goodHash = isHash(hash.trim());

  return (
    <div className="space-y-4">
      <Card padding="none">
        <div className="p-4 space-y-2">
          <h1 className="text-[18px] font-semibold text-text-primary">Start building on Elysium testnet</h1>
          <p className="text-[13px] leading-relaxed text-text-secondary max-w-[70ch]">
            Elysium is a chain that settles on HyperEVM, with HYPE as its gas token. Six steps take you from an empty
            wallet to a contract deployed, verified and its transaction decoded. Steps 1 and 2 check themselves against your
            wallet and the chain as you go.
          </p>
        </div>
      </Card>

      <KpiRibbon cells={cells} />

      <div className="grid gap-4 lg:grid-cols-2 items-start">
        <Step n={1} title="Add the network" icon={<Wallet size={14} />} done={onElysium}>
          <div>
            <Row label="Network" value="Elysium Testnet" />
            <Row label="Chain ID" value={String(ELYSIUM_CHAIN.chainId)} />
            <Row label="RPC" value={ELYSIUM_CHAIN.rpc} />
            <Row label="RPC (alt)" value={ELYSIUM_ALT_RPC_URL} />
            <Row label="Currency" value="HYPE" />
            <Row label="Explorer" value={KINETIQ_EXPLORER} href={KINETIQ_EXPLORER} />
            <Row label="Explorer (alt)" value={EXPLORER} href={EXPLORER} />
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
          <p>
            Already holding HYPE on HyperEVM testnet? The{" "}
            <a href={BRIDGE_URL} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">
              Elysium bridge
            </a>{" "}
            deposits it 1:1 through the rollup inbox, which its interface puts at about a minute. Withdrawals go the
            other way and become claimable on HyperEVM once the rollup confirms them.
          </p>
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

      <Step n={5} title="Verify your source" icon={<ShieldCheck size={14} />}>
        <p>
          Publishing the source lets anyone read your contract on the explorers, and lets the{" "}
          <Link href="/elysium/decode" className="text-brand hover:underline">
            decoder
          </Link>{" "}
          name its functions. Each explorer runs its own verifier: verify on the Kinetiq explorer through its Blockscout
          API, on the Conduit explorer through its Sourcify server, or both.
        </p>
        <div className="grid gap-3 lg:grid-cols-2">
          <Code title="Kinetiq explorer">{VERIFY_BLOCKSCOUT}</Code>
          <Code title="Conduit explorer">{VERIFY_SOURCIFY}</Code>
        </div>
        <p className="text-[11.5px] text-text-tertiary">
          Hardhat and the web form are on the{" "}
          <ExtLink href={`${KINETIQ_EXPLORER}/verify-contract`} className="text-text-secondary">
            Kinetiq explorer verify page
          </ExtLink>{" "}
          and in the{" "}
          <ExtLink href="https://docs.conduit.xyz/chains/explorer/verify-contracts" className="text-text-secondary">
            Conduit guide
          </ExtLink>
          .
        </p>
      </Step>

      <div className="grid gap-4 lg:grid-cols-2 items-start">
        <Card padding="none">
          <CardHeading icon={<Info size={14} />} title="What differs from Ethereum" meta="checked on the chain" />
          <ul className="space-y-3 p-4 text-[12.5px] leading-relaxed text-text-secondary">
            <li>
              <span className="font-medium text-text-primary">block.number is the HyperEVM block.</span> Elysium runs on
              the Arbitrum Nitro stack, where <span className="mono">block.number</span>{" "}
              inside a contract returns the
              parent chain block. For Elysium&apos;s own block, call{" "}
              <span className="mono">ArbSys(0x64).arbBlockNumber()</span>. The two live values are in the strip above.
            </li>
            <li>
              <span className="font-medium text-text-primary">Blocks are fast and cheap.</span> Gas is paid in HYPE at
              the base fee shown above, and blocks come every fraction of a second on average. Time-based logic should
              use <span className="mono">block.timestamp</span>, not block counts.
            </li>
            <li>
              <span className="font-medium text-text-primary">Recent opcodes work, blobs do not.</span> PUSH0, transient
              storage (TSTORE / TLOAD), MCOPY and CLZ all execute. BLOBBASEFEE is rejected: the chain posts its data to
              a data availability committee, not to blobs.
            </li>
            <li>
              <span className="font-medium text-text-primary">Rust and C contracts too.</span> Stylus is on, so
              contracts compiled to WebAssembly run next to Solidity ones and can call each other.
            </li>
            <li>
              <span className="font-medium text-text-primary">Arbitrum precompiles are there.</span> ArbSys, ArbGasInfo
              and the rest sit at their usual addresses; the{" "}
              <Link href="/elysium/network" className="text-brand hover:underline">
                Network page
              </Link>{" "}
              reads them live.
            </li>
          </ul>
        </Card>

        <Card padding="none">
          <CardHeading icon={<Boxes size={14} />} title="Already deployed" meta="usual addresses" />
          <div className="p-4">
            {DEPLOYED.map((c) => (
              <div key={c.address} className="flex items-center gap-3 py-2 border-b border-border-subtle last:border-0">
                <div className="min-w-0 flex-1">
                  <div className="text-[12.5px] font-medium text-text-primary">{c.name}</div>
                  <div className="text-[11.5px] text-text-tertiary">{c.note}</div>
                </div>
                <Link href={addressHref(c.address)} className="mono text-[12px] text-text-secondary hover:text-brand">
                  {short(c.address)}
                </Link>
                <CopyButton text={c.address} className="shrink-0" />
              </div>
            ))}
            <p className="pt-3 text-[11.5px] leading-relaxed text-text-tertiary">
              Checked on the chain on 4 Oct 2026. Anything else (account abstraction, Safe…) you deploy yourself, for
              example through the CREATE2 deployer to keep the same address as on other chains.
            </p>
          </div>
        </Card>
      </div>

      <Card padding="none">
        <CardHeading icon={<Wrench size={14} />} title="6 · Use your own tools" meta="Foundry · Hardhat · viem" />
        <div className="grid gap-3 p-4 lg:grid-cols-2">
          <Code title="foundry.toml">{FOUNDRY_TOML}</Code>
          <Code title="cast">{CAST}</Code>
          <Code title="Foundry">{FOUNDRY}</Code>
          <Code title="Hardhat">{HARDHAT}</Code>
          <Code title="viem">{VIEM}</Code>
          <Code title="Hardhat · deploy">{HARDHAT_DEPLOY}</Code>
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
          <ExtLink href={DOCS_URL} className="text-text-secondary">
            Elysium docs
          </ExtLink>
          <ExtLink href={KINETIQ_EXPLORER} className="text-text-secondary">
            Elysium explorer
          </ExtLink>
        </div>
      </Card>
    </div>
  );
}

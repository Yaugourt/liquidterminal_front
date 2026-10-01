"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  decodeFunctionResult,
  formatUnits,
  isAddress,
  keccak256,
  parseEther,
  type Abi,
  type AbiFunction,
  type Address,
  type EIP1193Provider,
  type Hash,
  type Hex,
} from "viem";
import { CheckCircle2, Circle, Link2, Play, Rocket, ShieldCheck, Wallet, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { Checkbox } from "@/components/ui/checkbox";
import { CardHeading, ShareTile } from "@/components/common";
import { ELYSIUM_CHAIN } from "@/lib/elysium-chain";
import {
  MAX_INITCODE_BYTES,
  MAX_RUNTIME_BYTES,
  NATIVE_TRANSFER_ADDRESS,
  elysiumClient,
  fetchTokenMeta,
  simulateElysiumDeploy,
  type DeploySimResult,
} from "@/services/elysium/rpc";
import { connectWallet, injectedWallet, sendDeployment, switchToElysium, walletChainId, walletError } from "@/lib/elysium/wallet";
import { AddrLink, EMPTY, ExtLink, addressHref } from "./shared";
import { EventsCard, Field, Stat, decodeLog, fmtArg, inputCls, parseSig, revertText, type TokenMeta } from "./simulator-shared";
import { DEPLOY_SAMPLE_FROM, buildDeploy, ctorSignature, deployFormFromParams, deployFormToParams, parseCode, parseCtor, type DeployForm } from "@/lib/elysium/deploy-form";
import { GREETER_BYTECODE, GREETER_CONSTRUCTOR, GREETER_SOURCE } from "./sim-samples";

const SAMPLE_FROM = DEPLOY_SAMPLE_FROM;
/** Gas limit sent to the wallet: the estimate plus 20%, so a slightly busier block does not run out. */
const GAS_MARGIN_PCT = 120n;

const PRESETS: { label: string; form: DeployForm }[] = [
  {
    label: "Deploy a Greeter",
    form: { from: SAMPLE_FROM, value: "0", code: GREETER_BYTECODE, ctor: GREETER_CONSTRUCTOR, args: ["gm Elysium"], then: "greeting() view returns (string)", thenArgs: [], fund: true },
  },
  {
    label: "HYPE to a non-payable constructor",
    form: { from: SAMPLE_FROM, value: "1", code: GREETER_BYTECODE, ctor: GREETER_CONSTRUCTOR, args: ["gm Elysium"], then: "", thenArgs: [], fund: true },
  },
];

/** Read-only functions without inputs: one-click follow-up calls. */
function quickReads(abi: Abi | null): string[] {
  return (abi ?? [])
    .filter((x): x is AbiFunction => x.type === "function" && (x.stateMutability === "view" || x.stateMutability === "pure") && x.inputs.length === 0)
    .slice(0, 6)
    .map((f) => `${f.name}() view returns (${f.outputs.map((o) => o.type).join(",")})`);
}

/** Fingerprint of what a wallet would sign, to refuse a send that drifted from its check. */
const fingerprint = (from: string, data: Hex, value: bigint) => `${from.toLowerCase()}:${keccak256(data)}:${value}`;

/** Links longer than this get cut by chat apps and proxies: no share link then. */
const MAX_SHARE_URL = 7_500;

const hypeText = (wei: bigint, digits = 6) => `${Number(formatUnits(wei, 18)).toLocaleString("en-US", { maximumFractionDigits: digits })} HYPE`;
const bytesText = (n: number, max: number) => `${n.toLocaleString("en-US")} / ${max.toLocaleString("en-US")} B`;

/**
 * Deploy mode: simulate a contract creation on live Elysium state (address,
 * constructor events, code size, fee, a follow-up call on the new contract),
 * then deploy it from the user's own wallet once a check from that wallet
 * passes.
 */
export function ElysiumDeploySimulator() {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [form, setForm] = useState<DeployForm>(() => deployFormFromParams(new URLSearchParams(sp.toString())) ?? PRESETS[0].form);
  // Bytecode that arrived through a link (not our bundled example): the wallet
  // card asks for an explicit acknowledgement before deploying someone else's code.
  const [linkCode] = useState<Hex | null>(() => {
    const f = deployFormFromParams(new URLSearchParams(sp.toString()));
    const b = f ? parseCode(f.code)?.bytecode ?? null : null;
    return b && b !== GREETER_BYTECODE ? b : null;
  });
  const [result, setResult] = useState<DeploySimResult | null>(null);
  const [ran, setRan] = useState<{ form: DeployForm; thenFn: AbiFunction | null; abi: Abi | null } | null>(null);
  const [meta, setMeta] = useState<TokenMeta>({});
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (patch: Partial<DeployForm>) => setForm((f) => ({ ...f, ...patch }));
  const parsed = useMemo(() => parseCode(form.code), [form.code]);
  const ctor = useMemo(() => parseCtor(form.ctor), [form.ctor]);
  const thenFn = useMemo(() => (form.then.trim() ? parseSig(form.then) : null), [form.then]);
  const reads = useMemo(() => quickReads(parsed?.abi ?? null), [parsed]);
  const isSample = parsed?.bytecode === GREETER_BYTECODE;

  /** Pasting an artifact fills the constructor from its ABI. */
  const onCode = (code: string) => {
    const p = parseCode(code);
    const sig = ctorSignature(p?.abi ?? null);
    setForm((f) => ({ ...f, code, ...(p?.abi ? { ctor: sig, args: [], then: "", thenArgs: [] } : {}) }));
  };

  const run = useCallback(
    async (f: DeployForm) => {
      setErr(null);
      setBusy(true);
      try {
        if (!isAddress(f.from)) throw new Error("From is not an address");
        const b = buildDeploy(f);
        if (b.data.length / 2 - 1 > MAX_INITCODE_BYTES) throw new Error(`Creation code is over the ${MAX_INITCODE_BYTES.toLocaleString("en-US")}-byte limit (EIP-3860)`);
        const r = await simulateElysiumDeploy({ from: f.from as Address, value: b.value, data: b.data, fundWei: f.fund ? parseEther("100") : undefined, followUpData: b.followUp });
        const tokens = [...new Set(r.logs.map((l) => l.address.toLowerCase()).filter((a) => a !== NATIVE_TRANSFER_ADDRESS && a !== r.address.toLowerCase()))] as Address[];
        setMeta(await fetchTokenMeta(tokens));
        setResult(r);
        setRan({ form: f, thenFn: b.thenFn, abi: b.parsed.abi });
        const qs = deployFormToParams(f);
        router.replace(qs.length < MAX_SHARE_URL ? `${pathname}?${qs}` : `${pathname}?kind=deploy`, { scroll: false });
      } catch (e) {
        setResult(null);
        setErr(e instanceof Error ? e.message.split("\n")[0] : String(e));
      } finally {
        setBusy(false);
      }
    },
    [pathname, router]
  );

  useEffect(() => {
    void run(form);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logs = useMemo(() => (result?.logs ?? []).map((l) => decodeLog(l, ran?.abi ?? undefined)), [result, ran]);
  const revert = result ? revertText(result.revertData, result.revertMessage, ran?.abi ?? undefined) : null;
  const followUp = useMemo(() => {
    const f = result?.followUp;
    if (!f || !ran?.thenFn) return null;
    if (f.status === "reverted") return { ok: false, text: revertText(f.revertData, f.revertMessage, ran.abi ?? undefined) ?? "reverted" };
    if (!ran.thenFn.outputs.length) return { ok: true, text: f.returnData === "0x" ? "success, nothing returned" : f.returnData };
    try {
      const v = decodeFunctionResult({ abi: [ran.thenFn], functionName: ran.thenFn.name, data: f.returnData });
      return { ok: true, text: (Array.isArray(v) ? v : [v]).map(fmtArg).join(", ") };
    } catch {
      return { ok: true, text: f.returnData };
    }
  }, [result, ran]);
  const fee = result?.gasEstimate != null ? result.gasEstimate * result.gasPriceWei : null;
  const shareQs = ran ? deployFormToParams(ran.form) : "";
  const shareUrl = ran && shareQs.length < MAX_SHARE_URL && typeof window !== "undefined" ? `${window.location.origin}${pathname}?${shareQs}` : "";
  const labels = result ? { [result.address.toLowerCase()]: "new contract" } : undefined;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-[12px]">
        <span className="text-text-tertiary">Examples</span>
        {PRESETS.map((p) => (
          <Button key={p.label} size="sm" variant="outline" onClick={() => { setForm(p.form); void run(p.form); }}>
            {p.label}
          </Button>
        ))}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
        <div className="min-w-0">
          <Card className="overflow-hidden flex flex-col">
            <CardHeading icon={<Rocket size={13} className="text-brand" />} title="Deployment" meta="simulated, nothing is sent" metaVariant="plain" />
            <form className="p-3.5 space-y-3" onSubmit={(e) => { e.preventDefault(); void run(form); }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                <Field id="dep-from" label="Deployer">
                  <input id="dep-from" className={inputCls} value={form.from} onChange={(e) => set({ from: e.target.value })} spellCheck={false} />
                </Field>
                <Field id="dep-value" label="Value (HYPE)">
                  <input id="dep-value" className={inputCls} value={form.value} onChange={(e) => set({ value: e.target.value })} inputMode="decimal" />
                </Field>
              </div>
              <label className="flex items-center gap-2 text-[12px] text-text-secondary">
                <Checkbox id="dep-fund" checked={form.fund} onCheckedChange={(v) => set({ fund: v === true })} />
                Give the deployer 100 HYPE for this run
              </label>
              <Field
                id="dep-code"
                label="Creation bytecode or build artifact"
                hint="Paste the 0x bytecode, or a whole Foundry (out/X.sol/X.json), Hardhat or solc JSON: bytecode, constructor and ABI are read from it."
              >
                <textarea
                  id="dep-code"
                  className={`${inputCls} min-h-[88px] max-h-[160px] break-all`}
                  value={form.code}
                  onChange={(e) => onCode(e.target.value)}
                  spellCheck={false}
                  placeholder="0x6080… or { &quot;abi&quot;: [...], &quot;bytecode&quot;: ... }"
                />
              </Field>
              {form.code.trim() && !parsed ? <p className="text-[11px] text-danger">No bytecode found in this input yet.</p> : null}
              {parsed ? (
                <p className="text-[11px] text-text-tertiary">
                  {parsed.name ? <span className="text-text-secondary">{parsed.name} · </span> : null}
                  {(parsed.bytecode.length / 2 - 1).toLocaleString("en-US")} bytes of creation code{parsed.abi ? ` · ABI with ${parsed.abi.length} entries` : ""}
                </p>
              ) : null}
              <Field id="dep-ctor" label="Constructor" hint="Leave empty when the contract takes no arguments. Integers accept 1e18.">
                <input id="dep-ctor" className={inputCls} value={form.ctor} onChange={(e) => set({ ctor: e.target.value })} spellCheck={false} placeholder="constructor(string name, uint256 supply)" />
              </Field>
              {form.ctor.trim() && !ctor ? <p className="text-[11px] text-danger">Constructor not understood yet.</p> : null}
              {ctor?.inputs.map((p, i) => (
                <Field key={`ctor-${i}`} id={`dep-arg-${i}`} label={`${p.name || `arg ${i}`} · ${p.type}`}>
                  <input
                    id={`dep-arg-${i}`}
                    className={inputCls}
                    value={form.args[i] ?? ""}
                    onChange={(e) => { const args = [...form.args]; args[i] = e.target.value; set({ args }); }}
                    spellCheck={false}
                  />
                </Field>
              ))}
              <Field id="dep-then" label="Then call on the new contract (optional)" hint="Runs in the same simulated block, right after the constructor.">
                <input id="dep-then" className={inputCls} value={form.then} onChange={(e) => set({ then: e.target.value, thenArgs: [] })} spellCheck={false} placeholder="owner() view returns (address)" />
              </Field>
              {reads.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {reads.map((r) => (
                    <button key={r} type="button" className="rounded border border-border-default px-1.5 py-0.5 mono text-[11px] text-text-secondary hover:text-text-primary" onClick={() => set({ then: r, thenArgs: [] })}>
                      {r.slice(0, r.indexOf("("))}()
                    </button>
                  ))}
                </div>
              ) : null}
              {thenFn?.inputs.map((p, i) => (
                <Field key={`then-${i}`} id={`dep-targ-${i}`} label={`${p.name || `arg ${i}`} · ${p.type}`}>
                  <input
                    id={`dep-targ-${i}`}
                    className={inputCls}
                    value={form.thenArgs[i] ?? ""}
                    onChange={(e) => { const thenArgs = [...form.thenArgs]; thenArgs[i] = e.target.value; set({ thenArgs }); }}
                    spellCheck={false}
                  />
                </Field>
              ))}
              <Button type="submit" size="sm" disabled={busy}>
                <Play size={13} className="mr-1.5" />
                {busy ? "Simulating…" : "Simulate deployment"}
              </Button>
              {err ? <p className="text-[12px] text-danger">{err}</p> : null}
            </form>
            {isSample ? (
              <details className="border-t border-border-subtle px-3.5 py-2.5 text-[12px]">
                <summary className="cursor-pointer text-text-secondary">Example source: Greeter.sol (solc 0.8.26)</summary>
                <pre className="mt-2 max-h-[260px] overflow-auto rounded-md bg-surface-2 p-2.5 mono text-[11px] text-text-secondary">{GREETER_SOURCE}</pre>
              </details>
            ) : null}
          </Card>
        </div>

        <div className="space-y-4 min-w-0">
          <Card className="overflow-hidden flex flex-col">
            <CardHeading
              icon={result?.status === "reverted" ? <XCircle size={13} className="text-danger" /> : <CheckCircle2 size={13} className="text-brand" />}
              title="Result"
              meta={result ? `block ${result.block.toLocaleString("en-US")}` : undefined}
              metaVariant="plain"
            />
            {!result ? (
              <p className="px-3.5 py-6 text-center text-[12px] text-text-tertiary">{busy ? "Simulating…" : "Simulate a deployment to see its outcome."}</p>
            ) : (
              <div className="p-3.5 space-y-3 text-[12px]">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Stat label="Status" value={result.status} tone={result.status === "success" ? "text-success" : "text-danger"} />
                  <Stat label="Execution gas" value={result.gasUsed.toLocaleString("en-US")} />
                  <Stat label="Gas to set" value={result.gasEstimate != null ? result.gasEstimate.toLocaleString("en-US") : EMPTY} />
                  <Stat label="Fee" value={fee != null ? hypeText(fee, 8) : EMPTY} tone="text-gold" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-[0.06em] text-text-tertiary">Contract address</div>
                    <div className="mono text-text-primary flex items-center gap-1.5 min-w-0">
                      <span className="truncate" title={result.address}>{result.address}</span>
                      <CopyButton text={result.address} />
                    </div>
                    <div className="text-[11px] text-text-tertiary">deployer nonce {result.nonce.toLocaleString("en-US")}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Stat
                      label="Runtime code"
                      value={bytesText(result.runtimeSize, MAX_RUNTIME_BYTES)}
                      tone={result.runtimeSize > MAX_RUNTIME_BYTES ? "text-danger" : "text-text-primary"}
                    />
                    <Stat label="Creation code" value={bytesText(result.initcodeSize, MAX_INITCODE_BYTES)} />
                  </div>
                </div>
                <p className="text-[11px] text-text-tertiary">
                  The address comes from the deployer and its nonce: it holds as long as no other transaction from that address lands first.
                </p>
                {revert ? (
                  <div className="rounded-md border border-danger/40 bg-danger/10 px-2.5 py-2">
                    <div className="text-[10px] uppercase tracking-[0.06em] text-danger">Revert reason</div>
                    <div className="mono text-text-primary break-all">{revert}</div>
                  </div>
                ) : null}
                {followUp && ran ? (
                  <div className={`rounded-md border px-2.5 py-2 ${followUp.ok ? "border-border-subtle bg-surface-2" : "border-danger/40 bg-danger/10"}`}>
                    <div className="text-[10px] uppercase tracking-[0.06em] text-text-tertiary">Then {ran.thenFn?.name}()</div>
                    <div className={`mono break-all ${followUp.ok ? "text-text-primary" : "text-danger"}`}>{followUp.text}</div>
                  </div>
                ) : null}
                {shareUrl ? (
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-text-tertiary">
                    <span className="flex items-center gap-1.5"><Link2 size={12} /> Share this simulation <CopyButton text={shareUrl} /></span>
                    <ShareTile src={`/api/tile/elysium-simulation?${shareQs}`} filename="liquid-terminal-elysium-deploy" />
                  </div>
                ) : ran ? (
                  <p className="text-[11px] text-text-tertiary">This bytecode is too long for a share link.</p>
                ) : null}
              </div>
            )}
          </Card>
          {result ? <EventsCard logs={logs} meta={meta} labels={labels} /> : null}
          <WalletDeployCard form={form} fromLink={linkCode != null && parsed?.bytecode === linkCode} />
        </div>
      </div>
      <p className="text-[11px] text-text-tertiary">
        Simulations run on the latest Elysium block (eth_simulateV1 without a recipient, eth_estimateGas). The HYPE credit is a state override that only
        exists inside the simulation. Deploying for real goes through your own wallet, on the Elysium testnet only.
      </p>
    </div>
  );
}

type Check = { label: string; ok: boolean | null; detail?: string };

interface Preflight {
  key: string;
  account: Address;
  result: DeploySimResult;
  gas: bigint;
  data: Hex;
  value: bigint;
}

/**
 * Real deployment from the user's wallet. The send button only unlocks after
 * a check run from that wallet's own address, with no balance override, on
 * exactly the bytecode, arguments and value now in the form.
 */
function WalletDeployCard({ form, fromLink }: { form: DeployForm; fromLink: boolean }) {
  const [ackCode, setAckCode] = useState(false);
  const [ackValue, setAckValue] = useState(false);
  const [provider, setProvider] = useState<EIP1193Provider | null>(null);
  const [account, setAccount] = useState<Address | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [pre, setPre] = useState<Preflight | null>(null);
  const [step, setStep] = useState<"idle" | "checking" | "signing" | "pending">("idle");
  const [err, setErr] = useState<string | null>(null);
  const [sent, setSent] = useState<{ hash: Hash; address: Address | null; status: "pending" | "success" | "reverted"; predicted: Address } | null>(null);

  useEffect(() => {
    const p = injectedWallet();
    setProvider(p);
    if (!p) return;
    const onAccounts = (a: unknown) => { const list = a as string[]; setAccount(list[0] ? (list[0] as Address) : null); setPre(null); };
    const onChain = (c: unknown) => { setChainId(Number(BigInt(c as string))); setPre(null); };
    p.on("accountsChanged", onAccounts as never);
    p.on("chainChanged", onChain as never);
    return () => {
      p.removeListener("accountsChanged", onAccounts as never);
      p.removeListener("chainChanged", onChain as never);
    };
  }, []);

  // What the form would send right now; a mismatch with the check locks the button.
  const current = useMemo(() => {
    try {
      const b = buildDeploy(form);
      return { data: b.data, value: b.value, followUp: b.followUp };
    } catch {
      return null;
    }
  }, [form]);
  const currentKey = account && current ? fingerprint(account, current.data, current.value) : null;

  const connect = async () => {
    if (!provider) return;
    setErr(null);
    try {
      setAccount(await connectWallet(provider));
      setChainId(await walletChainId(provider));
    } catch (e) {
      setErr(walletError(e));
    }
  };

  const switchChain = async () => {
    if (!provider) return;
    setErr(null);
    try {
      await switchToElysium(provider);
      setChainId(await walletChainId(provider));
    } catch (e) {
      setErr(walletError(e));
    }
  };

  const check = async () => {
    if (!account || !current) return;
    setErr(null);
    setStep("checking");
    try {
      const r = await simulateElysiumDeploy({ from: account, value: current.value, data: current.data, followUpData: current.followUp });
      const gas = r.gasEstimate != null ? (r.gasEstimate * GAS_MARGIN_PCT) / 100n : 0n;
      setPre({ key: fingerprint(account, current.data, current.value), account, result: r, gas, data: current.data, value: current.value });
      setAckCode(false);
      setAckValue(false);
    } catch (e) {
      setPre(null);
      setErr(e instanceof Error ? e.message.split("\n")[0] : String(e));
    } finally {
      setStep("idle");
    }
  };

  const onElysium = chainId === ELYSIUM_CHAIN.chainId;
  const r = pre?.result;
  const cost = pre && r ? pre.value + pre.gas * r.gasPriceWei : null;
  const checks: Check[] = [
    { label: `Wallet on Elysium testnet (chain ${ELYSIUM_CHAIN.chainId})`, ok: account ? onElysium : null, detail: account && !onElysium && chainId != null ? `wallet is on chain ${chainId}` : undefined },
    { label: "Simulated from your address, no balance override", ok: r ? r.status === "success" : null, detail: r ? (r.status === "success" ? `block ${r.block.toLocaleString("en-US")}` : revertText(r.revertData, r.revertMessage) ?? "reverted") : undefined },
    { label: "Balance covers value and fee", ok: r && cost != null ? r.senderBalanceWei >= cost && r.gasEstimate != null : null, detail: r && cost != null ? `${hypeText(r.senderBalanceWei)} available, ${hypeText(cost, 8)} needed` : undefined },
    { label: "Code within size limits", ok: r ? r.runtimeSize <= MAX_RUNTIME_BYTES && r.initcodeSize <= MAX_INITCODE_BYTES : null, detail: r ? `${r.runtimeSize.toLocaleString("en-US")} B runtime` : undefined },
    { label: "Form unchanged since the check", ok: pre ? pre.key === currentKey : null, detail: pre && pre.key !== currentKey ? "run the check again" : undefined },
    ...(fromLink ? [{ label: "You confirmed you trust this bytecode", ok: pre ? ackCode : null }] : []),
    ...(pre && pre.value > 0n ? [{ label: `You confirmed sending ${hypeText(pre.value)} into the contract`, ok: ackValue }] : []),
  ];
  const ready = checks.every((c) => c.ok === true) && step === "idle";

  const deploy = async () => {
    if (!provider || !pre || !ready) return;
    setErr(null);
    setStep("signing");
    try {
      // The wallet may have switched since the check: read it again right before signing.
      if ((await walletChainId(provider)) !== ELYSIUM_CHAIN.chainId) throw new Error("The wallet left the Elysium testnet: switch back and check again");
      const hash = await sendDeployment(provider, { account: pre.account, data: pre.data, value: pre.value, gas: pre.gas });
      setSent({ hash, address: null, status: "pending", predicted: pre.result.address });
      setStep("pending");
      setPre(null);
      const receipt = await elysiumClient.waitForTransactionReceipt({ hash, timeout: 120_000 });
      setSent({ hash, address: receipt.contractAddress ?? null, status: receipt.status === "success" ? "success" : "reverted", predicted: pre.result.address });
    } catch (e) {
      setErr(walletError(e));
    } finally {
      setStep("idle");
    }
  };

  return (
    <Card className="overflow-hidden flex flex-col">
      <CardHeading icon={<ShieldCheck size={13} className="text-brand" />} title="Deploy with your wallet" meta="testnet" metaVariant="plain" />
      <div className="p-3.5 space-y-3 text-[12px]">
        <p className="text-text-secondary">
          Your wallet shows the transaction and you sign it there: Liquid Terminal never sees a key. Deploying unlocks once a check from your own address passes.
        </p>
        {!provider ? (
          <p className="text-text-tertiary">No browser wallet found. Install an EVM wallet extension, then reload this page.</p>
        ) : !account ? (
          <Button size="sm" variant="outline" onClick={connect}>
            <Wallet size={13} className="mr-1.5" />
            Connect a wallet
          </Button>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-text-tertiary">Wallet</span>
              <AddrLink address={account} className="text-text-primary" />
              {!onElysium ? (
                <Button size="sm" variant="outline" onClick={switchChain}>Switch to Elysium testnet</Button>
              ) : null}
            </div>
            <ul className="space-y-1">
              {checks.map((c) => (
                <li key={c.label} className="flex items-start gap-2">
                  {c.ok === true ? (
                    <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-success" />
                  ) : c.ok === false ? (
                    <XCircle size={13} className="mt-0.5 shrink-0 text-danger" />
                  ) : (
                    <Circle size={13} className="mt-0.5 shrink-0 text-text-tertiary" />
                  )}
                  <span className="min-w-0">
                    <span className={c.ok === false ? "text-text-primary" : "text-text-secondary"}>{c.label}</span>
                    {c.detail ? <span className="block mono text-[11px] text-text-tertiary break-all">{c.detail}</span> : null}
                  </span>
                </li>
              ))}
            </ul>
            {fromLink ? (
              <div className="rounded-md border border-warning/40 bg-warning/10 px-2.5 py-2 space-y-1.5">
                <p className="text-text-primary">
                  This bytecode came from a shared link. A contract does whatever its author wrote: deploy only code you compiled or verified yourself.
                </p>
                <label className="flex items-center gap-2 text-text-secondary">
                  <Checkbox id="dep-ack-code" checked={ackCode} disabled={!pre} onCheckedChange={(v) => setAckCode(v === true)} />
                  I know what this bytecode does
                </label>
              </div>
            ) : null}
            {pre && pre.value > 0n ? (
              <label className="flex items-center gap-2 text-text-secondary">
                <Checkbox id="dep-ack-value" checked={ackValue} onCheckedChange={(v) => setAckValue(v === true)} />
                Send {hypeText(pre.value)} from my wallet into the new contract
              </label>
            ) : null}
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" variant="outline" onClick={check} disabled={!onElysium || !current || step !== "idle"}>
                <Play size={13} className="mr-1.5" />
                {step === "checking" ? "Checking…" : "Check from my wallet"}
              </Button>
              <Button size="sm" onClick={deploy} disabled={!ready}>
                <Rocket size={13} className="mr-1.5" />
                {step === "signing" ? "Confirm in your wallet…" : step === "pending" ? "Waiting for the block…" : "Deploy"}
              </Button>
              {pre && ready ? (
                <span className="text-text-tertiary">
                  to <span className="mono text-text-secondary">{pre.result.address.slice(0, 10)}…</span>, gas limit {pre.gas.toLocaleString("en-US")}
                </span>
              ) : null}
            </div>
          </>
        )}
        {err ? <p className="text-danger break-words">{err}</p> : null}
        {sent ? (
          <div className={`rounded-md border px-2.5 py-2 space-y-1 ${sent.status === "reverted" ? "border-danger/40 bg-danger/10" : "border-border-subtle bg-surface-2"}`}>
            <div className="text-[10px] uppercase tracking-[0.06em] text-text-tertiary">
              {sent.status === "pending" ? "Sent, waiting for the block" : sent.status === "success" ? "Deployed" : "Transaction reverted"}
            </div>
            <div className="mono break-all">
              <ExtLink href={`${ELYSIUM_CHAIN.explorer}/tx/${sent.hash}`} className="text-text-secondary">{sent.hash}</ExtLink>
            </div>
            {sent.address ? (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-text-tertiary">Contract</span>
                <Link href={addressHref(sent.address)} className="mono text-brand hover:underline break-all">{sent.address}</Link>
                <CopyButton text={sent.address} />
                {sent.address.toLowerCase() !== sent.predicted.toLowerCase() ? (
                  <span className="text-text-tertiary">(another transaction from this address landed first: the nonce moved)</span>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </Card>
  );
}

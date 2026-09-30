"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  decodeErrorResult,
  decodeEventLog,
  decodeFunctionResult,
  encodeFunctionData,
  formatUnits,
  isAddress,
  isHex,
  parseAbi,
  parseAbiItem,
  parseEther,
  type AbiFunction,
  type AbiParameter,
  type Address,
  type Hex,
} from "viem";
import { CheckCircle2, FlaskConical, Link2, ListTree, Play, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { Checkbox } from "@/components/ui/checkbox";
import { CardHeading } from "@/components/common";
import { PillTabs } from "@/components/ui/pill-tabs";
import {
  NATIVE_TRANSFER_ADDRESS,
  PRECOMPILE,
  fetchTokenMeta,
  simulateElysiumCall,
  type SimLog,
  type SimResult,
} from "@/services/elysium/rpc";
import { AddrLink, EMPTY } from "./shared";

// Events a builder meets most on Elysium: tokens, wrapped HYPE, Uniswap V2/V3 pools.
const EVENTS = parseAbi([
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
  "event Deposit(address indexed dst, uint256 wad)",
  "event Withdrawal(address indexed src, uint256 wad)",
  "event Swap(address indexed sender, uint256 amount0In, uint256 amount1In, uint256 amount0Out, uint256 amount1Out, address indexed to)",
  "event Sync(uint112 reserve0, uint112 reserve1)",
  "event PairCreated(address indexed token0, address indexed token1, address pair, uint256)",
  "event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)",
  "event PoolCreated(address indexed token0, address indexed token1, uint24 indexed fee, int24 tickSpacing, address pool)",
  "event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)",
]);
// ERC-721 Transfer carries the id as a third indexed topic.
const NFT_TRANSFER = parseAbi(["event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"]);

const WHYPE = "0xcd57f65c2b0e5881cfc2e609f7cd53b746e1f234";
const SAMPLE_FROM = "0x1111111111111111111111111111111111111111";

interface Form {
  from: string;
  to: string;
  value: string;
  mode: "fn" | "raw";
  sig: string;
  args: string[];
  data: string;
  fund: boolean;
}

/** Example calls, run against live state. The sender is a placeholder funded by override. */
const PRESETS: { label: string; form: Form }[] = [
  { label: "Wrap 1 HYPE", form: { from: SAMPLE_FROM, to: WHYPE, value: "1", mode: "fn", sig: "deposit()", args: [], data: "", fund: true } },
  { label: "Read a balance", form: { from: SAMPLE_FROM, to: WHYPE, value: "0", mode: "fn", sig: "balanceOf(address owner) view returns (uint256)", args: [WHYPE], data: "", fund: false } },
  { label: "Gas prices (precompile)", form: { from: SAMPLE_FROM, to: PRECOMPILE.ArbGasInfo, value: "0", mode: "fn", sig: "getPricesInWei() view returns (uint256,uint256,uint256,uint256,uint256,uint256)", args: [], data: "", fund: false } },
  { label: "A failing transfer", form: { from: SAMPLE_FROM, to: WHYPE, value: "0", mode: "fn", sig: "transfer(address to, uint256 amount)", args: ["0x2222222222222222222222222222222222222222", "1e18"], data: "", fund: false } },
];

function parseSig(sig: string): AbiFunction | null {
  const s = sig.trim();
  if (!s) return null;
  try {
    const item = parseAbiItem(s.startsWith("function ") ? s : `function ${s}`);
    return item.type === "function" ? item : null;
  } catch {
    return null;
  }
}

/** "1e18" and "1.5e6" are accepted for integers, so amounts need no zero counting. */
function toBigInt(raw: string): bigint {
  const v = raw.trim().replace(/_/g, "");
  const m = /^(-?\d+)(?:\.(\d+))?e(\d+)$/i.exec(v);
  if (m) {
    const frac = m[2] ?? "";
    const exp = Number(m[3]);
    if (frac.length > exp) throw new Error(`${raw} is not an integer`);
    return BigInt(m[1] + frac + "0".repeat(exp - frac.length));
  }
  return BigInt(v);
}

function parseArg(p: AbiParameter, raw: string): unknown {
  const t = p.type;
  if (t.endsWith("]")) {
    const arr = JSON.parse(raw) as unknown[];
    const inner = { ...p, type: t.slice(0, t.lastIndexOf("[")) } as AbiParameter;
    return arr.map((x) => parseArg(inner, typeof x === "string" ? x : JSON.stringify(x)));
  }
  if (t.startsWith("uint") || t.startsWith("int")) return toBigInt(raw);
  if (t === "bool") return raw.trim() === "true";
  if (t === "address" && !isAddress(raw.trim())) throw new Error(`${p.name || "address"}: not an address`);
  if (t.startsWith("tuple")) throw new Error("Tuples are not supported in this form: use raw calldata");
  return raw.trim();
}

function formFromParams(sp: URLSearchParams): Form | null {
  if (!sp.get("to")) return null;
  return {
    from: sp.get("from") ?? SAMPLE_FROM,
    to: sp.get("to") ?? "",
    value: sp.get("value") ?? "0",
    mode: sp.get("data") ? "raw" : "fn",
    sig: sp.get("sig") ?? "",
    args: sp.getAll("arg"),
    data: sp.get("data") ?? "",
    fund: sp.get("fund") === "1",
  };
}

function formToParams(f: Form): string {
  const sp = new URLSearchParams({ from: f.from, to: f.to, value: f.value });
  if (f.mode === "raw") sp.set("data", f.data);
  else {
    sp.set("sig", f.sig);
    f.args.forEach((a) => sp.append("arg", a));
  }
  if (f.fund) sp.set("fund", "1");
  return sp.toString();
}

const fmtArg = (v: unknown): string =>
  typeof v === "bigint" ? v.toString() : Array.isArray(v) ? `[${v.map(fmtArg).join(", ")}]` : typeof v === "object" && v ? JSON.stringify(v, (_, x) => (typeof x === "bigint" ? x.toString() : x)) : String(v);

interface DecodedLog { name: string; args: [string, unknown][]; log: SimLog }

function decodeLog(log: SimLog): DecodedLog {
  for (const abi of [EVENTS, NFT_TRANSFER]) {
    try {
      const d = decodeEventLog({ abi, topics: log.topics as [Hex, ...Hex[]], data: log.data });
      return { name: d.eventName, args: Object.entries((d.args ?? {}) as Record<string, unknown>), log };
    } catch {
      // Try the next ABI.
    }
  }
  return { name: log.topics[0] ? `${log.topics[0].slice(0, 10)}…` : "anonymous", args: [["data", log.data]], log };
}

function Field({ id, label, children, hint }: { id: string; label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label htmlFor={id} className="block">
      <span className="block text-[10px] uppercase tracking-[0.06em] text-text-tertiary mb-1">{label}</span>
      {children}
      {hint ? <span className="block text-[11px] text-text-tertiary mt-1">{hint}</span> : null}
    </label>
  );
}

const inputCls =
  "w-full rounded-md border border-border-default bg-surface-2 px-2.5 py-1.5 mono text-[12px] text-text-primary placeholder:text-text-tertiary focus-ring";

/**
 * Elysium · Simulator: dry-run any call against live Elysium state before
 * signing it. eth_simulateV1 gives status, execution gas, logs and native
 * transfers; eth_estimateGas prices it with the HyperEVM posting cost.
 */
export function ElysiumSimulator() {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [form, setForm] = useState<Form>(() => formFromParams(new URLSearchParams(sp.toString())) ?? PRESETS[0].form);
  const [result, setResult] = useState<SimResult | null>(null);
  const [meta, setMeta] = useState<Record<string, { symbol: string; decimals: number }>>({});
  const [ran, setRan] = useState<Form | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const fn = useMemo(() => (form.mode === "fn" ? parseSig(form.sig) : null), [form.mode, form.sig]);
  const set = (patch: Partial<Form>) => setForm((f) => ({ ...f, ...patch }));

  const run = useCallback(
    async (f: Form) => {
      setErr(null);
      setBusy(true);
      try {
        if (!isAddress(f.from)) throw new Error("From is not an address");
        if (!isAddress(f.to)) throw new Error("To is not an address");
        let data: Hex = "0x";
        if (f.mode === "raw") {
          if (f.data && !isHex(f.data)) throw new Error("Calldata must be 0x-prefixed hex");
          data = (f.data || "0x") as Hex;
        } else {
          const item = parseSig(f.sig);
          if (!item) throw new Error("Function signature not understood, e.g. transfer(address to, uint256 amount)");
          const args = item.inputs.map((p, i) => parseArg(p, f.args[i] ?? ""));
          data = encodeFunctionData({ abi: [item], functionName: item.name, args });
        }
        const r = await simulateElysiumCall({
          from: f.from as Address,
          to: f.to as Address,
          value: parseEther(f.value || "0"),
          data,
          fundWei: f.fund ? parseEther("100") : undefined,
        });
        const tokens = [...new Set(r.logs.map((l) => l.address.toLowerCase()).filter((a) => a !== NATIVE_TRANSFER_ADDRESS))] as Address[];
        setMeta(await fetchTokenMeta(tokens));
        setResult(r);
        setRan(f);
        router.replace(`${pathname}?${formToParams(f)}`, { scroll: false });
      } catch (e) {
        setResult(null);
        setErr(e instanceof Error ? e.message.split("\n")[0] : String(e));
      } finally {
        setBusy(false);
      }
    },
    [pathname, router]
  );

  // Open in a working state: run the shared link, or the first example.
  useEffect(() => {
    void run(form);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ranFn = ran && ran.mode === "fn" ? parseSig(ran.sig) : null;
  const returned = useMemo(() => {
    if (!result || result.status !== "success" || !ranFn || !ranFn.outputs.length) return null;
    try {
      const v = decodeFunctionResult({ abi: [ranFn], functionName: ranFn.name, data: result.returnData });
      return Array.isArray(v) ? v : [v];
    } catch {
      return null;
    }
  }, [result, ranFn]);

  const revert = useMemo(() => {
    if (!result?.revertData || result.revertData === "0x") return result?.revertMessage ?? null;
    try {
      const d = decodeErrorResult({ data: result.revertData });
      return `${d.errorName}(${(d.args ?? []).map(fmtArg).join(", ")})`;
    } catch {
      return result.revertMessage ?? `custom error ${result.revertData.slice(0, 10)}`;
    }
  }, [result]);

  const logs = useMemo(() => (result?.logs ?? []).map(decodeLog), [result]);
  const amount = (token: string, v: unknown) => {
    const m = token === NATIVE_TRANSFER_ADDRESS ? { symbol: "HYPE", decimals: 18 } : meta[token.toLowerCase()];
    return typeof v === "bigint" && m ? `${Number(formatUnits(v, m.decimals)).toLocaleString("en-US", { maximumFractionDigits: 6 })} ${m.symbol}` : fmtArg(v);
  };
  const fee = result?.gasEstimate != null ? result.gasEstimate * result.gasPriceWei : null;
  const shareUrl = ran && typeof window !== "undefined" ? `${window.location.origin}${pathname}?${formToParams(ran)}` : "";

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
        <Card className="overflow-hidden flex flex-col">
          <CardHeading icon={<FlaskConical size={13} className="text-brand" />} title="Call" meta="nothing is signed or sent" metaVariant="plain" />
          <form
            className="p-3.5 space-y-3"
            onSubmit={(e) => { e.preventDefault(); void run(form); }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field id="sim-from" label="From">
                <input id="sim-from" className={inputCls} value={form.from} onChange={(e) => set({ from: e.target.value })} spellCheck={false} />
              </Field>
              <Field id="sim-to" label="To (contract)">
                <input id="sim-to" className={inputCls} value={form.to} onChange={(e) => set({ to: e.target.value })} spellCheck={false} placeholder="0x…" />
              </Field>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
              <Field id="sim-value" label="Value (HYPE)">
                <input id="sim-value" className={inputCls} value={form.value} onChange={(e) => set({ value: e.target.value })} inputMode="decimal" />
              </Field>
              <label className="flex items-center gap-2 text-[12px] text-text-secondary pb-1.5">
                <Checkbox id="sim-fund" checked={form.fund} onCheckedChange={(v) => set({ fund: v === true })} />
                Give the sender 100 HYPE for this run
              </label>
            </div>
            <PillTabs
              activeTab={form.mode}
              onTabChange={(v) => set({ mode: v as Form["mode"] })}
              tabs={[{ value: "fn", label: "Function" }, { value: "raw", label: "Raw calldata" }]}
            />
            {form.mode === "fn" ? (
              <div className="space-y-3">
                <Field id="sim-sig" label="Function signature" hint="Add `returns (...)` to decode the result. Integers accept 1e18.">
                  <input id="sim-sig" className={inputCls} value={form.sig} onChange={(e) => set({ sig: e.target.value })} spellCheck={false} placeholder="transfer(address to, uint256 amount)" />
                </Field>
                {form.sig && !fn ? <p className="text-[11px] text-danger">Signature not understood yet.</p> : null}
                {fn?.inputs.map((p, i) => (
                  <Field key={`${fn.name}-${i}`} id={`sim-arg-${i}`} label={`${p.name || `arg ${i}`} · ${p.type}`}>
                    <input
                      id={`sim-arg-${i}`}
                      className={inputCls}
                      value={form.args[i] ?? ""}
                      onChange={(e) => { const args = [...form.args]; args[i] = e.target.value; set({ args }); }}
                      spellCheck={false}
                    />
                  </Field>
                ))}
              </div>
            ) : (
              <Field id="sim-data" label="Calldata">
                <textarea id="sim-data" className={`${inputCls} min-h-[96px]`} value={form.data} onChange={(e) => set({ data: e.target.value })} spellCheck={false} placeholder="0x…" />
              </Field>
            )}
            <Button type="submit" size="sm" disabled={busy}>
              <Play size={13} className="mr-1.5" />
              {busy ? "Simulating…" : "Simulate"}
            </Button>
            {err ? <p className="text-[12px] text-danger">{err}</p> : null}
          </form>
        </Card>

        {/* Right column: the result and its events stack, level with the call form. */}
        <div className="space-y-4 min-w-0">
          <Card className="overflow-hidden flex flex-col">
            <CardHeading
              icon={result?.status === "reverted" ? <XCircle size={13} className="text-danger" /> : <CheckCircle2 size={13} className="text-brand" />}
              title="Result"
              meta={result ? `block ${result.block.toLocaleString("en-US")}` : undefined}
              metaVariant="plain"
            />
            {!result ? (
              <p className="px-3.5 py-6 text-center text-[12px] text-text-tertiary">{busy ? "Simulating…" : "Run a call to see its outcome."}</p>
            ) : (
              <div className="p-3.5 space-y-3 text-[12px]">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.06em] text-text-tertiary">Status</div>
                    <div className={`mono ${result.status === "success" ? "text-success" : "text-danger"}`}>{result.status}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.06em] text-text-tertiary">Execution gas</div>
                    <div className="mono text-text-primary">{result.gasUsed.toLocaleString("en-US")}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.06em] text-text-tertiary">Gas to set</div>
                    <div className="mono text-text-primary">{result.gasEstimate != null ? result.gasEstimate.toLocaleString("en-US") : EMPTY}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.06em] text-text-tertiary">Fee</div>
                    <div className="mono text-gold">{fee != null ? `${Number(formatUnits(fee, 18)).toLocaleString("en-US", { maximumSignificantDigits: 3 })} HYPE` : EMPTY}</div>
                  </div>
                </div>
                <p className="text-[11px] text-text-tertiary">
                  Gas to set = eth_estimateGas, which adds the cost of posting the tx to HyperEVM on top of execution.
                </p>
                {revert ? (
                  <div className="rounded-md border border-danger/40 bg-danger/10 px-2.5 py-2">
                    <div className="text-[10px] uppercase tracking-[0.06em] text-danger">Revert reason</div>
                    <div className="mono text-text-primary break-all">{revert}</div>
                  </div>
                ) : null}
                {returned ? (
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.06em] text-text-tertiary mb-1">Returned</div>
                    <div className="space-y-0.5">
                      {returned.map((v, i) => (
                        <div key={i} className="mono text-text-primary break-all">
                          <span className="text-text-tertiary">{ranFn?.outputs[i]?.name || `[${i}]`} </span>
                          {fmtArg(v)}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : result.status === "success" && result.returnData !== "0x" ? (
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.06em] text-text-tertiary mb-1">Returned (raw)</div>
                    <div className="mono text-text-secondary break-all">{result.returnData}</div>
                  </div>
                ) : null}
                {shareUrl ? (
                  <div className="flex items-center gap-1.5 text-text-tertiary">
                    <Link2 size={12} /> Share this simulation <CopyButton text={shareUrl} />
                  </div>
                ) : null}
              </div>
            )}
          </Card>
          {result ? (
            <Card className="overflow-hidden flex flex-col">
              <CardHeading icon={<ListTree size={13} className="text-brand" />} title="Events and transfers" meta={`${logs.length} emitted`} metaVariant="plain" />
              {logs.length === 0 ? (
                <p className="px-3.5 py-4 text-[12px] text-text-tertiary">No event emitted.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-[12px]">
                    <thead>
                      <tr className="text-[10px] uppercase tracking-[0.06em] text-text-tertiary">
                        <th className="text-left font-semibold px-3.5 py-2">Event</th>
                        <th className="text-left font-semibold px-2 py-2 hidden sm:table-cell">Emitter</th>
                        <th className="text-left font-semibold px-3.5 py-2">Arguments</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((l, i) => {
                        const native = l.log.address.toLowerCase() === NATIVE_TRANSFER_ADDRESS;
                        return (
                          <tr key={i} className="border-t border-border-subtle align-top">
                            <td className="px-3.5 py-1.5 whitespace-nowrap text-text-primary">{native ? "HYPE transfer" : l.name}</td>
                            <td className="px-2 py-1.5 whitespace-nowrap hidden sm:table-cell">
                              {native ? <span className="text-text-tertiary">native</span> : <AddrLink address={l.log.address} className="text-text-secondary" />}
                              {!native && meta[l.log.address.toLowerCase()] ? <span className="ml-1.5 text-text-tertiary">{meta[l.log.address.toLowerCase()].symbol}</span> : null}
                            </td>
                            <td className="px-3.5 py-1.5">
                              <div className="flex flex-wrap gap-x-4 gap-y-0.5">
                                {l.args.map(([k, v]) => (
                                  <span key={k} className="mono break-all">
                                    <span className="text-text-tertiary">{k} </span>
                                    {typeof v === "string" && isAddress(v) ? (
                                      <AddrLink address={v} className="text-text-secondary" />
                                    ) : ["value", "wad", "amount"].includes(k) && (l.name === "Transfer" || l.name === "Approval" || l.name === "Deposit" || l.name === "Withdrawal") ? (
                                      <span className="text-text-primary">{amount(l.log.address, v)}</span>
                                    ) : (
                                      <span className="text-text-primary">{fmtArg(v)}</span>
                                    )}
                                  </span>
                                ))}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          ) : null}
        </div>
      </div>
      <p className="text-[11px] text-text-tertiary">
        Runs on the latest Elysium block through a public Elysium RPC (eth_simulateV1 with native transfer tracing, eth_estimateGas). The HYPE credit is a
        state override: it only exists inside this simulation. Internal call traces need debug_traceCall, which neither public RPC exposes today.
      </p>
    </div>
  );
}

import { decodeFunctionResult, encodeFunctionData, formatUnits, isAddress, isHex, parseAbi, parseEther, type Address, type Hex } from "viem";
import { TileFrame } from "@/lib/og/TileFrame";
import { tileColors } from "@/lib/og/tileTheme";
import { ElysiumBadge, RankList, StatRow, clip, elysiumTileResponse, shortAddr, untrusted, utcStamp } from "@/lib/og/elysium";
import { elysiumSimClient } from "@/lib/og/elysium-rpc";
import { NATIVE_TRANSFER_ADDRESS, simulateCall, simulateDeploy, type SimLog, type SimResult } from "@/lib/elysium/simulate";
import { decodeLog, fmtArg, parseArg, parseSig, revertText } from "@/lib/elysium/sim-abi";
import { buildDeploy, deployFormFromParams, parseCode } from "@/lib/elysium/deploy-form";
import { GREETER_BYTECODE, GREETER_CONSTRUCTOR } from "@/components/elysium/sim-samples";

/**
 * A Simulator run as a share tile: the same query string as a shared
 * simulation link (`kind=deploy` for a contract creation), re-simulated on
 * the latest Elysium block. Without a call or code, `?example=wrap|deploy`
 * picks one of the Simulator's examples.
 *
 * `GET /api/tile/elysium-simulation?...` → PNG 1200x630.
 */
export const runtime = "nodejs";
export const revalidate = 300;

const C = tileColors;
const SAMPLE_FROM = "0x1111111111111111111111111111111111111111";
const WHYPE = "0xcd57f65c2b0e5881cfc2e609f7cd53b746e1f234";
const EXAMPLES: Record<string, string> = {
  wrap: new URLSearchParams({ from: SAMPLE_FROM, to: WHYPE, value: "1", sig: "deposit()", fund: "1" }).toString(),
  deploy: (() => {
    const sp = new URLSearchParams({ kind: "deploy", from: SAMPLE_FROM, value: "0", code: GREETER_BYTECODE, ctor: GREETER_CONSTRUCTOR, then: "greeting() view returns (string)", fund: "1" });
    sp.append("arg", "gm Elysium");
    return sp.toString();
  })(),
};

const MAX_CODE_CHARS = 16_000;
const MAX_ARGS = 16;

const ERC20 = parseAbi(["function symbol() view returns (string)", "function decimals() view returns (uint8)"]);

async function tokenMeta(addresses: string[]): Promise<Record<string, { symbol: string; decimals: number }>> {
  const out: Record<string, { symbol: string; decimals: number }> = {};
  await Promise.all(
    addresses.map(async (a) => {
      try {
        const [symbol, decimals] = await Promise.all([
          elysiumSimClient.readContract({ address: a as Address, abi: ERC20, functionName: "symbol" }),
          elysiumSimClient.readContract({ address: a as Address, abi: ERC20, functionName: "decimals" }),
        ]);
        out[a] = { symbol: untrusted(symbol, 12) || "token", decimals: Number(decimals) };
      } catch {
        // Not an ERC-20: amounts stay raw.
      }
    })
  );
  return out;
}

const hype = (wei: bigint) => `${Number(formatUnits(wei, 18)).toLocaleString("en-US", { maximumSignificantDigits: 3 })} HYPE`;

/** Event rows: name, emitter, arguments with token amounts in units. */
async function eventRows(logs: SimLog[], labels: Record<string, string>) {
  const tokens = [...new Set(logs.map((l) => l.address.toLowerCase()).filter((a) => a !== NATIVE_TRANSFER_ADDRESS && !labels[a]))];
  const meta = await tokenMeta(tokens);
  return logs.slice(0, 4).map((l, i) => {
    const d = decodeLog(l);
    const emitter = l.address.toLowerCase();
    const native = emitter === NATIVE_TRANSFER_ADDRESS;
    const m = native ? { symbol: "HYPE", decimals: 18 } : meta[emitter];
    const args = d.args
      .map(([k, v]) => {
        if (typeof v === "string" && isAddress(v)) return `${k} ${shortAddr(v.toLowerCase())}`;
        if (typeof v === "bigint" && m && ["value", "wad", "amount"].includes(k)) {
          return `${Number(formatUnits(v, m.decimals)).toLocaleString("en-US", { maximumFractionDigits: 4 })} ${m.symbol}`;
        }
        return `${k} ${untrusted(fmtArg(v), 40)}`;
      })
      .join(" · ");
    return {
      key: `${i}`,
      cells: [
        { text: clip(native ? "HYPE transfer" : untrusted(d.name, 22), 22) },
        { text: native ? "native" : labels[emitter] ?? (meta[emitter] ? `${meta[emitter].symbol} ${shortAddr(emitter)}` : shortAddr(emitter)), color: C.textSecondary },
        { text: clip(args, 48), color: C.textSecondary },
      ],
    };
  });
}

/** Fee in HYPE without the unit (the label carries it), so it fits one line. */
function fee(r: SimResult): string {
  return r.gasEstimate != null ? Number(formatUnits(r.gasEstimate * r.gasPriceWei, 18)).toLocaleString("en-US", { maximumSignificantDigits: 3, maximumFractionDigits: 12 }) : "-";
}

/** Decoded revert reason, in its own block so the hero line stays short. */
function RevertBox({ text }: { text: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", marginTop: 28, border: `1px solid ${C.danger}`, borderRadius: 10, padding: "14px 18px" }}>
      <div style={{ display: "flex", fontSize: 13, letterSpacing: 1, color: C.danger }}>REVERT REASON</div>
      <div style={{ display: "flex", marginTop: 8, fontFamily: "JetBrains Mono", fontSize: 22, color: C.textPrimary }}>{untrusted(text, 70)}</div>
    </div>
  );
}

const FOOT = () => `Source: Elysium testnet RPC, ${utcStamp()} UTC`;

export async function GET(req: Request) {
  const url = new URL(req.url);
  let sp = url.searchParams;
  if (!sp.get("to") && !sp.get("code")) {
    const ex = sp.get("example") ?? "wrap";
    sp = new URLSearchParams(Object.hasOwn(EXAMPLES, ex) ? EXAMPLES[ex] : EXAMPLES.wrap);
  }
  // Public route: bound the work one request can ask for (the share link
  // itself is capped at 7.5K characters by the Simulator).
  if ((sp.get("code")?.length ?? 0) > MAX_CODE_CHARS || (sp.get("data")?.length ?? 0) > MAX_CODE_CHARS) return new Response("code too long", { status: 414 });
  if (sp.getAll("arg").length + sp.getAll("targ").length > MAX_ARGS) return new Response("too many arguments", { status: 400 });
  const from = sp.get("from") ?? SAMPLE_FROM;
  if (!isAddress(from)) return new Response("from is not an address", { status: 400 });
  const fundWei = sp.get("fund") === "1" ? parseEther("100") : undefined;

  try {
    if (sp.get("kind") === "deploy") {
      const form = deployFormFromParams(sp);
      if (!form || !parseCode(form.code)) return new Response("no creation code", { status: 400 });
      const b = buildDeploy(form);
      const r = await simulateDeploy(elysiumSimClient, { from, value: b.value, data: b.data, fundWei, followUpData: b.followUp });
      const ok = r.status === "success";
      let then: string | null = null;
      if (r.followUp && b.thenFn) {
        if (r.followUp.status === "reverted") then = `${b.thenFn.name}() reverted`;
        else {
          try {
            const v = decodeFunctionResult({ abi: [b.thenFn], functionName: b.thenFn.name, data: r.followUp.returnData });
            then = `${b.thenFn.name}() → ${untrusted((Array.isArray(v) ? v : [v]).map(fmtArg).join(", "), 40)}`;
          } catch {
            then = `${b.thenFn.name}() ok`;
          }
        }
      }
      const rows = await eventRows(r.logs, { [r.address.toLowerCase()]: "new contract" });
      return elysiumTileResponse(
        <TileFrame
          title="Contract deployment"
          pill="simulated"
          badge={<ElysiumBadge />}
          eyebrow={`Elysium testnet · dry run on block ${r.block.toLocaleString("en-US")}, nothing sent`}
          hero={ok ? "Deploys" : "Reverts"}
          heroColor={ok ? C.success : C.danger}
          heroSub={ok ? `at ${shortAddr(r.address.toLowerCase())} · ${r.runtimeSize.toLocaleString("en-US")} B of runtime code${then ? ` · ${then}` : ""}` : "reverted while deploying"}
          footLeft="eth_simulateV1 on live state, fee from eth_estimateGas (posting cost included)"
          footNote={FOOT()}
        >
          <StatRow
            marginTop={20}
            cells={[
              { label: "Execution gas", value: r.gasUsed.toLocaleString("en-US") },
              { label: "Fee (HYPE)", value: fee(r), color: C.warn },
              { label: "Creation code", value: `${r.initcodeSize.toLocaleString("en-US")} B` },
              { label: "Events", value: String(r.logs.length) },
            ]}
          />
          {!ok ? <RevertBox text={revertText(r.revertData, r.revertMessage) ?? "reverted"} /> : null}
          {rows.length ? (
            <RankList
              marginTop={24}
              columns={[
                { label: "Event", width: 1.3 },
                { label: "Emitter", width: 1.5, mono: true },
                { label: "Arguments", width: 3, mono: true },
              ]}
              rows={rows}
            />
          ) : null}
        </TileFrame>,
        revalidate
      );
    }

    const to = sp.get("to") ?? "";
    if (!isAddress(to)) return new Response("to is not an address", { status: 400 });
    let data: Hex = "0x";
    const fn = sp.get("data") ? null : parseSig(sp.get("sig") ?? "");
    if (sp.get("data")) {
      const raw = sp.get("data") ?? "";
      if (!isHex(raw)) return new Response("calldata must be hex", { status: 400 });
      data = raw;
    } else if (fn) {
      const args = sp.getAll("arg");
      data = encodeFunctionData({ abi: [fn], functionName: fn.name, args: fn.inputs.map((p, i) => parseArg(p, args[i] ?? "")) });
    }
    const value = parseEther(sp.get("value") || "0");
    const r = await simulateCall(elysiumSimClient, { from, to, value, data, fundWei });
    const ok = r.status === "success";
    const [toMeta] = Object.values(await tokenMeta([to.toLowerCase()]));
    const target = toMeta ? `${toMeta.symbol} ${shortAddr(to)}` : shortAddr(to);
    const callText = fn ? `${fn.name}(${sp.getAll("arg").map((a) => (isAddress(a) ? shortAddr(a.toLowerCase()) : untrusted(a, 14))).join(", ")})` : data === "0x" ? "plain transfer" : `${data.slice(0, 10)}…`;
    const rows = await eventRows(r.logs, {});
    return elysiumTileResponse(
      <TileFrame
        title="Call simulation"
        pill="simulated"
        badge={<ElysiumBadge />}
        eyebrow={`Elysium testnet · dry run on block ${r.block.toLocaleString("en-US")}, nothing sent`}
        hero={ok ? "Succeeds" : "Reverts"}
        heroColor={ok ? C.success : C.danger}
        heroSub={`${clip(callText, 44)} on ${target}${value > 0n ? ` with ${hype(value)}` : ""}`}
        footLeft="eth_simulateV1 on live state, fee from eth_estimateGas (posting cost included)"
        footNote={FOOT()}
      >
        <StatRow
          marginTop={20}
          cells={[
            { label: "Execution gas", value: r.gasUsed.toLocaleString("en-US") },
            { label: "Gas to set", value: r.gasEstimate != null ? r.gasEstimate.toLocaleString("en-US") : "-" },
            { label: "Fee (HYPE)", value: fee(r), color: C.warn },
            { label: "Events", value: String(r.logs.length) },
          ]}
        />
        {!ok ? <RevertBox text={revertText(r.revertData, r.revertMessage) ?? "reverted"} /> : null}
        {rows.length ? (
          <RankList
            marginTop={24}
            columns={[
              { label: "Event", width: 1.3 },
              { label: "Emitter", width: 1.5, mono: true },
              { label: "Arguments", width: 3, mono: true },
            ]}
            rows={rows}
          />
        ) : null}
      </TileFrame>,
      revalidate
    );
  } catch (e) {
    // Input errors (bad signature, out-of-range integer) are the caller's to fix;
    // anything else stays generic so RPC details are not echoed.
    const msg = e instanceof Error ? e.message.split("\n")[0] : "";
    const input = /not an address|not an integer|too long|too large|not understood|range|invalid|Tuples/i.test(msg) && !/RPC|URL|fetch/i.test(msg);
    return new Response(input ? `bad input: ${untrusted(msg, 120)}` : "simulation failed", { status: input ? 400 : 502 });
  }
}

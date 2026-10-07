import { encodeDeployData, encodeFunctionData, isHex, parseAbiItem, parseEther, type Abi, type AbiFunction, type AbiParameter, type Hex } from "viem";
import { parseArg, parseSig } from "./sim-abi";

/**
 * The Simulator's deploy form: parsing the pasted code (raw bytecode or a
 * build artifact), the constructor, and the URL form shared links and the
 * simulation tile use. No React.
 */

type AbiConstructor = { type: "constructor"; inputs: readonly AbiParameter[]; stateMutability: string };

export const DEPLOY_SAMPLE_FROM = "0x1111111111111111111111111111111111111111";

export interface DeployForm {
  from: string;
  value: string;
  /** Creation bytecode, or a Foundry / Hardhat / solc build artifact (JSON). */
  code: string;
  ctor: string;
  args: string[];
  /** Function called on the new contract right after deployment. */
  then: string;
  thenArgs: string[];
  fund: boolean;
}

export interface ParsedCode {
  bytecode: Hex;
  abi: Abi | null;
  name: string | null;
}

/** Reads raw bytecode, or pulls bytecode + ABI out of a build artifact. */
export function parseCode(raw: string): ParsedCode | null {
  const s = raw.trim();
  if (!s) return null;
  if (s.startsWith("{")) {
    try {
      const j = JSON.parse(s) as {
        bytecode?: string | { object?: string };
        evm?: { bytecode?: { object?: string } };
        abi?: Abi;
        contractName?: string;
      };
      const bc = typeof j.bytecode === "string" ? j.bytecode : j.bytecode?.object ?? j.evm?.bytecode?.object;
      if (!bc) return null;
      const bytecode = (bc.startsWith("0x") ? bc : `0x${bc}`) as Hex;
      return isHex(bytecode) && bytecode.length > 2 ? { bytecode, abi: Array.isArray(j.abi) ? j.abi : null, name: j.contractName ?? null } : null;
    } catch {
      return null;
    }
  }
  const bytecode = (s.startsWith("0x") ? s : `0x${s}`).replace(/\s+/g, "") as Hex;
  return isHex(bytecode) && bytecode.length > 2 && bytecode.length % 2 === 0 ? { bytecode, abi: null, name: null } : null;
}

export function ctorSignature(abi: Abi | null): string {
  const c = abi?.find((x) => x.type === "constructor") as AbiConstructor | undefined;
  if (!c) return "";
  return `constructor(${c.inputs.map((i) => `${i.type}${i.name ? ` ${i.name}` : ""}`).join(", ")})${c.stateMutability === "payable" ? " payable" : ""}`;
}

export function parseCtor(sig: string): AbiConstructor | null {
  const s = sig.trim();
  if (!s) return null;
  try {
    const item = parseAbiItem(s.startsWith("constructor") ? s : `constructor(${s})`);
    return item.type === "constructor" ? item : null;
  } catch {
    return null;
  }
}

/** Everything that goes into the transaction: creation code + args, value. */
export function buildDeploy(f: DeployForm): { data: Hex; value: bigint; parsed: ParsedCode; followUp: Hex | undefined; thenFn: AbiFunction | null } {
  const parsed = parseCode(f.code);
  if (!parsed) throw new Error("Paste creation bytecode (0x…) or a build artifact JSON with a bytecode field");
  const ctor = parseCtor(f.ctor);
  if (f.ctor.trim() && !ctor) throw new Error("Constructor not understood, e.g. constructor(string name, uint256 supply)");
  const args = ctor ? ctor.inputs.map((p, i) => parseArg(p, f.args[i] ?? "")) : [];
  const data = ctor && ctor.inputs.length ? encodeDeployData({ abi: [ctor], bytecode: parsed.bytecode, args }) : parsed.bytecode;
  const thenFn = f.then.trim() ? parseSig(f.then) : null;
  if (f.then.trim() && !thenFn) throw new Error("Follow-up function not understood, e.g. name() view returns (string)");
  const followUp = thenFn
    ? encodeFunctionData({ abi: [thenFn], functionName: thenFn.name, args: thenFn.inputs.map((p, i) => parseArg(p, f.thenArgs[i] ?? "")) })
    : undefined;
  return { data, value: parseEther(f.value || "0"), parsed, followUp, thenFn };
}

export function deployFormFromParams(sp: URLSearchParams): DeployForm | null {
  if (sp.get("kind") !== "deploy" || !sp.get("code")) return null;
  return {
    from: sp.get("from") ?? DEPLOY_SAMPLE_FROM,
    value: sp.get("value") ?? "0",
    code: sp.get("code") ?? "",
    ctor: sp.get("ctor") ?? "",
    args: sp.getAll("arg"),
    then: sp.get("then") ?? "",
    thenArgs: sp.getAll("targ"),
    fund: sp.get("fund") === "1",
  };
}

/** Shareable form: an artifact is reduced to its bytecode and constructor signature. */
export function deployFormToParams(f: DeployForm): string {
  const parsed = parseCode(f.code);
  const sp = new URLSearchParams({ kind: "deploy", from: f.from, value: f.value || "0", code: parsed?.bytecode ?? f.code.trim() });
  const ctor = f.ctor.trim() || ctorSignature(parsed?.abi ?? null);
  if (ctor) {
    sp.set("ctor", ctor);
    f.args.forEach((a) => sp.append("arg", a));
  }
  if (f.then.trim()) {
    sp.set("then", f.then.trim());
    f.thenArgs.forEach((a) => sp.append("targ", a));
  }
  if (f.fund) sp.set("fund", "1");
  return sp.toString();
}


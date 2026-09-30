"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { isAddress } from "viem";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useElysiumContracts } from "@/services/elysium";
import { ElysiumContractDecoder } from "./ElysiumContractDecoder";
import { short } from "./shared";

/**
 * Elysium · Decoder: paste any contract address to see what it is and who is
 * behind it. The address lives in the URL so a decode can be shared.
 */
export function ElysiumDecode() {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const current = sp.get("address");
  const [input, setInput] = useState(current ?? "");
  const [err, setErr] = useState<string | null>(null);
  const { data: top } = useElysiumContracts("24h");
  const picks = (top ?? []).filter((r) => r.kind !== "precompile").slice(0, 6);

  const go = (a: string) => {
    const v = a.trim();
    if (!isAddress(v)) return setErr("Not an address: expected 0x followed by 40 hex characters.");
    setErr(null);
    setInput(v);
    router.replace(`${pathname}?address=${v.toLowerCase()}`, { scroll: false });
  };

  return (
    <div className="space-y-4">
      <Card className="p-3.5 space-y-2.5">
        <form className="flex flex-col sm:flex-row gap-2" onSubmit={(e) => { e.preventDefault(); go(input); }}>
          <label htmlFor="decode-address" className="sr-only">Contract address</label>
          <input
            id="decode-address"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Contract address, 0x…"
            spellCheck={false}
            className="flex-1 rounded-md border border-border-default bg-surface-2 px-2.5 py-1.5 mono text-[12px] text-text-primary placeholder:text-text-tertiary focus-ring"
          />
          <Button type="submit" size="sm"><Search size={13} className="mr-1.5" />Decode</Button>
        </form>
        {err ? <p className="text-[12px] text-danger">{err}</p> : null}
        {picks.length ? (
          <div className="flex flex-wrap items-center gap-1.5 text-[12px]">
            <span className="text-text-tertiary">Most called, 24h</span>
            {picks.map((p) => (
              <button key={p.address} type="button" onClick={() => go(p.address)} className="rounded bg-surface-2 px-2 py-0.5 hover:text-brand focus-ring">
                {p.label ?? p.symbol ?? <span className="mono">{short(p.address)}</span>}
              </button>
            ))}
          </div>
        ) : null}
      </Card>
      {current && isAddress(current) ? <ElysiumContractDecoder key={current} address={current} /> : null}
    </div>
  );
}

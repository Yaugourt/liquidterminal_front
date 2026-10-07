"use client";

import { usePathname, useRouter } from "next/navigation";
import { Check, ChevronDown } from "lucide-react";
import { ElysiumMark, HypeMark } from "@/components/common";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NETWORKS, networkFromPath, type NetworkId } from "@/lib/networks";
import { cn } from "@/lib/utils";

function Mark({ id, size = 14 }: { id: NetworkId; size?: number }) {
  return id === "elysium" ? (
    <ElysiumMark size={size} className="text-text-primary" />
  ) : (
    // HypeMark bottoms out at 16px; scale its box so both marks match.
    <span
      className="inline-flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
    >
      <span style={{ transform: `scale(${size / 16})` }} className="inline-flex">
        <HypeMark logoOnly size="xs" />
      </span>
    </span>
  );
}

function useNetwork() {
  const pathname = usePathname();
  const router = useRouter();
  const active = networkFromPath(pathname);
  const go = (id: NetworkId) => {
    if (id !== active) router.push(NETWORKS[id].home);
  };
  return { active, go };
}

/** Menu listing the networks; shared by the dropdown triggers below. */
function NetworkMenu({ active, go }: { active: NetworkId; go: (id: NetworkId) => void }) {
  return (
    <DropdownMenuContent align="start" className="w-[200px] bg-surface border-border-default p-1">
      {(Object.keys(NETWORKS) as NetworkId[]).map((id) => (
        <DropdownMenuItem key={id} onSelect={() => go(id)} className="flex items-center gap-2 cursor-pointer text-[12.5px]">
          <Mark id={id} />
          <span className="text-text-primary">{NETWORKS[id].label}</span>
          <span className="text-[10px] text-text-tertiary">{NETWORKS[id].status}</span>
          {id === active && <Check className="ml-auto h-3.5 w-3.5 text-brand" />}
        </DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  );
}

/** Sidebar: the lockup subtitle is the network selector (no extra height). */
export function NetworkSubtitle() {
  const { active, go } = useNetwork();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="mt-[3px] inline-flex items-center gap-1 rounded text-[9.5px] uppercase tracking-[0.1em] text-text-secondary hover:text-brand focus-ring"
        aria-label="Switch network"
      >
        <Mark id={active} size={11} />
        {/* No "Data" suffix: with the mark and chevron it overflowed the 208px mobile drawer. */}
        {NETWORKS[active].label}
        <ChevronDown className="h-2.5 w-2.5" />
      </DropdownMenuTrigger>
      <NetworkMenu active={active} go={go} />
    </DropdownMenu>
  );
}

/** Header: compact network pill, left of the search bar (also the mobile entry point). */
export function NetworkPill({ className }: { className?: string }) {
  const { active, go } = useNetwork();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "inline-flex h-9 items-center gap-2 rounded-lg border border-border-subtle bg-surface-2 px-3 text-[12.5px] text-text-primary hover:border-border-default focus-ring",
          className
        )}
        aria-label={`Switch network (${NETWORKS[active].label})`}
        title={NETWORKS[active].label}
      >
        <Mark id={active} />
        {/* Mark only on phones: with the donate and account buttons the
            header row ran 13px past a 375px screen on every page. */}
        <span className="hidden sm:inline font-medium">{NETWORKS[active].label}</span>
        <ChevronDown className="h-3.5 w-3.5 text-text-tertiary" />
      </DropdownMenuTrigger>
      <NetworkMenu active={active} go={go} />
    </DropdownMenu>
  );
}

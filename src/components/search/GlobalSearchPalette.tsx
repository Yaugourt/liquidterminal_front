"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { Command } from "cmdk";
import {
  ArrowUpRight,
  Blocks,
  BookOpen,
  Boxes,
  CandlestickChart,
  Clock,
  FileText,
  Landmark,
  Layers,
  Search,
  Shield,
  Vault,
  Wallet,
} from "lucide-react";
import {
  loadSearchIndex,
  detectPattern,
  searchIndex,
  PAGE_RESULTS,
  type SearchGroup,
  type SearchResult,
  type SearchResultKind,
} from "@/services/search";
import { useGlobalSearch } from "@/store/use-global-search";
import { trackSearch } from "@/lib/analytics";
import { Hypurr } from "@/components/hypurr/Hypurr";

const RECENTS_KEY = "lt.search.recents";
const MAX_RECENTS = 6;

const KIND_ICONS: Record<SearchResultKind, typeof Search> = {
  address: Wallet,
  transaction: FileText,
  block: Blocks,
  "spot-token": CandlestickChart,
  "perp-market": Layers,
  validator: Shield,
  vault: Vault,
  project: Boxes,
  wiki: BookOpen,
  page: Landmark,
};

function readRecents(): SearchResult[] {
  try {
    const raw = localStorage.getItem(RECENTS_KEY);
    return raw ? (JSON.parse(raw) as SearchResult[]) : [];
  } catch {
    return [];
  }
}

function saveRecent(result: SearchResult): void {
  try {
    const next = [result, ...readRecents().filter((r) => r.id !== result.id)].slice(0, MAX_RECENTS);
    localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
  } catch {
    // Private mode: recents just don't persist.
  }
}

function ResultRow({ result, onSelect }: { result: SearchResult; onSelect: (r: SearchResult) => void }) {
  const Icon = KIND_ICONS[result.kind] ?? Search;
  return (
    <Command.Item
      value={result.id}
      onSelect={() => onSelect(result)}
      className="flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer text-[13px] text-text-secondary data-[selected=true]:bg-surface-2 data-[selected=true]:text-text-primary"
    >
      <Icon className="h-4 w-4 shrink-0 text-text-tertiary" />
      <span className="truncate text-text-primary">{result.label}</span>
      {result.sublabel && (
        <span className="mono truncate text-[11px] text-text-tertiary">{result.sublabel}</span>
      )}
      {result.external && <ArrowUpRight className="ml-auto h-3.5 w-3.5 shrink-0 text-text-tertiary" />}
    </Command.Item>
  );
}

/**
 * Global search palette (Cmd+K / "/"): one box for every entity on the
 * site. Exact on-chain identifiers (address, tx, block) resolve first,
 * then scored matches over tokens, markets, validators, vaults, projects,
 * wiki resources, named addresses and pages.
 */
export function GlobalSearchPalette() {
  const { open, setOpen, toggle } = useGlobalSearch();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState<SearchResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [recents, setRecents] = useState<SearchResult[]>([]);

  // Hotkeys: Cmd/Ctrl+K everywhere, "/" outside editable fields.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggle();
        return;
      }
      if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const target = e.target as HTMLElement | null;
        const editable =
          target &&
          (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
        if (!editable) {
          e.preventDefault();
          setOpen(true);
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggle, setOpen]);

  // Lazy-load the index on first open; refresh recents each open.
  useEffect(() => {
    if (!open) return;
    setRecents(readRecents());
    if (!index) {
      setLoading(true);
      loadSearchIndex()
        .then(setIndex)
        .finally(() => setLoading(false));
    }
  }, [open, index]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const pattern = useMemo(() => detectPattern(query), [query]);
  const groups: SearchGroup[] = useMemo(
    () => (index ? searchIndex(index, query) : []),
    [index, query]
  );
  const hasQuery = query.trim().length > 0;
  const isEmpty = hasQuery && !pattern && groups.length === 0;

  const handleSelect = useCallback(
    (result: SearchResult) => {
      trackSearch(result.kind);
      saveRecent(result);
      setOpen(false);
      if (result.external) {
        window.open(result.href, "_blank", "noopener,noreferrer");
      } else {
        router.push(result.href);
      }
    },
    [router, setOpen]
  );

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[99] bg-base/70 backdrop-blur-sm" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed left-1/2 top-[12vh] z-[100] w-[min(640px,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-lg border border-border-default bg-surface shadow-2xl shadow-black/60"
        >
          <Dialog.Title className="sr-only">Search Hyperliquid</Dialog.Title>
          <Command shouldFilter={false} label="Search Hyperliquid">
      <div className="flex items-center gap-3 border-b border-border-subtle px-4">
        <Search className="h-4 w-4 shrink-0 text-text-tertiary" />
        <Command.Input
          value={query}
          onValueChange={setQuery}
          placeholder="Search tokens, wallets, validators, vaults, projects, wiki…"
          className="h-12 w-full bg-transparent text-[13.5px] text-text-primary placeholder:text-text-tertiary focus:outline-none"
        />
        <kbd className="mono shrink-0 rounded-md border border-border-subtle bg-surface-2 px-1.5 py-0.5 text-[10.5px] text-text-tertiary">
          esc
        </kbd>
      </div>

      <Command.List className="max-h-[min(420px,60vh)] overflow-y-auto p-2">
        {loading && (
          <div className="px-3 py-6 text-center text-[12.5px] text-text-tertiary">Loading index…</div>
        )}

        {pattern && (
          <Command.Group
            heading="On-chain"
            className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10.5px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.08em] [&_[cmdk-group-heading]]:text-text-tertiary"
          >
            <ResultRow result={pattern} onSelect={handleSelect} />
          </Command.Group>
        )}

        {!hasQuery && recents.length > 0 && (
          <Command.Group
            heading="Recent"
            className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10.5px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.08em] [&_[cmdk-group-heading]]:text-text-tertiary"
          >
            {recents.map((r) => (
              <ResultRow key={`recent-${r.id}`} result={r} onSelect={handleSelect} />
            ))}
            <Command.Item
              value="clear-recents"
              onSelect={() => {
                localStorage.removeItem(RECENTS_KEY);
                setRecents([]);
              }}
              className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer text-[11.5px] text-text-tertiary data-[selected=true]:bg-surface-2 data-[selected=true]:text-text-secondary"
            >
              <Clock className="h-3.5 w-3.5 shrink-0" />
              Clear recent searches
            </Command.Item>
          </Command.Group>
        )}

        {!hasQuery && (
          <Command.Group
            heading="Go to"
            className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10.5px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.08em] [&_[cmdk-group-heading]]:text-text-tertiary"
          >
            {PAGE_RESULTS.slice(0, 8).map((r) => (
              <ResultRow key={r.id} result={r} onSelect={handleSelect} />
            ))}
          </Command.Group>
        )}

        {groups.map((group) => (
          <Command.Group
            key={group.kind}
            heading={group.label}
            className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10.5px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.08em] [&_[cmdk-group-heading]]:text-text-tertiary"
          >
            {group.results.map((r) => (
              <ResultRow key={r.id} result={r} onSelect={handleSelect} />
            ))}
          </Command.Group>
        ))}

        {isEmpty && !loading && (
          <div className="flex flex-col items-center gap-3 px-3 py-8 text-center text-[12.5px] text-text-tertiary">
            <Hypurr mood="shrug" height={72} />
            No match. Paste an address, a tx hash or a block number to jump straight to it.
          </div>
        )}
      </Command.List>

      <div className="flex items-center gap-4 border-t border-border-subtle px-4 py-2 text-[10.5px] text-text-tertiary">
        <span className="flex items-center gap-1.5">
          <kbd className="mono rounded border border-border-subtle bg-surface-2 px-1 py-px">↑↓</kbd> navigate
        </span>
        <span className="flex items-center gap-1.5">
          <kbd className="mono rounded border border-border-subtle bg-surface-2 px-1 py-px">↵</kbd> open
        </span>
        <span className="ml-auto mono">tokens · wallets · validators · vaults · wiki</span>
      </div>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

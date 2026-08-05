"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { SearchBar } from "@/components/common";
import { builderBrand } from "@/lib/builderBrands";
import { BuilderAvatar, resolveBuilderLabel } from "./BuilderIdentity";
import type { BuilderListRow } from "@/services/indexer/builders/types";

interface BuilderSelectorProps {
  builders: BuilderListRow[];
  selectedAddress: string;
  onSelect: (address: string) => void;
}

export function BuilderSelector({ builders, selectedAddress, onSelect }: BuilderSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selected = builders.find((b) => b.address === selectedAddress);
  const displayName = selected ? resolveBuilderLabel(selected.address, selected.name).label : "—";

  const filtered = builders.filter((b) => {
    if (!search) return true;
    const s = search.toLowerCase();
    const name = (b.name ?? "").toLowerCase();
    const addr = (b.address ?? "").toLowerCase();
    const brand = builderBrand(b.address)?.name.toLowerCase() ?? "";
    return name.includes(s) || addr.includes(s) || brand.includes(s);
  });

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="bg-surface border border-border-subtle rounded-lg px-4 py-3 flex items-center gap-3 min-w-64 hover:border-border-default transition-all text-left"
      >
        {selectedAddress ? (
          <BuilderAvatar
            address={selectedAddress}
            label={displayName}
            size={32}
            className="rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand/20 to-gold/20 flex items-center justify-center text-xs font-bold text-brand shrink-0">
            ?
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-text-primary font-medium text-sm truncate">{displayName}</p>
          <p className="text-text-tertiary text-xs font-mono truncate">
            {selectedAddress ? `${selectedAddress.slice(0, 10)}…` : "—"}
          </p>
        </div>
        <ChevronDown className={`w-4 h-4 text-text-tertiary transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-80 bg-surface border border-border-default rounded-lg z-50 shadow-2xl">
          <div className="p-2 border-b border-border-subtle">
            <SearchBar
              onSearch={setSearch}
              placeholder="Search builder…"
              debounceMs={150}
            />
          </div>
          <div className="max-h-64 overflow-y-auto">
            {filtered.slice(0, 50).map((b) => {
              const { label: name } = resolveBuilderLabel(b.address, b.name);
              return (
                <button
                  key={b.address}
                  className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-surface-2 transition-colors text-left ${
                    b.address === selectedAddress ? "bg-brand/10" : ""
                  }`}
                  onClick={() => {
                    onSelect(b.address);
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  <BuilderAvatar
                    address={b.address}
                    label={name}
                    size={24}
                    className="rounded-full"
                  />
                  <div className="min-w-0">
                    <p className="text-text-primary text-sm truncate">{name}</p>
                    <p className="text-text-tertiary text-xs font-mono">{b.address.slice(0, 12)}…</p>
                  </div>
                </button>
              );
            })}
            {filtered.length === 0 && (
              <p className="text-text-tertiary text-sm text-center py-4">No results</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

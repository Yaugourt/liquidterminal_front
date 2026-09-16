"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination, Skeleton } from "@/components/common";
import { useNumberFormat } from "@/store/number-format.store";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { useWalletNfts, type WalletNft } from "@/services/market/tracker/hyperfolio";
import { HyperfolioNotice } from "./HyperfolioNotice";

interface NftsTabProps {
  address: string;
}

const PAGE_SIZE = 24;

function NftCard({ nft }: { nft: WalletNft }) {
  const [errored, setErrored] = useState(false);
  const { format } = useNumberFormat();
  const hype = (v: number | null) => (v === null ? "—" : `${formatNumber(v, format, { maximumFractionDigits: 2 })} HYPE`);
  return (
    <div className="rounded-lg border border-border-subtle bg-surface/60 overflow-hidden hover:border-border-default transition-colors">
      <div className="relative aspect-square bg-surface-2">
        {nft.image && !errored ? (
          <Image
            src={nft.image}
            alt={nft.name}
            fill
            sizes="(max-width: 640px) 50vw, 160px"
            className="object-cover"
            onError={() => setErrored(true)}
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-text-tertiary">
            <ImageOff size={18} />
          </div>
        )}
      </div>
      <div className="p-2.5 space-y-0.5">
        <p className="text-xs font-semibold text-text-primary truncate" title={nft.name}>
          {nft.name}
        </p>
        <p className="text-[11px] text-text-tertiary truncate">{nft.collectionName}</p>
        <div className="flex items-center justify-between pt-1 text-[11px]">
          <span className="text-text-secondary">Price</span>
          <span className="mono text-text-primary">{hype(nft.price)}</span>
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-text-secondary">Floor</span>
          <span className="mono text-text-tertiary">{hype(nft.floorPrice)}</span>
        </div>
      </div>
    </div>
  );
}

/** Wallet NFTs on HyperEVM (Hyperfolio `/nfts`, DripTrade-sourced), paginated grid. */
export function NftsTab({ address }: NftsTabProps) {
  const { nfts, page, totalItems, goToPage, isLoading, error, refetch } = useWalletNfts(address, PAGE_SIZE);

  if (error && nfts.length === 0) {
    return (
      <div className="p-3.5">
        <HyperfolioNotice error={error} onRetry={refetch} />
      </div>
    );
  }

  if (isLoading && nfts.length === 0) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 p-3.5">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[3/4] w-full" />
        ))}
      </div>
    );
  }

  if (nfts.length === 0) {
    return (
      <EmptyState
        withCard={false}
        title="No NFTs"
        description="This wallet holds no NFTs on HyperEVM."
        minHeight="min-h-[160px]"
      />
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 p-3.5">
        {nfts.map((nft) => (
          <NftCard key={nft.id} nft={nft} />
        ))}
      </div>
      {totalItems > PAGE_SIZE && (
        <Pagination
          total={totalItems}
          page={page - 1}
          rowsPerPage={PAGE_SIZE}
          rowsPerPageOptions={[PAGE_SIZE]}
          onPageChange={(next) => goToPage(next + 1)}
          onRowsPerPageChange={() => undefined}
          disabled={isLoading}
        />
      )}
    </div>
  );
}

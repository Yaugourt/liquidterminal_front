"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/common";
import { SectionHead } from "@/components/dashboard/SectionHead";
import { PublicWalletLists } from "@/components/market/tracker/walletlists/PublicWalletLists";

/**
 * /market/tracker/public-lists — V4 page-type: PageHeader (back link in the
 * actions slot) → SectionHead'd directory with its search toolbar.
 */
export default function PublicListsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-8">
      <PageHeader
        title="Public lists"
        titleQualifier="wallet tracker"
        description="Curated wallet lists shared by the community — preview any list and copy it into your own tracker."
        actions={
          <Button asChild variant="outline" size="sm" className="h-8 text-xs">
            <Link href="/market/tracker">
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Back to Tracker
            </Link>
          </Button>
        }
      />

      <section className="space-y-2.5">
        <SectionHead title="Directory" subtitle="Search by name or description" />
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-tertiary" />
          <Input
            type="text"
            placeholder="Search public lists…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-8 text-sm bg-transparent border-border-subtle text-text-primary placeholder:text-text-tertiary focus:border-brand/50"
          />
        </div>
        <PublicWalletLists searchQuery={searchQuery} />
      </section>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search } from "lucide-react";
import { PublicWalletLists } from "@/components/market/tracker/walletlists/PublicWalletLists";
import { useRouter } from "next/navigation";

export default function PublicListsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  return (
    <>
      {/* Back button */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/market/tracker')}
          className="border-[#83E9FF4D] text-white hover:bg-[#83E9FF20]"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Tracker
        </Button>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <Input
          type="text"
          placeholder="Search public lists by name or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 rounded-lg text-white placeholder:text-zinc-500"
        />
      </div>

      {/* Public lists component */}
      <PublicWalletLists searchQuery={searchQuery} />
    </>
  );
}

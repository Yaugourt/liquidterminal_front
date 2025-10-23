"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Menu, ArrowLeft, Search } from "lucide-react";
import { PublicWalletLists } from "@/components/market/tracker/walletlists/PublicWalletLists";
import { useRouter } from "next/navigation";

export default function PublicListsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  return (
    <div className="min-h-screen">
      {/* Mobile menu button */}
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          className="bg-[#051728] hover:bg-[#112941]"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <Menu className="h-6 w-6 text-white" />
        </Button>
      </div>

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Main content */}
      <div className="">
        <Header customTitle="Public Wallet Lists" showFees={true} />

        <main className="px-2 py-2 sm:px-4 sm:py-4 lg:px-6 xl:px-12 lg:py-6 space-y-6 max-w-[1920px] mx-auto">
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search public lists by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[#0C2237] border-[#83E9FF4D] text-white placeholder:text-gray-400"
            />
          </div>

          {/* Public lists component */}
          <PublicWalletLists searchQuery={searchQuery} />
        </main>
      </div>
    </div>
  );
}


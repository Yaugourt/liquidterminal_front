"use client";

import { Header } from "@/components/Header";
import { SearchBar } from "@/components/SearchBar";

export default function L1ProjectPage() {

  return (
    <div className="min-h-screen p-4">
      <Header customTitle="L1 Project" showFees={true} />
      <div className="p-2 lg:hidden">
        <SearchBar placeholder="Search..." />
      </div>

      <main className="p-3 sm:p-4 lg:p-6 xl:p-12 space-y-4 sm:space-y-6">
        <h1 className="text-xl font-bold text-white">L1 Project</h1>
        <div className="bg-[#051728] rounded-lg p-4 text-white">
          <p>L1 Project content will be displayed here.</p>
        </div>
      </main>
    </div>
  );
} 
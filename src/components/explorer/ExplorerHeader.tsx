"use client";

import { SearchBar } from "@/components/SearchBar";

export function ExplorerHeader() {
  return (
    <div className="p-4  pb-0 lg:pb-0">
      <div className="flex items-center gap-5">
        <h1 className="text-2xl font-bold text-white">
          HyperLiquid L1 explorer
        </h1>
        <SearchBar
          placeholder="Search by Block, Txn Hash, User..."
          className=" border-[#83E9FF4D] border-[2px] rounded-lg aw-[300px] lg:w-[400px]"
        />
      </div>
    </div>
  );
}

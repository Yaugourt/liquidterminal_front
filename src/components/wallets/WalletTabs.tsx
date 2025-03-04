"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export function WalletTabs() {
  return (
    <div className="flex gap-2 items-center">
      <Tabs defaultValue="wallet1" className="w-auto">
        <TabsList className="bg-[#051728]">
          <TabsTrigger value="wallet1" className="data-[state=active]:bg-[#0B2437] data-[state=active]:text-white">
            Wallet 1
          </TabsTrigger>
          <TabsTrigger value="wallet2" className="data-[state=active]:bg-[#1692AD] data-[state=active]:text-white">
            Wallet 2
          </TabsTrigger>
          <TabsTrigger value="wallet3" className="data-[state=active]:bg-[#1692AD] data-[state=active]:text-white">
            Wallet 3
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <Button variant="default" className="ml-auto bg-[#F0D04E] text-black hover:bg-[#F0D04E]/90">
        <PlusCircle className="mr-2 h-4 w-4" /> Add Wallet
      </Button>
    </div>
  );
}

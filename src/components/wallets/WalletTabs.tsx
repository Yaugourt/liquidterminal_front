"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export function WalletTabs() {
  return (
    <div className="flex gap-2 items-center">
      <Tabs defaultValue="wallet1" className="w-auto">
        <TabsList className="gap-3">
          <TabsTrigger value="wallet1" className="bg-[#1692ADB2] data-[state=active]:bg-[#051728CC] data-[state=active]:text-white data-[state=active]:border-[1px] border-[#83E9FF4D] rounded-lg">
            Wallet 1
          </TabsTrigger>
          <TabsTrigger value="wallet2" className="bg-[#1692ADB2] data-[state=active]:bg-[#051728CC] data-[state=active]:text-white data-[state=active]:border-[1px] border-[#83E9FF4D] rounded-lg">
            Wallet 2
          </TabsTrigger>
          <TabsTrigger value="wallet3" className="bg-[#1692ADB2] data-[state=active]:bg-[#051728CC] data-[state=active]:text-white data-[state=active]:border-[1px] border-[#83E9FF4D] rounded-lg">
            Wallet 3
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <Button variant="default" className="ml-auto bg-[#F9E370E5] text-black hover:bg-[#F0D04E]/90">
        <PlusCircle className="mr-2 h-4 w-4" /> Add Wallet
      </Button>
    </div>
  );
}

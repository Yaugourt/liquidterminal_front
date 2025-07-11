import { Card } from "@/components/ui/card";
import { SpotTokenTabs } from "./SpotTokenTabs";
import { TokenTable } from "./SpotTokenTable";
import { useState } from "react";

export function TokensSection() {
  const [activeTab, setActiveTab] = useState("all");
  return (
    <div>
      <SpotTokenTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#83E9FF4D] scrollbar-track-transparent">
        <Card className="bg-[#051728]/60 backdrop-blur-md border border-[#83E9FF20] shadow-lg hover:border-[#83E9FF30] transition-all duration-300 overflow-hidden rounded-xl min-w-[800px]">
          <TokenTable strict={activeTab === "strict"} />
        </Card>
      </div>
    </div>
  );
}

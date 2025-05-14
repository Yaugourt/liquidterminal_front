import { Card } from "@/components/ui/card";
import { PerpTokenTabs } from "./PerpTokenTabs";
import { PerpTokenTable } from "./PerpTokenTable";

export function PerpTokensSection() {
    return (
        <div>
            <PerpTokenTabs />
            <Card className="bg-[#051728]/60 backdrop-blur-md border border-[#83E9FF20] shadow-lg hover:border-[#83E9FF30] transition-all duration-300 overflow-hidden rounded-xl">
                <PerpTokenTable />
            </Card>
        </div>
    );
} 
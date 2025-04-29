import { Card } from "@/components/ui/card";
import { PerpTokenTabs } from "./PerpTokenTabs";
import { PerpTokenTable } from "./PerpTokenTable";

export function PerpTokensSection() {
    return (
        <div>
            <PerpTokenTabs />
            <Card className="border-2 border-[#83E9FF4D] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] overflow-hidden">
                <PerpTokenTable />
            </Card>
        </div>
    );
} 
import { Card } from "@/components/ui/card";
import { TokenFilters } from "../TokenFilters";
import { PerpTokenTable } from "../PerpTokenTable";
import { PerpToken } from "@/services/markets/types";

interface PerpTokensSectionProps {
    tokens: PerpToken[];
    loading: boolean;
}

export function PerpTokensSection({ tokens, loading }: PerpTokensSectionProps) {
    return (
        <div>
            <TokenFilters />
            <Card className="border-2 border-[#83E9FF4D] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] overflow-hidden">
                <PerpTokenTable tokens={tokens} loading={loading} />
            </Card>
        </div>
    );
} 
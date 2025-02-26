import { Card } from "@/components/ui/card";
import { TokenFilters } from "../TokenFilters";
import { TokenTable } from "../TokenTable";

interface TokensSectionProps {
  tokens: any[];
  loading: boolean;
}

export function TokensSection({ tokens, loading }: TokensSectionProps) {
  return (
    <div>
      <TokenFilters />
      <Card className="bg-[#051728E5] border-2 border-[#83E9FF4D] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] overflow-hidden">
        <TokenTable tokens={tokens} loading={loading} />
      </Card>
    </div>
  );
}

import { Database, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AssetsHeaderProps {
  totalAssets: number;
  walletDisplay: string | null;
  onRefresh: () => void;
  isRefreshing: boolean;
  isLoading: boolean;
}

export function AssetsHeader({ 
  totalAssets, 
  walletDisplay, 
  onRefresh, 
  isRefreshing, 
  isLoading 
}: AssetsHeaderProps) {
  return (
    <div className="flex items-center gap-4 justify-between sm:justify-end">
      <div className="flex items-center text-white text-xs sm:text-sm">
        <Database size={16} className="mr-2" />
        Total assets: {totalAssets}
        {walletDisplay && (
          <span className="ml-2 text-brand-accent">
            ({walletDisplay})
          </span>
        )}
      </div>
      <Button 
        variant="ghost" 
        size="sm"
        onClick={onRefresh}
        disabled={isRefreshing || isLoading}
        className={cn(
          "p-2 text-white hover:text-white transition-colors",
          isRefreshing && "animate-spin"
        )}
      >
        <RefreshCw size={16} />
      </Button>
    </div>
  );
} 
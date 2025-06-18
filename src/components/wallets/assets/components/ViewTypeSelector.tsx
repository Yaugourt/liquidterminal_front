import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ViewTypeSelectorProps {
  viewType: 'spot' | 'perp';
  onViewTypeChange: (type: 'spot' | 'perp') => void;
}

export function ViewTypeSelector({ viewType, onViewTypeChange }: ViewTypeSelectorProps) {
  const buttonClasses = (type: 'spot' | 'perp') => cn(
    "rounded-md px-4 sm:px-8 py-2 text-xs sm:text-sm font-medium",
    viewType === type
      ? "bg-[#1692ADB2] text-white border-[#83E9FF4D]"
      : "bg-[#051728] text-[#FFFFFF99] border-[#83E9FF4D] hover:bg-[#0C2237]"
  );

  return (
    <div className="flex space-x-2">
      <Button
        variant="outline"
        className={buttonClasses('spot')}
        onClick={() => onViewTypeChange('spot')}
      >
        Spot
      </Button>
      <Button
        variant="outline"
        className={buttonClasses('perp')}
        onClick={() => onViewTypeChange('perp')}
      >
        Perps
      </Button>
    </div>
  );
} 
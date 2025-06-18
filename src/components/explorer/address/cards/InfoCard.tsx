import { memo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { InfoCardProps } from "@/components/types/explorer.types";
import { CARD_BASE_CLASSES } from "./constants";

export const InfoCard = memo(({ onAddClick }: InfoCardProps) => {
    return (
        <Card className={CARD_BASE_CLASSES}>
            <h3 className="text-white text-[16px] font-serif mb-5">More Info</h3>
            <div className="space-y-5">
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-white text-sm">Private name tags</span>
                        <Button 
                            variant="outline"
                            size="sm"
                            className="bg-[#F3DC4D] text-black px-2 py-1 h-7 rounded-md text-xs font-medium hover:bg-opacity-90 transition-colors border-none"
                            onClick={onAddClick}
                        >
                            <Plus className="h-3.5 w-3.5 mr-1" /> Add
                        </Button>
                    </div>
                </div>
                <div>
                    <div className="text-white text-sm mb-3">Transactions sent</div>
                    <div className="flex gap-5">
                        <div>
                            <span className="text-[#FFFFFF80] text-xs">Latest:</span>
                            <span className="text-[#83E9FF] ml-1.5 text-xs">Loading...</span>
                        </div>
                        <div>
                            <span className="text-[#FFFFFF80] text-xs">First:</span>
                            <span className="text-[#83E9FF] ml-1.5 text-xs">Loading...</span>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}); 
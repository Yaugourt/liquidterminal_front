import { ReadListItem } from "@/types/read-list.types";
import { ReadListCard } from "./ReadListCard";

interface ReadListGridProps {
  items: ReadListItem[];
  readListId: string;
}

export function ReadListGrid({ items, readListId }: ReadListGridProps) {
  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-[#051728] border-2 border-[#83E9FF4D] rounded-lg">
        <div className="text-center">
          <p className="text-[#FFFFFF80] text-lg mb-2">No articles found</p>
          <p className="text-[#FFFFFF60] text-sm">
            Try adjusting your search or filter criteria
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <ReadListCard 
          key={item.id} 
          item={item} 
          readListId={readListId} 
        />
      ))}
    </div>
  );
} 
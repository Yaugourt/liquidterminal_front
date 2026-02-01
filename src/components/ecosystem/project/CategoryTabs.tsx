import { useRef, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Category } from "@/services/ecosystem/project/types";

interface CategoryTabsProps {
  categories: Category[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  isLoading?: boolean;
  error?: Error | null;
}

export function CategoryTabs({ 
  categories, 
  activeTab, 
  onTabChange, 
  isLoading = false, 
  error = null 
}: CategoryTabsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Vérifier si le défilement est possible
  const checkScrollability = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth
      );
    }
  };

  useEffect(() => {
    checkScrollability();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollability);
      
      // Support de la molette horizontale
      const handleWheel = (e: WheelEvent) => {
        if (e.deltaX !== 0) {
          e.preventDefault();
          container.scrollBy({ left: e.deltaY > 0 ? 60 : -60, behavior: 'smooth' });
        }
      };
      
      container.addEventListener('wheel', handleWheel);
      
      return () => {
        container.removeEventListener('scroll', checkScrollability);
        container.removeEventListener('wheel', handleWheel);
      };
    }
  }, [categories]);

  const scrollLeft = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({ left: -150, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({ left: 150, behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center w-full max-w-full overflow-hidden">
        <div className="flex items-center gap-1 flex-1 min-w-0">
          <div className="flex-1 min-w-0">
            <div className="flex bg-brand-dark rounded-lg p-1 border border-border-subtle gap-1">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-8 w-20 bg-white/5 rounded-md animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center w-full">
        <div className="text-rose-400 text-sm py-2 px-3">
          Failed to load categories: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center w-full max-w-full overflow-hidden">
      <div className="flex items-center gap-1 flex-1 min-w-0 mr-4">
        {/* Left scroll button */}
        {canScrollLeft && (
          <button
            onClick={scrollLeft}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-text-secondary hover:text-brand-accent hover:bg-white/5 rounded-lg transition-colors"
            title="Scroll left"
          >
            <ChevronLeft size={16} />
          </button>
        )}
        
        {/* Tabs container with scroll */}
        <div className="flex-1 min-w-0 overflow-hidden">
          <div
            ref={scrollContainerRef}
            className="w-fit flex bg-brand-dark rounded-lg p-1 border border-border-subtle overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent gap-1"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            {/* Tab "All" */}
            <button
              onClick={() => onTabChange('all')}
              className={`flex-shrink-0 px-2.5 sm:px-4 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-brand-accent text-brand-tertiary shadow-sm font-bold'
                  : 'tab-inactive'
              }`}
            >
              All Projects
            </button>
            
            {/* Category tabs */}
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => onTabChange(category.id.toString())}
                className={`flex-shrink-0 px-2 sm:px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                  activeTab === category.id.toString()
                    ? 'bg-brand-accent text-brand-tertiary shadow-sm font-bold'
                    : 'tab-inactive'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
        
        {/* Right scroll button */}
        {canScrollRight && (
          <button
            onClick={scrollRight}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-text-secondary hover:text-brand-accent hover:bg-white/5 rounded-lg transition-colors"
            title="Scroll right"
          >
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

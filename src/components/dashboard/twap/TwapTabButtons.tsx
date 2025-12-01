import { memo, useRef, useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, Zap } from "lucide-react";
import { TwapTabButtonsProps } from "./types";

const TwapTabButtonsComponent = ({ 
  activeTab, 
  setActiveTab, 
  availableTokens 
}: TwapTabButtonsProps) => {
  const tabs = useMemo(() => [
    { key: 'ALL', label: 'All Tokens' },
    ...availableTokens.map(token => ({ key: token, label: token }))
  ], [availableTokens]);

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
      
      // Ajouter le support de la molette horizontale
      const handleWheel = (e: WheelEvent) => {
        if (e.deltaX !== 0) {
          // Si c'est déjà un scroll horizontal, le laisser passer
          return;
        }
        if (e.deltaY !== 0) {
          // Convertir le scroll vertical en horizontal
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
  }, [tabs]);

  // Fonctions de défilement
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

  return (
    <div className="flex items-center p-4 border-b border-white/5 bg-black/20 w-full overflow-hidden">
      {/* Header Title */}
      <div className="flex items-center gap-2 mr-4 flex-shrink-0">
        <Zap size={16} className="text-[#83E9FF]" />
        <span className="text-sm font-semibold text-white">Active Twaps</span>
      </div>

      {/* Scrollable Tabs */}
      <div className="flex-1 min-w-0 flex items-center gap-2 overflow-hidden">
        {canScrollLeft && (
          <button
            onClick={scrollLeft}
            className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-zinc-400 hover:text-white bg-white/5 rounded-full transition-colors"
          >
            <ChevronLeft size={14} />
          </button>
        )}
        
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth"
        >
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-md text-[10px] font-medium transition-all whitespace-nowrap border ${
                activeTab === tab.key
                  ? 'bg-[#83E9FF]/10 border-[#83E9FF]/20 text-[#83E9FF] shadow-sm'
                  : 'bg-white/5 border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {canScrollRight && (
          <button
            onClick={scrollRight}
            className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-zinc-400 hover:text-white bg-white/5 rounded-full transition-colors"
          >
            <ChevronRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

export const TwapTabButtons = memo(TwapTabButtonsComponent);
TwapTabButtons.displayName = 'TwapTabButtons';

import { memo, useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TwapTabButtonsProps } from "./types";

export const TwapTabButtons = memo(({ 
  activeTab, 
  setActiveTab, 
  availableTokens 
}: TwapTabButtonsProps) => {
  const tabs = [
    { key: 'ALL', label: 'All' },
    ...availableTokens.map(token => ({ key: token, label: token }))
  ];

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
    <div className="flex items-center mb-4 w-full max-w-full overflow-hidden">
      {/* Section tabs avec défilement - prend maximum d'espace disponible */}
      <div className="flex items-center gap-1 flex-1 min-w-0 mr-4">
        {/* Bouton scroll gauche */}
        {canScrollLeft && (
          <button
            onClick={scrollLeft}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-white hover:text-[#83E9FF] hover:bg-[#FFFFFF0A] rounded-md transition-colors"
            title="Défiler vers la gauche"
          >
            <ChevronLeft size={16} />
          </button>
        )}
        
        {/* Container des tabs avec défilement */}
        <div className="flex-1 min-w-0 max-w-[600px]">
          <div
            ref={scrollContainerRef}
            className="flex items-center bg-[#FFFFFF0A] rounded-lg p-1 overflow-x-auto gap-1 max-w-full"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-shrink-0 px-3 py-1 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'bg-[#83E9FF] text-[#051728] shadow-sm'
                    : 'text-white hover:text-white hover:bg-[#FFFFFF0A]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bouton scroll droite */}
        {canScrollRight && (
          <button
            onClick={scrollRight}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-white hover:text-[#83E9FF] hover:bg-[#FFFFFF0A] rounded-md transition-colors"
            title="Défiler vers la droite"
          >
            <ChevronRight size={16} />
          </button>
        )}
      </div>
      
      {/* Label "Active Orders" - largeur fixe */}
      <div className="flex items-center gap-1 px-3 py-1 text-sm text-white flex-shrink-0 whitespace-nowrap">
        Active Twaps
      </div>
    </div>
  );
}); 
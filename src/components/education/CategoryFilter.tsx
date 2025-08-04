"use client";

import { ChevronDown, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useEducationalCategories } from "@/services/education";

interface CategoryFilterProps {
  selectedCategories: number[];
  onCategoryChange: (categories: number[]) => void;
}

export function CategoryFilter({ selectedCategories, onCategoryChange }: CategoryFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Fetch categories using the education service - get all categories
  const { categories, isLoading } = useEducationalCategories({
    limit: 100 // Get all categories at once, no pagination for dropdown
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleCategory = (categoryId: number) => {
    if (selectedCategories.includes(categoryId)) {
      onCategoryChange(selectedCategories.filter(id => id !== categoryId));
    } else {
      onCategoryChange([...selectedCategories, categoryId]);
    }
  };

  const handleSelectAll = () => {
    const allSelected = categories.length > 0 && categories.every(cat => selectedCategories.includes(cat.id));
    
    if (allSelected) {
      onCategoryChange([]);
    } else {
      onCategoryChange(categories.map(cat => cat.id));
    }
  };

  const getButtonText = () => {
    const allSelected = categories.length > 0 && categories.every(cat => selectedCategories.includes(cat.id));
    
    if (selectedCategories.length === 0) {
      return `Select categories... (${categories.length} total)`;
    } else if (allSelected) {
      return `All categories (${categories.length})`;
    } else {
      const selected = categories.filter(cat => selectedCategories.includes(cat.id));
      if (selectedCategories.length === 1) {
        return `${selected[0].name} (${selectedCategories.length}/${categories.length})`;
      }
      return `${selectedCategories.length}/${categories.length} categories selected`;
    }
  };

  if (isLoading) {
    return (
      <div className="relative w-full md:w-96">
        <div className="w-full px-4 py-3 bg-[#051728E5] border border-[#83E9FF4D] rounded-lg text-white">
          <span className="text-sm text-gray-400">Loading categories...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full md:w-96" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-[#051728E5] border border-[#83E9FF4D] hover:border-[#83E9FF80] rounded-lg flex items-center justify-between text-white transition-all"
      >
        <span className="text-sm font-medium">{getButtonText()}</span>
        <ChevronDown 
          size={16} 
          className={`text-[#F9E370] transition-transform ${isOpen ? "rotate-180" : ""}`} 
        />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 w-full bg-[#051728] border border-[#83E9FF4D] rounded-lg shadow-xl z-50 overflow-hidden">
          {/* Select All option */}
          <div className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#112941] transition-colors border-b border-[#83E9FF1A]">
            <button
              onClick={handleSelectAll}
              className="text-sm text-white font-medium hover:text-[#83E9FF] transition-colors"
            >
              Select All
            </button>
            <button
              onClick={handleSelectAll}
              className={`w-4 h-4 rounded border cursor-pointer transition-colors ${
                categories.length > 0 && categories.every(cat => selectedCategories.includes(cat.id))
                  ? "bg-[#F9E370] border-[#F9E370] hover:bg-[#F9E370]/80" 
                  : "border-gray-500 hover:border-[#83E9FF]"
              } flex items-center justify-center`}
            >
              {categories.length > 0 && categories.every(cat => selectedCategories.includes(cat.id)) && (
                <Check size={12} className="text-[#051728]" />
              )}
            </button>
          </div>

          {/* Category options */}
          <div className="max-h-64 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-400">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#83E9FF] mx-auto mb-2"></div>
                <span className="text-sm">Chargement des catégories...</span>
              </div>
            ) : (
              categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleToggleCategory(category.id)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#112941] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm text-white">{category.name}</span>
                </div>
                <div className={`w-4 h-4 rounded border ${
                  selectedCategories.includes(category.id) 
                    ? "bg-[#F9E370] border-[#F9E370]" 
                    : "border-gray-500"
                } flex items-center justify-center`}>
                  {selectedCategories.includes(category.id) && (
                    <Check size={12} className="text-[#051728]" />
                  )}
                </div>
              </button>
            ))
            )}
          </div>


        </div>
      )}
    </div>
  );
} 
"use client";

import { ChevronDown, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface Category {
  id: number;
  title: string;
  count: number;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategories: number[];
  onCategoryChange: (categories: number[]) => void;
}

export function CategoryFilter({ categories, selectedCategories, onCategoryChange }: CategoryFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    if (selectedCategories.length === categories.length) {
      onCategoryChange([]);
    } else {
      onCategoryChange(categories.map(cat => cat.id));
    }
  };

  const getButtonText = () => {
    if (selectedCategories.length === 0) {
      return "Select categories...";
    } else if (selectedCategories.length === categories.length) {
      return "All categories";
    } else {
      const selected = categories.filter(cat => selectedCategories.includes(cat.id));
      if (selectedCategories.length === 1) {
        return selected[0].title;
      }
      return `${selectedCategories.length} categories selected`;
    }
  };

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
          <button
            onClick={handleSelectAll}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#112941] transition-colors border-b border-[#83E9FF1A]"
          >
            <span className="text-sm text-white font-medium">Select All</span>
            <div className={`w-4 h-4 rounded border ${
              selectedCategories.length === categories.length 
                ? "bg-[#F9E370] border-[#F9E370]" 
                : "border-gray-500"
            } flex items-center justify-center`}>
              {selectedCategories.length === categories.length && (
                <Check size={12} className="text-[#051728]" />
              )}
            </div>
          </button>

          {/* Category options */}
          <div className="max-h-64 overflow-y-auto">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleToggleCategory(category.id)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#112941] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm text-white">{category.title}</span>
                  <span className="text-xs text-gray-400">({category.count})</span>
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
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 
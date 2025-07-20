"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, Plus, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useReadLists } from "@/store/use-readlists";

interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  image: string;
}

interface ResourceCardProps {
  resource: Resource;
  categoryColor: string;
}

export function ResourceCard({ resource, categoryColor }: ResourceCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isAddingToList, setIsAddingToList] = useState(false);
  const [showReadLists, setShowReadLists] = useState(false);
  const { readLists, addItemToReadList } = useReadLists();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowReadLists(false);
      }
    };

    if (showReadLists) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showReadLists]);

  const handleAddToReadList = async (readListId: number) => {
    try {
      console.log('Adding to read list:', readListId, 'Resource:', resource);
      setIsAddingToList(true);
      await addItemToReadList(readListId, {
        resourceId: parseInt(resource.id),
        notes: `Added from ${resource.title}`
      });
      setShowReadLists(false);
      console.log('Successfully added to read list');
    } catch (error) {
      console.error('Error adding to read list:', error);
    } finally {
      setIsAddingToList(false);
    }
  };

  // Debug: afficher les read lists disponibles
  console.log('Available read lists:', readLists);
  console.log('Show read lists dropdown:', showReadLists);

  return (
    <Card className="bg-[#051728E5] border border-[#83E9FF4D] hover:border-[#83E9FF80] transition-all shadow-sm hover:shadow-lg group overflow-hidden rounded-lg relative">
      <CardContent className="p-0">
        <a 
          href={resource.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block"
        >
          {/* Image section */}
          <div className="relative h-48 w-full overflow-hidden bg-[#112941]">
            {!imageError ? (
              <Image
                src={resource.image}
                alt={resource.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-[#83E9FF] opacity-20">
                  <ExternalLink size={48} />
                </div>
              </div>
            )}
          </div>

          {/* Content section */}
          <div className="p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-medium text-white line-clamp-2 group-hover:text-[#F9E370] transition-colors">
                {resource.title}
              </h3>
              <ExternalLink size={14} className="text-[#F9E370] mt-0.5 flex-shrink-0" />
            </div>

            <p className="text-xs text-gray-400 line-clamp-2">
              {resource.description}
            </p>

            <div className="flex items-center justify-between pt-2">
              <Badge 
                variant="secondary" 
                className="bg-[#112941] text-gray-300 border-none text-xs"
              >
                Article
              </Badge>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">2 min read</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Plus button clicked! Current state:', showReadLists);
                    setShowReadLists(!showReadLists);
                    console.log('New state will be:', !showReadLists);
                  }}
                  className="p-1 h-auto text-[#83E9FF] hover:text-[#F9E370] hover:bg-[#83E9FF1A]"
                  title="Add to read list"
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </a>

        {/* Read Lists Modal - EN DEHORS du lien */}
        {showReadLists && (
          <div 
            ref={dropdownRef} 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowReadLists(false);
              }
            }}
          >
            <div className="bg-[#051728] border-2 border-[#83E9FF] rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
              <div className="text-lg text-[#83E9FF] font-medium mb-4">Add to read list:</div>
              {readLists.length === 0 ? (
                <div className="text-sm text-[#FFFFFF60] py-4 text-center">
                  No read lists available
                </div>
              ) : (
                <div className="space-y-3">
                  {readLists.map((readList) => (
                    <button
                      key={readList.id}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Clicking on read list:', readList.id);
                        handleAddToReadList(readList.id);
                      }}
                      disabled={isAddingToList}
                      className="w-full text-left px-4 py-3 text-sm text-white hover:bg-[#83E9FF1A] rounded-md flex items-center gap-3 disabled:opacity-50 transition-colors border border-[#83E9FF4D]"
                    >
                      <BookOpen className="w-5 h-5 text-[#83E9FF] flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-medium">{readList.name}</div>
                        {readList.description && (
                          <div className="text-xs text-[#FFFFFF80] mt-1">{readList.description}</div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowReadLists(false);
                  }}
                  className="px-4 py-2 text-sm text-[#FFFFFF80] hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 
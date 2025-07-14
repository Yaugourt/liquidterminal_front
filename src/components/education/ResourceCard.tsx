"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, Bookmark, BookmarkCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import Image from "next/image";

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
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <Card className="bg-[#051728E5] border border-[#83E9FF4D] hover:border-[#83E9FF80] transition-all shadow-sm hover:shadow-lg group overflow-hidden rounded-lg">
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
            
            {/* Bookmark button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsBookmarked(!isBookmarked);
              }}
              className="absolute top-3 right-3 p-2 bg-[#051728]/80 backdrop-blur-sm rounded-lg hover:bg-[#051728] transition-colors"
            >
              {isBookmarked ? (
                <BookmarkCheck size={16} className="text-[#F9E370]" />
              ) : (
                <Bookmark size={16} className="text-white" />
              )}
            </button>
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
              <span className="text-xs text-gray-500">2 min read</span>
            </div>
          </div>
        </a>
      </CardContent>
    </Card>
  );
} 
"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  User, 
  Calendar, 
  FileText,
  ArrowLeft
} from "lucide-react";
import { PublicReadList, ReadListItem } from "@/services/wiki/readList/types";
import { formatDistanceToNow } from "date-fns";
import { ResourceCard } from "../ResourceCard";
import { getReadListItems } from "@/services/wiki/readList/api";

interface PublicReadListDetailsProps {
  readList: PublicReadList | null;
  onBack: () => void;
  onCopy: () => void;
}

export function PublicReadListDetails({ 
  readList, 
  onBack, 
  onCopy 
}: PublicReadListDetailsProps) {
  const [items, setItems] = useState<ReadListItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (readList) {
      const fetchItems = async () => {
        setLoading(true);
        try {
          const response = await getReadListItems(readList.id);
          if (response.success && response.data) {
            setItems(response.data);
          }
        } catch {
          // Error handled silently
        } finally {
          setLoading(false);
        }
      };
      
      fetchItems();
    }
  }, [readList]);

  if (!readList) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          onClick={onBack}
          variant="ghost"
          size="sm"
          className="text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Lists
        </Button>
        <Button
          onClick={onCopy}
          className="bg-[#83E9FF] hover:bg-[#83E9FF]/90 text-[#051728] font-semibold rounded-lg"
        >
          <BookOpen className="w-4 h-4 mr-2" />
          Copy This List
        </Button>
      </div>

      {/* Read List Info */}
      <div className="bg-[#151A25]/60 backdrop-blur-md border border-white/5 rounded-2xl shadow-xl shadow-black/20 p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white mb-2">{readList.name}</h2>
            {readList.description && (
              <p className="text-zinc-400 mb-4">{readList.description}</p>
            )}
            <div className="flex items-center gap-4 text-xs text-zinc-500">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2 text-[#83E9FF]" />
                <span className="text-zinc-300">Created by {readList.creator.name}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-[#83E9FF]" />
                <span>
                  Updated {formatDistanceToNow(new Date(readList.updatedAt), { addSuffix: true })}
                </span>
              </div>
              <div className="flex items-center">
                <FileText className="w-4 h-4 mr-2 text-[#83E9FF]" />
                <span>{readList.itemsCount} resources</span>
              </div>
            </div>
          </div>
          <Badge 
            variant="secondary" 
            className="bg-[#F9E370]/10 text-[#F9E370] border-none text-xs"
          >
            Public List
          </Badge>
        </div>
      </div>

      {/* Resources */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Resources</h3>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#83E9FF] mb-2"></div>
              <p className="text-zinc-500 text-sm">Loading resources...</p>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-[#151A25]/60 backdrop-blur-md border border-white/5 rounded-2xl shadow-xl shadow-black/20 p-8">
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-[#83e9ff]/10 rounded-2xl flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-[#83E9FF]" />
              </div>
              <p className="text-zinc-400">No resources available in this list</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {items.map((item) => (
              <ResourceCard
                key={item.id}
                resource={{
                  id: item.resourceId.toString(),
                  url: item.resource.url,
                  title: item.resource.url,
                  description: item.notes || 'No description',
                  image: '' // Empty string for now, will be handled by preview
                }}
                categoryColor="#83E9FF"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 
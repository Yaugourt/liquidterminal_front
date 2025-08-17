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
        } catch (error) {
          console.error('Error fetching read list items:', error);
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
          className="text-[#83E9FF] hover:text-[#83E9FF]/80 hover:bg-[#83E9FF]/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Lists
        </Button>
        <Button
          onClick={onCopy}
          className="bg-[#83E9FF] text-black hover:bg-[#83E9FF]/90"
        >
          <BookOpen className="w-4 h-4 mr-2" />
          Copy This List
        </Button>
      </div>

      {/* Read List Info */}
      <Card className="bg-[#051728E5] border-[#83E9FF4D]">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">{readList.name}</h2>
              {readList.description && (
                <p className="text-[#FFFFFF80] mb-4">{readList.description}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-[#f9e370]">
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  <span>Created by {readList.creator.name}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>
                    Updated {formatDistanceToNow(new Date(readList.updatedAt), { addSuffix: true })}
                  </span>
                </div>
                <div className="flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  <span>{readList.itemsCount} resources</span>
                </div>
              </div>
            </div>
            <Badge 
              variant="secondary" 
              className="bg-[#F9E370]/20 text-[#F9E370] border-[#F9E370]/30"
            >
              Public List
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Resources */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-4">Resources</h3>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#83E9FF] mx-auto mb-4"></div>
            <p className="text-[#FFFFFF80]">Loading resources...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="w-16 h-16 text-[#FFFFFF40] mx-auto mb-4" />
            <p className="text-[#FFFFFF80]">No resources available in this list</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
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
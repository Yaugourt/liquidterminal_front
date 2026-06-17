"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  BookOpen,
  Calendar,
  FileText,
  ArrowLeft,
  Copy,
  CheckCircle,
  Globe,
} from "lucide-react";
import { InlineSpinner } from "@/components/ui/inline-spinner";
import { chartPalette, Skeleton } from "@/components/common";
import { PublicReadList, ReadListItem } from "@/services/wiki/readList/types";
import { timeAgo } from "@/lib/formatters/dateFormatting";
import { ResourceCard } from "../ResourceCard";
import { getReadListItems } from "@/services/wiki/readList/api";
import { motion, AnimatePresence } from "framer-motion";

interface PublicReadListDetailsProps {
  readList: PublicReadList | null;
  onBack: () => void;
  onCopy: () => void;
}

const ResourceSkeleton = () => (
  <Card>
    <Skeleton className="w-full h-36 rounded-none" />
    <div className="p-4 space-y-2.5">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  </Card>
);

export function PublicReadListDetails({
  readList,
  onBack,
  onCopy
}: PublicReadListDetailsProps) {
  const [items, setItems] = useState<ReadListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!readList) return;
    const fetchItems = async () => {
      setLoading(true);
      try {
        const response = await getReadListItems(readList.id);
        if (response.success && response.data) {
          setItems(response.data);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [readList]);

  const handleCopy = async () => {
    await onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!readList) return null;

  const initial = (readList.creator.name || "?").charAt(0).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      {/* Back + Copy bar */}
      <div className="flex items-center justify-between gap-3">
        <Button
          onClick={onBack}
          variant="ghost"
          size="sm"
          className="interactive-secondary rounded-lg"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Lists
        </Button>
        <Button
          onClick={handleCopy}
          className="bg-brand hover:bg-brand/90 text-brand-text-on font-semibold rounded-lg"
          size="sm"
        >
          {copied ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              Copy This List
            </>
          )}
        </Button>
      </div>

      {/* Info card */}
      <Card>
        <div className="h-1 bg-gradient-to-r from-brand/60 to-brand/20" />
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <div className="w-12 h-12 rounded-lg bg-brand/10 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-6 h-6 text-brand" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold text-text-primary">{readList.name}</h2>
                  <span className="flex items-center gap-1 text-label bg-brand/10 text-brand px-2 py-0.5 rounded-md border border-brand/20">
                    <Globe className="w-3 h-3" />
                    Public
                  </span>
                </div>
                {readList.description && (
                  <p className="text-text-secondary mt-1">{readList.description}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-5 mt-5 pt-4 border-t border-border-subtle flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-brand/20 flex items-center justify-center text-brand font-bold text-xs">
                {initial}
              </div>
              <div>
                <p className="text-xs text-text-tertiary">Created by</p>
                <p className="text-sm text-text-secondary font-medium">{readList.creator.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-text-tertiary">
              <Calendar className="w-3.5 h-3.5 text-brand/60" />
              <div>
                <p className="text-xs text-text-tertiary">Updated</p>
                <p className="text-sm text-text-secondary">
                  {timeAgo(readList.updatedAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-brand/60" />
              <div>
                <p className="text-xs text-text-tertiary">Resources</p>
                <p className="text-sm text-text-secondary font-medium">{readList.itemsCount}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Resources */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Resources</h3>
          {!loading && items.length > 0 && (
            <span className="text-label bg-brand/10 text-brand px-1.5 py-0.5 rounded-md">{items.length}</span>
          )}
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <ResourceSkeleton key={i} />
              ))}
            </motion.div>
          ) : items.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
            <Card padding="lg" className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-brand/10 rounded-lg flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-brand" />
              </div>
              <p className="text-text-secondary">No resources in this list yet</p>
            </Card>
            </motion.div>
          ) : (
            <motion.div
              key="items"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
            >
              {items.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.05, 0.4) }}
                >
                  <ResourceCard
                    resource={{
                      id: item.resourceId.toString(),
                      url: item.resource.url,
                      title: item.resource.url,
                      description: item.notes || '',
                      image: ''
                    }}
                    categoryColor={chartPalette.accent}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="flex justify-center">
          <InlineSpinner className="w-5 h-5 text-brand" />
        </div>
      )}
    </motion.div>
  );
}

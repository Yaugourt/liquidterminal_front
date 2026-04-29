"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  User,
  Calendar,
  FileText,
  ArrowLeft,
  Copy,
  CheckCircle,
  Globe,
  Loader2,
} from "lucide-react";
import { PublicReadList, ReadListItem } from "@/services/wiki/readList/types";
import { formatDistanceToNow } from "date-fns";
import { ResourceCard } from "../ResourceCard";
import { getReadListItems } from "@/services/wiki/readList/api";
import { motion, AnimatePresence } from "framer-motion";

interface PublicReadListDetailsProps {
  readList: PublicReadList | null;
  onBack: () => void;
  onCopy: () => void;
}

const ResourceSkeleton = () => (
  <div className="bg-brand-secondary/60 border border-border-subtle rounded-2xl overflow-hidden animate-pulse">
    <div className="w-full h-36 bg-white/5"></div>
    <div className="p-4 space-y-2.5">
      <div className="h-4 bg-white/5 rounded w-3/4"></div>
      <div className="h-3 bg-white/5 rounded w-full"></div>
      <div className="h-3 bg-white/5 rounded w-1/2"></div>
    </div>
  </div>
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
          className="bg-brand-accent hover:bg-brand-accent/90 text-brand-tertiary font-semibold rounded-lg"
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
      <div className="bg-brand-secondary/60 backdrop-blur-md border border-border-subtle rounded-2xl shadow-xl shadow-black/20 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-brand-accent/60 to-brand-accent/20" />
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-brand-accent/10 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-6 h-6 text-brand-accent" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold text-white">{readList.name}</h2>
                  <span className="flex items-center gap-1 text-label bg-brand-accent/10 text-brand-accent px-2 py-0.5 rounded-md border border-brand-accent/20">
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
              <div className="w-7 h-7 rounded-full bg-brand-accent/20 flex items-center justify-center text-brand-accent font-bold text-xs">
                {initial}
              </div>
              <div>
                <p className="text-xs text-text-muted">Created by</p>
                <p className="text-sm text-white/90 font-medium">{readList.creator.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-text-muted">
              <Calendar className="w-3.5 h-3.5 text-brand-accent/60" />
              <div>
                <p className="text-xs text-text-muted">Updated</p>
                <p className="text-sm text-white/80">
                  {formatDistanceToNow(new Date(readList.updatedAt), { addSuffix: true })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-brand-accent/60" />
              <div>
                <p className="text-xs text-text-muted">Resources</p>
                <p className="text-sm text-white/80 font-medium">{readList.itemsCount}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resources */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Resources</h3>
          {!loading && items.length > 0 && (
            <span className="text-label bg-brand-accent/10 text-brand-accent px-1.5 py-0.5 rounded-md">{items.length}</span>
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
              className="bg-brand-secondary/60 backdrop-blur-md border border-border-subtle rounded-2xl p-12 text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-brand-accent/10 rounded-2xl flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-brand-accent" />
              </div>
              <p className="text-text-secondary">No resources in this list yet</p>
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
                    categoryColor="#83E9FF"
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
          <Loader2 className="w-5 h-5 animate-spin text-brand-accent" />
        </div>
      )}
    </motion.div>
  );
}

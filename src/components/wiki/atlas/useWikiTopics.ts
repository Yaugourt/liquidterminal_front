"use client";

import { useMemo } from "react";
import { useEducationalCategories } from "@/services/wiki";
import { useHyperliquidEducation } from "@/hooks/useHyperliquidEducation";
import { buildTopics, type ChapterTopic } from "../hub/topics";
import type { EducationalCategory } from "@/services/wiki/types";

interface UseWikiTopicsResult {
  chapterTopics: ChapterTopic[];
  communityCategories: EducationalCategory[];
  categories: EducationalCategory[];
  isLoading: boolean;
  /** Freshness of the underlying categories poll — drives the page-level cue. */
  isRefreshing?: boolean;
  refetch: () => Promise<void>;
  dataUpdatedAt?: number | null;
}

/**
 * Resolve the Learn chapters against the live categories (withCounts) into
 * chapter topics + the leftover community categories. Shared by every routed
 * topic view so the rail and headers stay consistent.
 */
export function useWikiTopics(): UseWikiTopicsResult {
  const { education, loading: educationLoading } = useHyperliquidEducation();
  const {
    categories,
    isLoading: categoriesLoading,
    isRefreshing,
    refetch,
    dataUpdatedAt,
  } = useEducationalCategories({
    limit: 100,
    withCounts: true,
    sortBy: "name",
    sortOrder: "asc",
  });

  const { chapterTopics, communityCategories } = useMemo(
    () => buildTopics(education?.chapters ?? [], categories),
    [education, categories]
  );

  return {
    chapterTopics,
    communityCategories,
    categories,
    isLoading: (educationLoading || categoriesLoading) && (chapterTopics.length === 0 || categories.length === 0),
    isRefreshing,
    refetch,
    dataUpdatedAt,
  };
}

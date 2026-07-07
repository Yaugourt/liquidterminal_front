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
}

/**
 * Resolve the Learn chapters against the live categories (withCounts) into
 * chapter topics + the leftover community categories. Shared by every routed
 * topic view so the rail and headers stay consistent.
 */
export function useWikiTopics(): UseWikiTopicsResult {
  const { education, loading: educationLoading } = useHyperliquidEducation();
  const { categories, isLoading: categoriesLoading } = useEducationalCategories({
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
  };
}

"use client";

import { use, useEffect } from "react";
import { usePageTitle } from "@/store/use-page-title";
import { ChapterView } from "@/components/wiki/atlas/ChapterView";

export default function WikiChapterPage({
  params,
}: {
  params: Promise<{ chapter: string; sub?: string[] }>;
}) {
  const { chapter, sub } = use(params);
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle("Wiki");
  }, [setTitle]);

  return <ChapterView chapterSlug={chapter} subId={sub?.[0]} />;
}

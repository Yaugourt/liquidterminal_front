"use client";

import { useEffect } from "react";
import { usePageTitle } from "@/store/use-page-title";
import { TopicsIndex } from "@/components/wiki/atlas/TopicsIndex";

export default function WikiTopicsPage() {
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle("Wiki");
  }, [setTitle]);

  return <TopicsIndex />;
}

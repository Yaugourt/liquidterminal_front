"use client";

import { useEffect } from "react";
import { usePageTitle } from "@/store/use-page-title";
import { ReadListsIndex } from "@/components/wiki/atlas/ReadListsIndex";

export default function WikiReadListsPage() {
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle("Wiki");
  }, [setTitle]);

  return <ReadListsIndex />;
}

"use client";

import { useEffect } from "react";
import { usePageTitle } from "@/store/use-page-title";
import { ReadList } from "@/components/wiki/readList";

export default function ReadListPage() {
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle("Read List");
  }, [setTitle]);

  return <ReadList />;
}

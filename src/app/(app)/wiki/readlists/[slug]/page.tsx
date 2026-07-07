"use client";

import { use, useEffect } from "react";
import { usePageTitle } from "@/store/use-page-title";
import { ReadListDetail } from "@/components/wiki/atlas/ReadListDetail";

export default function WikiReadListDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle("Wiki");
  }, [setTitle]);

  return <ReadListDetail slug={slug} />;
}

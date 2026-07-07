"use client";

import { use, useEffect } from "react";
import { usePageTitle } from "@/store/use-page-title";
import { CommunityView } from "@/components/wiki/atlas/CommunityView";

export default function WikiCommunityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle("Wiki");
  }, [setTitle]);

  return <CommunityView categorySlug={slug} />;
}

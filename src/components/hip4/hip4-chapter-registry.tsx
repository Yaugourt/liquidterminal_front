import type { ComponentType } from "react";
import type { Hip4Slug } from "@/lib/hip4-chapters";
import { Hip4AbiChapter } from "@/components/hip4/chapters/Hip4AbiChapter";
import { Hip4BridgeChapter } from "@/components/hip4/chapters/Hip4BridgeChapter";
import { Hip4DocsChapter } from "@/components/hip4/chapters/Hip4DocsChapter";
import { Hip4EventsChapter } from "@/components/hip4/chapters/Hip4EventsChapter";
import { Hip4HomeChapter } from "@/components/hip4/chapters/Hip4HomeChapter";
import { Hip4MarketsChapter } from "@/components/hip4/chapters/Hip4MarketsChapter";
import { Hip4MechanicsChapter } from "@/components/hip4/chapters/Hip4MechanicsChapter";
import { Hip4OverviewChapter } from "@/components/hip4/chapters/Hip4OverviewChapter";
import { Hip4RevertsChapter } from "@/components/hip4/chapters/Hip4RevertsChapter";
import { Hip4StorageChapter } from "@/components/hip4/chapters/Hip4StorageChapter";
import { Hip4TxexamplesChapter } from "@/components/hip4/chapters/Hip4TxexamplesChapter";

const HIP4_CHAPTER_COMPONENTS: Record<Hip4Slug, ComponentType> = {
  home: Hip4HomeChapter,
  overview: Hip4OverviewChapter,
  abi: Hip4AbiChapter,
  events: Hip4EventsChapter,
  reverts: Hip4RevertsChapter,
  markets: Hip4MarketsChapter,
  mechanics: Hip4MechanicsChapter,
  bridge: Hip4BridgeChapter,
  txexamples: Hip4TxexamplesChapter,
  storage: Hip4StorageChapter,
  docs: Hip4DocsChapter,
};

export function Hip4ChapterRouter({ slug }: { slug: Hip4Slug }) {
  const Component = HIP4_CHAPTER_COMPONENTS[slug];
  return <Component />;
}

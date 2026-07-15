import Link from "next/link";
import {
  Hip4ChapterShell,
  Hip4DocList,
  Hip4GlassPanel,
  Hip4SectionTitle,
} from "@/components/hip4/Hip4ChapterShell";
import { Hip4ChapterHubHeader } from "@/components/hip4/Hip4PageHeader";
import { Hip4ResearchTimeline } from "@/components/hip4/Hip4ResearchTimeline";

export function Hip4ResearchChapter() {
  return (
    <Hip4ChapterShell>
      <Hip4ChapterHubHeader
        title="Research timeline"
        subtitle={
          <p>Structured recap of the multi-day sprint and the public X thread list.</p>
        }
      />
      <Hip4GlassPanel>
        <Hip4SectionTitle>Sources</Hip4SectionTitle>
        <Hip4DocList className="text-xs">
          <li>
            <strong className="text-text-primary">Structured API blocks: </strong>
            <Link href="/hip4/info-api" className="text-brand hover:underline">
              Info endpoint
            </Link>
          </li>
        </Hip4DocList>
      </Hip4GlassPanel>
      <Hip4ResearchTimeline />
    </Hip4ChapterShell>
  );
}

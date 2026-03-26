import Link from "next/link";
import { Hip4ChapterShell, Hip4GlassPanel } from "@/components/hip4/Hip4ChapterShell";
import { Hip4ChapterHubHeader } from "@/components/hip4/Hip4PageHeader";
import { Hip4ResearchTimeline } from "@/components/hip4/Hip4ResearchTimeline";

export function Hip4ResearchChapter() {
  return (
    <Hip4ChapterShell>
      <Hip4ChapterHubHeader
        title="Research timeline"
        subtitle="Day-by-day notes and the public X thread archive. Full prose lives in the markdown reference."
      />
      <Hip4GlassPanel className="text-xs text-text-secondary">
        <p>
          Canonical write-up:{" "}
          <Link
            href="/hip4/HIP4-research-complete.md"
            className="text-brand-accent underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            HIP4-research-complete.md
          </Link>
        </p>
      </Hip4GlassPanel>
      <Hip4ResearchTimeline />
    </Hip4ChapterShell>
  );
}

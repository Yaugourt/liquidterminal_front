import Link from "next/link";
import {
  HIP4_RESEARCH_DAYS,
  HIP4_TWEET_ARCHIVE,
} from "@/lib/hip4/timeline-data";
import { Hip4GlassPanel, Hip4SectionTitle } from "@/components/hip4/Hip4ChapterShell";

export function Hip4ResearchTimeline() {
  return (
    <div className="space-y-8">
      <Hip4GlassPanel>
        <Hip4SectionTitle>Three-day sprint</Hip4SectionTitle>
        <ul className="space-y-6">
          {HIP4_RESEARCH_DAYS.map((day) => (
            <li key={day.id} className="border-l-2 border-brand-accent/40 pl-4">
              <div className="text-sm font-semibold text-white">{day.label}</div>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-text-secondary">
                {day.bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </Hip4GlassPanel>

      <Hip4GlassPanel>
        <Hip4SectionTitle>X archive (10 posts)</Hip4SectionTitle>
        <p className="mb-4 text-xs text-text-secondary">
          Same URL as a previous item usually means a thread continuation.
        </p>
        <ol className="space-y-4">
          {HIP4_TWEET_ARCHIVE.map((t) => (
            <li key={t.id} className="text-xs">
              <div className="font-semibold text-white">
                {t.url ? (
                  <Link
                    href={t.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-accent hover:underline"
                  >
                    {t.title}
                  </Link>
                ) : (
                  t.title
                )}
                {t.threadOf ? (
                  <span className="ml-2 font-normal text-text-muted">
                    (thread · see {t.threadOf})
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-text-secondary leading-relaxed">{t.excerpt}</p>
            </li>
          ))}
        </ol>
      </Hip4GlassPanel>
    </div>
  );
}

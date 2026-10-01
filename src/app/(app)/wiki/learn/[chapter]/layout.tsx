import type { Metadata } from "next";
import Link from "next/link";
import { CHAPTER_CATEGORY_MAP, chapterHref, slugify } from "@/components/wiki/hub/topics";
import education from "../../../../../../public/hyperliquid-education.json";
import { generateMetadata as buildMetadata } from "@/lib/seo";

/** Reverse the chapter slug back to its display title. */
function chapterTitle(slug: string): string | null {
  const match = Object.keys(CHAPTER_CATEGORY_MAP).find((title) => slugify(title) === slug);
  return match ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ chapter: string }>;
}): Promise<Metadata> {
  const { chapter } = await params;
  const title = chapterTitle(chapter);
  if (!title) return {};
  return buildMetadata({
    title: `${title} - Hyperliquid Wiki`,
    description: `Learn about ${title} on Hyperliquid: curated articles, official docs, threads and guides, ranked by community saves.`,
    image: "/og/wiki.png",
    path: `/wiki/learn/${chapter}`,
  });
}

interface EducationChapter {
  title: string;
  description?: string;
  subChapters?: { id: string; title: string; subtitle?: string }[];
}

/**
 * The chapter view renders on the client from a static JSON, so the HTML a
 * crawler gets had no heading and no text. The same chapter text is rendered
 * here, for crawlers and screen readers, from the same file.
 */
export default async function ChapterLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ chapter: string }>;
}) {
  const { chapter } = await params;
  const data = (education as { chapters: EducationChapter[] }).chapters.find((c) => slugify(c.title) === chapter);
  return (
    <>
      {children}
      {/* After the content: as first child it took the parent's space-y margin. */}
      {data ? (
        <div className="sr-only">
          <h1>{data.title} on Hyperliquid</h1>
          {(data.description ?? "").split(/\n\n+/).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          {data.subChapters?.length ? (
            <ul>
              {data.subChapters.map((s) => (
                <li key={s.id}>
                  <Link href={chapterHref(data.title, s.id)}>{s.subtitle ? `${s.title}: ${s.subtitle}` : s.title}</Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </>
  );
}

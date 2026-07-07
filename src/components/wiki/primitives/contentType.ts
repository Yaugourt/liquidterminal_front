import { FileText, MessageSquare, Video, Mic, BookMarked, type LucideIcon } from "lucide-react";

/**
 * Content type of a wiki resource. The backend has no `type` field yet, so
 * the type is DERIVED from the real URL (never invented): a display
 * affordance, not stored data. When the API gains a real type column, swap
 * `detectContentType` for the field and keep the badge/labels.
 */
export type ContentType = "article" | "thread" | "video" | "podcast" | "doc";

export interface ContentTypeMeta {
  label: string;
  icon: LucideIcon;
}

export const CONTENT_TYPE_META: Record<ContentType, ContentTypeMeta> = {
  article: { label: "Article", icon: FileText },
  thread: { label: "X thread", icon: MessageSquare },
  video: { label: "Video", icon: Video },
  podcast: { label: "Podcast", icon: Mic },
  doc: { label: "Official doc", icon: BookMarked },
};

/** Ordered list for filter tabs (matches the design council spec). */
export const CONTENT_TYPE_ORDER: ContentType[] = ["article", "thread", "video", "podcast", "doc"];

const DOC_HOSTS = ["gitbook.io", "gitbook.com", "docs.", "hyperliquid.gitbook.io"];
const VIDEO_HOSTS = ["youtube.com", "youtu.be", "vimeo.com"];
const PODCAST_HOSTS = ["spotify.com", "podcasts.apple.com", "anchor.fm", "pod.link"];

/** Best-effort content type from a resource URL. Defaults to "article". */
export function detectContentType(url: string): ContentType {
  let host = "";
  try {
    host = new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "article";
  }
  if (host === "x.com" || host === "twitter.com" || host === "nitter.net") return "thread";
  if (VIDEO_HOSTS.some((h) => host.includes(h))) return "video";
  if (PODCAST_HOSTS.some((h) => host.includes(h))) return "podcast";
  if (DOC_HOSTS.some((h) => host.includes(h))) return "doc";
  return "article";
}

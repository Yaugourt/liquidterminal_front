"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { Loader2 } from "lucide-react";
import { getHip4Chapter, hip4ScriptsForSlug } from "@/lib/hip4-chapters";

function extractPageWrapperInner(html: string): string {
  if (typeof document === "undefined") return "";
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const wrapper = doc.querySelector(".page-wrapper");
  if (!wrapper) {
    return `<div class="text-amber-400/90 text-sm">Could not find .page-wrapper in HIP-4 HTML.</div>`;
  }
  wrapper.querySelector("nav.tabs-container")?.remove();
  return wrapper.innerHTML;
}

interface Hip4DocBodyProps {
  slug: string;
}

export function Hip4DocBody({ slug }: Hip4DocBodyProps) {
  const chapter = getHip4Chapter(slug);
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!chapter) return;
    let cancelled = false;
    setHtml(null);
    setError(null);
    const url = `/hip4/${chapter.file}`;
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
        return r.text();
      })
      .then((t) => {
        if (cancelled) return;
        setHtml(extractPageWrapperInner(t));
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load");
      });
    return () => {
      cancelled = true;
    };
  }, [chapter]);

  const scripts = chapter ? hip4ScriptsForSlug(slug) : [];

  if (!chapter) {
    return null;
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
        Failed to load HIP-4 page: {error}
      </div>
    );
  }

  if (html === null) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-zinc-400">
        <Loader2 className="h-8 w-8 animate-spin text-brand-accent" />
        <p className="text-sm">Loading HIP-4 documentation…</p>
      </div>
    );
  }

  return (
    <>
      {scripts.map((src) => (
        <Script key={src} src={src} strategy="afterInteractive" />
      ))}
      <div
        className="hip4-injected"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </>
  );
}

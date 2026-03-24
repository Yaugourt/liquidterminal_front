"use client";

import { useEffect, useRef, useState } from "react";
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
  const injectedRef = useRef<HTMLDivElement>(null);

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

  /** ABI tabs + V2 JSON: must re-bind after each inject (Strict Mode / client navigation). */
  useEffect(() => {
    if (slug !== "abi" || html === null) return;
    const root = injectedRef.current;
    if (!root) return;

    let cancelled = false;
    const preV2 = root.querySelector<HTMLPreElement>("#hip4-v2-abi-json");
    if (preV2?.textContent === "Loading…") {
      fetch("/hip4/HIP4Contest.v2.abi")
        .then((r) => {
          if (!r.ok) throw new Error(r.statusText);
          return r.text();
        })
        .then((text) => {
          if (cancelled) return;
          const pre = root.querySelector<HTMLPreElement>("#hip4-v2-abi-json");
          if (!pre) return;
          pre.textContent = JSON.stringify(JSON.parse(text), null, 2);
        })
        .catch((e: unknown) => {
          if (cancelled) return;
          const pre = root.querySelector<HTMLPreElement>("#hip4-v2-abi-json");
          if (pre) {
            pre.textContent =
              "Failed to load ABI: " +
              (e instanceof Error ? e.message : String(e));
          }
        });
    }

    const tabs = root.querySelectorAll<HTMLButtonElement>(".hip4-abi-tab");
    const panels = root.querySelectorAll<HTMLElement>(".hip4-abi-panel");

    function setVersion(v: string) {
      tabs.forEach((tab) => {
        const active = tab.getAttribute("data-version") === v;
        tab.classList.toggle("active", active);
        tab.setAttribute("aria-selected", active ? "true" : "false");
      });
      panels.forEach((panel) => {
        const match = panel.getAttribute("data-version") === v;
        panel.hidden = !match;
        panel.classList.toggle("hip4-abi-panel--active", match);
      });
    }

    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      const tab = target?.closest<HTMLButtonElement>(".hip4-abi-tab");
      if (!tab || !root.contains(tab)) return;
      e.preventDefault();
      const v = tab.getAttribute("data-version");
      if (v) setVersion(v);
    }

    root.addEventListener("click", onClick);
    setVersion("v1");

    return () => {
      cancelled = true;
      root.removeEventListener("click", onClick);
    };
  }, [slug, html]);

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
      <div
        ref={injectedRef}
        className="hip4-injected"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {scripts.map((src) => (
        <Script key={src} src={src} strategy="afterInteractive" />
      ))}
    </>
  );
}

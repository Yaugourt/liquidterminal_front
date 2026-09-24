"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useGlobalSearch } from "@/store/use-global-search";

const loadPalette = () => import("./GlobalSearchPalette").then((m) => m.GlobalSearchPalette);
const GlobalSearchPalette = dynamic(loadPalette, { ssr: false });

/**
 * Always-mounted shell for the Cmd+K palette. Owns the hotkeys and mounts the
 * palette (cmdk + name resolution + index) only once it's first opened, so
 * none of that ships in the app-shell bundle. The chunk is prefetched when the
 * browser goes idle so the first open stays instant.
 */
export function GlobalSearch() {
  const open = useGlobalSearch((s) => s.open);
  const toggle = useGlobalSearch((s) => s.toggle);
  const setOpen = useGlobalSearch((s) => s.setOpen);
  // Stays true after the first open: the palette keeps its loaded index and
  // its close animation.
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (open) setArmed(true);
  }, [open]);

  // Hotkeys: Cmd/Ctrl+K everywhere, "/" outside editable fields.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggle();
        return;
      }
      if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const target = e.target as HTMLElement | null;
        const editable =
          target &&
          (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
        if (!editable) {
          e.preventDefault();
          setOpen(true);
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggle, setOpen]);

  // Warm the chunk off the critical path.
  useEffect(() => {
    const prefetch = () => {
      void loadPalette().catch(() => {
        // Retried on first open.
      });
    };
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(prefetch, { timeout: 5_000 });
      return () => window.cancelIdleCallback(id);
    }
    const t = setTimeout(prefetch, 3_000);
    return () => clearTimeout(t);
  }, []);

  return armed ? <GlobalSearchPalette /> : null;
}

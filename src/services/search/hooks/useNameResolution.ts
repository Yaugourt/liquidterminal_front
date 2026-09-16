import { useEffect, useState } from "react";
import { isHlName, resolveHlName, type ResolvedName } from "../names";

const DEBOUNCE_MS = 300;

export type NameResolutionStatus = "idle" | "resolving" | "resolved" | "not-found" | "error";

export interface NameResolutionState {
  status: NameResolutionStatus;
  name: string;
  result: ResolvedName | null;
}

const IDLE: NameResolutionState = { status: "idle", name: "", result: null };

/**
 * Resolves the search query when it looks like a `.hl` / `.hype` name.
 * Debounced so typing "hyperfol" never fires a lookup; only a complete name does.
 */
export function useNameResolution(query: string): NameResolutionState {
  const [state, setState] = useState<NameResolutionState>(IDLE);
  const candidate = query.trim().toLowerCase();

  useEffect(() => {
    if (!isHlName(candidate)) {
      setState(IDLE);
      return undefined;
    }
    let cancelled = false;
    setState({ status: "resolving", name: candidate, result: null });
    const handle = setTimeout(() => {
      resolveHlName(candidate)
        .then((result) => {
          if (cancelled) return;
          setState({ status: result ? "resolved" : "not-found", name: candidate, result });
        })
        .catch(() => {
          if (!cancelled) setState({ status: "error", name: candidate, result: null });
        });
    }, DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [candidate]);

  return state;
}

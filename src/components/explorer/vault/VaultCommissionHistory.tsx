"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { BarChart2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/formatters/dateFormatting";
import { useDateFormat } from "@/store/date-format.store";
import type { IndexerVaultPortfolioEntry } from "@/services/explorer/vault/types";

interface VaultCommissionHistoryProps {
  /** From IndexerVaultDetailsData.portfolio — commission + follower history. */
  portfolio: IndexerVaultPortfolioEntry[] | undefined;
}

interface Change {
  time: number;
  prev: number;
  curr: number;
}

/**
 * Renders the leader-commission policy over time. Detects every change in
 * `leaderCommission` and shows one row per change ("Jan 2 · 0% → 5%"), plus
 * a top row for the inception value and a "current" tag on the latest.
 *
 * If the API returned an empty portfolio, render nothing — there's no
 * meaningful timeline to show.
 */
export function VaultCommissionHistory({ portfolio }: VaultCommissionHistoryProps) {
  const { format: dateFormat } = useDateFormat();

  const { changes, inception, current } = useMemo(() => {
    if (!portfolio || portfolio.length === 0) {
      return { changes: [] as Change[], inception: null, current: null };
    }
    // portfolio is newest-first per upstream — sort ascending by time.
    const chronological = [...portfolio].sort((a, b) => a.time - b.time);
    const inception = chronological[0];
    const current = chronological[chronological.length - 1];
    const changes: Change[] = [];
    for (let i = 1; i < chronological.length; i++) {
      const prev = chronological[i - 1].leaderCommission;
      const curr = chronological[i].leaderCommission;
      if (prev !== curr) {
        changes.push({ time: chronological[i].time, prev, curr });
      }
    }
    return { changes, inception, current };
  }, [portfolio]);

  if (!portfolio || portfolio.length === 0 || !inception || !current) return null;

  const stable = changes.length === 0;
  const tag = stable ? "stable" : `${changes.length} change${changes.length === 1 ? "" : "s"}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.35 }}
    >
      <Card className="flex flex-col overflow-hidden">
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle">
          <span className="w-6 h-6 rounded-md bg-brand/10 grid place-items-center shrink-0">
            <BarChart2 size={13} className="text-brand" />
          </span>
          <h3 className="text-[13px] font-semibold text-text-primary">Commission history</h3>
          <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface-2 text-text-tertiary border border-border-subtle">
            {tag}
          </span>
        </div>

        {stable ? (
          <div className="px-3.5 py-3 text-xs text-text-secondary">
            Commission stable at{" "}
            <span className="mono text-gold font-semibold">
              {(current.leaderCommission * 100).toFixed(0)}%
            </span>{" "}
            since inception.
          </div>
        ) : (
          <ol className="divide-y divide-border-subtle">
            <TimelineRow
              date={formatDate(inception.time, dateFormat)}
              tag="inception"
              value={inception.leaderCommission}
            />
            {changes.map((c) => (
              <TimelineRow
                key={c.time}
                date={formatDate(c.time, dateFormat)}
                prev={c.prev}
                value={c.curr}
              />
            ))}
            <TimelineRow
              date={formatDate(current.time, dateFormat)}
              tag="current"
              value={current.leaderCommission}
              tagAccent
            />
          </ol>
        )}
      </Card>
    </motion.div>
  );
}

interface TimelineRowProps {
  date: string;
  /** Older value (renders "X% → Y%" when set). */
  prev?: number;
  /** Newer / current / inception value. */
  value: number;
  /** Side label ("inception" / "current"). */
  tag?: string;
  /** When true the tag is rendered in success color. */
  tagAccent?: boolean;
}

function TimelineRow({ date, prev, value, tag, tagAccent }: TimelineRowProps) {
  const valuePercent = (value * 100).toFixed(0);
  return (
    <li className="flex items-center gap-3 px-3.5 py-2 text-xs">
      <span className="text-text-tertiary w-24 shrink-0">{date}</span>
      {prev !== undefined && (
        <>
          <span className="mono text-text-tertiary line-through">
            {(prev * 100).toFixed(0)}%
          </span>
          <span className="text-text-tertiary">→</span>
        </>
      )}
      <span className="mono text-gold font-semibold">{valuePercent}%</span>
      {tag && (
        <span
          className={`ml-auto text-[10px] font-semibold ${
            tagAccent ? "text-success" : "text-text-tertiary"
          }`}
        >
          {tag}
        </span>
      )}
    </li>
  );
}

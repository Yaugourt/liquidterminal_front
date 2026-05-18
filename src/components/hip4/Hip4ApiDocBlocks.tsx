"use client";

import { ChevronDown } from "lucide-react";
import { Hip4CodeBlock } from "@/components/hip4/Hip4CodeBlock";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type {
  Hip4RestEndpointSpec,
  Hip4WsExampleSpec,
  Hip4ApiHeaderRow,
  Hip4ApiBodyFieldRow,
} from "@/lib/hip4/api-info-spec";
import { TypedDataTable, type Column } from "@/components/common";

function RequiredStar() {
  return <span className="ml-0.5 text-gold">*</span>;
}

const HEADER_COLUMNS: Column<Hip4ApiHeaderRow>[] = [
  {
    key: "name",
    header: "Name",
    accessor: (h) => (
      <span className="font-mono text-[11px] text-table-cell">
        {h.name}
        {h.required ? <RequiredStar /> : null}
      </span>
    ),
  },
  {
    key: "value",
    header: "Value",
    accessor: (h) => (
      <span className="text-table-cell text-text-secondary">{h.value}</span>
    ),
  },
];

const BODY_COLUMNS: Column<Hip4ApiBodyFieldRow>[] = [
  {
    key: "name",
    header: "Name",
    accessor: (f) => (
      <span className="font-mono text-[11px] text-table-cell">
        {f.name}
        {f.required ? <RequiredStar /> : null}
      </span>
    ),
  },
  {
    key: "type",
    header: "Type",
    accessor: (f) => (
      <span className="text-table-cell text-text-secondary">{f.type}</span>
    ),
  },
  {
    key: "description",
    header: "Description",
    accessor: (f) => (
      <span className="text-table-cell text-text-secondary">{f.description}</span>
    ),
  },
];

export function Hip4ApiRestEndpointDoc({ spec }: { spec: Hip4RestEndpointSpec }) {
  const defaultTab = spec.responseTabs[0]?.id ?? "200";

  return (
    <section id={spec.id} className="scroll-mt-28">
      <h2 className="font-inter text-base font-semibold text-text-primary sm:text-lg">{spec.title}</h2>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-b border-border-subtle pb-4">
        <span className="rounded-md bg-emerald-500/20 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-400">
          {spec.method}
        </span>
        <code className="break-all font-mono text-xs text-brand sm:text-sm">{spec.url}</code>
      </div>

      {spec.intro ? (
        <p className="mt-3 text-xs leading-relaxed text-text-secondary">{spec.intro}</p>
      ) : null}

      <h3 className="mt-6 text-xs font-bold uppercase tracking-wider text-text-secondary">
        Headers
      </h3>
      <div className="mt-2">
        <TypedDataTable<Hip4ApiHeaderRow>
          data={spec.headers}
          columns={HEADER_COLUMNS}
          getRowKey={(h) => h.name}
          density="compact"
        />
      </div>

      <h3 className="mt-6 text-xs font-bold uppercase tracking-wider text-text-secondary">Body</h3>
      <div className="mt-2">
        <TypedDataTable<Hip4ApiBodyFieldRow>
          data={spec.bodyFields}
          columns={BODY_COLUMNS}
          getRowKey={(f) => f.name}
          density="compact"
        />
      </div>

      <details className="group mt-4 rounded-lg border border-border-subtle bg-brand-primary/30">
        <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2.5 text-xs font-semibold text-text-secondary hover:text-text-primary [&::-webkit-details-marker]:hidden">
          <ChevronDown className="h-4 w-4 shrink-0 text-text-tertiary transition-transform group-open:rotate-180" />
          Example request
        </summary>
        <div className="border-t border-border-subtle px-3 pb-3 pt-1">
          <Hip4CodeBlock className="mt-2">{spec.exampleRequestJson}</Hip4CodeBlock>
        </div>
      </details>

      <h3 className="mt-6 text-xs font-bold uppercase tracking-wider text-text-secondary">
        Response
      </h3>
      <Tabs defaultValue={defaultTab} className="mt-2">
        <TabsList
          className={cn(
            "h-auto flex-wrap justify-start gap-1 rounded-lg border border-border-subtle bg-surface/60 p-1"
          )}
        >
          {spec.responseTabs.map((t) => (
            <TabsTrigger
              key={t.id}
              value={t.id}
              className="max-w-full rounded-md px-2 py-1.5 text-left text-[10px] leading-tight text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 data-[state=active]:bg-gold/20 data-[state=active]:text-gold data-[state=active]:shadow-none sm:px-3 sm:text-xs"
            >
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {spec.responseTabs.map((t) => (
          <TabsContent key={t.id} value={t.id} className="mt-2">
            <Hip4CodeBlock>{t.body}</Hip4CodeBlock>
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
}

export function Hip4ApiWsEndpointDoc({ spec }: { spec: Hip4WsExampleSpec }) {
  const defaultTab = spec.responseTabs[0]?.id ?? "push";

  return (
    <section id={spec.id} className="scroll-mt-28">
      <h2 className="font-inter text-base font-semibold text-text-primary sm:text-lg">{spec.title}</h2>
      <div className="mt-4 flex flex-wrap items-center gap-2 border-b border-border-subtle pb-4">
        <span className="rounded-md bg-gold/15 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-gold">
          WebSocket
        </span>
        <code className="break-all font-mono text-xs text-brand sm:text-sm">{spec.url}</code>
      </div>
      {spec.intro ? (
        <p className="mt-3 text-xs leading-relaxed text-text-secondary">{spec.intro}</p>
      ) : null}

      <h3 className="mt-6 text-xs font-bold uppercase tracking-wider text-text-secondary">
        Subscribe (example)
      </h3>
      <p className="mt-1 text-[11px] text-text-tertiary">
        Shape follows Hyperliquid WS patterns; verify against the latest official WS docs if your
        client fails to bind.
      </p>
      <Hip4CodeBlock className="mt-2">{spec.subscriptionExample}</Hip4CodeBlock>

      <h3 className="mt-6 text-xs font-bold uppercase tracking-wider text-text-secondary">
        Response
      </h3>
      <Tabs defaultValue={defaultTab} className="mt-2">
        <TabsList className="h-auto flex-wrap justify-start gap-1 rounded-lg border border-border-subtle bg-surface/60 p-1">
          {spec.responseTabs.map((t) => (
            <TabsTrigger
              key={t.id}
              value={t.id}
              className="max-w-full rounded-md px-2 py-1.5 text-left text-[10px] leading-tight text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 data-[state=active]:bg-gold/20 data-[state=active]:text-gold data-[state=active]:shadow-none sm:px-3 sm:text-xs"
            >
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {spec.responseTabs.map((t) => (
          <TabsContent key={t.id} value={t.id} className="mt-2">
            <Hip4CodeBlock>{t.body}</Hip4CodeBlock>
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
}

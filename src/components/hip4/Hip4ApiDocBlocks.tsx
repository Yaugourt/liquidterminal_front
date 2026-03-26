"use client";

import { Hip4CodeBlock } from "@/components/hip4/Hip4CodeBlock";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type {
  Hip4RestEndpointSpec,
  Hip4WsExampleSpec,
} from "@/lib/hip4/api-info-spec";

function RequiredStar() {
  return <span className="ml-0.5 text-brand-gold">*</span>;
}

export function Hip4ApiRestEndpointDoc({ spec }: { spec: Hip4RestEndpointSpec }) {
  const defaultTab = spec.responseTabs[0]?.id ?? "200";

  return (
    <section
      id={spec.id}
      className="scroll-mt-28 border-b border-border-subtle pb-10 last:border-0 last:pb-0"
    >
      <h2 className="font-outfit text-base font-semibold text-white sm:text-lg">{spec.title}</h2>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-emerald-500/20 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-400">
          {spec.method}
        </span>
        <code className="break-all font-mono text-xs text-brand-accent sm:text-sm">{spec.url}</code>
      </div>

      {spec.intro ? (
        <p className="mt-3 text-xs leading-relaxed text-text-secondary">{spec.intro}</p>
      ) : null}

      <h3 className="mt-6 text-xs font-bold uppercase tracking-wider text-text-secondary">
        Headers
      </h3>
      <div className="mt-2 overflow-x-auto rounded-lg border border-border-subtle">
        <Table>
          <TableHeader>
            <TableRow className="border-border-subtle hover:bg-transparent">
              <TableHead className="text-table-header">Name</TableHead>
              <TableHead className="text-table-header">Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {spec.headers.map((h) => (
              <TableRow key={h.name} className="border-border-subtle">
                <TableCell className="font-mono text-[11px] text-table-cell">
                  {h.name}
                  {h.required ? <RequiredStar /> : null}
                </TableCell>
                <TableCell className="text-table-cell text-text-secondary">{h.value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <h3 className="mt-6 text-xs font-bold uppercase tracking-wider text-text-secondary">
        Request body
      </h3>
      <div className="mt-2 overflow-x-auto rounded-lg border border-border-subtle">
        <Table>
          <TableHeader>
            <TableRow className="border-border-subtle hover:bg-transparent">
              <TableHead className="text-table-header">Name</TableHead>
              <TableHead className="text-table-header">Type</TableHead>
              <TableHead className="text-table-header">Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {spec.bodyFields.map((f) => (
              <TableRow key={f.name} className="border-border-subtle">
                <TableCell className="font-mono text-[11px] text-table-cell">
                  {f.name}
                  {f.required ? <RequiredStar /> : null}
                </TableCell>
                <TableCell className="text-table-cell text-text-secondary">{f.type}</TableCell>
                <TableCell className="text-table-cell text-text-secondary">{f.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <h3 className="mt-6 text-xs font-bold uppercase tracking-wider text-text-secondary">
        Example request
      </h3>
      <Hip4CodeBlock className="mt-2">{spec.exampleRequestJson}</Hip4CodeBlock>

      <h3 className="mt-6 text-xs font-bold uppercase tracking-wider text-text-secondary">
        Response
      </h3>
      <Tabs defaultValue={defaultTab} className="mt-2">
        <TabsList
          className={cn(
            "h-auto flex-wrap justify-start gap-1 rounded-lg border border-border-subtle bg-brand-secondary/60 p-1"
          )}
        >
          {spec.responseTabs.map((t) => (
            <TabsTrigger
              key={t.id}
              value={t.id}
              className="rounded-md px-3 py-1.5 text-xs text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/40 data-[state=active]:bg-brand-gold/20 data-[state=active]:text-brand-gold data-[state=active]:shadow-none"
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
    <section
      id={spec.id}
      className="scroll-mt-28 border-b border-border-subtle pb-10 last:border-0 last:pb-0"
    >
      <h2 className="font-outfit text-base font-semibold text-white sm:text-lg">{spec.title}</h2>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-brand-gold/15 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-brand-gold">
          WebSocket
        </span>
        <code className="break-all font-mono text-xs text-brand-accent sm:text-sm">{spec.url}</code>
      </div>
      {spec.intro ? (
        <p className="mt-3 text-xs leading-relaxed text-text-secondary">{spec.intro}</p>
      ) : null}

      <h3 className="mt-6 text-xs font-bold uppercase tracking-wider text-text-secondary">
        Subscribe (example)
      </h3>
      <p className="mt-1 text-[11px] text-text-muted">
        Shape follows Hyperliquid WS patterns; verify against the latest official WS docs if your
        client fails to bind.
      </p>
      <Hip4CodeBlock className="mt-2">{spec.subscriptionExample}</Hip4CodeBlock>

      <h3 className="mt-6 text-xs font-bold uppercase tracking-wider text-text-secondary">
        Example message
      </h3>
      <Tabs defaultValue={defaultTab} className="mt-2">
        <TabsList className="h-auto flex-wrap justify-start gap-1 rounded-lg border border-border-subtle bg-brand-secondary/60 p-1">
          {spec.responseTabs.map((t) => (
            <TabsTrigger
              key={t.id}
              value={t.id}
              className="rounded-md px-3 py-1.5 text-xs text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/40 data-[state=active]:bg-brand-gold/20 data-[state=active]:text-brand-gold data-[state=active]:shadow-none"
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

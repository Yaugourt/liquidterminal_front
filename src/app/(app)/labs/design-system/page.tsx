"use client";

/**
 * Design-system catalogue (dev-only, gated by the /labs layout).
 *
 * Renders the REAL consolidated primitives with deterministic fixtures — no
 * market endpoints, no auth, no wallet. Each case maps to `decisions.json`
 * (04-CATALOGUE-ET-CONTROLES): it proves a contract, it is not a page template
 * to copy. Reconstructing a component's CSS here is forbidden; import the real
 * one and feed it props.
 */

import { useState, type ReactNode } from "react";
import { Activity, BarChart3, Layers } from "lucide-react";
import {
  CardHeading,
  TimeframeTabs,
  ModuleTable,
  ModuleTableRow,
  Num,
  type ModuleColumn,
} from "@/components/common";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PillTabs } from "@/components/ui/pill-tabs";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import type { Timeframe } from "@/lib/timeframe";

/* -- shell ------------------------------------------------------------- */

function Case({
  id,
  name,
  spec,
  children,
}: {
  id: string;
  name: string;
  spec: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="mono text-[10px] uppercase tracking-[0.08em] text-brand">{id}</span>
          <h2 className="text-[15px] font-semibold text-text-primary">{name}</h2>
        </div>
        <p className="text-[12px] text-text-secondary max-w-2xl leading-relaxed">{spec}</p>
      </div>
      <div className="rounded-lg border border-border-subtle bg-base/40 p-4">{children}</div>
    </section>
  );
}

const brandIcon = (node: ReactNode) => <span className="text-brand">{node}</span>;

/* -- fixtures ---------------------------------------------------------- */

const TABLE_COLS: ModuleColumn[] = [
  { header: "Market", align: "left", width: "1fr" },
  { header: "Volume", align: "right" },
  { header: "OI", align: "right" },
];

const TABLE_ROWS = [
  ["HYPE-PERP", "$53.1M", "$10.6B"],
  ["BTC-PERP", "$23.0M", "$4.9B"],
  ["ETH-PERP", "$15.1M", "$2.1B"],
];

/* -- page -------------------------------------------------------------- */

export default function DesignSystemCatalogue() {
  const [panel, setPanel] = useState("overview");
  const [pill, setPill] = useState("volume");
  const [text, setText] = useState("perp");
  const [tf, setTf] = useState<Timeframe>("7d");

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      <header className="space-y-1.5">
        <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-text-primary">
          Design system
        </h1>
        <p className="text-[13px] text-text-secondary">
          Live catalogue of the consolidated primitives. Dev-only. Each case proves one
          contract from the design authority, with deterministic fixtures.
        </p>
      </header>

      {/* 1. heading-basic */}
      <Case
        id="heading-basic"
        name="Card heading — basic"
        spec="Title alone, then icon + meta + status. No empty slot when a part is absent; same anatomy either way. The head renders a ready status node — it never fetches."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Card>
            <CardHeading title="Network overview" />
          </Card>
          <Card>
            <CardHeading
              title="Network overview"
              icon={brandIcon(<Activity size={14} />)}
              meta="24h"
              status={<span className="mono text-[10px] text-success">● live</span>}
            />
          </Card>
        </div>
      </Case>

      {/* 2. heading-pressure */}
      <Case
        id="heading-pressure"
        name="Card heading — under pressure"
        spec="Long title, status and two labelled actions. Actions stay reachable and wrap to a second line instead of overlapping the title; tab order matches visual order."
      >
        <Card>
          <CardHeading
            title="HIP-3 builder-deployed perp DEX volume and open interest"
            icon={brandIcon(<Layers size={14} />)}
            status={<span className="mono text-[10px] text-success">● live</span>}
            actions={
              <>
                <Button size="sm" variant="ghostBrand">Export</Button>
                <Button size="sm" variant="outline">Filters</Button>
              </>
            }
          />
        </Card>
      </Case>

      {/* 3. card-density */}
      <Case
        id="card-density"
        name="Card density — inherited"
        spec="Density chosen once on the Card is read by its sections. compact / comfortable / historical consumer (no density → historical default) / explicit section override. No double padding."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Card density="compact">
            <CardHeader><CardTitle className="text-[13px]">compact</CardTitle></CardHeader>
            <CardContent className="text-[12px] text-text-secondary">Sections inherit p-3.5.</CardContent>
          </Card>
          <Card density="comfortable">
            <CardHeader><CardTitle className="text-[13px]">comfortable</CardTitle></CardHeader>
            <CardContent className="text-[12px] text-text-secondary">Sections inherit p-6.</CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-[13px]">historical (no density)</CardTitle></CardHeader>
            <CardContent className="text-[12px] text-text-secondary">Falls back to comfortable, unchanged.</CardContent>
          </Card>
          <Card density="compact">
            <CardHeader><CardTitle className="text-[13px]">override</CardTitle></CardHeader>
            <CardContent density="comfortable" className="text-[12px] text-text-secondary">
              Card is compact; this section overrides to comfortable.
            </CardContent>
          </Card>
        </div>
      </Case>

      {/* 4. card-flush */}
      <Case
        id="card-flush"
        name="Card content — flush"
        spec="A table owns its own margins via the flush body; borders and separators stay coherent, no p-0 needed in the page. Compare with an ordinary padded body."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Card>
            <CardHeading title="Flush body (table)" icon={brandIcon(<BarChart3 size={14} />)} />
            <CardContent flush>
              <ModuleTable columns={TABLE_COLS} density="compact">
                {TABLE_ROWS.map((r, i) => (
                  <ModuleTableRow
                    key={i}
                    cells={[
                      <span key="m" className="text-[12px] font-medium text-text-primary">{r[0]}</span>,
                      <span key="v" className="mono text-[12px] text-text-primary">{r[1]}</span>,
                      <span key="o" className="mono text-[12px] text-text-primary">{r[2]}</span>,
                    ]}
                  />
                ))}
              </ModuleTable>
            </CardContent>
          </Card>
          <Card>
            <CardHeading title="Padded body (prose)" icon={brandIcon(<BarChart3 size={14} />)} />
            <CardContent density="compact" className="text-[12px] text-text-secondary">
              Ordinary content keeps its padding; the body is not flush.
            </CardContent>
          </Card>
        </div>
      </Case>

      {/* 5. tabs-panels */}
      <Case
        id="tabs-panels"
        name="Tabs — panels (Radix)"
        spec="Content tabs use Radix for the accessible tab/panel relationship, keyboard and visible focus. Tab through to see the shared focus ring."
      >
        <Tabs value={panel} onValueChange={setPanel}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="markets">Markets</TabsTrigger>
            <TabsTrigger value="builders">Builders</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="text-[12px] text-text-secondary">
            Overview panel — associated to its tab.
          </TabsContent>
          <TabsContent value="markets" className="text-[12px] text-text-secondary">
            Markets panel.
          </TabsContent>
          <TabsContent value="builders" className="text-[12px] text-text-secondary">
            Builders panel.
          </TabsContent>
        </Tabs>
      </Case>

      {/* 6. period-selection */}
      <Case
        id="period-selection"
        name="Selection — period"
        spec="Period choices are a selection group, not a tab panel. TimeframeTabs and PillTabs (pill / text) announce the active choice, submit nothing, and keep a narrow strip contained. Same focus ring as the tabs."
      >
        <div className="flex flex-wrap items-center gap-6">
          <TimeframeTabs
            options={["24h", "7d", "30d", "90d"]}
            value={tf}
            onChange={setTf}
          />
          <PillTabs
            tabs={[
              { value: "volume", label: "Volume" },
              { value: "oi", label: "OI" },
              { value: "fees", label: "Fees" },
            ]}
            activeTab={pill}
            onTabChange={setPill}
          />
          <PillTabs
            variant="text"
            tabs={[
              { value: "perp", label: "Perp" },
              { value: "spot", label: "Spot" },
            ]}
            activeTab={text}
            onTabChange={setText}
          />
        </div>
      </Case>

      {/* 7. state-matrix */}
      <Case
        id="state-matrix"
        name="States — loading / empty / error / stale"
        spec="Distinct states, no fake zero, a useful action when one exists. Presentation and vocabulary are shared (2D will finish harmonizing them)."
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card><CardContent density="compact"><LoadingState message="Loading markets…" minHeight="120px" /></CardContent></Card>
          <Card><CardContent density="compact"><EmptyState title="No markets" description="No market in this window." minHeight="120px" /></CardContent></Card>
          <Card><CardContent density="compact"><ErrorState title="Failed to load" message="Upstream unavailable." onRetry={() => {}} minHeight="120px" /></CardContent></Card>
          <Card>
            <CardHeading title="Open interest" status={<span className="mono text-[10px] text-text-tertiary">updated 5m ago · stale</span>} />
            <CardContent density="compact"><Num value={10.6} format="raw" className="text-[20px] font-semibold" />
              <span className="text-[12px] text-text-tertiary"> B (last known)</span>
            </CardContent>
          </Card>
        </div>
      </Case>

      {/* 8. type-and-actions */}
      <Case
        id="type-and-actions"
        name="Type and actions"
        spec="Values, units, labels, buttons and focus follow the charter: 13px/600 titles, 12px secondary labels, tabular mono numbers, one verified fg/bg couple per button variant."
      >
        <div className="space-y-4">
          <div className="flex flex-wrap gap-6">
            {[
              { label: "Volume 24h", value: 53.1, unit: "M" },
              { label: "Open interest", value: 10.6, unit: "B" },
              { label: "Active traders", value: 12840, unit: "" },
            ].map((s) => (
              <div key={s.label} className="space-y-1">
                <div className="text-[10.5px] uppercase tracking-[0.06em] text-text-tertiary font-semibold">{s.label}</div>
                <div className="flex items-baseline gap-1">
                  <Num value={s.value} format="raw" className="mono text-[20px] font-semibold text-text-primary tracking-[-0.02em]" />
                  {s.unit && <span className="text-[12px] text-text-secondary">{s.unit}</span>}
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="ghostBrand" size="sm">Primary action</Button>
            <Button variant="outline" size="sm">Secondary</Button>
            <Button variant="ghost" size="sm">Tertiary</Button>
          </div>
        </div>
      </Case>

      {/* 9. free-composition */}
      <Case
        id="free-composition"
        name="Free composition"
        spec="The same blocks in two orders and proportions. Component identity stays intact without any imposed page template — the page decides order and width, the primitives decide look."
      >
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-[2fr_1fr]">
            <Card><CardHeading title="Chart first" icon={brandIcon(<BarChart3 size={14} />)} meta="wide" /><CardContent density="compact" className="text-[12px] text-text-secondary h-20 grid place-items-center">chart slot</CardContent></Card>
            <Card><CardHeading title="Context" /><CardContent density="compact" className="text-[12px] text-text-secondary">side panel</CardContent></Card>
          </div>
          <div className="grid gap-3 md:grid-cols-[1fr_2fr]">
            <Card><CardHeading title="Context" /><CardContent density="compact" className="text-[12px] text-text-secondary">side panel</CardContent></Card>
            <Card><CardHeading title="Chart second" icon={brandIcon(<BarChart3 size={14} />)} meta="wide" /><CardContent density="compact" className="text-[12px] text-text-secondary h-20 grid place-items-center">chart slot</CardContent></Card>
          </div>
        </div>
      </Case>
    </div>
  );
}

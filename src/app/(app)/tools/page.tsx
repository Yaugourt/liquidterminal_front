import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/common";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { NETWORKS, type NetworkId } from "@/lib/networks";
import { toolsFor, type ToolItem } from "@/lib/sidebar-config";
import { cn } from "@/lib/utils";

/** Networks in the order the page lists them: where most visitors come for tools first. */
const SECTIONS: NetworkId[] = ["elysium", "hyperliquid"];

function ToolCard({ tool }: { tool: ToolItem }) {
  const Icon = tool.IconComponent;
  return (
    <Link href={tool.href} className="focus-ring group block rounded-lg">
      <Card padding="md" className="flex h-full flex-col gap-2.5">
        <span className="grid h-8 w-8 place-items-center rounded-md border border-brand/30 bg-brand/10">
          <Icon className="h-4 w-4 text-brand" />
        </span>
        <span className="text-[14px] font-semibold text-text-primary">{tool.name}</span>
        <span className="text-[12.5px] leading-relaxed text-text-secondary">{tool.description}</span>
        <span className="mt-auto inline-flex items-center gap-1 pt-1 text-[12px] font-medium text-brand">
          Open
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </Card>
    </Link>
  );
}

/** Every tool of both networks, grouped by network. Source of truth: TOOLS in sidebar-config. */
export default function ToolsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Tools"
        titleQualifier="for Hyperliquid and Elysium"
        description="Simulate, decode, track, export and share. Free, nothing to install, nothing signed unless you choose to."
      />
      {SECTIONS.map((id) => {
        const network = NETWORKS[id];
        return (
          <section key={id} className="space-y-3" aria-labelledby={`tools-${id}`}>
            <div className="flex items-center gap-2">
              <span className={cn("h-1.5 w-1.5 rounded-full", id === "elysium" ? "bg-warning" : "bg-success")} />
              <h2 id={`tools-${id}`} className="text-[12px] font-semibold uppercase tracking-[0.1em] text-text-secondary">
                {network.label}
              </h2>
              <StatusBadge variant={id === "elysium" ? "warning" : "default"}>{network.status}</StatusBadge>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {toolsFor(id).map((tool) => (
                <ToolCard key={tool.href} tool={tool} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

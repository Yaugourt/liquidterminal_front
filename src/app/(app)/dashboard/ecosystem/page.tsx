"use client";

import { ProjectsRecap } from "@/components/dashboard/ecosystem/ProjectsRecap";
import { WikiRecap } from "@/components/dashboard/ecosystem/WikiRecap";
import { SectionHead } from "@/components/dashboard/SectionHead";

/**
 * Dashboard · Ecosystem — who is building here and what to read about it.
 *
 * The two curated contents of the terminal share this scope: DefiLlama has
 * been powering /ecosystem/project for a while without ever surfacing on the
 * dashboard, and the wiki had no presence there at all.
 */
export default function DashboardEcosystem() {
  return (
    <div className="space-y-8">
      <section className="space-y-2.5">
        <SectionHead
          title="Projects"
          subtitle="Live fundamentals on Hyperliquid, via DefiLlama"
          linkLabel="All projects →"
          linkHref="/ecosystem/project"
        />
        <ProjectsRecap />
      </section>

      <section className="space-y-2.5">
        <SectionHead
          title="Learn"
          subtitle="Most saved articles · public read lists · topics"
          linkLabel="Open wiki →"
          linkHref="/wiki"
        />
        <WikiRecap />
      </section>
    </div>
  );
}

import { Metadata } from "next";
import { generateMetadata as buildMetadata } from "@/lib/seo";
import { env } from "@/lib/env";
import { JsonLd, breadcrumbSchema } from "@/components/JsonLd";

interface ApiProject {
  title?: string;
  desc?: string;
}

/** The page itself is client-rendered; this fetch only feeds metadata. */
async function fetchProjectMeta(id: string): Promise<ApiProject | null> {
  try {
    const res = await fetch(`${env.NEXT_PUBLIC_API}/project/${id}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const body: unknown = await res.json();
    const record =
      body && typeof body === "object" && "data" in body
        ? (body as { data: unknown }).data
        : body;
    const project = record as ApiProject | null;
    return project && typeof project.title === "string" ? project : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const project = /^\d+$/.test(id) ? await fetchProjectMeta(id) : null;
  if (!project?.title) {
    return buildMetadata({
      title: "Hyperliquid Ecosystem Project",
      description:
        "Project profile in the Hyperliquid ecosystem directory: TVL, fees, volume, category and links.",
      path: `/ecosystem/project/${id}`,
    });
  }
  const intro = (project.desc ?? "").replace(/\s+/g, " ").trim();
  const description = (
    intro
      ? `${project.title} on Hyperliquid: ${intro}`
      : `${project.title} profile in the Hyperliquid ecosystem directory: TVL, fees, volume, category rank and links.`
  ).slice(0, 158);
  return buildMetadata({
    title: `${project.title} - Hyperliquid Ecosystem`,
    description,
    keywords: [project.title, "Hyperliquid ecosystem", "Hyperliquid project", "DeFi"],
    path: `/ecosystem/project/${id}`,
  });
}

export default async function ProjectDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // Same URL as generateMetadata: Next dedupes the fetch within the render.
  const project = /^\d+$/.test(id) ? await fetchProjectMeta(id) : null;
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Liquid Terminal", path: "" },
          { name: "Ecosystem projects", path: "/ecosystem/project" },
          { name: project?.title ?? `Project ${id}`, path: `/ecosystem/project/${id}` },
        ])}
      />
      {children}
    </>
  );
}

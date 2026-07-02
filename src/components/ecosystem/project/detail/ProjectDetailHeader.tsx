"use client";

import { useState } from "react";
import Image from "next/image";
import { Globe, MessageCircle, Send } from "lucide-react";
import { Project } from "@/services/ecosystem/project/types";

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

interface ProjectDetailHeaderProps {
  project: Project;
  updatedAt?: number;
}

export function ProjectDetailHeader({ project, updatedAt }: ProjectDetailHeaderProps) {
  const [imageError, setImageError] = useState(false);

  const socialLinks = [
    { url: project.twitter, IconComponent: XIcon, label: "X / Twitter" },
    { url: project.discord, IconComponent: MessageCircle, label: "Discord" },
    { url: project.telegram, IconComponent: Send, label: "Telegram" },
  ].filter((link) => link.url);

  const updatedLabel =
    updatedAt != null
      ? `updated ${new Date(updatedAt).toLocaleString("en-US", { hour: "2-digit", minute: "2-digit" })}`
      : null;

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-3.5 min-w-0">
        <div className="relative w-12 h-12 shrink-0">
          {!imageError && project.logo ? (
            <Image
              src={project.logo}
              alt={project.title}
              fill
              className="rounded-lg object-cover border border-border-subtle"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full rounded-lg bg-surface-2 border border-border-subtle grid place-items-center">
              <span className="text-text-secondary text-base font-semibold">
                {project.title.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        <div className="min-w-0 space-y-1.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="font-inter text-2xl sm:text-[28px] font-semibold tracking-tight leading-none text-text-primary">
              {project.title}
            </h1>
            {project.token && <span className="mono text-[12px] text-text-tertiary">${project.token}</span>}
          </div>
          <p className="text-sm text-text-secondary max-w-xl">{project.desc}</p>
          <div className="flex items-center gap-2 pt-0.5 flex-wrap">
            {project.categories?.map((category) => (
              <span
                key={category.id}
                className="text-[11px] px-2 py-0.5 rounded-md bg-surface-2 border border-border-subtle text-text-secondary"
              >
                {category.name}
              </span>
            ))}
            {updatedLabel && <span className="text-[11px] text-text-tertiary ml-1">{updatedLabel}</span>}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:shrink-0">
        {socialLinks.map((link, index) => (
          <a
            key={index}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.label}
            className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-border-default bg-surface-2 text-text-secondary hover:text-text-primary transition-colors"
          >
            <link.IconComponent />
          </a>
        ))}
        {project.website && (
          <a
            href={project.website}
            target="_blank"
            rel="noopener noreferrer"
            className="h-8 gap-1.5 text-xs font-semibold inline-flex items-center px-3 rounded-md bg-brand text-brand-text-on hover:bg-brand/90 transition-colors"
          >
            <Globe className="w-3.5 h-3.5" />
            Visit
          </a>
        )}
      </div>
    </header>
  );
}

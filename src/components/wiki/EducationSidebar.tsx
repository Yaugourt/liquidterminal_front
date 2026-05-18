"use client";

import { FileText, Twitter, Globe, MessageCircle, Send, Github, Layers, Copy, Check } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";

interface EducationSidebarProps {
  info: {
    title: string;
    description?: string;
    colors: string[];
    creator?: string;
    consensus?: string;
    executionLayer?: string;
    foundationCreation?: string;
    mainnetLaunch?: string;
    links: {
      whitepaperLink?: string;
      websiteLink?: string;
      appLink?: string;
      documentationLink?: string;
      twitterLink?: string;
      twitterFoundationLink?: string;
      discordLink?: string;
      telegramLink?: string;
      githubLink?: string;
    };
  };
}

export function EducationSidebar({ info }: EducationSidebarProps) {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedColor(text);
      setTimeout(() => setCopiedColor(null), 2000);
          } catch {
        // Error handled silently
      }
  };

  return (
    <Card padding="lg">
      <div className="space-y-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Image
              src="https://app.hyperliquid.xyz/coins/HYPE_USDC.svg"
              alt="HyperLiquid Logo"
              width={20}
              height={20}
              className="flex-shrink-0"
            />
            <h2 className="text-base font-bold text-text-primary">{info.title}</h2>
          </div>
          {info.description && (
            <p className="text-xs text-text-secondary mb-3">{info.description}</p>
          )}
        </div>

        <div className="space-y-2 pt-3 border-t border-border-subtle">
          {info.creator && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-text-tertiary">Creator</span>
              <span className="text-xs text-text-primary font-medium">{info.creator}</span>
            </div>
          )}

          {info.consensus && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-text-tertiary">Consensus</span>
              <span className="text-xs text-text-primary font-medium">{info.consensus}</span>
            </div>
          )}

          {info.executionLayer && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-text-tertiary">Execution Layer</span>
              <span className="text-xs text-text-primary font-medium">{info.executionLayer}</span>
            </div>
          )}

          {info.foundationCreation && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-text-tertiary">Foundation</span>
              <span className="text-xs text-text-primary font-medium">{info.foundationCreation}</span>
            </div>
          )}

          {info.mainnetLaunch && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-text-tertiary">Mainnet Launch</span>
              <span className="text-xs text-text-primary font-medium">{info.mainnetLaunch}</span>
            </div>
          )}

          {/* Color palette section */}
          <div className="space-y-2">
            <span className="text-xs text-text-tertiary">Brand Colors</span>
            <div className="grid grid-cols-2 gap-2">
              {info.colors.map((color, index) => (
                <button
                  key={index}
                  onClick={() => copyToClipboard(color)}
                  className="flex items-center gap-2 p-2 rounded-lg bg-base border border-border-subtle hover:border-border-default transition-colors group"
                >
                  <div 
                    className="w-3 h-3 rounded-full border border-white/20 flex-shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-xs text-text-primary flex-1 text-left">{color}</span>
                  {copiedColor === color ? (
                    <Check size={12} className="text-emerald-400" />
                  ) : (
                    <Copy size={12} className="text-gold opacity-60 group-hover:opacity-100 transition-all duration-200" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Links section */}
        <div className="pt-3 border-t border-border-subtle">
          <div className="grid grid-cols-2 gap-1">
            {info.links.whitepaperLink && (
              <a
                href={info.links.whitepaperLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 p-2 rounded-lg bg-base border border-border-subtle hover:border-border-default transition-colors group"
              >
                <FileText size={12} className="text-brand flex-shrink-0" />
                <span className="text-xs text-text-secondary truncate group-hover:text-text-primary">Whitepaper</span>
              </a>
            )}

            {info.links.websiteLink && (
              <a
                href={info.links.websiteLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 p-2 rounded-lg bg-base border border-border-subtle hover:border-border-default transition-colors group"
              >
                <Globe size={12} className="text-brand flex-shrink-0" />
                <span className="text-xs text-text-secondary truncate group-hover:text-text-primary">Website</span>
              </a>
            )}

            {info.links.appLink && (
              <a
                href={info.links.appLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 p-2 rounded-lg bg-base border border-border-subtle hover:border-border-default transition-colors group"
              >
                <Layers size={12} className="text-brand flex-shrink-0" />
                <span className="text-xs text-text-secondary truncate group-hover:text-text-primary">App</span>
              </a>
            )}

            {info.links.documentationLink && (
              <a
                href={info.links.documentationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 p-2 rounded-lg bg-base border border-border-subtle hover:border-border-default transition-colors group"
              >
                <FileText size={12} className="text-brand flex-shrink-0" />
                <span className="text-xs text-text-secondary truncate group-hover:text-text-primary">Documentation</span>
              </a>
            )}

            {info.links.twitterLink && (
              <a
                href={info.links.twitterLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 p-2 rounded-lg bg-base border border-border-subtle hover:border-border-default transition-colors group"
              >
                <Twitter size={12} className="text-brand flex-shrink-0" />
                <span className="text-xs text-text-secondary truncate group-hover:text-text-primary">X HyperLiquid</span>
              </a>
            )}

            {info.links.twitterFoundationLink && (
              <a
                href={info.links.twitterFoundationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 p-2 rounded-lg bg-base border border-border-subtle hover:border-border-default transition-colors group"
              >
                <Twitter size={12} className="text-brand flex-shrink-0" />
                <span className="text-xs text-text-secondary truncate group-hover:text-text-primary">X Foundation</span>
              </a>
            )}

            {info.links.discordLink && (
              <a
                href={info.links.discordLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 p-2 rounded-lg bg-base border border-border-subtle hover:border-border-default transition-colors group"
              >
                <MessageCircle size={12} className="text-brand flex-shrink-0" />
                <span className="text-xs text-text-secondary truncate group-hover:text-text-primary">Discord</span>
              </a>
            )}

            {info.links.telegramLink && (
              <a
                href={info.links.telegramLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 p-2 rounded-lg bg-base border border-border-subtle hover:border-border-default transition-colors group"
              >
                <Send size={12} className="text-brand flex-shrink-0" />
                <span className="text-xs text-text-secondary truncate group-hover:text-text-primary">Telegram</span>
              </a>
            )}

            {info.links.githubLink && (
              <a
                href={info.links.githubLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 p-2 rounded-lg bg-base border border-border-subtle hover:border-border-default transition-colors group"
              >
                <Github size={12} className="text-brand flex-shrink-0" />
                <span className="text-xs text-text-secondary truncate group-hover:text-text-primary">GitHub</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
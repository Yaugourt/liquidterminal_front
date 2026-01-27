"use client";

import { FileText, Twitter, Globe, MessageCircle, Send, Github, Layers, Copy, Check } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

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
    <div className="bg-brand-secondary/60 backdrop-blur-md border border-border-subtle rounded-2xl shadow-xl shadow-black/20 overflow-hidden p-5">
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
            <h2 className="text-base font-bold text-white">{info.title}</h2>
          </div>
          {info.description && (
            <p className="text-xs text-text-secondary mb-3">{info.description}</p>
          )}
        </div>

        <div className="space-y-2 pt-3 border-t border-border-subtle">
          {info.creator && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-text-muted">Creator</span>
              <span className="text-xs text-white font-medium">{info.creator}</span>
            </div>
          )}

          {info.consensus && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-text-muted">Consensus</span>
              <span className="text-xs text-white font-medium">{info.consensus}</span>
            </div>
          )}

          {info.executionLayer && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-text-muted">Execution Layer</span>
              <span className="text-xs text-white font-medium">{info.executionLayer}</span>
            </div>
          )}

          {info.foundationCreation && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-text-muted">Foundation</span>
              <span className="text-xs text-white font-medium">{info.foundationCreation}</span>
            </div>
          )}

          {info.mainnetLaunch && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-text-muted">Mainnet Launch</span>
              <span className="text-xs text-white font-medium">{info.mainnetLaunch}</span>
            </div>
          )}

          {/* Color palette section */}
          <div className="space-y-2">
            <span className="text-xs text-text-muted">Brand Colors</span>
            <div className="grid grid-cols-2 gap-2">
              {info.colors.map((color, index) => (
                <button
                  key={index}
                  onClick={() => copyToClipboard(color)}
                  className="flex items-center gap-2 p-2 rounded-lg bg-brand-dark border border-border-subtle hover:border-border-hover transition-colors group"
                >
                  <div 
                    className="w-3 h-3 rounded-full border border-white/20 flex-shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-xs text-white font-mono flex-1 text-left">{color}</span>
                  {copiedColor === color ? (
                    <Check size={12} className="text-emerald-400" />
                  ) : (
                    <Copy size={12} className="text-brand-gold opacity-60 group-hover:opacity-100 transition-all duration-200" />
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
                className="flex items-center gap-1 p-2 rounded-lg bg-brand-dark border border-border-subtle hover:border-border-hover transition-colors group"
              >
                <FileText size={12} className="text-brand-accent flex-shrink-0" />
                <span className="text-xs text-white/80 truncate group-hover:text-white">Whitepaper</span>
              </a>
            )}

            {info.links.websiteLink && (
              <a
                href={info.links.websiteLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 p-2 rounded-lg bg-brand-dark border border-border-subtle hover:border-border-hover transition-colors group"
              >
                <Globe size={12} className="text-brand-accent flex-shrink-0" />
                <span className="text-xs text-white/80 truncate group-hover:text-white">Website</span>
              </a>
            )}

            {info.links.appLink && (
              <a
                href={info.links.appLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 p-2 rounded-lg bg-brand-dark border border-border-subtle hover:border-border-hover transition-colors group"
              >
                <Layers size={12} className="text-brand-accent flex-shrink-0" />
                <span className="text-xs text-white/80 truncate group-hover:text-white">App</span>
              </a>
            )}

            {info.links.documentationLink && (
              <a
                href={info.links.documentationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 p-2 rounded-lg bg-brand-dark border border-border-subtle hover:border-border-hover transition-colors group"
              >
                <FileText size={12} className="text-brand-accent flex-shrink-0" />
                <span className="text-xs text-white/80 truncate group-hover:text-white">Documentation</span>
              </a>
            )}

            {info.links.twitterLink && (
              <a
                href={info.links.twitterLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 p-2 rounded-lg bg-brand-dark border border-border-subtle hover:border-border-hover transition-colors group"
              >
                <Twitter size={12} className="text-brand-accent flex-shrink-0" />
                <span className="text-xs text-white/80 truncate group-hover:text-white">X HyperLiquid</span>
              </a>
            )}

            {info.links.twitterFoundationLink && (
              <a
                href={info.links.twitterFoundationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 p-2 rounded-lg bg-brand-dark border border-border-subtle hover:border-border-hover transition-colors group"
              >
                <Twitter size={12} className="text-brand-accent flex-shrink-0" />
                <span className="text-xs text-white/80 truncate group-hover:text-white">X Foundation</span>
              </a>
            )}

            {info.links.discordLink && (
              <a
                href={info.links.discordLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 p-2 rounded-lg bg-brand-dark border border-border-subtle hover:border-border-hover transition-colors group"
              >
                <MessageCircle size={12} className="text-brand-accent flex-shrink-0" />
                <span className="text-xs text-white/80 truncate group-hover:text-white">Discord</span>
              </a>
            )}

            {info.links.telegramLink && (
              <a
                href={info.links.telegramLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 p-2 rounded-lg bg-brand-dark border border-border-subtle hover:border-border-hover transition-colors group"
              >
                <Send size={12} className="text-brand-accent flex-shrink-0" />
                <span className="text-xs text-white/80 truncate group-hover:text-white">Telegram</span>
              </a>
            )}

            {info.links.githubLink && (
              <a
                href={info.links.githubLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 p-2 rounded-lg bg-brand-dark border border-border-subtle hover:border-border-hover transition-colors group"
              >
                <Github size={12} className="text-brand-accent flex-shrink-0" />
                <span className="text-xs text-white/80 truncate group-hover:text-white">GitHub</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 
"use client";

import { Card } from "@/components/ui/card";
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
    <Card className="bg-[#051728E5] border-2 border-[#83E9FF4D] hover:border-[#83E9FF80] transition-colors shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm overflow-hidden rounded-lg p-5">
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
            <h2 className="text-base font-semibold text-white">{info.title}</h2>
          </div>
          {info.description && (
            <p className="text-xs text-gray-400 mb-3">{info.description}</p>
          )}
          {/* Banner */}
          <div className="relative w-full h-24 rounded-md overflow-hidden">
            <Image
              src="/Hyperliquid banner.jpg"
              alt="HyperLiquid Banner"
              fill
              className="object-cover object-center"
            />
          </div>
        </div>

        <div className="space-y-2 pt-3 border-t border-[#83E9FF1A]">
          {info.creator && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Creator</span>
              <span className="text-xs text-white font-medium">{info.creator}</span>
            </div>
          )}

          {info.consensus && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Consensus</span>
              <span className="text-xs text-white font-medium">{info.consensus}</span>
            </div>
          )}

          {info.executionLayer && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Execution Layer</span>
              <span className="text-xs text-white font-medium">{info.executionLayer}</span>
            </div>
          )}

          {info.foundationCreation && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Foundation</span>
              <span className="text-xs text-white font-medium">{info.foundationCreation}</span>
            </div>
          )}

          {info.mainnetLaunch && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Mainnet Launch</span>
              <span className="text-xs text-white font-medium">{info.mainnetLaunch}</span>
            </div>
          )}

          {/* Color palette section */}
          <div className="space-y-2">
            <span className="text-xs text-gray-400">Brand Colors</span>
            <div className="grid grid-cols-2 gap-2">
              {info.colors.map((color, index) => (
                <button
                  key={index}
                  onClick={() => copyToClipboard(color)}
                  className="flex items-center gap-2 p-2 rounded-md bg-[#112941] hover:bg-[#1a3654] transition-colors group"
                >
                  <div 
                    className="w-3 h-3 rounded-full border border-white/20 flex-shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-xs text-white font-mono flex-1 text-left">{color}</span>
                  {copiedColor === color ? (
                    <Check size={12} className="text-green-400" />
                  ) : (
                    <Copy size={12} className="text-gray-400 group-hover:text-[#83E9FF] transition-colors" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Links section */}
        <div className="pt-3 border-t border-[#83E9FF1A]">
          <div className="grid grid-cols-2 gap-1">
            {info.links.whitepaperLink && (
              <a
                href={info.links.whitepaperLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 p-2 rounded-md bg-[#112941] hover:bg-[#1a3654] transition-colors group"
              >
                <FileText size={12} className="text-[#F9E370] flex-shrink-0" />
                <span className="text-xs text-white truncate">Whitepaper</span>
              </a>
            )}

            {info.links.websiteLink && (
              <a
                href={info.links.websiteLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 p-2 rounded-md bg-[#112941] hover:bg-[#1a3654] transition-colors group"
              >
                <Globe size={12} className="text-[#F9E370] flex-shrink-0" />
                <span className="text-xs text-white truncate">Website</span>
              </a>
            )}

            {info.links.appLink && (
              <a
                href={info.links.appLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 p-2 rounded-md bg-[#112941] hover:bg-[#1a3654] transition-colors group"
              >
                <Layers size={12} className="text-[#F9E370] flex-shrink-0" />
                <span className="text-xs text-white truncate">App</span>
              </a>
            )}

            {info.links.documentationLink && (
              <a
                href={info.links.documentationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 p-2 rounded-md bg-[#112941] hover:bg-[#1a3654] transition-colors group"
              >
                <FileText size={12} className="text-[#F9E370] flex-shrink-0" />
                <span className="text-xs text-white truncate">Documentation</span>
              </a>
            )}

            {info.links.twitterLink && (
              <a
                href={info.links.twitterLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 p-2 rounded-md bg-[#112941] hover:bg-[#1a3654] transition-colors group"
              >
                <Twitter size={12} className="text-[#F9E370] flex-shrink-0" />
                <span className="text-xs text-white truncate">X HyperLiquid</span>
              </a>
            )}

            {info.links.twitterFoundationLink && (
              <a
                href={info.links.twitterFoundationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 p-2 rounded-md bg-[#112941] hover:bg-[#1a3654] transition-colors group"
              >
                <Twitter size={12} className="text-[#F9E370] flex-shrink-0" />
                <span className="text-xs text-white truncate">X Foundation</span>
              </a>
            )}

            {info.links.discordLink && (
              <a
                href={info.links.discordLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 p-2 rounded-md bg-[#112941] hover:bg-[#1a3654] transition-colors group"
              >
                <MessageCircle size={12} className="text-[#F9E370] flex-shrink-0" />
                <span className="text-xs text-white truncate">Discord</span>
              </a>
            )}

            {info.links.telegramLink && (
              <a
                href={info.links.telegramLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 p-2 rounded-md bg-[#112941] hover:bg-[#1a3654] transition-colors group"
              >
                <Send size={12} className="text-[#F9E370] flex-shrink-0" />
                <span className="text-xs text-white truncate">Telegram</span>
              </a>
            )}

            {info.links.githubLink && (
              <a
                href={info.links.githubLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 p-2 rounded-md bg-[#112941] hover:bg-[#1a3654] transition-colors group"
              >
                <Github size={12} className="text-[#F9E370] flex-shrink-0" />
                <span className="text-xs text-white truncate">GitHub</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
} 
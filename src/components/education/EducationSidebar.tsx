"use client";

import { Card } from "@/components/ui/card";
import { ExternalLink, FileText, Twitter, Globe } from "lucide-react";

interface EducationSidebarProps {
  info: {
    title: string;
    description?: string;
    color: string;
    creator?: string;
    consensus?: string;
    whitepaperLink?: string;
    websiteLink?: string;
    twitterLink?: string;
  };
}

export function EducationSidebar({ info }: EducationSidebarProps) {
  return (
    <Card className="bg-[#051728E5] border-2 border-[#83E9FF4D] hover:border-[#83E9FF80] transition-colors shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm overflow-hidden rounded-lg p-6">
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-white mb-2">{info.title}</h2>
          {info.description && (
            <p className="text-sm text-gray-400">{info.description}</p>
          )}
        </div>

        <div className="space-y-3 pt-4 border-t border-[#83E9FF1A]">
          {info.creator && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Creator</span>
              <span className="text-sm text-white font-medium">{info.creator}</span>
            </div>
          )}

          {info.consensus && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Consensus</span>
              <span className="text-sm text-white font-medium">{info.consensus}</span>
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Theme Color</span>
            <div className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full border border-white/20"
                style={{ backgroundColor: info.color }}
              />
              <span className="text-sm text-white font-mono">{info.color}</span>
            </div>
          </div>
        </div>

        {(info.whitepaperLink || info.websiteLink || info.twitterLink) && (
          <div className="space-y-2 pt-4 border-t border-[#83E9FF1A]">
            {info.whitepaperLink && (
              <a
                href={info.whitepaperLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-lg bg-[#112941] hover:bg-[#1a3654] transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-[#F9E370]" />
                  <span className="text-sm text-white">Whitepaper</span>
                </div>
                <ExternalLink size={14} className="text-gray-400 group-hover:text-[#83E9FF] transition-colors" />
              </a>
            )}

            {info.websiteLink && (
              <a
                href={info.websiteLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-lg bg-[#112941] hover:bg-[#1a3654] transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <Globe size={16} className="text-[#F9E370]" />
                  <span className="text-sm text-white">Website</span>
                </div>
                <ExternalLink size={14} className="text-gray-400 group-hover:text-[#83E9FF] transition-colors" />
              </a>
            )}

            {info.twitterLink && (
              <a
                href={info.twitterLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-lg bg-[#112941] hover:bg-[#1a3654] transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <Twitter size={16} className="text-[#F9E370]" />
                  <span className="text-sm text-white">Twitter</span>
                </div>
                <ExternalLink size={14} className="text-gray-400 group-hover:text-[#83E9FF] transition-colors" />
              </a>
            )}
          </div>
        )}
      </div>
    </Card>
  );
} 
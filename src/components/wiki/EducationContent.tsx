"use client";

import { useState } from "react";

interface Chapter {
  id: number;
  title: string;
  description: string;
}

interface EducationContentProps {
  chapters: Chapter[];
}

export function EducationContent({ chapters }: EducationContentProps) {
  const [activeTab, setActiveTab] = useState(chapters[0]?.title || "");

  const formatDescription = (text: string) => {
    return text.split('\n').map((paragraph, index) => (
      <p key={index} className="mb-4 last:mb-0 leading-relaxed">
        {paragraph}
      </p>
    ));
  };

  return (
    <div className="bg-brand-secondary/60 backdrop-blur-md border border-border-subtle rounded-2xl shadow-xl shadow-black/20 overflow-hidden">
      <div className="p-6">
        <div className="w-full">
          <div className="flex justify-start items-center mb-6 pb-4 border-b border-border-subtle">
            {/* Desktop version - Horizontal tabs */}
            <div className="hidden min-[750px]:flex bg-brand-dark rounded-lg p-1 border border-border-subtle">
              {chapters.map((chapter) => (
                <button
                  key={chapter.id}
                  onClick={() => setActiveTab(chapter.title)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${activeTab === chapter.title
                    ? 'bg-brand-accent text-brand-tertiary shadow-sm font-bold'
                    : 'text-text-secondary hover:text-zinc-200 hover:bg-white/5'
                    }`}
                >
                  {chapter.title}
                </button>
              ))}
            </div>

            {/* Mobile version - Dropdown for screens < 750px */}
            <div className="max-[749px]:block hidden w-full">
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value)}
                className="w-full bg-brand-dark border border-border-subtle rounded-lg px-3 py-2 text-sm font-medium text-white focus:outline-none focus:border-brand-accent/50"
              >
                {chapters.map((chapter) => (
                  <option
                    key={chapter.id}
                    value={chapter.title}
                    className="bg-brand-dark text-white"
                  >
                    {chapter.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-start">
            <div className="w-full max-w-4xl">
              {chapters.map((chapter) => (
                activeTab === chapter.title && (
                  <div key={chapter.id} className="space-y-4">
                    <div className="text-sm text-white/80 leading-relaxed">
                      {formatDescription(chapter.description)}
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

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
    <Card className="bg-[#051728E5] border-2 border-[#83E9FF4D] hover:border-[#83E9FF80] transition-colors shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm overflow-hidden rounded-lg">
      <CardContent className="p-6">
        <div className="w-full">
          <div className="flex justify-start items-center mb-6">
            <div className="flex items-center bg-[#FFFFFF0A] rounded-lg p-1">
              {chapters.map((chapter) => (
                <button
                  key={chapter.id}
                  onClick={() => setActiveTab(chapter.title)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === chapter.title
                      ? 'bg-[#83E9FF] text-[#051728] shadow-sm'
                      : 'text-white hover:text-white hover:bg-[#FFFFFF0A]'
                  }`}
                >
                  {chapter.title}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-start">
            <div className="w-full max-w-4xl">
              {chapters.map((chapter) => (
                activeTab === chapter.title && (
                  <div key={chapter.id} className="space-y-4">
                    <div className="text-sm text-gray-300">
                      {formatDescription(chapter.description)}
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 
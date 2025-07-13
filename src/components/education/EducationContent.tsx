"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

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
    <Card className="bg-[#051728E5] border-2 border-[#83E9FF4D] hover:border-[#83E9FF80] transition-colors shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm overflow-hidden rounded-xl">
      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6 bg-[#112941] p-1 rounded-lg">
            {chapters.map((chapter) => (
              <TabsTrigger
                key={chapter.id}
                value={chapter.title}
                className="text-xs sm:text-sm text-white data-[state=active]:bg-[#83E9FF] data-[state=active]:text-[#051728] rounded-md transition-all font-medium"
              >
                {chapter.title}
              </TabsTrigger>
            ))}
          </TabsList>

          {chapters.map((chapter) => (
            <TabsContent key={chapter.id} value={chapter.title} className="mt-6">
              <div className="space-y-4">
                <h2 className="text-xl md:text-2xl font-semibold text-white">
                  {chapter.title}
                </h2>
                <div className="text-sm md:text-base text-gray-300">
                  {formatDescription(chapter.description)}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
} 
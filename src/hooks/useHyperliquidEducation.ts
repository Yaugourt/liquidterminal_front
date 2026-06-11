import { useStaticJson } from './useStaticJson';

interface SubChapter {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
}

interface Chapter {
  id: number;
  title: string;
  description: string;
  subChapters?: SubChapter[];
}

interface HyperliquidEducation {
  chapters: Chapter[];
}

export const useHyperliquidEducation = () => {
  const { data: education, loading, error } = useStaticJson<HyperliquidEducation>(
    '/hyperliquid-education.json',
    'Failed to fetch HyperLiquid education content'
  );

  return { education, loading, error };
};

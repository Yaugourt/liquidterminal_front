import { useState, useEffect } from 'react';

interface Chapter {
  id: number;
  title: string;
  description: string;
}

interface HyperliquidEducation {
  chapters: Chapter[];
}

export const useHyperliquidEducation = () => {
  const [education, setEducation] = useState<HyperliquidEducation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEducation = async () => {
      try {
        const response = await fetch('/hyperliquid-education.json');
        if (!response.ok) {
          throw new Error('Failed to fetch HyperLiquid education content');
        }
        const data = await response.json();
        setEducation(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchEducation();
  }, []);

  return { education, loading, error };
}; 
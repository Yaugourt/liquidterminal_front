import { useState, useEffect } from 'react';

interface HyperliquidInfo {
  title: string;
  description: string;
  colors: string[];
  consensus: string;
  executionLayer: string;
  foundationCreation: string;
  mainnetLaunch: string;
  links: {
    website: string;
    app: string;
    documentation: string;
    twitter: string;
    twitterFoundation: string;
    discord: string;
    telegram: string;
    github: string;
  };
}

export const useHyperliquidInfo = () => {
  const [info, setInfo] = useState<HyperliquidInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const response = await fetch('/hyperliquid-info.json');
        if (!response.ok) {
          throw new Error('Failed to fetch HyperLiquid info');
        }
        const data = await response.json();
        setInfo(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchInfo();
  }, []);

  return { info, loading, error };
}; 
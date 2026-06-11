import { useStaticJson } from './useStaticJson';

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
  const { data: info, loading, error } = useStaticJson<HyperliquidInfo>(
    '/hyperliquid-info.json',
    'Failed to fetch HyperLiquid info'
  );

  return { info, loading, error };
};

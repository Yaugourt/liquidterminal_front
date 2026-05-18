import {
  FileText,
  Github,
  Globe,
  Layers,
  MessageCircle,
  Send,
  Twitter,
  type LucideIcon,
} from "lucide-react";

export interface EducationInfo {
  title?: string;
  description?: string;
  colors?: string[];
  links?: {
    websiteLink?: string;
    appLink?: string;
    documentationLink?: string;
    twitterLink?: string;
    twitterFoundationLink?: string;
    discordLink?: string;
    telegramLink?: string;
    githubLink?: string;
    whitepaperLink?: string;
  };
}

export interface ResourceLink {
  label: string;
  url: string;
  icon: LucideIcon;
}

/**
 * Map an `EducationInfo.links` blob to a flat array of `ResourceLink`s,
 * preserving the editorial order (website → app → docs → whitepaper → socials).
 * Returns an empty array when no info or no links are provided.
 */
export function buildResourceLinks(info?: EducationInfo | null): ResourceLink[] {
  if (!info?.links) return [];
  const l = info.links;
  const entries: Array<ResourceLink | null> = [
    l.websiteLink ? { label: "Website", url: l.websiteLink, icon: Globe } : null,
    l.appLink ? { label: "App", url: l.appLink, icon: Layers } : null,
    l.documentationLink
      ? { label: "Docs", url: l.documentationLink, icon: FileText }
      : null,
    l.whitepaperLink
      ? { label: "Whitepaper", url: l.whitepaperLink, icon: FileText }
      : null,
    l.twitterLink ? { label: "X", url: l.twitterLink, icon: Twitter } : null,
    l.twitterFoundationLink
      ? { label: "X Foundation", url: l.twitterFoundationLink, icon: Twitter }
      : null,
    l.discordLink
      ? { label: "Discord", url: l.discordLink, icon: MessageCircle }
      : null,
    l.telegramLink ? { label: "Telegram", url: l.telegramLink, icon: Send } : null,
    l.githubLink ? { label: "GitHub", url: l.githubLink, icon: Github } : null,
  ];
  return entries.filter((x): x is ResourceLink => x !== null);
}

/**
 * Highlight inline technical tokens (EVM-style hex addresses, "HyperBFT/Core/EVM",
 * "HIP-N", "HYPE", etc.) in brand color without requiring markdown. Keeps the JSON
 * authoring format plain text.
 */
const HIGHLIGHT_PATTERN =
  /(0x[a-fA-F0-9]{2,}(?:[……]+[a-fA-F0-9]*)?|HyperBFT|HyperCore|HyperEVM|HIP-\d+|HYPE|CoreWriter|Read Precompiles?|CLOB)/g;

export function renderParagraph(text: string) {
  const parts = text.split(HIGHLIGHT_PATTERN);
  return parts.map((part, i) => {
    if (!part) return null;
    const isMatch = i % 2 === 1;
    if (isMatch) {
      return (
        <span key={i} className="font-medium text-brand/90">
          {part}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

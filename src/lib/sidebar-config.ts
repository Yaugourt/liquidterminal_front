import { ComponentType } from "react";
import { HlNamesLogo } from "@/components/names/HlNamesLogo";
import {
  Gift,
  Heart,
  Network,
  Vault,
  Wallet,
  Globe,
  BookOpen,
  Home,
  CandlestickChart,
  Zap,
  Sparkles,
  Blocks,
  Fuel,
  Layers,
  Hammer,
  Scale,
  Boxes,
  Library,
  BarChart3,
  Landmark,
  GraduationCap,
  Cpu,
  Download,
  Share2,
  Percent,
  BellRing,
  Receipt,
  ArrowLeftRight,
  Coins,
  Server,
  FlaskConical,
  Rocket,
  FileSearch,
  HandCoins,
  ShieldCheck,
  LayoutGrid,
} from "lucide-react";
import type { NetworkId } from "@/lib/networks";
import { SidebarPreferences, SidebarGroupPreference, SidebarItemPreference } from "@/store/use-sidebar-preferences";

/** Small pill shown at the end of an entry (e.g. Core / new). */
export type NavigationBadge = { label: string; tone: "core" | "new" };

/**
 * Live counts shown at the end of an entry, keyed by href. Resolved by
 * `useSidebarBadges` from the cheapest available stats source, and omitted
 * until loaded (no data → no number, DS rule). Static markers (HIP-3, HIP-4)
 * live on the item as `tag` instead.
 */

/**
 * Navigation item structure
 */
export interface NavigationItem {
  name: string;
  href: string;
  icon?: string | null;
  IconComponent?: ComponentType<{ className?: string }>;
  /** HL CDN token logo (e.g. "HYPE") rendered via TokenAvatar instead of a lucide icon. */
  tokenIcon?: string;
  /** End-of-row pill, e.g. HyperCore vs HyperEVM markers. */
  badge?: NavigationBadge;
  /** Static muted marker at row end (e.g. "HIP-3"), when there is no live count. */
  tag?: string;
  children?: NavigationItem[];
}

/** Accent of a family header — tints its icon and the fold dot. */
export type NavigationAccent = "brand" | "gold" | "neutral";

/**
 * Navigation group structure. A named group renders as a collapsible family
 * header (OAK-style tree): icon + label + chevron, children hanging off a
 * connecting line. `groupName: null` is the header-less home block.
 */
export interface NavigationGroup {
  groupName: string | null;
  items: NavigationItem[];
  /** Family icon, shown on the collapsible header. */
  IconComponent?: ComponentType<{ className?: string }>;
  accent?: NavigationAccent;
}

/**
 * Generate unique ID for group
 */
export const getGroupId = (groupName: string | null): string => {
  if (!groupName) return "home";
  return groupName.toLowerCase().replace(/\s+/g, "-");
};

/**
 * Generate unique ID for item
 */
export const getItemId = (name: string, href: string): string => {
  return `${name.toLowerCase().replace(/\s+/g, "-")}-${href.replace(/\//g, "-")}`;
};

/**
 * Default navigation configuration
 */
export const defaultNavigationGroups: NavigationGroup[] = [
  {
    // Header-less block: the two places everyone starts from.
    groupName: null,
    items: [
      { name: 'Home', href: '/dashboard', icon: null, IconComponent: Home },
      { name: 'HYPE', href: '/hype', icon: null, tokenIcon: 'HYPE' },
    ],
  },
  {
    // Everything that quotes on HyperCore, plus what gets forced out of it.
    // Same entries, same order as the MarketScopeBar on /market/*, so the rail
    // and the in-page tabs never disagree.
    groupName: 'Markets',
    IconComponent: BarChart3,
    accent: 'brand',
    items: [
      { name: 'Overview', href: '/market', icon: null, IconComponent: CandlestickChart },
      { name: 'Spot', href: '/market/spot', icon: null, IconComponent: Coins },
      { name: 'Perps', href: '/market/perp', icon: null, IconComponent: BarChart3 },
      { name: 'Perp DEXs', href: '/market/perpdex', icon: null, IconComponent: Layers, tag: 'HIP-3' },
      { name: 'Outcomes', href: '/market/hip4', icon: null, IconComponent: Sparkles, tag: 'HIP-4' },
      { name: 'Trades', href: '/market/trades', icon: null, IconComponent: ArrowLeftRight },
      { name: 'Liquidations', href: '/explorer/liquidations', icon: null, IconComponent: Zap },
    ],
  },
  {
    // Where value sits and what it earns: pooled (vaults), staked (validators),
    // and the two revenue rails, builder codes and the priority-fee auction.
    groupName: 'Capital',
    IconComponent: Landmark,
    accent: 'gold',
    items: [
      { name: 'Vaults', href: '/explorer/vaults', icon: null, IconComponent: Vault },
      { name: 'Yields', href: '/market/yields', icon: null, IconComponent: Percent },
      { name: 'Staking', href: '/explorer/validator', icon: null, IconComponent: Network },
      { name: 'Builders', href: '/market/builders', icon: null, IconComponent: Hammer },
      { name: 'Portfolio Margin', href: '/market/portfolio-margin', icon: null, IconComponent: Scale, badge: { label: 'New', tone: 'new' } },
      { name: 'Priority Fees', href: '/explorer/priority-fees', icon: null, IconComponent: Fuel },
    ],
  },
  {
    // How the machine runs: the HyperCore L1 (Explorer) and the HyperEVM.
    groupName: 'Chain',
    IconComponent: Boxes,
    accent: 'neutral',
    items: [
      { name: 'Explorer', href: '/explorer', icon: null, IconComponent: Blocks, badge: { label: 'Core', tone: 'core' } },
      { name: 'HyperEVM', href: '/evm', icon: null, IconComponent: Cpu },
    ],
  },
  {
    groupName: 'Ecosystem',
    IconComponent: Globe,
    accent: 'neutral',
    items: [
      { name: 'Projects', href: '/ecosystem/project', icon: null, IconComponent: Boxes },
      { name: 'Public Goods', href: '/ecosystem/publicgoods', icon: null, IconComponent: Heart },
      { name: '.hl Names', href: '/names', icon: null, IconComponent: HlNamesLogo },
      { name: 'Perks', href: '/perks', icon: null, IconComponent: Gift },
    ],
  },
  {
    groupName: 'Learn',
    IconComponent: GraduationCap,
    accent: 'neutral',
    items: [
      { name: 'Wiki', href: '/wiki', icon: null, IconComponent: Library },
      { name: 'Read Lists', href: '/wiki/readlist', icon: null, IconComponent: BookOpen },
      { name: 'HIP-4 docs', href: '/hip4', icon: null, IconComponent: FileSearch },
    ],
  },
];

/**
 * Convert navigation groups to preferences structure
 */
const navigationGroupsToPreferences = (groups: NavigationGroup[]): SidebarPreferences => {
  const groupPreferences: SidebarGroupPreference[] = groups.map((group, groupIndex) => {
    const groupId = getGroupId(group.groupName);

    const itemPreferences: SidebarItemPreference[] = group.items.map((item, itemIndex) => ({
      id: getItemId(item.name, item.href),
      visible: true,
      order: itemIndex
    }));

    return {
      id: groupId,
      visible: true,
      order: groupIndex,
      items: itemPreferences
    };
  });

  return {
    // v3: Tools family added, Spot/Perps/Trades back in the rail, tools moved
    // out of the home block. Older prefs key off the old layout, so they must be
    // discarded rather than merged, else the new group has no pref and hides.
    // v2: the families were renamed (Markets/Capital/Chain/Ecosystem/Learn).
    version: 3,
    groups: groupPreferences
  };
};

/**
 * Get default preferences
 */
export const getDefaultSidebarPreferences = (): SidebarPreferences => {
  return navigationGroupsToPreferences(defaultNavigationGroups);
};

/**
 * Apply preferences to navigation groups (filter and reorder)
 */
export const applyPreferencesToNavigation = (
  groups: NavigationGroup[],
  preferences: SidebarPreferences
): NavigationGroup[] => {
  // Create a map of preferences
  const prefsMap = new Map(preferences.groups.map(g => [g.id, g]));

  // Sort groups by order and filter by visibility
  const sortedGroups = groups
    .map(group => {
      const groupId = getGroupId(group.groupName);
      const groupPref = prefsMap.get(groupId);

      if (!groupPref || !groupPref.visible) return null;

      // Filter and sort items
      const itemsMap = new Map(groupPref.items.map(i => [i.id, i]));
      const filteredItems = group.items
        .map((item, itemIndex) => {
          const itemId = getItemId(item.name, item.href);
          const itemPref = itemsMap.get(itemId);

          // Only hide an item the user explicitly hid. An item absent from
          // stored prefs is new since they last saved (e.g. a freshly shipped
          // page): show it by default and append it, rather than hiding it
          // until prefs are reset.
          if (itemPref && !itemPref.visible) return null;

          return { item, order: itemPref?.order ?? 1000 + itemIndex };
        })
        .filter((i): i is { item: NavigationItem; order: number } => i !== null)
        .sort((a, b) => a.order - b.order)
        .map(i => i.item);

      return {
        group,
        order: groupPref.order,
        items: filteredItems
      };
    })
    .filter((g): g is { group: NavigationGroup; order: number; items: NavigationItem[] } => g !== null)
    .sort((a, b) => a.order - b.order);

  return sortedGroups.map(({ group, items }) => ({
    ...group,
    items
  }));
};


/**
 * Rail shown while the Elysium network is active. It only links to /elysium
 * pages: any other link would leave the section and flip the network back to
 * Hyperliquid (the active network follows the URL). Hyperliquid pages are
 * one switch away.
 */
export const elysiumNavigationGroups: NavigationGroup[] = [
  {
    groupName: null,
    items: [
      { name: 'Start here', href: '/elysium/start', icon: null, IconComponent: Rocket },
      { name: 'Overview', href: '/elysium', icon: null, IconComponent: Home },
      { name: 'Ecosystem', href: '/elysium/ecosystem', icon: null, IconComponent: LayoutGrid },
      { name: 'Launchpads', href: '/elysium/launchpads', icon: null, IconComponent: Sparkles },
      { name: 'Contracts', href: '/elysium/contracts', icon: null, IconComponent: Blocks },
      { name: 'DEX', href: '/elysium/dex', icon: null, IconComponent: ArrowLeftRight },
      { name: 'Tokens', href: '/elysium/tokens', icon: null, IconComponent: Coins },
      { name: 'Users', href: '/elysium/users', icon: null, IconComponent: Wallet },
      { name: 'Bridge', href: '/elysium/bridge', icon: null, IconComponent: Network },
      { name: 'Economics', href: '/elysium/economics', icon: null, IconComponent: Fuel },
      { name: 'Fees by app', href: '/elysium/fees', icon: null, IconComponent: HandCoins },
      { name: 'Trust', href: '/elysium/trust', icon: null, IconComponent: ShieldCheck },
      { name: 'Network', href: '/elysium/network', icon: null, IconComponent: Cpu },
    ],
  },
];

/**
 * A tool is a page you act on (simulate, decode, track, export) rather than
 * one you read. Tools sit above the data in the sidebar, as tiles, and all of
 * them are listed on /tools.
 */
export interface ToolItem {
  /** Full name, used on /tools and as the tool page title. */
  name: string;
  /** Tile label when the full name would wrap in a half-width tile. */
  shortName?: string;
  href: string;
  IconComponent: ComponentType<{ className?: string }>;
  /** One line on what it does, shown on /tools. */
  description: string;
  network: NetworkId;
}

/**
 * Every tool, per network, most used first. The sidebar pins the first
 * PINNED_TOOLS of the active network as tiles; the rest are one click away
 * behind "All tools", so the block never grows with the list.
 */
export const TOOLS: ToolItem[] = [
  { name: 'Simulator', href: '/elysium/simulate', IconComponent: FlaskConical, network: 'elysium', description: 'Dry-run a call or a contract deployment on the latest Elysium block. Nothing is signed.' },
  { name: 'Decoder', href: '/elysium/decode', IconComponent: FileSearch, network: 'elysium', description: 'Turn calldata, a selector or a contract into readable functions.' },
  { name: 'Tx inspector', shortName: 'Inspector', href: '/elysium/tx', IconComponent: Receipt, network: 'elysium', description: 'Paste a transaction hash: decoded call, fee split, token movements and events.' },
  { name: 'Share studio', shortName: 'Share', href: '/elysium/share', IconComponent: Share2, network: 'elysium', description: 'Turn an Elysium metric into a post-ready image.' },
  { name: 'Run a node', href: '/elysium/node', IconComponent: Server, network: 'elysium', description: 'Set up your own Elysium node, step by step.' },
  { name: 'Wallet tracker', shortName: 'Tracker', href: '/market/tracker', IconComponent: Wallet, network: 'hyperliquid', description: 'Follow wallets, their positions and their fills.' },
  { name: 'Alerts', href: '/alerts', IconComponent: BellRing, network: 'hyperliquid', description: 'Get notified when the moves you follow happen.' },
  { name: 'Export', href: '/export', IconComponent: Download, network: 'hyperliquid', description: 'Download Hyperliquid data as CSV.' },
  { name: 'Share studio', shortName: 'Share', href: '/share', IconComponent: Share2, network: 'hyperliquid', description: 'Turn any Hyperliquid metric into a post-ready image.' },
];

/** Tiles shown in the sidebar: two rows of two, whatever the size of the list. */
export const PINNED_TOOLS = 4;

export const toolsFor = (network: NetworkId): ToolItem[] => TOOLS.filter((tool) => tool.network === network);

/** The tool a path belongs to, if any (a tool's sub-routes count as the tool). */
export const toolForPath = (pathname: string | null | undefined): ToolItem | undefined =>
  pathname ? TOOLS.find((tool) => pathname === tool.href || pathname.startsWith(`${tool.href}/`)) : undefined;

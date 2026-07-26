import { ComponentType } from "react";
import {
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
  Boxes,
  Library,
  BarChart3,
  Landmark,
  GraduationCap,
  Cpu,
  Download,
} from "lucide-react";
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
    // Header-less block: the two page-agnostic pins.
    groupName: null,
    items: [
      { name: 'Home', href: '/dashboard', icon: null, IconComponent: Home },
      { name: 'HYPE', href: '/hype', icon: null, tokenIcon: 'HYPE' },
      // Page-agnostic like the two above: the export workbench serves every
      // family rather than belonging to one, and a tool nobody can navigate to
      // may as well not ship.
      { name: 'Export', href: '/export', icon: null, IconComponent: Download },
    ],
  },
  {
    // What quotes, and what gets forced out — HyperCore order books plus the
    // liquidation feed that runs off them. The /market hub keeps its
    // MarketScopeBar (Overview/Spot/Perpetual/Auctions/...), so the rail lists
    // the peer destinations, not the scope tabs.
    groupName: 'Markets',
    IconComponent: BarChart3,
    accent: 'brand',
    items: [
      { name: 'Market', href: '/market', icon: null, IconComponent: CandlestickChart },
      { name: 'Perp DEXs', href: '/market/perpdex', icon: null, IconComponent: Layers, tag: 'HIP-3' },
      { name: 'Outcomes', href: '/market/hip4', icon: null, IconComponent: Sparkles, tag: 'HIP-4' },
      { name: 'Liquidations', href: '/explorer/liquidations', icon: null, IconComponent: Zap },
    ],
  },
  {
    // Where value sits and what it earns: pooled (vaults), staked (validators),
    // tracked (personal), plus the two revenue rails — builder codes and the
    // priority-fee auction.
    groupName: 'Capital',
    IconComponent: Landmark,
    accent: 'gold',
    items: [
      { name: 'Vaults', href: '/explorer/vaults', icon: null, IconComponent: Vault },
      { name: 'Validators', href: '/explorer/validator', icon: null, IconComponent: Network },
      { name: 'Tracker', href: '/market/tracker', icon: null, IconComponent: Wallet },
      { name: 'Builders', href: '/market/builders', icon: null, IconComponent: Hammer },
      { name: 'Priority Fees', href: '/explorer/priority-fees', icon: null, IconComponent: Fuel },
    ],
  },
  {
    // How the machine runs. Two execution layers on one consensus: the HyperCore
    // L1 (Explorer) and the HyperEVM.
    groupName: 'Chain',
    IconComponent: Boxes,
    accent: 'neutral',
    items: [
      { name: 'Explorer', href: '/explorer', icon: null, IconComponent: Blocks, badge: { label: 'Core', tone: 'core' } },
      { name: 'HyperEVM', href: '/evm', icon: null, IconComponent: Cpu, badge: { label: 'new', tone: 'new' } },
    ],
  },
  {
    groupName: 'Ecosystem',
    IconComponent: Globe,
    accent: 'neutral',
    items: [
      { name: 'Projects', href: '/ecosystem/project', icon: null, IconComponent: Boxes },
      { name: 'Public Goods', href: '/ecosystem/publicgoods', icon: null, IconComponent: Heart },
    ],
  },
  {
    groupName: 'Learn',
    IconComponent: GraduationCap,
    accent: 'neutral',
    items: [
      { name: 'Wiki', href: '/wiki', icon: null, IconComponent: Library },
      { name: 'Read Lists', href: '/wiki/readlist', icon: null, IconComponent: BookOpen },
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
    // v2: the families were renamed (Markets/Capital/Chain/Ecosystem/Learn) and
    // resegmented. v1 prefs key off the old group ids, so they must be discarded
    // rather than merged — else a renamed group has no matching pref and hides.
    version: 2,
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
        .map(item => {
          const itemId = getItemId(item.name, item.href);
          const itemPref = itemsMap.get(itemId);

          if (!itemPref || !itemPref.visible) return null;

          return { item, order: itemPref.order };
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


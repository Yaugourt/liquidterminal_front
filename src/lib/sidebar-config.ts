import { ComponentType } from "react";
import {
  Gavel,
  Heart,
  ClipboardList,
  Clock,
  Building2,
  Network,
  Vault,
  Search,
  Infinity,
  Wallet,
  Globe,
  BookOpen,
  AppWindow,
  Home,
  CandlestickChart,
  Zap
} from "lucide-react";
import { SidebarPreferences, SidebarGroupPreference, SidebarItemPreference } from "@/store/use-sidebar-preferences";

/**
 * Navigation item structure
 */
export interface NavigationItem {
  name: string;
  href: string;
  icon?: string | null;
  IconComponent?: ComponentType<{ className?: string }>;
  children?: NavigationItem[];
}

/**
 * Navigation group structure
 */
export interface NavigationGroup {
  groupName: string | null;
  items: NavigationItem[];
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
    groupName: null, // Home
    items: [
      {
        name: 'Home',
        href: '/dashboard',
        icon: null,
        IconComponent: Home
      },
    ]
  },
  {
    groupName: 'Liquid Explorer',
    items: [
      {
        name: 'Dashboard',
        href: '/explorer',
        icon: null,
        IconComponent: Search
      },
      {
        name: 'Validator',
        href: '/explorer/validator',
        icon: null,
        IconComponent: Network
      },
      {
        name: 'Vaults',
        href: '/explorer/vaults',
        icon: null,
        IconComponent: Vault
      },
      {
        name: 'Liquidations',
        href: '/explorer/liquidations',
        icon: null,
        IconComponent: Zap
      },
    ]
  },
  {
    groupName: 'Liquid Market',
    items: [
      {
        name: 'Spot',
        href: '/market/spot',
        icon: null,
        IconComponent: CandlestickChart,
        children: [
          {
            name: 'Market',
            href: '/market/spot',
            icon: null,
            IconComponent: CandlestickChart
          },
          {
            name: 'Auction',
            href: '/market/spot/auction',
            icon: null,
            IconComponent: Gavel
          }
        ]
      },
      {
        name: 'Perpetual',
        href: '/market/perp',
        icon: null,
        IconComponent: Infinity,
        children: [
          {
            name: 'Market',
            href: '/market/perp',
            icon: null,
            IconComponent: Infinity
          },
          {
            name: 'Auction',
            href: '/market/perp/auction',
            icon: null,
            IconComponent: Gavel
          }
        ]
      },
      {
        name: 'PerpDexs (HIP-3)',
        href: '/market/perpdex',
        icon: null,
        IconComponent: Building2
      },
      {
        name: 'Tracker',
        href: '/market/tracker',
        icon: null,
        IconComponent: Wallet,
        children: [
          {
            name: 'My Wallets',
            href: '/market/tracker/my-wallets',
            icon: null,
            IconComponent: Wallet
          },
          {
            name: 'Public Lists',
            href: '/market/tracker/public-lists',
            icon: null,
            IconComponent: Globe
          }
        ]
      },
    ]
  },
  {
    groupName: 'Liquid Ecosystem',
    items: [
      {
        name: 'Project',
        href: '/ecosystem/project',
        icon: null,
        IconComponent: Search
      },
      {
        name: 'Public Goods',
        href: '/ecosystem/publicgoods',
        icon: null,
        IconComponent: Heart,
        children: [
          {
            name: 'All Projects',
            href: '/ecosystem/publicgoods',
            icon: null,
            IconComponent: Heart
          },
          {
            name: 'My Submissions',
            href: '/ecosystem/publicgoods/my-submissions',
            icon: null,
            IconComponent: ClipboardList
          },
          {
            name: 'Pending Review',
            href: '/ecosystem/publicgoods/pending',
            icon: null,
            IconComponent: Clock
          }
        ]
      }
    ]
  },
  {
    groupName: 'Liquid Wiki',
    items: [
      {
        name: 'App',
        href: '/wiki',
        icon: null,
        IconComponent: AppWindow,
      },
      {
        name: 'Read List',
        href: '/wiki/readlist',
        icon: null,
        IconComponent: BookOpen,
      },
      {
        name: 'Public Read Lists',
        href: '/wiki/readlist/public-readlists',
        icon: null,
        IconComponent: Globe,
      }
    ]
  },
];

/**
 * Convert navigation groups to preferences structure
 */
export const navigationGroupsToPreferences = (groups: NavigationGroup[]): SidebarPreferences => {
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
    version: 1,
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


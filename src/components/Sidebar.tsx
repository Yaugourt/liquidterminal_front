import Link from "next/link"
import { Settings, Shield, MessageCircle, Github, BookOpen, ChevronDown, PanelLeftClose, PanelLeftOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import { SidebarToggle } from "@/components/common"
import { TokenAvatar, LiquidMark } from "@/components/common"
import Image from "next/image"
import { useState, useEffect, useRef, useCallback } from "react"
import { useAuthContext } from "@/contexts/auth.context"
import { usePathname } from 'next/navigation'
import { hasRole } from "@/lib/roleHelpers"
import { useSidebarPreferences } from "@/store/use-sidebar-preferences"
import { useSidebarUi } from "@/store/use-sidebar-ui"
import {
    defaultNavigationGroups,
    getDefaultSidebarPreferences,
    applyPreferencesToNavigation,
    type NavigationGroup,
    type NavigationItem
} from "@/lib/sidebar-config"
import { CustomizeSidebarModal } from "@/components/CustomizeSidebarModal"

const socials = [
    { name: 'Discord', href: '#', Icon: MessageCircle },
    { name: 'Twitter', href: 'https://x.com/liquidterminal', Icon: () => <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
    { name: 'Github', href: 'https://github.com/Liquid-Terminal', Icon: Github },
    { name: 'GitBook', href: 'https://liquid-terminal.gitbook.io/liquid-terminal', Icon: BookOpen },
]

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

/** Hover flyout state for the collapsed rail (name label / submenu panel). */
interface FlyoutState {
    item: NavigationItem;
    top: number;
}

/**
 * Collapse mechanics: the DOM structure is IDENTICAL in both states — only
 * the container width animates while labels fade and get clipped by
 * `overflow-hidden`. Icons keep the exact same x position (header px-[15px],
 * nav px-2.5, item px-2.5 → icon center at 28px = half the 56px rail), so
 * nothing jumps during the tween.
 */
export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
    const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
    const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
    const { user } = useAuthContext();
    const pathname = usePathname();

    const [hasMounted, setHasMounted] = useState(false);
    // Transitions stay disabled until shortly after mount so a persisted
    // collapsed state renders instantly instead of replaying its animation.
    const [animReady, setAnimReady] = useState(false);
    const { preferences, initializePreferences, getPreferences } = useSidebarPreferences();
    const { collapsed, toggleCollapsed } = useSidebarUi();
    const [navigationGroups, setNavigationGroups] = useState<NavigationGroup[]>(defaultNavigationGroups);

    // Collapsed only applies to the desktop rail — the mobile drawer always
    // shows the full menu. Gate on hasMounted to avoid hydration mismatch on
    // the persisted flag.
    const isCollapsed = hasMounted && collapsed && !isOpen;

    // Hover flyout (collapsed mode). JS-positioned because the nav scroll
    // container would clip an absolutely-positioned CSS flyout.
    const [flyout, setFlyout] = useState<FlyoutState | null>(null);
    const flyoutCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const openFlyout = useCallback((item: NavigationItem, e: React.MouseEvent<HTMLElement>) => {
        if (flyoutCloseTimer.current) clearTimeout(flyoutCloseTimer.current);
        const rect = e.currentTarget.getBoundingClientRect();
        // Clamp so a tall submenu panel never overflows the viewport bottom.
        const top = Math.min(rect.top, (typeof window !== "undefined" ? window.innerHeight : 800) - 260);
        setFlyout({ item, top });
    }, []);

    const scheduleFlyoutClose = useCallback(() => {
        if (flyoutCloseTimer.current) clearTimeout(flyoutCloseTimer.current);
        flyoutCloseTimer.current = setTimeout(() => setFlyout(null), 120);
    }, []);

    const cancelFlyoutClose = useCallback(() => {
        if (flyoutCloseTimer.current) clearTimeout(flyoutCloseTimer.current);
    }, []);

    useEffect(() => {
        setHasMounted(true);
        const t = setTimeout(() => setAnimReady(true), 150);
        return () => clearTimeout(t);
    }, []);

    // Close any flyout when the rail expands or the route changes.
    useEffect(() => {
        setFlyout(null);
    }, [isCollapsed, pathname]);

    useEffect(() => {
        if (!hasMounted) return;
        const defaultPrefs = getDefaultSidebarPreferences();
        initializePreferences(defaultPrefs);
    }, [initializePreferences, hasMounted]);

    useEffect(() => {
        if (!hasMounted) return;
        const prefs = getPreferences();
        if (prefs) {
            setNavigationGroups(applyPreferencesToNavigation(defaultNavigationGroups, prefs));
        }
    }, [preferences, getPreferences, hasMounted]);

    const toggleSubmenu = (name: string) => {
        setOpenSubmenu(prev => prev === name ? null : name);
    };

    const isAdmin = hasRole(user, 'ADMIN');

    const isItemActive = (item: NavigationItem): boolean =>
        pathname === item.href ||
        (item.href.startsWith("/market/") && pathname.startsWith(`${item.href}/`)) ||
        Boolean(item.children && item.children.some((child) => pathname === child.href));

    /** Icon node — token logo > custom image > lucide, in a fixed 16px slot. */
    const renderIcon = (item: NavigationItem, isActive: boolean) => {
        if (item.tokenIcon) {
            return <TokenAvatar assetName={item.tokenIcon} size="xs" className="rounded-full" />;
        }
        if (item.icon) {
            return <Image src={item.icon} alt="" width={16} height={16} className="shrink-0" />;
        }
        const Icon = item.IconComponent;
        return Icon ? <Icon className={cn("w-4 h-4 shrink-0", isActive && "text-brand")} /> : null;
    };

    /** Label fade — clipped by the parent's overflow-hidden while the rail shrinks. */
    const labelClass = cn(
        "truncate whitespace-nowrap transition-opacity duration-150",
        isCollapsed ? "opacity-0" : "opacity-100 delay-75"
    );

    /** One markup for both states — the rail just clips it. */
    const renderItem = (item: NavigationItem) => {
        const isActive = isItemActive(item);
        const isSubOpen = openSubmenu === item.name && !isCollapsed;

        return (
            <li key={item.name} className="relative">
                {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 bg-brand rounded-r" />
                )}
                <div className="flex items-center">
                    <Link
                        href={item.href}
                        aria-label={item.name}
                        className={cn(
                            "flex flex-1 items-center gap-2.5 px-2.5 py-[7px] rounded-md text-[13px] font-medium transition-colors overflow-hidden",
                            isActive
                                ? "bg-brand/10 text-text-primary"
                                : "text-text-secondary hover:bg-surface-2 hover:text-text-primary"
                        )}
                        onClick={() => { setIsOpen(false); setFlyout(null); }}
                        onMouseEnter={(e) => { if (isCollapsed) openFlyout(item, e); }}
                        onMouseLeave={() => { if (isCollapsed) scheduleFlyoutClose(); }}
                    >
                        <span className="w-4 h-4 shrink-0 grid place-items-center">
                            {renderIcon(item, isActive)}
                        </span>
                        <span className={labelClass}>{item.name}</span>
                    </Link>
                    {item.children && !isCollapsed && (
                        <button
                            onClick={(e) => { e.preventDefault(); toggleSubmenu(item.name); }}
                            className="p-1 rounded text-text-tertiary hover:bg-surface-2 hover:text-text-primary transition-colors"
                            aria-label={`Toggle ${item.name}`}
                        >
                            <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", isSubOpen && "rotate-180")} />
                        </button>
                    )}
                </div>
                {item.children && isSubOpen && (
                    <ul className="ml-[22px] mt-0.5 space-y-0.5 border-l border-border-subtle pl-2">
                        {item.children.map((child: NavigationItem) => {
                            const isChildActive = pathname === child.href;
                            return (
                                <li key={child.name}>
                                    <Link
                                        href={child.href}
                                        className={cn(
                                            "flex items-center gap-2 px-2 py-1.5 rounded-md text-[12px] transition-colors",
                                            isChildActive
                                                ? "text-brand font-medium"
                                                : "text-text-tertiary hover:bg-surface-2 hover:text-text-primary"
                                        )}
                                        onClick={() => setIsOpen(false)}
                                    >
                                        {child.IconComponent && <child.IconComponent className="w-3.5 h-3.5 shrink-0" />}
                                        <span>{child.name}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </li>
        );
    };

    /** Group header morphs between its text label and a hairline separator. */
    const renderGroupHeader = (groupName: string, gold = false) => (
        <div
            className={cn(
                "relative overflow-hidden transition-all duration-200",
                isCollapsed ? "h-[9px] mx-3" : "h-[21px] px-2.5"
            )}
        >
            <div
                className={cn(
                    "text-[10px] uppercase tracking-[0.1em] font-semibold whitespace-nowrap transition-opacity duration-150",
                    gold ? "text-gold" : "text-text-tertiary",
                    isCollapsed ? "opacity-0" : "opacity-100 delay-75"
                )}
            >
                {groupName}
            </div>
            <div
                className={cn(
                    "absolute inset-x-0 top-1/2 border-t border-border-subtle transition-opacity duration-150",
                    isCollapsed ? "opacity-100" : "opacity-0"
                )}
            />
        </div>
    );

    const adminActive = pathname === '/user';
    const adminItem: NavigationItem = { name: 'User Management', href: '/user', IconComponent: Shield };

    return (
        <>
            {/* Overlay mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <div
                className={cn(
                    "fixed left-0 top-0 h-full bg-surface flex flex-col",
                    "border-r border-border-subtle",
                    "transition-[transform,width] duration-200 ease-out z-50 lg:translate-x-0",
                    isCollapsed ? "w-[208px] lg:w-14" : "w-[232px] max-lg:w-[208px]",
                    isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
                    !animReady && "sidebar-no-anim"
                )}
            >
                {/* Bloc de marque — the toggle glides from top-right to below the logo. */}
                <div
                    className={cn(
                        "relative flex items-center border-b border-border-subtle px-[15px] pt-[14px] transition-[padding] duration-200 ease-out",
                        isCollapsed ? "pb-12" : "pb-[14px]"
                    )}
                >
                    <Link
                        href="/dashboard"
                        className="flex flex-1 items-center gap-2 overflow-hidden hover:opacity-80 transition-opacity"
                        onClick={() => setIsOpen(false)}
                        aria-label="Liquid Terminal — Dashboard"
                    >
                        <LiquidMark size={26} decorative className="shrink-0" />
                        <div className={cn("whitespace-nowrap transition-opacity duration-150", isCollapsed ? "opacity-0" : "opacity-100 delay-75")}>
                            <div className="text-[14px] font-semibold leading-none text-text-primary">
                                Liquid Terminal
                            </div>
                            {/* tracking kept under 0.12em: the trailing letter-space made the
                                wordmark overflow the 208px mobile drawer by 4px. */}
                            <div className="text-[9px] uppercase tracking-[0.1em] text-text-tertiary mt-[3px]">
                                Hyperliquid Data
                            </div>
                        </div>
                    </Link>
                    {/* Desktop collapse toggle */}
                    <button
                        onClick={toggleCollapsed}
                        className={cn(
                            "max-lg:hidden absolute p-1.5 rounded-md text-text-tertiary hover:bg-surface-2 hover:text-text-primary",
                            "transition-all duration-200 ease-out",
                            isCollapsed
                                ? "left-1/2 -translate-x-1/2 top-[52px]"
                                : "right-2.5 top-[15px] translate-x-0"
                        )}
                        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {isCollapsed
                            ? <PanelLeftOpen className="w-4 h-4" />
                            : <PanelLeftClose className="w-4 h-4" />}
                    </button>
                    <SidebarToggle
                        onClick={() => setIsOpen(false)}
                        className="lg:hidden"
                        label="Close navigation"
                    />
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-2.5 py-3 overflow-y-auto overflow-x-hidden scrollbar-brand">
                    <ul className={cn("transition-all duration-200", isCollapsed ? "space-y-3" : "space-y-5")}>
                        {navigationGroups.map((group, groupIndex) => (
                            <li key={groupIndex} className="space-y-1">
                                {group.groupName && renderGroupHeader(group.groupName)}
                                <ul className="space-y-0.5">
                                    {group.items.map(renderItem)}
                                </ul>
                            </li>
                        ))}

                        {isAdmin && (
                            <li className="space-y-1">
                                {renderGroupHeader('Administration', true)}
                                <ul className="space-y-0.5">
                                    <li className="relative">
                                        {adminActive && (
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 bg-gold rounded-r" />
                                        )}
                                        <Link
                                            href="/user"
                                            aria-label="User Management"
                                            className={cn(
                                                "flex items-center gap-2.5 px-2.5 py-[7px] rounded-md text-[13px] font-medium transition-colors overflow-hidden",
                                                adminActive
                                                    ? "bg-gold/10 text-text-primary"
                                                    : "text-text-secondary hover:bg-surface-2 hover:text-text-primary"
                                            )}
                                            onClick={() => { setIsOpen(false); setFlyout(null); }}
                                            onMouseEnter={(e) => { if (isCollapsed) openFlyout(adminItem, e); }}
                                            onMouseLeave={() => { if (isCollapsed) scheduleFlyoutClose(); }}
                                        >
                                            <span className="w-4 h-4 shrink-0 grid place-items-center">
                                                <Shield className={cn("w-4 h-4", adminActive && "text-gold")} />
                                            </span>
                                            <span className={labelClass}>User Management</span>
                                        </Link>
                                    </li>
                                </ul>
                            </li>
                        )}
                    </ul>
                </nav>

                {/* Pied — customize + statut + socials, same morphing rules. */}
                <div className="border-t border-border-subtle">
                    <div className="px-2.5 py-2">
                        <button
                            onClick={() => setIsCustomizeOpen(true)}
                            aria-label="Customize sidebar"
                            title="Customize sidebar"
                            className="flex items-center gap-2.5 w-full px-2.5 py-[7px] rounded-md text-[12px] text-text-tertiary hover:bg-surface-2 hover:text-text-primary transition-colors overflow-hidden"
                        >
                            <Settings className="w-4 h-4 shrink-0" />
                            <span className={labelClass}>Customize sidebar</span>
                        </button>
                    </div>
                    <div
                        className={cn(
                            "flex items-center border-t border-border-subtle overflow-hidden transition-all duration-200 ease-out",
                            isCollapsed ? "justify-center px-0 py-2" : "justify-between px-4 py-3"
                        )}
                    >
                        <div className="flex items-center gap-1.5 text-[10px] text-text-tertiary">
                            <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" title="Mainnet" />
                            <span className={cn("whitespace-nowrap transition-opacity duration-150", isCollapsed ? "opacity-0 w-0" : "opacity-100 delay-75")}>
                                Mainnet
                            </span>
                        </div>
                        <div className={cn("flex items-center gap-0.5 transition-opacity duration-150", isCollapsed && "opacity-0 w-0 pointer-events-none overflow-hidden")}>
                            {socials.map((item) => (
                                <a
                                    key={item.name}
                                    href={item.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={item.name}
                                    className="group p-1.5 rounded-md hover:bg-surface-2 transition-colors"
                                >
                                    <item.Icon className="h-3.5 w-3.5 text-text-tertiary group-hover:text-brand transition-colors" />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Collapsed-rail hover flyout — name label, plus child links when present. */}
            {isCollapsed && flyout && (
                <div
                    className="fixed left-14 z-[70] pl-2"
                    style={{ top: flyout.top }}
                    onMouseEnter={cancelFlyoutClose}
                    onMouseLeave={scheduleFlyoutClose}
                >
                    <div className="rounded-lg border border-border-subtle bg-surface shadow-xl py-1.5 min-w-[168px]">
                        <Link
                            href={flyout.item.href}
                            className="block px-3 py-1 text-[12px] font-semibold text-text-primary hover:text-brand transition-colors"
                            onClick={() => setFlyout(null)}
                        >
                            {flyout.item.name}
                        </Link>
                        {flyout.item.children && (
                            <ul className="mt-1 border-t border-border-subtle pt-1">
                                {flyout.item.children.map((child) => {
                                    const isChildActive = pathname === child.href;
                                    return (
                                        <li key={child.name}>
                                            <Link
                                                href={child.href}
                                                className={cn(
                                                    "flex items-center gap-2 px-3 py-1.5 text-[12px] transition-colors",
                                                    isChildActive
                                                        ? "text-brand font-medium"
                                                        : "text-text-secondary hover:bg-surface-2 hover:text-text-primary"
                                                )}
                                                onClick={() => setFlyout(null)}
                                            >
                                                {child.IconComponent && <child.IconComponent className="w-3.5 h-3.5 shrink-0" />}
                                                <span>{child.name}</span>
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </div>
            )}

            <CustomizeSidebarModal
                isOpen={isCustomizeOpen}
                onClose={() => setIsCustomizeOpen(false)}
            />
        </>
    )
}

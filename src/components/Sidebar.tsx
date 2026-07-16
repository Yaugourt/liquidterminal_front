import Link from "next/link"
import { Settings, Shield, MessageCircle, Github, BookOpen, ChevronDown, PanelLeftClose, PanelLeftOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import { SidebarToggle } from "@/components/common"
import { TokenAvatar } from "@/components/common"
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

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
    const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
    const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
    const { user } = useAuthContext();
    const pathname = usePathname();

    const [hasMounted, setHasMounted] = useState(false);
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

    /** Icon node shared by both modes — token logo > custom image > lucide. */
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

    /** Collapsed rail item — centered icon, flyout on hover. */
    const renderCollapsedItem = (item: NavigationItem) => {
        const isActive = isItemActive(item);
        return (
            <li key={item.name} className="relative">
                {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 bg-brand rounded-r" />
                )}
                <Link
                    href={item.href}
                    aria-label={item.name}
                    className={cn(
                        "flex items-center justify-center h-9 w-9 mx-auto rounded-md transition-colors",
                        isActive
                            ? "bg-brand/10 text-text-primary"
                            : "text-text-secondary hover:bg-surface-2 hover:text-text-primary"
                    )}
                    onMouseEnter={(e) => openFlyout(item, e)}
                    onMouseLeave={scheduleFlyoutClose}
                    onClick={() => setFlyout(null)}
                >
                    {renderIcon(item, isActive)}
                </Link>
            </li>
        );
    };

    /** Expanded item — icon + label, chevron submenu (original behavior). */
    const renderItem = (item: NavigationItem) => {
        if (isCollapsed) return renderCollapsedItem(item);

        const isActive = isItemActive(item);
        const isSubOpen = openSubmenu === item.name;

        const linkClass = cn(
            "flex items-center gap-2.5 px-2.5 py-[7px] rounded-md text-[13px] font-medium transition-colors",
            isActive
                ? "bg-brand/10 text-text-primary"
                : "text-text-secondary hover:bg-surface-2 hover:text-text-primary"
        );
        const iconNode = renderIcon(item, isActive);

        return (
            <li key={item.name} className="relative">
                {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 bg-brand rounded-r" />
                )}
                {item.children ? (
                    <div className="flex items-center">
                        <Link href={item.href} className={cn(linkClass, "flex-1")} onClick={() => setIsOpen(false)}>
                            {iconNode}
                            <span className="truncate">{item.name}</span>
                        </Link>
                        <button
                            onClick={(e) => { e.preventDefault(); toggleSubmenu(item.name); }}
                            className="p-1 rounded text-text-tertiary hover:bg-surface-2 hover:text-text-primary transition-colors"
                            aria-label={`Toggle ${item.name}`}
                        >
                            <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", isSubOpen && "rotate-180")} />
                        </button>
                    </div>
                ) : (
                    <Link href={item.href} className={linkClass} onClick={() => setIsOpen(false)}>
                        {iconNode}
                        <span className="truncate">{item.name}</span>
                    </Link>
                )}
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
                    "transition-[transform,width] duration-300 ease-in-out z-50 lg:translate-x-0",
                    isCollapsed ? "w-[208px] lg:w-16" : "w-[232px] max-lg:w-[208px]",
                    isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}
            >
                {/* Bloc de marque */}
                <div className={cn(
                    "flex items-center border-b border-border-subtle",
                    isCollapsed ? "flex-col gap-1.5 px-0 py-3" : "justify-between gap-2 px-5 py-[14px]"
                )}>
                    <Link
                        href="/dashboard"
                        className={cn("flex items-center gap-2.5 hover:opacity-80 transition-opacity", isCollapsed && "justify-center")}
                        onClick={() => setIsOpen(false)}
                        aria-label="Liquid Terminal — Dashboard"
                    >
                        <Image src="/logo.svg" alt="Liquid Terminal" width={26} height={26} className="h-[26px] w-[26px]" />
                        {!isCollapsed && (
                            <div>
                                <div className="text-[14px] font-semibold leading-none text-text-primary">
                                    Liquid Terminal
                                </div>
                                <div className="text-[9px] uppercase tracking-[0.12em] text-text-tertiary mt-[3px]">
                                    Hyperliquid Data
                                </div>
                            </div>
                        )}
                    </Link>
                    {/* Desktop collapse toggle */}
                    <button
                        onClick={toggleCollapsed}
                        className="max-lg:hidden p-1.5 rounded-md text-text-tertiary hover:bg-surface-2 hover:text-text-primary transition-colors"
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
                <nav className={cn("flex-1 py-3 overflow-y-auto scrollbar-brand", isCollapsed ? "px-0" : "px-2.5")}>
                    <ul className={cn(isCollapsed ? "space-y-3" : "space-y-5")}>
                        {navigationGroups.map((group, groupIndex) => (
                            <li key={groupIndex} className={cn(isCollapsed ? "space-y-1" : "space-y-1")}>
                                {group.groupName && (
                                    isCollapsed ? (
                                        <div className="mx-3 mb-1.5 border-t border-border-subtle" aria-hidden />
                                    ) : (
                                        <div className="px-2.5 pb-1 text-[10px] uppercase tracking-[0.1em] text-text-tertiary font-semibold">
                                            {group.groupName}
                                        </div>
                                    )
                                )}
                                <ul className={cn("space-y-0.5", isCollapsed && "space-y-1")}>
                                    {group.items.map(renderItem)}
                                </ul>
                            </li>
                        ))}

                        {isAdmin && (
                            <li className="space-y-1">
                                {isCollapsed ? (
                                    <>
                                        <div className="mx-3 mb-1.5 border-t border-border-subtle" aria-hidden />
                                        {renderCollapsedItem({ name: 'User Management', href: '/user', IconComponent: Shield })}
                                    </>
                                ) : (
                                    <>
                                        <div className="px-2.5 pb-1 text-[10px] uppercase tracking-[0.1em] text-gold font-semibold">
                                            Administration
                                        </div>
                                        <ul className="space-y-0.5">
                                            <li className="relative">
                                                {pathname === '/user' && (
                                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 bg-gold rounded-r" />
                                                )}
                                                <Link
                                                    href="/user"
                                                    className={cn(
                                                        "flex items-center gap-2.5 px-2.5 py-[7px] rounded-md text-[13px] font-medium transition-colors",
                                                        pathname === '/user'
                                                            ? "bg-gold/10 text-text-primary"
                                                            : "text-text-secondary hover:bg-surface-2 hover:text-text-primary"
                                                    )}
                                                    onClick={() => setIsOpen(false)}
                                                >
                                                    <Shield className={cn("w-4 h-4 shrink-0", pathname === '/user' && "text-gold")} />
                                                    <span>User Management</span>
                                                </Link>
                                            </li>
                                        </ul>
                                    </>
                                )}
                            </li>
                        )}
                    </ul>
                </nav>

                {/* Pied — customize + statut + socials */}
                <div className="border-t border-border-subtle">
                    {isCollapsed ? (
                        <div className="flex flex-col items-center gap-1 py-2">
                            <button
                                onClick={() => setIsCustomizeOpen(true)}
                                className="p-2 rounded-md text-text-tertiary hover:bg-surface-2 hover:text-text-primary transition-colors"
                                aria-label="Customize sidebar"
                                title="Customize sidebar"
                            >
                                <Settings className="w-4 h-4" />
                            </button>
                            <span className="w-1.5 h-1.5 rounded-full bg-success" title="Mainnet" aria-label="Mainnet" />
                        </div>
                    ) : (
                        <>
                            <div className="px-2.5 py-2">
                                <button
                                    onClick={() => setIsCustomizeOpen(true)}
                                    className="flex items-center gap-2.5 w-full px-2.5 py-[7px] rounded-md text-[12px] text-text-tertiary hover:bg-surface-2 hover:text-text-primary transition-colors"
                                >
                                    <Settings className="w-4 h-4 shrink-0" />
                                    <span>Customize sidebar</span>
                                </button>
                            </div>
                            <div className="flex items-center justify-between px-4 py-3 border-t border-border-subtle">
                                <div className="flex items-center gap-1.5 text-[10px] text-text-tertiary">
                                    <span className="w-1.5 h-1.5 rounded-full bg-success" />
                                    Mainnet
                                </div>
                                <div className="flex items-center gap-0.5">
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
                        </>
                    )}
                </div>
            </div>

            {/* Collapsed-rail hover flyout — name label, plus child links when present. */}
            {isCollapsed && flyout && (
                <div
                    className="fixed left-16 z-[70] pl-2"
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

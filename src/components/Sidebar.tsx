import Link from "next/link"
import { Settings, Shield, MessageCircle, Github, BookOpen, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { SidebarToggle } from "@/components/common"
import Image from "next/image"
import { useState, useEffect } from "react"
import { useAuthContext } from "@/contexts/auth.context"
import { usePathname } from 'next/navigation'
import { hasRole } from "@/lib/roleHelpers"
import { useSidebarPreferences } from "@/store/use-sidebar-preferences"
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

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
    const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
    const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
    const { user } = useAuthContext();
    const pathname = usePathname();

    const [hasMounted, setHasMounted] = useState(false);
    const { preferences, initializePreferences, getPreferences } = useSidebarPreferences();
    const [navigationGroups, setNavigationGroups] = useState<NavigationGroup[]>(defaultNavigationGroups);

    useEffect(() => {
        setHasMounted(true);
    }, []);

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

    /** Item de navigation — style analytics, identité V4. */
    const renderItem = (item: NavigationItem) => {
        const isActive =
            pathname === item.href ||
            (item.href.startsWith("/market/") && pathname.startsWith(`${item.href}/`)) ||
            (item.children && item.children.some((child) => pathname === child.href));
        const isSubOpen = openSubmenu === item.name;

        const linkClass = cn(
            "flex items-center gap-2.5 px-2.5 py-[7px] rounded-md text-[13px] font-medium transition-colors",
            isActive
                ? "bg-brand/10 text-text-primary"
                : "text-text-secondary hover:bg-surface-2 hover:text-text-primary"
        );
        const Icon = item.IconComponent;
        const iconNode = item.icon ? (
            <Image src={item.icon} alt="" width={16} height={16} className="shrink-0" />
        ) : Icon ? (
            <Icon className={cn("w-4 h-4 shrink-0", isActive && "text-brand")} />
        ) : null;

        return (
            <li key={item.name} className="relative">
                {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 bg-brand rounded-r" />
                )}
                {item.children ? (
                    <div className="flex items-center">
                        <Link href={item.href} className={cn(linkClass, "flex-1")} onClick={() => setIsOpen(false)}>
                            {iconNode}
                            <span>{item.name}</span>
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
                        <span>{item.name}</span>
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
                    "fixed left-0 top-0 h-full w-[232px] max-lg:w-[208px] bg-surface flex flex-col",
                    "border-r border-border-subtle",
                    "transition-transform duration-300 ease-in-out z-50 lg:translate-x-0",
                    isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}
            >
                {/* Bloc de marque */}
                <div className="flex items-center justify-between gap-2 px-5 py-[14px] border-b border-border-subtle">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
                        onClick={() => setIsOpen(false)}
                    >
                        <Image src="/logo.svg" alt="Liquid Terminal" width={26} height={26} className="h-[26px] w-[26px]" />
                        <div>
                            <div className="text-[14px] font-semibold leading-none text-text-primary">
                                Liquid Terminal
                            </div>
                            <div className="text-[9px] uppercase tracking-[0.12em] text-text-tertiary mt-[3px]">
                                Hyperliquid Data
                            </div>
                        </div>
                    </Link>
                    <SidebarToggle
                        onClick={() => setIsOpen(false)}
                        className="lg:hidden"
                        label="Close navigation"
                    />
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-2.5 py-3 overflow-y-auto scrollbar-brand">
                    <ul className="space-y-5">
                        {navigationGroups.map((group, groupIndex) => (
                            <li key={groupIndex} className="space-y-1">
                                {group.groupName && (
                                    <div className="px-2.5 pb-1 text-[10px] uppercase tracking-[0.1em] text-text-tertiary font-semibold">
                                        {group.groupName}
                                    </div>
                                )}
                                <ul className="space-y-0.5">
                                    {group.items.map(renderItem)}
                                </ul>
                            </li>
                        ))}

                        {isAdmin && (
                            <li className="space-y-1">
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
                            </li>
                        )}
                    </ul>
                </nav>

                {/* Pied — customize + statut + socials */}
                <div className="border-t border-border-subtle">
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
                </div>
            </div>

            <CustomizeSidebarModal
                isOpen={isCustomizeOpen}
                onClose={() => setIsCustomizeOpen(false)}
            />
        </>
    )
}

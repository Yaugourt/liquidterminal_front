import Link from "next/link"
import { Settings, Shield, MessageCircle, Github, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
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

// Social links


const socials = [
    { name: 'Discord', href: '#', Icon: MessageCircle },
    { name: 'Twitter', href: 'https://x.com/liquidterminal', Icon: () => <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
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

    // Hydration fix: track if component has mounted
    const [hasMounted, setHasMounted] = useState(false);

    // Sidebar preferences
    const { preferences, initializePreferences, getPreferences } = useSidebarPreferences();

    // Always use defaultNavigationGroups for SSR, only apply preferences after mount
    const [navigationGroups, setNavigationGroups] = useState<NavigationGroup[]>(defaultNavigationGroups);

    // Mark as mounted after first render (hydration complete)
    useEffect(() => {
        setHasMounted(true);
    }, []);

    // Initialize preferences on mount
    useEffect(() => {
        if (!hasMounted) return;
        const defaultPrefs = getDefaultSidebarPreferences();
        initializePreferences(defaultPrefs);
    }, [initializePreferences, hasMounted]);

    // Apply preferences to navigation only after mount (prevents hydration mismatch)
    useEffect(() => {
        if (!hasMounted) return;
        const prefs = getPreferences();
        if (prefs) {
            const filteredGroups = applyPreferencesToNavigation(defaultNavigationGroups, prefs);
            setNavigationGroups(filteredGroups);
        }
    }, [preferences, getPreferences, hasMounted]);

    const toggleSubmenu = (name: string) => {
        setOpenSubmenu(prev => prev === name ? null : name);
    };

    // Check if user is admin
    const isAdmin = hasRole(user, 'ADMIN');

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <div
                className={cn(
                    "fixed left-0 top-0 h-full w-[220px] max-lg:w-[200px] bg-surface flex flex-col",
                    "border-r border-border-subtle",
                    "transition-transform duration-300 ease-in-out z-50",
                    "lg:translate-x-0",
                    isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-3 border-b border-border-subtle h-14">
                    <SidebarToggle
                        onClick={() => setIsOpen(false)}
                        className="lg:hidden"
                        label="Close navigation"
                    />

                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                        onClick={() => setIsOpen(false)}
                    >
                        <div className="w-[22px] h-[22px] rounded-md bg-brand text-brand-text-on flex items-center justify-center text-[13px] font-semibold">
                            L
                        </div>
                        <h1 className="hidden lg:block text-sm font-semibold text-text-primary">
                            Liquid Terminal
                        </h1>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-2 overflow-y-auto scrollbar-brand">
                    <ul>
                        {navigationGroups.map((group, groupIndex) => (
                            <li key={groupIndex}>
                                {group.groupName && (
                                    <div className="px-2 pt-4 pb-1.5 text-[10px] uppercase tracking-[0.08em] font-medium text-text-tertiary">
                                        {group.groupName}
                                    </div>
                                )}
                                <ul className="space-y-0.5">
                                    {group.items.map((item) => {
                                        const isActive =
                                            pathname === item.href ||
                                            (item.href.startsWith("/market/") &&
                                                pathname.startsWith(`${item.href}/`)) ||
                                            (item.children && item.children.some((child) => pathname === child.href));
                                        const isOpen = openSubmenu === item.name;
                                        return (
                                            <li key={item.name}>
                                                {item.children ? (
                                                    <div className="flex items-center">
                                                        <Link
                                                            href={item.href}
                                                            className={cn(
                                                                "flex items-center gap-2.5 px-2 py-1.5 rounded-md transition-colors relative group flex-1",
                                                                isActive
                                                                    ? "bg-brand/10 text-brand font-medium"
                                                                    : "text-text-secondary hover:bg-surface-2 hover:text-text-primary"
                                                            )}
                                                            onClick={() => setIsOpen(false)}
                                                        >
                                                            <div className={cn(
                                                                "transition-transform",
                                                                isActive ? "scale-110" : "group-hover:scale-105"
                                                            )}>
                                                                {item.icon ? (
                                                                    <Image
                                                                        src={item.icon}
                                                                        alt={item.name}
                                                                        width={14}
                                                                        height={14}
                                                                    />
                                                                ) : item.IconComponent ? (
                                                                    <item.IconComponent className="w-3.5 h-3.5" />
                                                                ) : null}
                                                            </div>
                                                            <span className="text-[13px]">{item.name}</span>
                                                        </Link>
                                                        <button
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                toggleSubmenu(item.name);
                                                            }}
                                                            className={cn(
                                                                "p-1 rounded transition-colors",
                                                                isActive
                                                                    ? "text-brand hover:bg-surface-2"
                                                                    : "text-text-tertiary hover:bg-surface-2 hover:text-text-primary"
                                                            )}
                                                        >
                                                            <span className="text-xs">{isOpen ? '▲' : '▼'}</span>
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <Link
                                                        href={item.href}
                                                        className={cn(
                                                            "flex items-center gap-2.5 px-2 py-1.5 rounded-md transition-colors relative group",
                                                            isActive
                                                                ? "bg-brand/10 text-brand font-medium"
                                                                : "text-text-secondary hover:bg-surface-2 hover:text-text-primary"
                                                        )}
                                                        onClick={() => setIsOpen(false)}
                                                    >
                                                        <div className={cn(
                                                            "transition-transform",
                                                            isActive ? "scale-110" : "group-hover:scale-105"
                                                        )}>
                                                            {item.icon ? (
                                                                <Image
                                                                    src={item.icon}
                                                                    alt={item.name}
                                                                    width={16}
                                                                    height={16}
                                                                />
                                                            ) : item.IconComponent ? (
                                                                <item.IconComponent className="w-4 h-4" />
                                                            ) : null}
                                                        </div>
                                                        <span className="text-[13px]">{item.name}</span>
                                                    </Link>
                                                )}
                                                {/* Sous-menu */}
                                                {item.children && isOpen && (
                                                    <ul className="ml-6 mt-0.5 space-y-0.5 border-l border-border-subtle pl-2">
                                                        {item.children.map((child: NavigationItem) => {
                                                            const isChildActive = pathname === child.href;
                                                            return (
                                                                <li key={child.name}>
                                                                    <Link
                                                                        href={child.href}
                                                                        className={cn(
                                                                            "flex items-center gap-2 px-2 py-1 rounded transition-colors",
                                                                            isChildActive
                                                                                ? "bg-brand/10 text-brand font-medium"
                                                                                : "text-text-tertiary hover:bg-surface-2 hover:text-text-primary"
                                                                        )}
                                                                        onClick={() => setIsOpen(false)}
                                                                    >
                                                                        {child.IconComponent && <child.IconComponent className="w-3.5 h-3.5" />}
                                                                        <span className="text-xs">{child.name}</span>
                                                                    </Link>
                                                                </li>
                                                            );
                                                        })}
                                                    </ul>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </li>
                        ))}

                        {/* Admin Section — gold preserved (legitimate premium/admin tier per V4 spec) */}
                        {isAdmin && (
                            <li>
                                <div className="px-2 pt-4 pb-1.5 text-[10px] uppercase tracking-[0.08em] font-medium text-gold">
                                    Administration
                                </div>
                                <ul>
                                    <li>
                                        <Link
                                            href="/user"
                                            className={cn(
                                                "flex items-center gap-2.5 px-2 py-1.5 rounded-md transition-colors relative group",
                                                pathname === '/user'
                                                    ? "bg-gold/10 text-gold font-medium"
                                                    : "text-text-secondary hover:bg-surface-2 hover:text-gold"
                                            )}
                                            onClick={() => setIsOpen(false)}
                                        >
                                            <div className={cn(
                                                "transition-transform",
                                                pathname === '/user' ? "scale-110" : "group-hover:scale-105"
                                            )}>
                                                <Shield className="w-3.5 h-3.5" />
                                            </div>
                                            <span className="text-[13px]">User Management</span>
                                        </Link>
                                    </li>
                                </ul>
                            </li>
                        )}
                    </ul>
                </nav>

                {/* Customize Button */}
                <div className="px-3 py-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsCustomizeOpen(true)}
                        className="w-full justify-start gap-2 text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-colors"
                    >
                        <Settings className="w-4 h-4" />
                        <span className="text-xs">Customize Sidebar</span>
                    </Button>
                </div>

                {/* Social Links */}
                <div className="flex items-center justify-center gap-3 py-3 px-3 border-t border-border-subtle">
                    {socials.map((item) => (
                        <a
                            key={item.name}
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group p-1.5 rounded-md hover:bg-surface-2 transition-colors"
                        >
                            <item.Icon className="h-4 w-4 text-text-tertiary group-hover:text-brand transition-colors" />
                        </a>
                    ))}
                </div>
            </div>

            {/* Customize Modal */}
            <CustomizeSidebarModal
                isOpen={isCustomizeOpen}
                onClose={() => setIsCustomizeOpen(false)}
            />
        </>
    )
}

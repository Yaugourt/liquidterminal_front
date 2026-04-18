import Link from "next/link"
import { Menu, Settings, Shield, MessageCircle, Github, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
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
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <div
                className={cn(
                    "fixed left-0 top-0 h-full w-[220px] max-lg:w-[200px] bg-brand-main flex flex-col",
                    "border-r border-border-subtle",
                    "transition-transform duration-300 ease-in-out z-50",
                    "lg:translate-x-0",
                    isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-3 border-b border-border-subtle">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden hover:bg-white/5"
                        onClick={() => setIsOpen(false)}
                    >
                        <Menu className="h-5 w-5 text-brand-accent" />
                    </Button>
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                        onClick={() => setIsOpen(false)}
                    >
                        <Image
                            src="/logo.svg"
                            alt="Logo"
                            width={24}
                            height={24}
                            className="h-6 w-6"
                        />
                        <h1 className="hidden lg:block text-sm font-bold">
                            <span className="text-brand-accent font-inter font-semibold">Liquid </span>
                            <span className="text-white font-inter">Terminal</span>
                        </h1>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-2 py-2 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    <ul className="space-y-4">
                        {navigationGroups.map((group, groupIndex) => (
                            <li key={groupIndex} className="space-y-1">
                                {group.groupName && (
                                    <div className="px-3 text-label">
                                        <span className="text-brand-accent font-inter font-semibold">{group.groupName.split(' ')[0]} </span>
                                        <span className="text-text-secondary font-inter">{group.groupName.split(' ').slice(1).join(' ')}</span>
                                    </div>
                                )}
                                <ul className="space-y-[2px]">
                                    {group.items.map((item) => {
                                        const isActive =
                                            pathname === item.href ||
                                            (item.href.startsWith("/market/") &&
                                                pathname.startsWith(`${item.href}/`)) ||
                                            (item.children && item.children.some((child) => pathname === child.href));
                                        const isOpen = openSubmenu === item.name;
                                        return (
                                            <li key={item.name} className="relative">
                                                {/* Barre verticale active */}
                                                {isActive && (
                                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 bg-brand-accent rounded-r" />
                                                )}
                                                {item.children ? (
                                                    <div className="flex items-center">
                                                        <Link
                                                            href={item.href}
                                                            className={cn(
                                                                "flex items-center gap-3 px-3 py-1.5 rounded-lg transition-all relative group flex-1",
                                                                isActive
                                                                    ? "bg-brand-accent/10 text-brand-accent"
                                                                    : "text-white/80 hover:bg-white/5 hover:text-white"
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
                                                                        width={18}
                                                                        height={18}
                                                                    />
                                                                ) : item.IconComponent ? (
                                                                    <item.IconComponent className="w-5 h-5" />
                                                                ) : null}
                                                            </div>
                                                            <span className="text-sm">{item.name}</span>
                                                        </Link>
                                                        <button
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                toggleSubmenu(item.name);
                                                            }}
                                                            className={cn(
                                                                "p-1 rounded transition-all",
                                                                isActive
                                                                    ? "text-brand-accent hover:bg-white/5"
                                                                    : "text-text-secondary hover:bg-white/5 hover:text-white"
                                                            )}
                                                        >
                                                            <span className="text-xs">{isOpen ? '▲' : '▼'}</span>
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <Link
                                                        href={item.href}
                                                        className={cn(
                                                            "flex items-center gap-3 px-3 py-1.5 rounded-lg transition-all relative group",
                                                            isActive
                                                                ? "bg-brand-accent/10 text-brand-accent"
                                                                : "text-white/80 hover:bg-white/5 hover:text-white"
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
                                                                    width={18}
                                                                    height={18}
                                                                />
                                                            ) : item.IconComponent ? (
                                                                <item.IconComponent className="w-5 h-5" />
                                                            ) : null}
                                                        </div>
                                                        <span className="text-sm">{item.name}</span>
                                                    </Link>
                                                )}
                                                {/* Sous-menu */}
                                                {item.children && isOpen && (
                                                    <ul className="ml-7 mt-1 space-y-1 border-l border-border-subtle pl-2">
                                                        {item.children.map((child: NavigationItem) => {
                                                            const isChildActive = pathname === child.href;
                                                            return (
                                                                <li key={child.name}>
                                                                    <Link
                                                                        href={child.href}
                                                                        className={cn(
                                                                            "flex items-center gap-2 px-2 py-1 rounded-md transition-all",
                                                                            isChildActive
                                                                                ? "bg-brand-accent/10 text-brand-accent font-medium"
                                                                                : "text-text-secondary hover:bg-white/5 hover:text-white"
                                                                        )}
                                                                        onClick={() => setIsOpen(false)}
                                                                    >
                                                                        {child.IconComponent && <child.IconComponent className="w-4 h-4" />}
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

                        {/* Admin Section - Only visible to admins */}
                        {isAdmin && (
                            <li className="space-y-1">
                                <div className="px-3 text-label">
                                    <span className="text-brand-gold font-inter font-semibold">Administration</span>
                                </div>
                                <ul className="space-y-[2px]">
                                    <li className="relative">
                                        {pathname === '/user' && (
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 bg-brand-gold rounded-r" />
                                        )}
                                        <Link
                                            href="/user"
                                            className={cn(
                                                "flex items-center gap-3 px-3 py-1.5 rounded-lg transition-all relative group",
                                                pathname === '/user'
                                                    ? "bg-brand-gold/10 text-brand-gold"
                                                    : "text-white/80 hover:bg-white/5 hover:text-brand-gold"
                                            )}
                                            onClick={() => setIsOpen(false)}
                                        >
                                            <div className={cn(
                                                "transition-transform",
                                                pathname === '/user' ? "scale-110" : "group-hover:scale-105"
                                            )}>
                                                <Shield className="w-5 h-5" />
                                            </div>
                                            <span className="text-sm">User Management</span>
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
                        className="w-full interactive-secondary justify-start gap-2 transition-colors"
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
                            className="group p-1.5 rounded-lg hover-subtle"
                        >
                            <item.Icon className="h-4 w-4 text-text-muted group-hover:text-brand-accent transition-colors" />
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

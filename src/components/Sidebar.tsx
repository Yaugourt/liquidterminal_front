import Link from "next/link"
import { Icon } from '@iconify/react'
import { Menu, Settings, Shield } from "lucide-react"
import { PiSignIn, PiSignOut } from "react-icons/pi";
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useState, useEffect } from "react"
import { useAuthContext } from "@/contexts/auth.context"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
    { name: 'Discord', href: '#', iconName: 'ic:baseline-discord' },
    { name: 'Twitter', href: 'https://x.com/liquidterminal', iconName: 'simple-icons:x' },
    { name: 'Github', href: 'https://github.com/Liquid-Terminal', iconName: 'mdi:github' },
    { name: 'GitBook', href: 'https://liquid-terminal.gitbook.io/liquid-terminal', iconName: 'simple-icons:gitbook' },
]

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
    const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
    const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
    const { authenticated, login, logout, privyUser, user } = useAuthContext();
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
                    "fixed left-0 top-0 h-full w-[220px] max-lg:w-[200px] bg-[#051728] flex flex-col",
                    "border-r border-[#83E9FF1A]",
                    "transition-transform duration-300 ease-in-out z-50",
                    "lg:translate-x-0",
                    isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-3 border-b border-[#83E9FF1A]">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden hover:bg-[#83E9FF1A]"
                        onClick={() => setIsOpen(false)}
                    >
                        <Menu className="h-5 w-5 text-[#83E9FF]" />
                    </Button>
                    <div className="flex items-center gap-2">
                        <Image 
                            src="/logo.svg" 
                            alt="Logo" 
                            width={24} 
                            height={24}
                            className="h-6 w-6" 
                        />
                        <h1 className="hidden lg:block text-sm font-bold">
                            <span className="text-[#83E9FF] font-higuen">Liquid </span>
                            <span className="text-white font-inter">Terminal</span>
                        </h1>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-2 py-2 overflow-y-auto scrollbar-thin scrollbar-thumb-[#83E9FF1A] scrollbar-track-transparent">
                    <ul className="space-y-4">
                        {navigationGroups.map((group, groupIndex) => (
                            <li key={groupIndex} className="space-y-1">
                                {group.groupName && (
                                    <div className="px-3 text-xs">
                                        <span className="text-[#83E9FFCC] font-higuen">{group.groupName.split(' ')[0]} </span>
                                        <span className="text-[#FFFFFFCC] font-inter">{group.groupName.split(' ').slice(1).join(' ')}</span>
                                    </div>
                                )}
                                <ul className="space-y-[2px]">
                                    {group.items.map((item) => {
                                        const isActive = pathname === item.href || (item.children && item.children.some(child => pathname === child.href));
                                        const isOpen = openSubmenu === item.name;
                                        return (
                                            <li key={item.name} className="relative">
                                                {/* Barre verticale active */}
                                                {isActive && (
                                                    <div className="absolute left-0 top-1/2 h-5 bg-[#83E9FF] rounded-r shadow-[0_0_8px_0_rgba(131,233,255,0.3)]" />
                                                )}
                                                {item.children ? (
                                                    <div className="flex items-center">
                                                        <Link
                                                            href={item.href}
                                                            className={cn(
                                                                "flex items-center gap-3 px-3 py-1.5 rounded-lg transition-all relative group flex-1",
                                                                isActive 
                                                                    ? "bg-[#83E9FF0A] text-[#83E9FF]" 
                                                                    : "text-[#FFFFFFCC] hover:bg-[#83E9FF0A] hover:text-[#83E9FF]"
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
                                                                    ? "text-[#83E9FF] hover:bg-[#83E9FF1A]" 
                                                                    : "text-[#FFFFFFCC] hover:bg-[#83E9FF0A] hover:text-[#83E9FF]"
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
                                                                ? "bg-[#83E9FF0A] text-[#83E9FF]" 
                                                                : "text-[#FFFFFFCC] hover:bg-[#83E9FF0A] hover:text-[#83E9FF]"
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
                                                    <ul className="ml-7 mt-1 space-y-1">
                                                        {item.children.map((child: NavigationItem) => {
                                                            const isChildActive = pathname === child.href;
                                                            return (
                                                                <li key={child.name}>
                                                                    <Link
                                                                        href={child.href}
                                                                        className={cn(
                                                                            "flex items-center gap-2 px-2 py-1 rounded transition-all",
                                                                            isChildActive
                                                                                ? "bg-[#83E9FF1A] text-[#83E9FF] font-semibold"
                                                                                : "text-[#FFFFFFCC] hover:bg-[#83E9FF0A] hover:text-[#83E9FF]"
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
                                <div className="px-3 text-xs">
                                    <span className="text-[#f9e370CC] font-higuen">Administration</span>
                                </div>
                                <ul className="space-y-[2px]">
                                    <li className="relative">
                                        {pathname === '/user' && (
                                            <div className="absolute left-0 top-1/2 h-5 bg-[#f9e370] rounded-r shadow-[0_0_8px_0_rgba(249,227,112,0.3)]" />
                                        )}
                                        <Link
                                            href="/user"
                                            className={cn(
                                                "flex items-center gap-3 px-3 py-1.5 rounded-lg transition-all relative group",
                                                pathname === '/user'
                                                    ? "bg-[#f9e3700A] text-[#f9e370]" 
                                                    : "text-[#FFFFFFCC] hover:bg-[#f9e3700A] hover:text-[#f9e370]"
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

                {/* Account Section */}
                <div className="p-3">
                    {!authenticated ? (
                        <Button 
                            onClick={() => login()}
                            className="group relative w-full bg-[#051728] rounded-lg overflow-hidden"
                        >
                            <div className="absolute inset-[1px] bg-[#051728] rounded-lg z-10" />
                            <div className="absolute inset-0 bg-[#83E9FF] blur-[2px]" />
                            <div className="relative z-20 flex items-center justify-center gap-2 py-2.5">
                                <PiSignIn className="w-6 h-6 brightness-0 invert group-hover:scale-110 transition-transform duration-300" />
                                <span className="font-semibold text-[#83E9FF] group-hover:text-white group-hover:drop-shadow-[0_0_6px_rgba(131,233,255,0.6)] transition-all duration-300">
                                    Login
                                </span>
                            </div>
                        </Button>
                    ) : (
                        <div className="p-1.5 bg-[#83E9FF05] rounded-lg">
                            <div className="flex items-center gap-2">
                                <Avatar className="h-7 w-7 ring-1 ring-[#83E9FF1A]">
                                    {privyUser?.twitter?.profilePictureUrl ? (
                                        <Image 
                                            src={privyUser.twitter.profilePictureUrl}
                                            alt="Avatar"
                                            width={28}
                                            height={28}
                                            className="object-cover rounded-full"
                                        />
                                    ) : (
                                        <AvatarFallback className="bg-[#1a2c38] text-[#83E9FF] text-xs font-medium">
                                            {privyUser?.twitter?.username?.[0]?.toUpperCase() || "U"}
                                        </AvatarFallback>
                                    )}
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white text-sm font-medium truncate">
                                        {privyUser?.twitter?.username || "User"}
                                    </p>
                                </div>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => logout()}
                                    className="h-7 w-7 hover:bg-[#83E9FF1A] text-gray-400 hover:text-[#83E9FF]"
                                >
                                    <PiSignOut className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Customize Button */}
                <div className="px-2 py-2 border-t border-[#83E9FF1A]">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsCustomizeOpen(true)}
                        className="w-full border-[#83E9FF4D] text-white hover:bg-[#83E9FF20] justify-start gap-2"
                    >
                        <Settings className="w-4 h-4" />
                        <span className="text-xs">Customize Sidebar</span>
                    </Button>
                </div>

                {/* Social Links */}
                <div className="flex items-center justify-center gap-2 py-1.5 px-2 border-t border-[#83E9FF1A]">
                    {socials.map((item) => (
                        <a
                            key={item.name}
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative p-1"
                        >
                            <Icon 
                                icon={item.iconName} 
                                className="h-3.5 w-3.5 text-[#F9E370]/60 group-hover:text-[#F9E370] transition-colors" 
                            />
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
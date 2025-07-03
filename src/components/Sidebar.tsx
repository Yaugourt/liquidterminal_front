import Link from "next/link"
import { Icon } from '@iconify/react'
import { Menu } from "lucide-react"
import { PiShareNetworkBold, PiVault, PiListMagnifyingGlass, PiInfinity, PiChartLine, PiWallet, PiSignIn, PiSignOut, PiChalkboardTeacherLight } from "react-icons/pi";
import { AiOutlineHome } from "react-icons/ai";
import { MdOutlineCandlestickChart } from "react-icons/md";
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useState } from "react"
import { useAuthContext } from "@/contexts/auth.context"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { usePathname } from 'next/navigation'

// Define navigation groups
const navigationGroups = [
    {
        groupName: null, // No group title for Home
        items: [
            {
                name: 'Home',
                href: '/',
                icon: null,
                IconComponent: AiOutlineHome
            },
        ]
    },
    {
        groupName: 'Explorer',
        items: [
            {
                name: 'Dashboard',
                href: '/explorer',
                icon: '/sidebar/Search.svg'
            },
            {
                name: 'Validator',
                href: '/explorer/validator',
                icon: null,
                IconComponent: PiShareNetworkBold
            },
            {
                name: 'Vaults',
                href: '/explorer/vault',
                icon: null,
                IconComponent: PiVault
            },
        ]
    },
    {
        groupName: 'Market',
        items: [
            {
                name: 'Spot',
                href: '/market/spot',
                icon: null,
                IconComponent: MdOutlineCandlestickChart
            },
            {
                name: 'Perpetual',
                href: '/market/perp',
                icon: null,
                IconComponent: PiInfinity
            },
            {
                name: 'Wallet',
                href: '/wallets',
                icon: null,
                IconComponent: PiWallet
            },
        ]
    },
    {
        groupName: 'Ecosystem',
        items: [
            {
                name: 'Project',
                href: '/project',
                icon: null,
                IconComponent: PiListMagnifyingGlass
            },
            {
                name: 'Education',
                href: '/education',
                icon: null,
                IconComponent: PiChalkboardTeacherLight
            },
        ]
    },
]

const socials = [
    { name: 'Discord', href: '#', iconName: 'ic:baseline-discord' },
    { name: 'Twitter', href: '#', iconName: 'simple-icons:x' },
    { name: 'Github', href: '#', iconName: 'mdi:github' },
]

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
    const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
    const { authenticated, login, logout, privyUser } = useAuthContext();
    const pathname = usePathname();

    const toggleSubmenu = (name: string) => {
        setOpenSubmenu(openSubmenu === name ? null : name);
    };

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
                                    <div className="px-3 text-[11px] font-medium text-[#83E9FF99] uppercase tracking-wider">
                                        {group.groupName}
                                    </div>
                                )}
                                <ul className="space-y-[2px]">
                                    {group.items.map((item) => {
                                        const isActive = pathname === item.href;
                                        return (
                                            <li key={item.name} className="relative">
                                                {/* Barre verticale active */}
                                                {isActive && (
                                                    <div className="absolute left-0 top-1/2 h-5 bg-[#83E9FF] rounded-r shadow-[0_0_8px_0_rgba(131,233,255,0.3)]" />
                                                )}
                                                <Link
                                                    href={item.href}
                                                    className={cn(
                                                        "flex items-center gap-3 px-3 py-1.5 rounded-lg transition-all",
                                                        "relative group",
                                                        isActive 
                                                            ? "bg-[#83E9FF0A] text-[#83E9FF]" 
                                                            : "text-[#FFFFFFCC] hover:bg-[#83E9FF0A] hover:text-[#83E9FF]"
                                                    )}
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
                                            </li>
                                        );
                                    })}
                                </ul>
                            </li>
                        ))}
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
                        <div className="p-2 bg-[#83E9FF0A] rounded-xl border border-[#83E9FF1A] backdrop-blur-sm">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="absolute -inset-1 bg-[#83E9FF] rounded-full blur opacity-20" />
                                    <Avatar className="relative h-9 w-9 ring-2 ring-[#83E9FF1A] ring-offset-2 ring-offset-[#051728]">
                                        {privyUser?.twitter?.profilePictureUrl ? (
                                            <Image 
                                                src={privyUser.twitter.profilePictureUrl}
                                                alt="Avatar"
                                                width={36}
                                                height={36}
                                                className="object-cover rounded-full"
                                            />
                                        ) : (
                                            <AvatarFallback className="bg-[#1a2c38] text-[#83E9FF] font-medium">
                                                {privyUser?.twitter?.username?.[0]?.toUpperCase() || "U"}
                                            </AvatarFallback>
                                        )}
                                    </Avatar>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white font-medium truncate">
                                        {privyUser?.twitter?.username || "User"}
                                    </p>
                                    <p className="text-[#FFFFFF80] text-xs truncate">Connected with Twitter</p>
                                </div>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => logout()}
                                    className="hover:bg-[#83E9FF1A] text-[#83E9FF]"
                                >
                                    <PiSignOut className="w-6 h-6" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Social Links */}
                <div className="flex items-center justify-center gap-3 py-2 px-2 border-t border-[#83E9FF1A] bg-[#83E9FF05]">
                    {socials.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="group relative p-1.5"
                        >
                            <div className="absolute inset-0 bg-[#83E9FF] rounded-lg opacity-0 group-hover:opacity-10 transition-opacity" />
                            <Icon 
                                icon={item.iconName} 
                                className="h-4 w-4 text-[#83E9FFCC] group-hover:text-[#83E9FF] transition-colors relative z-10" 
                            />
                        </Link>
                    ))}
                </div>
            </div>
        </>
    )
}
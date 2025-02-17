import Link from "next/link"
import { Icon } from '@iconify/react'
import { Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Image from "next/image"

const navigation = [
    {
        name: 'Dashboard',
        href: '/',
        icon: '/sidebar/Home.svg'
    },
    {
        name: 'Explorer',
        href: '/explorer',
        icon: '/sidebar/Search.svg'
    },
    {
        name: 'Market',
        href: '/market',
        icon: '/sidebar/Line_up.svg'
    },
    {
        name: 'Project',
        href: '/project',
        icon: '/sidebar/Folder_line.svg'
    },
    {
        name: 'Wallets',
        href: '/wallets',
        icon: '/sidebar/Wallet_alt.svg'
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
    return (
        <>
            {/* Overlay - visible uniquement sur mobile quand la sidebar est ouverte */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <div
                className={cn(
                    "fixed left-0 top-0 h-full w-[200px] bg-[#051728] p-2 flex flex-col",
                    "transition-transform duration-300 ease-in-out z-50",
                    "lg:translate-x-0",
                    isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="bg-[#1a2c38] lg:hidden"
                        onClick={() => setIsOpen(false)}
                    >
                        <Menu className="h-8 w-8 text-white" />
                    </Button>
                    <div className="flex items-center gap-2">
                        <img src="/logo.svg" alt="Logo" className="h-6 w-6" />
                        <h1 className="hidden lg:block text-sm font-bold">
                            <span className="text-[#83E9FF]">Liquid</span>
                            <span className="text-white">Terminal</span>
                        </h1>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1">
                    <ul className="space-y-2">
                        {navigation.map((item) => (
                            <li key={item.name}>
                                <Link
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2 rounded-lg text-white hover:bg-[#112941] transition-colors",
                                        "hover:text-white"
                                    )}
                                >
                                    <Image
                                        src={item.icon}
                                        alt={item.name}
                                        width={20}
                                        height={20}
                                    />
                                    <span>{item.name}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Social Links */}
                <div className="flex items-center justify-center gap-8 mb-4">
                    {socials.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="text-[#83E9FFCC] hover:text-white transition-colors"
                        >
                            <Icon icon={item.iconName} className="h-6 w-6" />
                        </Link>
                    ))}
                </div>
            </div>
        </>
    )
}
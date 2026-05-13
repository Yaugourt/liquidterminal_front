"use client"

import Link from "next/link"
import Image from "next/image"
import { LogIn, LogOut } from "lucide-react"
import { useAuthContext } from "@/contexts/auth.context"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { XpBadge, DailyTasksPopover } from "@/components/xp"
import { cn } from "@/lib/utils"

const TelegramIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
)

export function UserAccountCompact() {
    const { authenticated, login, logout, privyUser, user } = useAuthContext()
    const router = useRouter()

    if (!authenticated) {
        return (
            <Button
                onClick={() => login()}
                size="sm"
                className="bg-brand-accent hover:bg-brand-accent/90 text-brand-main font-bold text-xs px-3 py-1.5 h-auto rounded-lg"
            >
                <LogIn className="w-3.5 h-3.5 mr-1.5" />
                Login
            </Button>
        )
    }

    return (
        <div className="flex items-center gap-2">
            {/* XP Badge compact */}
            <div onClick={(e) => e.stopPropagation()}>
                <XpBadge compact showStreak />
            </div>

            {/* Daily Tasks */}
            <div onClick={(e) => e.stopPropagation()}>
                <DailyTasksPopover />
            </div>

            {/* Telegram */}
            <button
                onClick={() => router.push('/profile')}
                className={cn(
                    "stat-card flex items-center gap-1.5 cursor-pointer transition-colors",
                    user?.telegramUsername
                        ? "text-emerald-400 hover:border-emerald-500/40"
                        : "text-brand-telegram hover:border-brand-telegram/40"
                )}
                title={user?.telegramUsername ? `Telegram: @${user.telegramUsername}` : 'Connect Telegram'}
            >
                <TelegramIcon className="h-3 w-3 shrink-0" />
                <span className="text-[10px] font-medium hidden lg:block">
                    {user?.telegramUsername ? `@${user.telegramUsername}` : 'Telegram'}
                </span>
            </button>

            {/* Avatar + username → profile */}
            <Link
                href="/profile"
                className="flex items-center gap-1.5 stat-card hover:border-border-hover transition-colors"
            >
                <Avatar className="h-5 w-5 shrink-0">
                    {privyUser?.twitter?.profilePictureUrl ? (
                        <Image
                            src={privyUser.twitter.profilePictureUrl}
                            alt="Avatar"
                            width={20}
                            height={20}
                            className="object-cover rounded-full"
                        />
                    ) : (
                        <AvatarFallback className="bg-brand-secondary text-brand-accent text-[9px] font-medium">
                            {privyUser?.twitter?.username?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                    )}
                </Avatar>
                <span className="text-white text-[11px] font-medium hidden md:block max-w-[90px] truncate">
                    {privyUser?.twitter?.username || "Profile"}
                </span>
            </Link>

            {/* Logout */}
            <button
                onClick={() => logout()}
                className="stat-card flex items-center gap-1 text-text-muted hover:text-rose-400 hover:border-rose-500/30 transition-colors cursor-pointer"
                title="Logout"
            >
                <LogOut className="w-3 h-3" />
            </button>
        </div>
    )
}

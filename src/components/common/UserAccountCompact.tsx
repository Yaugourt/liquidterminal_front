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
                className="bg-action hover:bg-action-hover text-white font-medium text-xs px-3.5 h-7 rounded-md transition-colors"
            >
                <LogIn className="w-3.5 h-3.5 mr-1.5" />
                Connect
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

            {/* Connect Wallet CTA (when wallet not linked) — placeholder slot for now */}

            {/* Telegram (icon-btn 32x32 per V4 ref) */}
            <button
                onClick={() => router.push('/profile')}
                className={cn(
                    "h-8 w-8 inline-flex items-center justify-center rounded-md border border-border-subtle bg-surface-2 hover:bg-surface-3 hover:text-text-primary transition-colors cursor-pointer",
                    user?.telegramUsername ? "text-success" : "text-text-secondary"
                )}
                title={user?.telegramUsername ? `Telegram: @${user.telegramUsername}` : 'Connect Telegram'}
            >
                <TelegramIcon className="h-3.5 w-3.5 shrink-0" />
            </button>

            {/* Avatar circle 28x28 → profile (V4 brand-bg + brand text + brand-border) */}
            <Link
                href="/profile"
                className="h-7 w-7 inline-flex items-center justify-center rounded-full border border-brand/30 bg-brand/10 hover:bg-brand/20 transition-colors"
                title={privyUser?.twitter?.username || 'Profile'}
            >
                <Avatar className="h-full w-full">
                    {privyUser?.twitter?.profilePictureUrl ? (
                        <Image
                            src={privyUser.twitter.profilePictureUrl}
                            alt="Avatar"
                            width={28}
                            height={28}
                            className="object-cover rounded-full"
                        />
                    ) : (
                        <AvatarFallback className="bg-transparent text-brand text-[10px] font-semibold">
                            {privyUser?.twitter?.username?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                    )}
                </Avatar>
            </Link>

            {/* Logout (icon-btn 32x32) */}
            <button
                onClick={() => logout()}
                className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-border-subtle bg-surface-2 text-text-secondary hover:text-danger hover:bg-surface-3 transition-colors cursor-pointer"
                title="Logout"
            >
                <LogOut className="w-3.5 h-3.5" />
            </button>
        </div>
    )
}

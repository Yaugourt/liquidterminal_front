"use client";

import { cn } from "@/lib/utils";
import {
    Send,
    ListPlus,
    Wallet,
    BookOpen,
    Users,
    CalendarCheck,
    ShieldCheck,
    Zap
} from "lucide-react";

interface MissionItem {
    icon: React.ElementType;
    title: string;
    description: string;
    xp: string;
    color: string;
    bgColor: string;
}

const MISSIONS: MissionItem[] = [
    {
        icon: Send,
        title: "Submit Resource",
        description: "Submit a quality educational resource to the Wiki.",
        xp: "+15 XP",
        color: "text-purple-400",
        bgColor: "bg-purple-500/10"
    },
    {
        icon: ListPlus,
        title: "Create Public Readlist",
        description: "Create a curated ID for the community.",
        xp: "+20 XP",
        color: "text-pink-400",
        bgColor: "bg-pink-500/10"
    },
    {
        icon: Wallet,
        title: "Create Public Wallet List",
        description: "Share a list of interesting wallets to track.",
        xp: "+20 XP",
        color: "text-blue-400",
        bgColor: "bg-blue-500/10"
    },
    {
        icon: ListPlus,
        title: "Create Private List",
        description: "Create a private Readlist or Wallet List for yourself.",
        xp: "+15 XP",
        color: "text-zinc-400",
        bgColor: "bg-zinc-500/10"
    },
    {
        icon: CalendarCheck,
        title: "Daily Login",
        description: "Log in every day. Bonus for streaks!",
        xp: "+10 - 200 XP",
        color: "text-emerald-400",
        bgColor: "bg-emerald-500/10"
    },
    {
        icon: ShieldCheck,
        title: "Public Good Approved",
        description: "Get your submitted project validated by mods.",
        xp: "+500 XP",
        color: "text-[#F9E370]",
        bgColor: "bg-[#F9E370]/10"
    },
    {
        icon: Users,
        title: "Referral",
        description: "Invite a friend who becomes active.",
        xp: "+200 XP",
        color: "text-brand-accent",
        bgColor: "bg-brand-accent/10"
    },
    {
        icon: BookOpen,
        title: "Read Resource",
        description: "Read an educational resource (max 10/day).",
        xp: "+5 XP",
        color: "text-cyan-400",
        bgColor: "bg-cyan-500/10"
    }
];

export function XpEarnGuide({ className }: { className?: string }) {
    return (
        <div className={cn(
            "p-6 rounded-2xl",
            "bg-brand-secondary/60 backdrop-blur-md",
            "border border-white/5",
            className
        )}>
            <div className="flex items-center gap-2 mb-6">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#F9E370]/20 to-orange-500/20 flex items-center justify-center border border-[#F9E370]/30">
                    <Zap className="h-4 w-4 text-[#F9E370]" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-white">Ways to Earn XP</h3>
                    <p className="text-xs text-zinc-500">Permanent missions and rewards available anytime</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {MISSIONS.map((mission, index) => {
                    const Icon = mission.icon;
                    return (
                        <div
                            key={index}
                            className="group p-4 rounded-xl bg-brand-dark border border-white/5 hover:border-white/10 transition-all hover:bg-white/5"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className={cn(
                                    "h-10 w-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110",
                                    mission.bgColor
                                )}>
                                    <Icon className={cn("h-5 w-5", mission.color)} />
                                </div>
                                <div className={cn(
                                    "px-2 py-1 rounded text-xs font-bold bg-brand-main border border-white/5",
                                    mission.color
                                )}>
                                    {mission.xp}
                                </div>
                            </div>

                            <h4 className="text-sm font-semibold text-white mb-1 group-hover:text-brand-accent transition-colors">
                                {mission.title}
                            </h4>
                            <p className="text-xs text-zinc-500 leading-relaxed">
                                {mission.description}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useAuthContext } from "@/contexts/auth.context";
import { useWallets } from "@/store/use-wallets";
import { useReadLists } from "@/store/use-readlists";
import { useUserWalletLists } from "@/services/market/tracker/hooks/useWalletLists";
import { authService } from "@/services/auth/api";
import { ReferralStats } from "@/services/auth/types";
import { useXp } from "@/services/xp";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { SearchBar } from "@/components/SearchBar";
import { XpBadge, XpHistoryList, XpLeaderboard, DailyTasksWidget, WeeklyChallengesCard } from "@/components/xp";
import { Shield, Users, Wallet, BookOpen, Copy, Activity, Menu, List, LucideIcon, Flame } from "lucide-react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { usePrivy } from "@privy-io/react-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWindowSize } from "@/hooks/use-window-size";
import { useSearchParams } from "next/navigation";

function ProfileTabs() {
    const searchParams = useSearchParams();
    const initialTab = searchParams.get('tab') || 'activity';
    
    return <ProfileContent initialTab={initialTab} />;
}

function ProfileContent({ initialTab }: { initialTab: string }) {
    const { user: privyUser } = usePrivy();
    const { user: currentUser } = useAuthContext();
    const { wallets } = useWallets();
    const { readLists } = useReadLists();
    const { data: walletLists } = useUserWalletLists({ enabled: !!currentUser });
    const { stats: xpStats, isLoading: isLoadingXp } = useXp();
    const { width } = useWindowSize();

    // State pour la sélection de liste (null = "All Wallets")
    const [selectedListId, setSelectedListId] = useState<number | null>(null);
    const [activeListItems, setActiveListItems] = useState<{ userWallet?: { name?: string; Wallet?: { id?: number; address?: string } }; addedAt?: string }[]>([]);
    const [isLoadingListItems, setIsLoadingListItems] = useState(false);

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);

    useEffect(() => {
        if (width && width >= 1024) {
            setIsSidebarOpen(false);
        }
    }, [width]);

    // Chargement des items de la liste sélectionnée
    useEffect(() => {
        const loadListItems = async () => {
            if (selectedListId === null) {
                setActiveListItems([]);
                return;
            }

            try {
                setIsLoadingListItems(true);
                const { getWalletListItems } = await import("@/services/market/tracker/walletlist.service");
                const response = await getWalletListItems(selectedListId);
                setActiveListItems(response.data || []);
            } catch (error) {
                console.error("Failed to load list items", error);
                toast.error("Failed to load list contents");
                setActiveListItems([]);
            } finally {
                setIsLoadingListItems(false);
            }
        };

        loadListItems();
    }, [selectedListId]);

    // Calcul des wallets à afficher
    const displayedWallets = useMemo(() => {
        if (selectedListId === null) {
            return wallets; // All wallets
        }

        // On utilise les items chargés dynamiquement
        return activeListItems.map(item => ({
            id: item.userWallet?.Wallet?.id || 0,
            address: item.userWallet?.Wallet?.address || '',
            name: item.userWallet?.name || 'Unknown',
            addedAt: item.addedAt,
        })).filter(w => w.address);
    }, [selectedListId, wallets, activeListItems]);

    // Récupération des données manquantes (Referrals)
    useEffect(() => {
        const fetchExtraData = async () => {
            try {
                const stats = await authService.getReferralStats();
                setReferralStats(stats);
            } catch (e) {
                console.error("Failed to load referral stats", e);
            }
        };

        if (currentUser) {
            fetchExtraData();
        }
    }, [currentUser]);

    // Rank based on XP level
    const getRank = (level: number) => {
        if (level >= 20) return "Whale 🐋";
        if (level >= 10) return "Shark 🦈";
        if (level >= 5) return "Dolphin 🐬";
        return "Shrimp 🦐";
    };

    const copyReferralLink = () => {
        const referralLink = `https://liquidterminal.com/ref/${currentUser?.name || "N/A"}`;
        navigator.clipboard.writeText(referralLink);
        toast.success("Referral link copied!");
    };

    // Helper to get high quality profile picture
    const getProfilePictureUrl = (url: string | undefined) => {
        if (!url) return undefined;
        return url.replace('_normal', '');
    };

    if (!currentUser) return (
        <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#83E9FF]" />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0B0E14] text-zinc-100 font-inter bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a2c38] via-[#0B0E14] to-[#050505]">
            {/* Mobile menu button */}
            <div className="fixed top-4 left-4 z-50 lg:hidden">
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/10"
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                >
                    <Menu className="h-6 w-6" />
                </Button>
            </div>

            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            <div className="">
                {/* Header with glass effect */}
                <div className="sticky top-0 z-40 backdrop-blur-xl bg-[#0B0E14]/80 border-b border-white/5">
                    <Header customTitle="Profile" showFees={true} />
                </div>

                {/* Mobile search bar */}
                <div className="p-2 lg:hidden">
                    <SearchBar placeholder="Search..." />
                </div>

                <main className="px-6 py-8 space-y-8 max-w-[1920px] mx-auto">

                    {/* Header Profile */}
                    <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between bg-[#151A25]/60 backdrop-blur-md p-6 rounded-2xl border border-white/5 shadow-xl shadow-black/20">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-20 w-20 ring-2 ring-[#F9E370] ring-offset-2 ring-offset-[#151A25]">
                                {privyUser?.twitter?.profilePictureUrl ? (
                                    <Image
                                        src={getProfilePictureUrl(privyUser.twitter.profilePictureUrl)!}
                                        alt="Avatar"
                                        width={80}
                                        height={80}
                                        className="object-cover rounded-full"
                                        unoptimized
                                    />
                                ) : (
                                    <AvatarFallback className="bg-[#0A0D12] text-[#F9E370] text-3xl font-bold">
                                        {currentUser.name?.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                )}
                            </Avatar>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-2xl font-bold text-white">{currentUser.name}</h1>
                                    {currentUser.verified && <Shield className="h-5 w-5 text-[#F9E370]" />}
                                </div>
                                <p className="text-zinc-400 capitalize">{currentUser.role.toLowerCase()} Member</p>
                                <div className="flex items-center gap-2 mt-2">
                                    {isLoadingXp ? (
                                        <Loader2 className="h-4 w-4 animate-spin text-[#83E9FF]" />
                                    ) : xpStats ? (
                                        <>
                                            <span className="px-2 py-0.5 bg-[#F9E370]/10 text-[#F9E370] text-xs rounded-md border border-[#F9E370]/20 font-medium">
                                                Lvl {xpStats.level}
                                            </span>
                                            <span className="px-2 py-0.5 bg-[#83E9FF]/10 text-[#83E9FF] text-xs rounded-md border border-[#83E9FF]/20 font-medium">
                                                {getRank(xpStats.level)}
                                            </span>
                                            {xpStats.loginStreak > 0 && (
                                                <span className="px-2 py-0.5 bg-orange-500/10 text-orange-400 text-xs rounded-md border border-orange-500/20 font-medium flex items-center gap-1">
                                                    <Flame className="h-3 w-3" />
                                                    {xpStats.loginStreak}d
                                                </span>
                                            )}
                                        </>
                                    ) : null}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 w-full md:w-auto">
                            <div className="text-xs text-zinc-400 font-semibold uppercase tracking-wider mb-1">Your Referral Link</div>
                            <div className="flex gap-2">
                                <div className="bg-[#0A0D12] px-4 py-2.5 rounded-lg text-white font-mono text-sm border border-white/5 flex-1 truncate">
                                    liquidterminal.com/ref/{currentUser.name}
                                </div>
                                <Button onClick={copyReferralLink} size="icon" className="bg-[#83E9FF] hover:bg-[#83E9FF]/90 text-[#051728]">
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* XP Progress Card */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <XpBadge showStreak className="w-full" />
                        </div>
                        <div className="space-y-4">
                            <StatsCard
                                title="Referrals"
                                value={(referralStats?.referralCount || 0).toString()}
                                icon={Users}
                                color="text-[#83E9FF]"
                                subtext="+200 XP each"
                            />
                        </div>
                    </div>

                    {/* Tabs for different sections */}
                    <Tabs defaultValue={initialTab} className="space-y-6">
                        <TabsList className="bg-[#0A0D12] border border-white/5 rounded-lg p-1">
                            <TabsTrigger 
                                value="activity" 
                                className="text-zinc-400 data-[state=active]:bg-[#83E9FF] data-[state=active]:text-[#051728] data-[state=active]:font-bold rounded-md text-xs transition-all"
                            >
                                Activity
                            </TabsTrigger>
                            <TabsTrigger 
                                value="xp-history" 
                                className="text-zinc-400 data-[state=active]:bg-[#F9E370] data-[state=active]:text-[#051728] data-[state=active]:font-bold rounded-md text-xs transition-all"
                            >
                                XP History
                            </TabsTrigger>
                            <TabsTrigger 
                                value="leaderboard" 
                                className="text-zinc-400 data-[state=active]:bg-purple-500 data-[state=active]:text-white data-[state=active]:font-bold rounded-md text-xs transition-all"
                            >
                                Leaderboard
                            </TabsTrigger>
                            <TabsTrigger 
                                value="missions" 
                                className="text-zinc-400 data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:font-bold rounded-md text-xs transition-all"
                            >
                                Missions
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="activity" className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Section Tracker Activity */}
                                <div className="bg-[#151A25]/60 backdrop-blur-md border border-white/5 rounded-2xl shadow-xl shadow-black/20 overflow-hidden">
                                    <div className="p-4 border-b border-white/5">
                                        <h3 className="flex items-center gap-2 text-white font-semibold">
                                            <Activity className="h-5 w-5 text-[#83E9FF]" />
                                            Portfolio Tracker Activity
                                        </h3>
                                    </div>
                                    <div className="p-4">
                                        <div className="flex flex-col-reverse md:flex-row gap-6">
                                            {/* Left Column: Displayed Wallets (Content) */}
                                            <div className="flex-1 space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                                                        {selectedListId === null
                                                            ? `All Wallets (${wallets.length})`
                                                            : `${walletLists?.find(l => l.id === selectedListId)?.name || 'List'} (${displayedWallets.length})`
                                                        }
                                                    </h4>
                                                    {selectedListId !== null && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setSelectedListId(null)}
                                                            className="h-6 text-xs text-[#83E9FF] hover:text-[#83E9FF] hover:bg-[#83E9FF]/10"
                                                        >
                                                            Clear filter
                                                        </Button>
                                                    )}
                                                </div>

                                                {isLoadingListItems ? (
                                                    <div className="flex items-center justify-center py-12 border border-dashed border-white/5 rounded-xl">
                                                        <Loader2 className="h-6 w-6 animate-spin text-[#83E9FF]" />
                                                    </div>
                                                ) : displayedWallets.length > 0 ? (
                                                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                                                        {displayedWallets.map(wallet => (
                                                            <div key={`${wallet.id}-${wallet.address}`} className="flex justify-between items-center p-3 bg-[#0A0D12] rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                                                                <div className="flex items-center gap-3 min-w-0">
                                                                    <div className="h-8 w-8 rounded-lg bg-[#83E9FF]/10 flex items-center justify-center shrink-0">
                                                                        <Wallet className="h-4 w-4 text-[#83E9FF]" />
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <div className="font-medium text-sm text-white truncate">{wallet.name}</div>
                                                                        <div className="text-xs text-zinc-500 font-mono truncate">{wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}</div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-12 text-zinc-500 text-sm italic border border-dashed border-white/5 rounded-xl">
                                                        No wallets found in this view.
                                                    </div>
                                                )}

                                                <div className="pt-4 mt-auto">
                                                    <Button variant="outline" className="w-full border-white/5 hover:bg-white/5 text-zinc-300 rounded-lg" asChild>
                                                        <a href="/market/tracker">Manage Tracker & Lists</a>
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Right Column: List Selection (Navigation) */}
                                            <div className="w-full md:w-1/3 space-y-4 border-b md:border-b-0 md:border-l border-white/5 pb-6 md:pb-0 md:pl-6">
                                                <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Your Lists</h4>
                                                <div className="space-y-2">
                                                    {/* All Wallets Option */}
                                                    <div
                                                        onClick={() => setSelectedListId(null)}
                                                        className={`flex justify-between items-center p-3 rounded-xl border cursor-pointer transition-all ${selectedListId === null
                                                            ? 'bg-[#83E9FF]/10 border-[#83E9FF]/30 text-[#83E9FF]'
                                                            : 'bg-[#0A0D12] border-white/5 hover:bg-white/5 hover:border-white/10 text-zinc-300'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <Wallet className="h-4 w-4" />
                                                            <span className="font-medium text-sm">All Wallets</span>
                                                        </div>
                                                        <span className="text-xs opacity-70">{wallets.length}</span>
                                                    </div>

                                                    {/* Custom Lists */}
                                                    {walletLists && walletLists.length > 0 ? (
                                                        walletLists.map(list => (
                                                            <div
                                                                key={list.id}
                                                                onClick={() => setSelectedListId(list.id)}
                                                                className={`flex justify-between items-center p-3 rounded-xl border cursor-pointer transition-all ${selectedListId === list.id
                                                                    ? 'bg-[#83E9FF]/10 border-[#83E9FF]/30 text-[#83E9FF]'
                                                                    : 'bg-[#0A0D12] border-white/5 hover:bg-white/5 hover:border-white/10 text-zinc-300'
                                                                    }`}
                                                            >
                                                                <div className="flex items-center gap-3 min-w-0">
                                                                    <List className="h-4 w-4 shrink-0" />
                                                                    <span className="font-medium text-sm truncate">{list.name}</span>
                                                                </div>
                                                                <span className="text-xs opacity-70 shrink-0">{list.itemsCount || 0}</span>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="text-center py-4 text-zinc-600 text-xs italic">
                                                            No custom lists yet.
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Section Read List Activity */}
                                <div className="bg-[#151A25]/60 backdrop-blur-md border border-white/5 rounded-2xl shadow-xl shadow-black/20 overflow-hidden">
                                    <div className="p-4 border-b border-white/5">
                                        <h3 className="flex items-center gap-2 text-white font-semibold">
                                            <BookOpen className="h-5 w-5 text-[#F9E370]" />
                                            Knowledge Base
                                        </h3>
                                    </div>
                                    <div className="p-4">
                                        {readLists.length > 0 ? (
                                            <div className="space-y-4">
                                                {readLists.map(list => (
                                                    <div key={list.id} className="flex justify-between items-center p-3 bg-[#0A0D12] rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-8 w-8 rounded-lg bg-[#F9E370]/10 flex items-center justify-center">
                                                                <BookOpen className="h-4 w-4 text-[#F9E370]" />
                                                            </div>
                                                            <div>
                                                                <div className="font-medium text-sm text-white">{list.name}</div>
                                                                <div className="text-xs text-zinc-500">{list.itemsCount || 0} articles</div>
                                                            </div>
                                                        </div>
                                                        <div className="text-xs text-zinc-400">
                                                            {list.isPublic ? "Public" : "Private"}
                                                        </div>
                                                    </div>
                                                ))}
                                                <Button variant="outline" className="w-full border-white/5 hover:bg-white/5 text-zinc-300 rounded-lg" asChild>
                                                    <a href="/wiki">Go to Wiki</a>
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="text-center py-8">
                                                <p className="text-zinc-500">No reading lists created yet.</p>
                                                <Button className="mt-4 bg-[#F9E370] text-[#051728] hover:bg-[#F9E370]/90 font-semibold rounded-lg" asChild>
                                                    <a href="/wiki">Explore Wiki</a>
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="xp-history">
                            <XpHistoryList />
                        </TabsContent>

                        <TabsContent value="leaderboard">
                            <XpLeaderboard limit={20} showCurrentUser />
                        </TabsContent>

                        <TabsContent value="missions" className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <DailyTasksWidget />
                                <WeeklyChallengesCard />
                            </div>
                        </TabsContent>
                    </Tabs>

                </main>
            </div>
        </div>
    );
}

export default function ProfilePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#83E9FF]" />
            </div>
        }>
            <ProfileTabs />
        </Suspense>
    );
}

interface StatsCardProps {
    title: string;
    value: string;
    icon: LucideIcon;
    color: string;
    subtext?: string;
}

function StatsCard({ title, value, icon: Icon, color, subtext }: StatsCardProps) {
    return (
        <div className="bg-[#151A25]/60 backdrop-blur-md border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all shadow-xl shadow-black/20 group">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{title}</p>
                    <h3 className="text-2xl font-bold text-white mt-2">{value}</h3>
                    {subtext && <p className={`text-xs mt-1 ${color}`}>{subtext}</p>}
                </div>
                <div className={`w-10 h-10 rounded-xl bg-[#83E9FF]/10 flex items-center justify-center transition-transform group-hover:scale-110`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                </div>
            </div>
        </div>
    );
}

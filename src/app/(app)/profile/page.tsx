"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useAuthContext } from "@/contexts/auth.context";
import { useWallets } from "@/store/use-wallets";
import { useReadLists } from "@/store/use-readlists";
import { useUserWalletLists } from "@/services/market/tracker/hooks/useWalletLists";
import { WalletListItem } from "@/services/market/tracker/types";
import { authService } from "@/services/auth/api";
import { ReferralStats } from "@/services/auth/types";
import { useXp } from "@/services/xp";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatsCard } from "@/components/common";
import { usePageTitle } from "@/store/use-page-title";
import { XpBadge, XpHistoryList, XpLeaderboard, DailyTasksWidget, WeeklyChallengesCard, XpEarnGuide } from "@/components/xp";
import { Shield, Users, Wallet, BookOpen, Copy, Activity, List, Flame, Send } from "lucide-react";
import { toast } from "sonner";
import { LoadingState } from "@/components/ui/loading-state";
import { InlineSpinner } from "@/components/ui/inline-spinner";
import Image from "next/image";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { usePrivy } from "@privy-io/react-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams } from "next/navigation";
import { MySubmissionsList } from "@/components/wiki/MySubmissionsList";
import { TelegramLinkCard } from "@/components/profile";

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
    const { setTitle } = usePageTitle();

    useEffect(() => {
        setTitle("Profile");
    }, [setTitle]);

    // State pour la sélection de liste (null = "All Wallets")
    const [selectedListId, setSelectedListId] = useState<number | null>(null);
    const [activeListItems, setActiveListItems] = useState<WalletListItem[]>([]);
    const [isLoadingListItems, setIsLoadingListItems] = useState(false);
    const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);

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
        <div className="flex items-center justify-center min-h-[50vh]">
            <LoadingState size="md" withCard={false} />
        </div>
    );

    return (
        <>
            {/* Header Profile */}
            <Card padding="lg" interactive={false} className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20 ring-2 ring-gold ring-offset-2 ring-offset-surface">
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
                            <AvatarFallback className="bg-base text-gold text-3xl font-bold">
                                {currentUser.name?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        )}
                    </Avatar>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-text-primary">{currentUser.name}</h1>
                            {currentUser.verified && <Shield className="h-5 w-5 text-gold" />}
                        </div>
                        <p className="text-text-secondary capitalize">{currentUser.role.toLowerCase()} Member</p>
                        <div className="flex items-center gap-2 mt-2">
                            {isLoadingXp ? (
                                <InlineSpinner className="text-brand" />
                            ) : xpStats ? (
                                <>
                                    <span className="px-2 py-0.5 bg-gold/10 text-gold text-xs rounded-md border border-gold/20 font-medium">
                                        Lvl {xpStats.level}
                                    </span>
                                    <span className="px-2 py-0.5 bg-brand/10 text-brand text-xs rounded-md border border-brand/20 font-medium">
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
                    <div className="text-xs text-text-secondary font-semibold uppercase tracking-wider mb-1">Your Referral Link</div>
                    <div className="flex gap-2">
                        <div className="bg-base px-4 py-2.5 rounded-lg text-text-primary text-sm border border-border-subtle flex-1 truncate">
                            liquidterminal.com/ref/{currentUser.name}
                        </div>
                        <Button onClick={copyReferralLink} size="icon" className="bg-brand hover:bg-brand/90 text-brand-text-on">
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </Card>

            {/* XP Progress Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <XpBadge showStreak className="w-full" />
                </div>
                <div className="space-y-4">
                    <StatsCard
                        title="Referrals"
                        value={referralStats?.referralCount ?? 0}
                        icon={<Users className="h-5 w-5 text-brand" />}
                        subValue={<span className="text-brand">+200 XP each</span>}
                    />
                    <TelegramLinkCard
                        initialTelegramUsername={currentUser?.telegramUsername}
                    />
                </div>
            </div>

            {/* Tabs for different sections */}
            <Tabs defaultValue={initialTab} className="space-y-6">
                <TabsList className="bg-surface-2 border border-border-subtle rounded-lg p-1">
                    {[
                        { value: "activity", label: "Activity" },
                        { value: "xp-history", label: "XP History" },
                        { value: "leaderboard", label: "Leaderboard" },
                        { value: "missions", label: "Missions" },
                    ].map((tab) => (
                        <TabsTrigger
                            key={tab.value}
                            value={tab.value}
                            className="text-text-secondary data-[state=active]:bg-brand data-[state=active]:text-brand-text-on data-[state=active]:font-bold rounded-md text-xs transition-all"
                        >
                            {tab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>

                <TabsContent value="activity" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Section Tracker Activity */}
                        <div className="bg-surface border border-border-subtle rounded-lg overflow-hidden">
                            <div className="p-4 border-b border-border-subtle">
                                <h3 className="flex items-center gap-2 text-text-primary font-semibold">
                                    <Activity className="h-5 w-5 text-brand" />
                                    Portfolio Tracker Activity
                                </h3>
                            </div>
                            <div className="p-4">
                                <div className="flex flex-col-reverse md:flex-row gap-6">
                                    {/* Left Column: Displayed Wallets (Content) */}
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
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
                                                    className="h-6 text-xs text-brand hover:text-brand hover:bg-brand/10"
                                                >
                                                    Clear filter
                                                </Button>
                                            )}
                                        </div>

                                        {isLoadingListItems ? (
                                            <div className="border border-dashed border-border-subtle rounded-lg py-12">
                                                <LoadingState size="sm" withCard={false} />
                                            </div>
                                        ) : displayedWallets.length > 0 ? (
                                            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-brand">
                                                {displayedWallets.map(wallet => (
                                                    <div key={`${wallet.id}-${wallet.address}`} className="flex justify-between items-center p-3 bg-base rounded-lg border border-border-subtle hover:border-border-default transition-colors">
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div className="h-8 w-8 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
                                                                <Wallet className="h-4 w-4 text-brand" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="font-medium text-sm text-text-primary truncate">{wallet.name}</div>
                                                                <div className="text-xs text-text-tertiary truncate">{wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12 text-text-tertiary text-sm italic border border-dashed border-border-subtle rounded-lg">
                                                No wallets found in this view.
                                            </div>
                                        )}

                                        <div className="pt-4 mt-auto">
                                            <Button variant="outline" className="w-full border-border-subtle hover:bg-white/5 text-text-secondary rounded-lg" asChild>
                                                <a href="/market/tracker">Manage Tracker & Lists</a>
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Right Column: List Selection (Navigation) */}
                                    <div className="w-full md:w-1/3 space-y-4 border-b md:border-b-0 md:border-l border-border-subtle pb-6 md:pb-0 md:pl-6">
                                        <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Your Lists</h4>
                                        <div className="space-y-2">
                                            {/* All Wallets Option */}
                                            <div
                                                onClick={() => setSelectedListId(null)}
                                                className={`flex justify-between items-center p-3 rounded-lg border cursor-pointer transition-all ${selectedListId === null
                                                    ? 'bg-brand/10 border-brand/30 text-brand'
                                                    : 'bg-base border-border-subtle hover:bg-white/5 hover:border-border-default text-text-secondary'
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
                                                        className={`flex justify-between items-center p-3 rounded-lg border cursor-pointer transition-all ${selectedListId === list.id
                                                            ? 'bg-brand/10 border-brand/30 text-brand'
                                                            : 'bg-base border-border-subtle hover:bg-white/5 hover:border-border-default text-text-secondary'
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
                                                <div className="text-center py-4 text-text-tertiary text-xs italic">
                                                    No custom lists yet.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section Knowledge Base with Tabs */}
                        <div className="bg-surface border border-border-subtle rounded-lg overflow-hidden">
                            <div className="p-4 border-b border-border-subtle">
                                <h3 className="flex items-center gap-2 text-text-primary font-semibold">
                                    <BookOpen className="h-5 w-5 text-gold" />
                                    Knowledge Base
                                </h3>
                            </div>
                            <Tabs defaultValue="readlists" className="w-full">
                                <TabsList className="w-full grid grid-cols-2 bg-base/50 rounded-none border-b border-border-subtle p-1">
                                    <TabsTrigger
                                        value="readlists"
                                        className="text-text-secondary data-[state=active]:bg-gold/10 data-[state=active]:text-gold data-[state=active]:font-semibold rounded-md text-xs transition-all"
                                    >
                                        <BookOpen className="w-3 h-3 mr-1" />
                                        Read Lists
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="submissions"
                                        className="text-text-secondary data-[state=active]:bg-brand/10 data-[state=active]:text-brand data-[state=active]:font-semibold rounded-md text-xs transition-all"
                                    >
                                        <Send className="w-3 h-3 mr-1" />
                                        My Submissions
                                    </TabsTrigger>
                                </TabsList>
                                <TabsContent value="readlists" className="p-4">
                                    {readLists.length > 0 ? (
                                        <div className="space-y-4">
                                            {readLists.map(list => (
                                                <div key={list.id} className="flex justify-between items-center p-3 bg-base rounded-lg border border-border-subtle hover:border-border-default transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-lg bg-gold/10 flex items-center justify-center">
                                                            <BookOpen className="h-4 w-4 text-gold" />
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-sm text-text-primary">{list.name}</div>
                                                            <div className="text-xs text-text-tertiary">{list.itemsCount || 0} articles</div>
                                                        </div>
                                                    </div>
                                                    <div className="text-xs text-text-secondary">
                                                        {list.isPublic ? "Public" : "Private"}
                                                    </div>
                                                </div>
                                            ))}
                                            <Button variant="outline" className="w-full border-border-subtle hover:bg-white/5 text-text-secondary rounded-lg" asChild>
                                                <a href="/wiki">Go to Wiki</a>
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <p className="text-text-tertiary">No reading lists created yet.</p>
                                            <Button className="mt-4 bg-gold text-brand-text-on hover:bg-gold/90 font-semibold rounded-lg" asChild>
                                                <a href="/wiki">Explore Wiki</a>
                                            </Button>
                                        </div>
                                    )}
                                </TabsContent>
                                <TabsContent value="submissions" className="p-4">
                                    <MySubmissionsList />
                                </TabsContent>
                            </Tabs>
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
                    <XpEarnGuide />
                </TabsContent>
            </Tabs>
        </>
    );
}

export default function ProfilePage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[50vh]">
                <LoadingState size="md" withCard={false} />
            </div>
        }>
            <ProfileTabs />
        </Suspense>
    );
}


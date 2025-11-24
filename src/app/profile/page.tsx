"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuthContext } from "@/contexts/auth.context";
import { useWallets } from "@/store/use-wallets";
import { useReadLists } from "@/store/use-readlists";
import { useUserWalletLists } from "@/services/market/tracker/hooks/useWalletLists";
import { authService } from "@/services/auth/api";
import { ReferralStats } from "@/services/auth/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/Sidebar";
import { Shield, Users, Wallet, BookOpen, Star, Copy, Trophy, Activity, Menu, List } from "lucide-react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import Image from "next/image";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { usePrivy } from "@privy-io/react-auth";

export default function ProfilePage() {
    const { user: privyUser } = usePrivy();
    const { user: currentUser } = useAuthContext();
    const { wallets } = useWallets();
    const { readLists } = useReadLists();
    const { data: walletLists } = useUserWalletLists({ enabled: !!currentUser });

    // State pour la sélection de liste (null = "All Wallets")
    const [selectedListId, setSelectedListId] = useState<number | null>(null);
    const [activeListItems, setActiveListItems] = useState<any[]>([]);
    const [isLoadingListItems, setIsLoadingListItems] = useState(false);

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
    const [loading, setLoading] = useState(true);

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
            // On peut ajouter d'autres props si nécessaire
        })).filter(w => w.address); // Filtrer les wallets invalides
    }, [selectedListId, wallets, activeListItems]);

    // 1. Récupération des données manquantes (Referrals)
    useEffect(() => {
        const fetchExtraData = async () => {
            try {
                const stats = await authService.getReferralStats();
                setReferralStats(stats);
            } catch (e) {
                console.error("Failed to load referral stats", e);
            } finally {
                setLoading(false);
            }
        };

        if (currentUser) {
            fetchExtraData();
        } else {
            // Stop loading if no user is connected initially (though ProtectedRoute usually handles this)
            setLoading(false);
        }
    }, [currentUser]);

    // 2. Logique "Intelligence Artificielle" pour les Stats & Fidélité
    const loyaltyStats = useMemo(() => {
        // Score Tracker : 100 points par wallet tracké, 200 points par liste de wallet
        const trackerScore = (wallets.length * 100) + ((walletLists?.length || 0) * 200);

        // Score Reader : 50 points par liste, 10 par item (estimé)
        const readerScore = (readLists.length * 50) + (readLists.reduce((acc, list) => acc + (list.itemsCount || 0), 0) * 10);

        // Score Social : 200 points par parrainage
        const socialScore = (referralStats?.referralCount || 0) * 200;

        const totalScore = trackerScore + readerScore + socialScore;

        // Calcul du "Niveau"
        const level = Math.floor(Math.sqrt(totalScore / 100)) + 1;

        return {
            totalScore,
            level,
            trackerScore,
            readerScore,
            socialScore,
            rank: totalScore > 5000 ? "Whale" : totalScore > 1000 ? "Shark" : "Shrimp"
        };
    }, [wallets, readLists, referralStats, walletLists]);

    const copyReferralCode = () => {
        // Si pas de code, on utilise le nom comme fallback pour l'instant
        const code = currentUser?.referralCode || currentUser?.name || "N/A";
        navigator.clipboard.writeText(code);
        toast.success("Referral code copied!");
    };

    // Helper to get high quality profile picture
    const getProfilePictureUrl = (url: string | undefined) => {
        if (!url) return undefined;
        // Twitter specific: remove "_normal" to get original quality
        return url.replace('_normal', '');
    };

    if (!currentUser) return (
        <div className="min-h-screen bg-[#020817] flex items-center justify-center text-white">
            <Loader2 className="h-8 w-8 animate-spin text-[#f9e370]" />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#020817]">
            {/* Mobile menu toggle button */}
            <div className="fixed top-4 left-4 z-50 lg:hidden">
                <Button
                    variant="ghost"
                    size="icon"
                    className="bg-[#051728] hover:bg-[#112941]"
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                >
                    <Menu className="h-6 w-6 text-white" />
                </Button>
            </div>

            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            <div className="">
                {/* Mobile search placeholder if needed, keeping structure similar to other pages */}
                <div className="p-2 lg:hidden pl-16">
                    <SearchBar placeholder="Search..." />
                </div>

                <main className="px-2 py-2 sm:px-4 sm:py-4 lg:px-6 xl:px-12 lg:py-6 space-y-8 max-w-[1920px] mx-auto">

                    {/* Header Profile */}
                    <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between bg-[#051728] p-6 rounded-xl border border-[#1e293b]">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-20 w-20 ring-2 ring-[#f9e370] ring-offset-2 ring-offset-[#051728]">
                                {privyUser?.twitter?.profilePictureUrl ? (
                                    <Image
                                        src={getProfilePictureUrl(privyUser.twitter.profilePictureUrl)!}
                                        alt="Avatar"
                                        width={80}
                                        height={80}
                                        className="object-cover rounded-full"
                                        unoptimized // Avoid Next.js optimization issues with external URLs sometimes
                                    />
                                ) : (
                                    <AvatarFallback className="bg-[#1a2c38] text-[#f9e370] text-3xl font-bold">
                                        {currentUser.name?.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                )}
                            </Avatar>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-2xl font-bold text-white">{currentUser.name}</h1>
                                    {currentUser.verified && <Shield className="h-5 w-5 text-[#f9e370]" />}
                                </div>
                                <p className="text-gray-400 capitalize">{currentUser.role.toLowerCase()} Member</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="px-2 py-0.5 bg-[#f9e37020] text-[#f9e370] text-xs rounded-full border border-[#f9e37040]">
                                        Lvl {loyaltyStats.level}
                                    </span>
                                    <span className="px-2 py-0.5 bg-[#83E9FF20] text-[#83E9FF] text-xs rounded-full border border-[#83E9FF40]">
                                        {loyaltyStats.rank}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 w-full md:w-auto">
                            <div className="text-sm text-gray-400 mb-1">Your Referral Link</div>
                            <div className="flex gap-2">
                                <div className="bg-[#0b1d30] px-4 py-2 rounded-lg text-white font-mono text-sm border border-[#1e293b] flex-1 truncate">
                                    liquidterminal.com/ref/{currentUser.name}
                                </div>
                                <Button onClick={copyReferralCode} size="icon" variant="secondary" className="bg-[#f9e370] hover:bg-[#e6d05f] text-[#051728]">
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid - "IA Choice" */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatsCard
                            title="Total XP"
                            value={loyaltyStats.totalScore.toLocaleString()}
                            icon={Trophy}
                            color="text-[#f9e370]"
                            subtext="Combined activity score"
                        />
                        <StatsCard
                            title="Tracked Assets"
                            value={(wallets.length + (walletLists?.length || 0)).toString()}
                            icon={Wallet}
                            color="text-[#83E9FF]"
                            subtext={`+${loyaltyStats.trackerScore} XP`}
                        />
                        <StatsCard
                            title="Read Lists"
                            value={readLists.length.toString()}
                            icon={BookOpen}
                            color="text-[#ff9f43]"
                            subtext={`+${loyaltyStats.readerScore} XP`}
                        />
                        <StatsCard
                            title="Referrals"
                            value={(referralStats?.referralCount || 0).toString()}
                            icon={Users}
                            color="text-[#54a0ff]"
                            subtext={`+${loyaltyStats.socialScore} XP`}
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Section Tracker Activity */}
                        <Card className="bg-[#051728] border-[#1e293b] text-white">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="h-5 w-5 text-[#83E9FF]" />
                                    Portfolio Tracker Activity
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col-reverse md:flex-row gap-6">
                                    {/* Left Column: Displayed Wallets (Content) */}
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
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
                                                    className="h-6 text-xs text-[#83E9FF] hover:text-[#83E9FF] hover:bg-[#83E9FF10]"
                                                >
                                                    Clear filter
                                                </Button>
                                            )}
                                        </div>

                                        {isLoadingListItems ? (
                                            <div className="flex items-center justify-center py-12 border border-dashed border-[#1e293b] rounded-lg">
                                                <Loader2 className="h-6 w-6 animate-spin text-[#83E9FF]" />
                                            </div>
                                        ) : displayedWallets.length > 0 ? (
                                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#1e293b] scrollbar-track-transparent">
                                                {displayedWallets.map(wallet => (
                                                    <div key={`${wallet.id}-${wallet.address}`} className="flex justify-between items-center p-3 bg-[#0b1d30] rounded-lg border border-[#1e293b50]">
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div className="h-8 w-8 rounded bg-[#83E9FF20] flex items-center justify-center shrink-0">
                                                                <Wallet className="h-4 w-4 text-[#83E9FF]" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="font-medium text-sm truncate">{wallet.name}</div>
                                                                <div className="text-xs text-gray-500 font-mono truncate">{wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12 text-gray-500 text-sm italic border border-dashed border-[#1e293b] rounded-lg">
                                                No wallets found in this view.
                                            </div>
                                        )}

                                        <div className="pt-4 mt-auto">
                                            <Button variant="outline" className="w-full border-[#1e293b] hover:bg-[#0b1d30] text-gray-300" asChild>
                                                <a href="/market/tracker">Manage Tracker & Lists</a>
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Right Column: List Selection (Navigation) */}
                                    <div className="w-full md:w-1/3 space-y-4 border-b md:border-b-0 md:border-l border-[#1e293b50] pb-6 md:pb-0 md:pl-6">
                                        <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Your Lists</h4>
                                        <div className="space-y-2">
                                            {/* All Wallets Option */}
                                            <div
                                                onClick={() => setSelectedListId(null)}
                                                className={`flex justify-between items-center p-3 rounded-lg border cursor-pointer transition-all ${selectedListId === null
                                                    ? 'bg-[#83E9FF10] border-[#83E9FF] text-[#83E9FF]'
                                                    : 'bg-[#0b1d30] border-[#1e293b50] hover:bg-[#0C2237] hover:border-[#83E9FF50] text-gray-300'
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
                                                            ? 'bg-[#83E9FF10] border-[#83E9FF] text-[#83E9FF]'
                                                            : 'bg-[#0b1d30] border-[#1e293b50] hover:bg-[#0C2237] hover:border-[#83E9FF50] text-gray-300'
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
                                                <div className="text-center py-4 text-gray-500 text-xs italic">
                                                    No custom lists yet.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Section Read List Activity */}
                        <Card className="bg-[#051728] border-[#1e293b] text-white">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BookOpen className="h-5 w-5 text-[#ff9f43]" />
                                    Knowledge Base
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {readLists.length > 0 ? (
                                    <div className="space-y-4">
                                        {readLists.map(list => (
                                            <div key={list.id} className="flex justify-between items-center p-3 bg-[#0b1d30] rounded-lg border border-[#1e293b50]">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded bg-[#ff9f4320] flex items-center justify-center">
                                                        <BookOpen className="h-4 w-4 text-[#ff9f43]" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-sm">{list.name}</div>
                                                        <div className="text-xs text-gray-500">{list.itemsCount || 0} articles</div>
                                                    </div>
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    {list.isPublic ? "Public" : "Private"}
                                                </div>
                                            </div>
                                        ))}
                                        <Button variant="outline" className="w-full border-[#1e293b] hover:bg-[#0b1d30] text-gray-300" asChild>
                                            <a href="/wiki">Go to Wiki</a>
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <p>No reading lists created yet.</p>
                                        <Button className="mt-4 bg-[#ff9f43] text-[#051728]" asChild>
                                            <a href="/wiki">Explore Wiki</a>
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                </main>
            </div>
        </div>
    );
}

function StatsCard({ title, value, icon: Icon, color, subtext }: any) {
    return (
        <Card className="bg-[#051728] border-[#1e293b] text-white">
            <CardContent className="p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm font-medium text-gray-400">{title}</p>
                        <h3 className="text-2xl font-bold mt-2">{value}</h3>
                        {subtext && <p className={`text-xs mt-1 ${color}`}>{subtext}</p>}
                    </div>
                    <div className={`p-3 rounded-lg bg-opacity-10 ${color.replace('text-', 'bg-')}`}>
                        <Icon className={`h-5 w-5 ${color}`} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

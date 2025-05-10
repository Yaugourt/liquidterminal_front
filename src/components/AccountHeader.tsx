"use client"

import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Image from "next/image"
import { useAuthContext } from "@/contexts/auth.context"

export function AccountHeader() {
    const { authenticated, login, logout, privyUser } = useAuthContext();

    // Si non authentifié, afficher le bouton de connexion
    if (!authenticated) {
        return (
            <div className="hidden lg:flex items-center">
                <Button 
                    onClick={() => login()}
                    className="flex items-center gap-2 bg-gradient-to-r from-[#2DCCFF] to-[#15748E] hover:from-[#83E9FF] hover:to-[#1692AD] text-white rounded-xl px-4 py-2 h-10 transition-all border-2 border-[#83E9FF33] shadow-[0_0_15px_rgba(131,233,255,0.15)]"
                >
                    <Image
                        src="/wallet-icon.svg" 
                        alt="Connecter"
                        width={20}
                        height={20}
                        style={{ filter: "brightness(0) invert(1)" }}
                    />
                    <span className="font-medium">Login</span>
                </Button>
            </div>
        )
    }

    // État authentifié
    return (
        <div className="hidden lg:flex items-center gap-4">
            <Button variant="ghost" size="icon" className="w-[45px] h-[45px] rounded-xl bg-[#051728] border-2 border-[#83E9FF4D]">
                <Bell className="h-10 w-10 text-white" />
            </Button>

            <div className="flex items-center gap-3 bg-[#051728] px-2 py-1 rounded-xl border-2 border-[#83E9FF4D]">
                <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8 border-2 border-[#1a2c38]">
                        {privyUser?.twitter?.profilePictureUrl || privyUser?.farcaster?.pfp ? (
                            <Image 
                                src={privyUser.twitter?.profilePictureUrl || privyUser.farcaster?.pfp || ""}
                                alt="Avatar"
                                width={32}
                                height={32}
                            />
                        ) : (
                            <AvatarFallback className="bg-[#1a2c38] text-white text-xs">
                                {privyUser?.twitter?.username?.[0]?.toUpperCase() || 
                                 privyUser?.farcaster?.username?.[0]?.toUpperCase() || 
                                 privyUser?.github?.username?.[0]?.toUpperCase() || "U"}
                            </AvatarFallback>
                        )}
                    </Avatar>
                    <span className="text-[#FFFFFF99]">
                        {privyUser?.twitter?.username || 
                         privyUser?.farcaster?.username || 
                         privyUser?.github?.username || "User"}
                    </span>
                </div>
                <div className="w-[1px] h-6 bg-[#1a2c38]" />
                <Button variant="ghost" size="icon" onClick={() => logout()}>
                    <Image
                        src="/Sign_out_circle.svg"
                        alt="Sign out"
                        width={20}
                        height={20}
                    />
                </Button>
            </div>
        </div>
    )
} 
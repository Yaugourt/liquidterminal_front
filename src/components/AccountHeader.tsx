"use client"

import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Image from "next/image"
import { useAuthContext } from "@/contexts/auth.context"

export function AccountHeader() {
    const {  authenticated, login, logout, privyUser } = useAuthContext();

    // Si non authentifié, afficher le bouton de connexion
    if (!authenticated) {
        return (
            <div className="hidden lg:flex items-center gap-4 absolute top-4 right-8 z-30">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="w-[45px] h-[45px] rounded-xl bg-[#051728] border-2 border-[#83E9FF4D]"
                    onClick={() => login()}
                >
                    <Image
                        src="/wallet-icon.svg" 
                        alt="Se connecter"
                        width={24}
                        height={24}
                        style={{ filter: "brightness(0) invert(1)" }}
                    />
                </Button>
            </div>
        )
    }

    // État authentifié
    return (
        <div className="hidden lg:flex items-center gap-4 absolute top-4 right-8 z-30">
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
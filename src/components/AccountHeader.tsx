"use client"

import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Image from "next/image"

export function AccountHeader() {
    return (
        <div className="hidden lg:flex items-center gap-4 absolute top-4 right-4 z-20">
            <Button variant="ghost" size="icon" className="w-[45px] h-[45px] rounded-xl bg-[#051728] border-2 border-[#83E9FF4D]">
                <Bell className="h-10 w-10 text-white" />
            </Button>

            <div className="flex items-center gap-3 bg-[#051728] px-2 py-1 rounded-xl border-2 border-[#83E9FF4D]">
                <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8 border-2 border-[#1a2c38]">
                        <AvatarFallback className="bg-[#1a2c38] text-white text-xs">
                            UT
                        </AvatarFallback>
                    </Avatar>
                    <span className="text-[#FFFFFF99]">Xpuser_test</span>
                </div>
                <div className="w-[1px] h-6 bg-[#1a2c38]" />
                <Button variant="ghost" size="icon">
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
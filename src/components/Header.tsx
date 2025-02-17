"use client"

import { Menu, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useSidebar } from "@/hooks/use-sidebar"
import Image from "next/image"

export function Header() {
    const { setIsOpen } = useSidebar()

    return (
        <header className="p-2 lg:hidden bg-[#051728]">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="bg-[#1a2c38]"
                        onClick={() => setIsOpen(true)}
                    >
                        <Menu className="h-5 w-5 text-white" />
                    </Button>
                    <h1 className="text-sm font-bold">
                        <span className="text-[#83E9FF]">Liquid</span>
                        <span className="text-white">Terminal</span>
                    </h1>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="w-[47px] h-[47px] rounded-xl bg-[#11294199] border-2 border-[#83E9FF1A]">
                        <Bell className="h-5 w-5 text-white" />
                    </Button>

                    <div className="flex items-center gap-2 bg-[#11294199] px-2 py-1 rounded-xl border-2 border-[#83E9FF1A]">
                        <Avatar className="h-8 w-8 border-2 border-[#1a2c38]">
                            <AvatarFallback className="bg-[#1a2c38] text-white text-xs">
                                UT
                            </AvatarFallback>
                        </Avatar>
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
            </div>
        </header>
    )
} 
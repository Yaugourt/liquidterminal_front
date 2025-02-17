import { create } from 'zustand'

type SidebarStore = {
    isOpen: boolean
    setIsOpen: (isOpen: boolean) => void
}

export const useSidebar = create<SidebarStore>((set) => ({
    isOpen: false,
    setIsOpen: (isOpen) => set({ isOpen }),
})) 
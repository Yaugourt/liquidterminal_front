import { create } from 'zustand'

type PageTitleStore = {
    title: string
    setTitle: (title: string) => void
}

export const usePageTitle = create<PageTitleStore>((set) => ({
    title: '',
    setTitle: (title) => set({ title }),
}))

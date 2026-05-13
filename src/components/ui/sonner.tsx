"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast font-sans group-[.toaster]:bg-brand-tertiary group-[.toaster]:text-white group-[.toaster]:border-brand-accent/30 group-[.toaster]:shadow-lg backdrop-blur-sm",
          description: "group-[.toast]:text-white/50 group-[.toast]:font-sans",
          title: "group-[.toast]:font-sans",
          actionButton:
            "group-[.toast]:bg-brand-accent group-[.toast]:text-black group-[.toast]:hover:bg-brand-accent/90",
          cancelButton:
            "group-[.toast]:bg-brand-tertiary group-[.toast]:text-white group-[.toast]:hover:bg-brand-tertiary/80",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }

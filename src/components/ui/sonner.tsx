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
            "group toast group-[.toaster]:bg-brand-tertiary group-[.toaster]:text-white group-[.toaster]:border-[#83E9FF4D] group-[.toaster]:shadow-lg backdrop-blur-sm",
          description: "group-[.toast]:text-[#FFFFFF80]",
          actionButton:
            "group-[.toast]:bg-brand-accent group-[.toast]:text-black group-[.toast]:hover:bg-brand-accent/90",
          cancelButton:
            "group-[.toast]:bg-[#112941] group-[.toast]:text-white group-[.toast]:hover:bg-[#112941]/80",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }

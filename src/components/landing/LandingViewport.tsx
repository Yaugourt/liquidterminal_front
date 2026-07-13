"use client";

import { useEffect } from "react";
import { CommandHouse } from "./CommandHouse";

/**
 * Landing page: "Command House" (mockup home-v4-D).
 * Structure: search hero, live KPI ribbon, product screens, data
 * sources, charter + Telegram bot.
 */
export function LandingViewport() {
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = "";
    };
  }, []);

  return <CommandHouse />;
}

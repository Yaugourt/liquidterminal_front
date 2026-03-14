"use client";

import { useEffect } from "react";
import { SectionsEditorialPremium } from "./SectionsEditorialPremium";

/**
 * Landing page: hybrid Editorial + Premium.
 * Structure: Hero → Why → See it → Get started
 * Style: glassmorphism, gradients cyan/gold, refined
 */
export function LandingViewport() {
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = "";
    };
  }, []);

  return <SectionsEditorialPremium />;
}

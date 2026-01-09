"use client";

import { useState, useEffect } from "react";
import { X, Sparkles, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/contexts/auth.context";

const STORAGE_KEY = "welcomePromptDismissed";
const DISMISS_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export function WelcomePrompt() {
    const { isAuthenticated, login } = useAuthContext();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Don't show if user is already authenticated
        if (isAuthenticated) {
            setIsVisible(false);
            return;
        }

        // Check if prompt was recently dismissed
        const dismissedAt = localStorage.getItem(STORAGE_KEY);
        if (dismissedAt) {
            const dismissedTime = parseInt(dismissedAt, 10);
            if (Date.now() - dismissedTime < DISMISS_DURATION) {
                return; // Don't show if recently dismissed
            }
        }

        // Show after a short delay to not be too aggressive
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 3000); // 3 seconds after arriving on the site

        return () => clearTimeout(timer);
    }, [isAuthenticated]);

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem(STORAGE_KEY, Date.now().toString());
    };

    const handleLogin = () => {
        login();
        handleDismiss();
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm animate-in slide-in-from-bottom-5 fade-in duration-300">
            <div className="glass-card p-4 border border-brand-accent/30 shadow-lg shadow-brand-accent/10">
                <button
                    onClick={handleDismiss}
                    className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
                    aria-label="Close"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="flex items-start gap-3 pr-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-brand-accent/20 to-brand-gold/20 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-brand-accent" />
                    </div>

                    <div className="flex-1">
                        <h4 className="text-white font-medium text-sm mb-1">
                            Level up your journey! 🚀
                        </h4>
                        <p className="text-gray-400 text-xs mb-3">
                            Sign in to earn XP, complete weekly challenges and unlock exclusive rewards.
                        </p>

                        <Button
                            onClick={handleLogin}
                            size="sm"
                            className="w-full bg-gradient-to-r from-brand-accent to-brand-gold text-black font-medium hover:opacity-90 transition-opacity"
                        >
                            <LogIn className="w-4 h-4 mr-2" />
                            Get Started
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

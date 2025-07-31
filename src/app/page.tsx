"use client";

import { useState, useEffect, Suspense } from "react";
import { useAuthContext } from "@/contexts/auth.context";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Icon } from '@iconify/react';
import Image from "next/image";
import {  Clock } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

function HomePageContent() {
  const { login, logout, user, loading, authenticated, privyUser } = useAuthContext();
  const searchParams = useSearchParams();
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const [titleText, setTitleText] = useState("");
  const [titleIndex, setTitleIndex] = useState(0);
  const [versionText, setVersionText] = useState("");
  const [versionIndex, setVersionIndex] = useState(0);
  const [copySuccess, setCopySuccess] = useState(false);
  const [animationsStarted, setAnimationsStarted] = useState(false);

  const fullText = "The Terminal to house all Hyper";
  const liquidText = "Liquid";
  const titleFullText = "Liquid Terminal";
  const versionFullText = "v1.0.0";
  const typingSpeed = 100; // ms par caractère
  const titleTypingSpeed = 80; // ms par caractère pour le titre
  const versionTypingSpeed = 60; // ms par caractère pour la version

  // Fonction locale pour générer le lien de referral
  const generateReferralLink = (username: string) => {
    return `https://liquidterminal.xyz/?ref=${username}`;
  };

  // Détecter le referrer depuis l'URL et le stocker (une seule fois)
  useEffect(() => {
    const refParam = searchParams.get('ref');
    if (refParam && !localStorage.getItem('referrer')) {
      localStorage.setItem('referrer', refParam);
    }
  }, [searchParams]);

  // Lancer les animations une seule fois
  useEffect(() => {
    if (!animationsStarted) {
      setAnimationsStarted(true);
    }
  }, [animationsStarted]);

  // Animation du texte principal (une seule fois)
  useEffect(() => {
    if (!animationsStarted) return;
    
    if (currentIndex < fullText.length) {
      const timer = setTimeout(() => {
        setDisplayText(fullText.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, typingSpeed);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, fullText.length, animationsStarted]);

  // Animation du titre (une seule fois)
  useEffect(() => {
    if (!animationsStarted) return;
    
    if (titleIndex < titleFullText.length) {
      const timer = setTimeout(() => {
        setTitleText(titleFullText.slice(0, titleIndex + 1));
        setTitleIndex(titleIndex + 1);
      }, titleTypingSpeed);
      return () => clearTimeout(timer);
    }
  }, [titleIndex, titleFullText.length, animationsStarted]);

  // Animation de la version (une seule fois)
  useEffect(() => {
    if (!animationsStarted) return;
    
    if (versionIndex < versionFullText.length) {
      const timer = setTimeout(() => {
        setVersionText(versionFullText.slice(0, versionIndex + 1));
        setVersionIndex(versionIndex + 1);
      }, versionTypingSpeed);
      return () => clearTimeout(timer);
    }
  }, [versionIndex, versionFullText.length, animationsStarted]);

  // Animation du curseur seulement pendant la frappe (une seule fois)
  useEffect(() => {
    if (!animationsStarted) return;
    
    if (currentIndex < fullText.length) {
      const cursorTimer = setInterval(() => {
        setShowCursor(prev => !prev);
      }, 500);
      return () => clearInterval(cursorTimer);
    } else {
      setShowCursor(true); // Garder le curseur visible mais sans clignotement
    }
  }, [currentIndex, fullText.length, animationsStarted]);

  const socials = [
    { name: 'Discord', href: '#', iconName: 'ic:baseline-discord' },
    { name: 'Twitter', href: 'https://x.com/liquidterminal', iconName: 'simple-icons:x' },
    { name: 'Github', href: 'https://github.com/Liquid-Terminal', iconName: 'mdi:github' },
  ];

  const handleSignUp = async () => {
    if (isSigningUp) return; // Éviter les clics multiples
    
    setIsSigningUp(true);
    try {
      await login();
    } catch {
      // Error handled by useAuth
    } finally {
      setIsSigningUp(false);
    }
  };

  const handleCopyLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000); // Reset après 2 secondes
    } catch {
      // Error handled silently
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      {/* Image de fond banner.jpg */}
      <div className="absolute inset-0">
        <Image 
          src="/banner.jpg" 
          alt="Background" 
          fill
          className="object-cover object-center"
          priority
        />
        {/* Filtre sombre pour assurer la lisibilité */}
        <div className="absolute inset-0 bg-[#051728]/95" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-6 flex-shrink-0">
        {/* Logo et nom en haut à gauche */}
        <div className="flex items-center gap-2">
          <Image 
            src="/logo.svg" 
            alt="Logo" 
            width={24} 
            height={24}
            className="h-6 w-6" 
          />
          <h1 className="text-sm">
            <span className="text-[#83E9FF] font-higuen">{titleText.slice(0, 6)}</span>
            <span className="text-white font-inter">{titleText.slice(6)}</span>
          </h1>
        </div>

        {/* Icônes réseaux sociaux en haut à droite */}
        <div className="flex items-center gap-3">
          {socials.map((item) => (
            <a
              key={item.name}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative p-2"
            >
              <div className="absolute inset-0 bg-[#83E9FF] rounded-lg opacity-0 group-hover:opacity-10 transition-opacity" />
              <Icon 
                icon={item.iconName} 
                className="h-5 w-5 text-[#f9e370] group-hover:text-[#83E9FF] transition-colors relative z-10" 
              />
            </a>
          ))}
        </div>
      </div>

      {/* Contenu principal */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-4 md:px-6 py-4">
        {!authenticated || !privyUser ? (
          // État initial - pas connecté
          <div className="text-center max-w-2xl mx-auto">
            {/* Debug logs */}
      
            
            {/* Affichage du parrain détecté */}
            {searchParams.get('ref') && (
              <div className="mb-6">
                <p className="text-[#83E9FF] font-inter font-normal">
                  You&apos;re joining <strong className="text-white">{searchParams.get('ref')}</strong> on Liquid Terminal
                </p>
              </div>
            )}
            <h2 className="text-3xl md:text-4xl lg:text-6xl font-inter font-normal text-white mb-6 md:mb-8 leading-tight">
              {displayText.slice(0, 4)}
              <span className="text-[#83E9FF] font-higuen">{displayText.slice(4, 12)}</span>
              {displayText.slice(12)}
              {currentIndex >= fullText.length && (
                <span className="text-[#83E9FF] font-higuen">{liquidText}</span>
              )}
              {showCursor && <span className="text-[#83E9FF] animate-pulse">_</span>}
            </h2>
            
            <Button 
              onClick={handleSignUp}
              disabled={isSigningUp || loading}
              className="group relative bg-[#051728] rounded-lg overflow-hidden px-8 py-4 text-lg font-semibold"
            >
              <div className="absolute inset-[1px] bg-[#051728] rounded-lg z-10" />
              <div className="absolute inset-0 bg-[#83E9FF] blur-[2px]" />
              <div className="relative z-20 flex items-center justify-center gap-3">
                {isSigningUp || loading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#83E9FF]" />
                ) : (
                  <span className="font-inter font-normal text-[#83E9FF] group-hover:text-white group-hover:drop-shadow-[0_0_6px_rgba(131,233,255,0.6)] transition-all duration-300">
                    Sign up for closed beta
                  </span>
                )}
              </div>
            </Button>
          </div>
        ) : authenticated && privyUser && (!user || !user.verified) ? (
          // État après connexion mais non vérifié
          <div className="text-center max-w-md mx-auto">
            {/* Photo de profil et pseudo de l'utilisateur */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <Avatar className="h-12 w-12 ring-2 ring-[#83E9FF1A] ring-offset-2 ring-offset-[#051728]">
                {privyUser?.twitter?.profilePictureUrl ? (
                  <Image 
                    src={privyUser.twitter.profilePictureUrl}
                    alt="Avatar"
                    width={48}
                    height={48}
                    className="object-cover rounded-full"
                  />
                ) : (
                  <AvatarFallback className="bg-[#1a2c38] text-[#83E9FF] font-medium">
                    {privyUser?.twitter?.username?.[0]?.toUpperCase() || 
                     privyUser?.farcaster?.username?.[0]?.toUpperCase() || 
                     privyUser?.github?.username?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="text-left">
                <p className="text-white font-inter font-normal text-lg">
                  {privyUser?.twitter?.username || 
                   privyUser?.farcaster?.username || 
                   privyUser?.github?.username || 'User'}
                </p>
                <p className="text-[#FFFFFF80] font-inter font-normal text-sm">
                  {privyUser?.email?.address}
                </p>
              </div>
            </div>


            
            <div className="flex items-center justify-center gap-3 mb-4">
              <Image 
                src="/pending.jpg" 
                alt="Pending" 
                width={32} 
                height={32}
                className="h-8 w-8 rounded-full object-cover" 
              />
              <h3 className="text-2xl font-inter font-normal text-white">
                Thank you for signing up!
              </h3>
            </div>
            
            <p className="text-[#FFFFFF80] mb-6 font-inter font-normal">
              Your application has been submitted. We&apos;ll review it and notify you once your account is verified.
            </p>
            
            <div className="flex gap-3">
              <Button 
                disabled
                className="flex-1 bg-[#83E9FF2A] text-[#83E9FFCC] cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Clock className="h-4 w-4" />
                Pending verification
              </Button>
              <Button 
                onClick={() => logout()}
                variant="outline"
                className="border-[#83E9FF1A] text-[#83E9FF] hover:bg-[#83E9FF1A]"
              >
                Sign out
              </Button>
            </div>

            {/* Lien de referral */}
            <div className="mt-6 max-w-md mx-auto">
              <p className="text-[#83E9FF] font-inter font-normal text-sm mb-2 text-left">
                Referral link {user?.referralCount && user.referralCount > 0 && `(${user.referralCount})`}
              </p>
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={generateReferralLink(privyUser?.twitter?.username || privyUser?.farcaster?.username || privyUser?.github?.username || 'user')}
                  readOnly
                  className="flex-1 bg-[#051728] text-white font-inter font-normal text-sm px-3 py-2 rounded border border-[#83E9FF33] focus:outline-none focus:border-[#83E9FF]"
                />
                <button 
                  onClick={() => {
                    const link = generateReferralLink(privyUser?.twitter?.username || privyUser?.farcaster?.username || privyUser?.github?.username || 'user');
                    handleCopyLink(link);
                  }}
                  className="p-2 text-[#83E9FF] hover:text-white hover:bg-[#83E9FF1A] rounded transition-colors relative"
                >
                  {copySuccess ? (
                    <Icon icon="mdi:check" className="h-4 w-4 text-green-400" />
                  ) : (
                    <Icon icon="mdi:content-copy" className="h-4 w-4" />
                  )}
                </button>
                <button 
                  onClick={() => {
                    const link = generateReferralLink(privyUser?.twitter?.username || privyUser?.farcaster?.username || privyUser?.github?.username || 'user');
                    const tweetText = `@HyperliquidX is the house of all the finance.\n\nCome to the house of HyperLiquid: ${link}`;
                    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
                    window.open(twitterUrl, '_blank');
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-[#83E9FF] hover:bg-[#83E9FFCC] text-[#051728] rounded transition-colors relative font-medium text-sm"
                >
                  Refer on <Icon icon="simple-icons:x" className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ) : user && user.verified ? (
          // État vérifié - rediriger vers le dashboard
          <div className="text-center">


            <div className="flex items-center justify-center gap-3 mb-6">
              <Image 
                src="/verified.jpg" 
                alt="Verified" 
                width={48} 
                height={48}
                className="h-12 w-12 rounded-full object-cover" 
              />
              <h3 className="text-2xl font-inter font-normal text-white">
                Welcome to Liquid Terminal!
              </h3>
            </div>
            <div className="flex gap-3 justify-center">
              <Button 
                onClick={() => window.location.href = '/dashboard'}
                className="bg-[#83E9FF] text-[#051728] hover:bg-[#83E9FFCC]"
              >
                Go to Dashboard
              </Button>
              <Button 
                onClick={() => logout()}
                variant="outline"
                className="border-[#83E9FF1A] text-[#83E9FF] hover:bg-[#83E9FF1A]"
              >
                Sign out
              </Button>
            </div>

            {/* Lien de referral */}
            <div className="mt-6 max-w-md mx-auto">
              <p className="text-[#83E9FF] font-inter font-normal text-sm mb-2 text-left">
                Referral link {user?.referralCount && user.referralCount > 0 && `(${user.referralCount})`}
              </p>
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={generateReferralLink(user.name)}
                  readOnly
                  className="flex-1 bg-[#051728] text-white font-inter font-normal text-sm px-3 py-2 rounded border border-[#83E9FF33] focus:outline-none focus:border-[#83E9FF]"
                />
                <button 
                  onClick={() => {
                    const link = generateReferralLink(user.name);
                    handleCopyLink(link);
                  }}
                  className="p-2 text-[#83E9FF] hover:text-white hover:bg-[#83E9FF1A] rounded transition-colors relative"
                >
                  {copySuccess ? (
                    <Icon icon="mdi:check" className="h-4 w-4 text-green-400" />
                  ) : (
                    <Icon icon="mdi:content-copy" className="h-4 w-4" />
                  )}
                </button>
                <button 
                  onClick={() => {
                    const link = generateReferralLink(user.name);
                    const tweetText = `@HyperliquidX is the house of all the finance, @liquidterminal is the house of all HyperLiquid.\n\nCome to the house of HyperLiquid: ${link}`;
                    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
                    window.open(twitterUrl, '_blank');
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-[#83E9FF] hover:bg-[#83E9FFCC] text-[#051728] rounded transition-colors relative font-medium text-sm"
                >
                  Refer on <Icon icon="simple-icons:x" className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>



      {/* Footer */}
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between text-sm p-4 md:p-6 flex-shrink-0 w-full gap-4">
        <div className="flex items-center gap-4">
          <span className="text-white font-inter font-normal">{versionText}</span>
          <span className="text-white font-inter font-normal">•</span>
          <span className="bg-[#F9E3701A] text-[#F9E370] px-2 py-1 rounded text-xs font-inter font-normal">
            CLOSED BETA
          </span>
        </div>

        {/* API Providers Bandeau */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 w-full md:w-auto">
          <span className="text-[#FFFFFF80] text-xs font-inter font-normal">
            API providers:
          </span>
          <div className="flex items-center gap-4 md:gap-6 overflow-x-auto scrollbar-hide w-full md:w-auto">
            <a 
              href="https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-white hover:text-[#83E9FF] transition-colors group flex-shrink-0"
            >
              <Image 
                src="https://app.hyperliquid.xyz/coins/HYPE_USDC.svg" 
                alt="HyperLiquid" 
                width={20}
                height={20}
                className="w-5 h-5 rounded"
              />
              <span className="text-sm font-inter font-normal">HyperLiquid</span>
            </a>

            <a 
              href="https://api.hypurrscan.io/ui/#/Experimental/hypurrscanAPI.get%20spotUSDC" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-white hover:text-[#83E9FF] transition-colors group flex-shrink-0"
            >
              <Image 
                src="/hypurrscan.jpg" 
                alt="HypurrScan" 
                width={20}
                height={20}
                className="w-5 h-5 rounded"
              />
              <span className="text-sm font-inter font-normal">HypurrScan</span>
            </a>

            <a 
              href="https://api-docs.defillama.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-white hover:text-[#83E9FF] transition-colors group flex-shrink-0"
            >
              <Image 
                src="/defillama.jpg" 
                alt="DefiLlama" 
                width={20}
                height={20}
                className="w-5 h-5 rounded"
              />
              <span className="text-sm font-inter font-normal">DefiLlama</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#051728] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#83E9FF]"></div>
      </div>
    }>
      <HomePageContent />
    </Suspense>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useAuthContext } from "@/contexts/auth.context";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Icon } from '@iconify/react';
import Image from "next/image";
import { CheckCircle, Clock } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function HomePage() {
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

  const fullText = "The Terminal to house all Hyper";
  const liquidText = "Liquid";
  const titleFullText = "Liquid Terminal";
  const versionFullText = "v1.0.0";
  const typingSpeed = 100; // ms par caractère
  const titleTypingSpeed = 80; // ms par caractère pour le titre
  const versionTypingSpeed = 60; // ms par caractère pour la version

  // Fonction locale pour générer le lien de referral
  const generateReferralLink = (username: string) => {
    return `${window.location.origin}/?ref=${username}`;
  };

  // Détecter le referrer depuis l'URL et le stocker
  useEffect(() => {
    const refParam = searchParams.get('ref');
    if (refParam) {
      // Stocker le referrer dans localStorage pour qu'il persiste
      localStorage.setItem('referrer', refParam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (currentIndex < fullText.length) {
      const timer = setTimeout(() => {
        setDisplayText(fullText.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, typingSpeed);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, fullText.length]);

  // Animation du titre
  useEffect(() => {
    if (titleIndex < titleFullText.length) {
      const timer = setTimeout(() => {
        setTitleText(titleFullText.slice(0, titleIndex + 1));
        setTitleIndex(titleIndex + 1);
      }, titleTypingSpeed);
      return () => clearTimeout(timer);
    }
  }, [titleIndex, titleFullText.length]);

  // Animation de la version
  useEffect(() => {
    if (versionIndex < versionFullText.length) {
      const timer = setTimeout(() => {
        setVersionText(versionFullText.slice(0, versionIndex + 1));
        setVersionIndex(versionIndex + 1);
      }, versionTypingSpeed);
      return () => clearTimeout(timer);
    }
  }, [versionIndex, versionFullText.length]);

  // Animation du curseur seulement pendant la frappe
  useEffect(() => {
    if (currentIndex < fullText.length) {
      const cursorTimer = setInterval(() => {
        setShowCursor(prev => !prev);
      }, 500);
      return () => clearInterval(cursorTimer);
    } else {
      setShowCursor(true); // Garder le curseur visible mais sans clignotement
    }
  }, [currentIndex, fullText.length]);

  const socials = [
    { name: 'Discord', href: '#', iconName: 'ic:baseline-discord' },
    { name: 'Twitter', href: '#', iconName: 'simple-icons:x' },
    { name: 'Github', href: '#', iconName: 'mdi:github' },
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
    <div className="min-h-screen bg-[#051728] relative overflow-hidden flex flex-col">
      {/* Fond avec lumière blanche en arc de cercle */}
      <div className="absolute inset-0">
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[800px] h-[600px] bg-gradient-radial from-white/10 via-white/5 to-transparent rounded-full blur-3xl" />
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
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-6">
        {!authenticated || !privyUser ? (
          // État initial - pas connecté
          <div className="text-center max-w-2xl mx-auto">
            {/* Debug logs */}
      
            
            {/* Affichage du parrain détecté */}
            {searchParams.get('ref') && (
              <div className="mb-6 p-4 bg-[#83E9FF1A] rounded-lg border border-[#83E9FF33]">
                <p className="text-[#83E9FF] font-inter font-normal">
                  Vous rejoignez <strong className="text-white">{searchParams.get('ref')}</strong> sur Liquid Terminal
                </p>
              </div>
            )}
            <h2 className="text-4xl md:text-6xl font-inter font-normal text-white mb-8 leading-tight">
              {displayText.slice(0, 4)}
              <span className="text-[#83E9FF]">{displayText.slice(4, 12)}</span>
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


            
            <h3 className="text-2xl font-inter font-normal text-white mb-4">
              Thank you for signing up!
            </h3>
            
            <p className="text-[#FFFFFF80] mb-6 font-inter font-normal">
              Your application has been submitted. We&apos;ll review it and notify you once your account is verified.
            </p>
            
            <div className="flex items-center justify-center gap-2 text-[#83E9FF] mb-6">
              <Clock className="h-5 w-5" />
              <span className="text-sm font-inter font-normal">Pending verification</span>
            </div>
            


            <div className="flex gap-3">
              <Button 
                disabled
                className="flex-1 bg-[#83E9FF1A] text-[#83E9FF80] cursor-not-allowed"
              >
                Access pending verification
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
              </div>
            </div>
          </div>
        ) : user && user.verified ? (
          // État vérifié - rediriger vers le dashboard
          <div className="text-center">


            {/* Affichage des stats de referral */}
            {(user.referralCount > 0 || user.referredBy) && (
              <div className="mb-6 p-4 bg-[#83E9FF1A] rounded-lg border border-[#83E9FF33]">
                <h4 className="text-[#83E9FF] font-inter font-normal mb-2">Referral Stats</h4>
                {user.referredBy && (
                  <p className="text-white font-inter font-normal text-sm mb-1">
                    Rejoint via: <strong className="text-[#83E9FF]">{user.referredBy}</strong>
                  </p>
                )}
                {user.referralCount > 0 && (
                  <p className="text-white font-inter font-normal text-sm">
                    Parrainages: <strong className="text-[#83E9FF]">{user.referralCount}</strong> utilisateur(s)
                  </p>
                )}
              </div>
            )}
            <div className="mx-auto mb-6 p-4 bg-[#52C41A1A] rounded-full w-fit">
              <CheckCircle className="h-12 w-12 text-[#52C41A]" />
            </div>
            <h3 className="text-2xl font-inter font-normal text-white mb-4">
              Welcome to Liquid Terminal!
            </h3>
            <p className="text-[#FFFFFF80] mb-6 font-inter font-normal">
              Your account has been verified.
            </p>
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
              </div>
            </div>
          </div>
        ) : null}
      </div>



      {/* Footer */}
      <div className="relative z-10 flex items-center justify-between text-sm p-6 flex-shrink-0 w-full">
        <div className="flex items-center gap-4">
          <span className="text-white font-inter font-normal">{versionText}</span>
          <span className="text-white font-inter font-normal">•</span>
          <span className="bg-[#F9E3701A] text-[#F9E370] px-2 py-1 rounded text-xs font-inter font-normal">
            CLOSED BETA
          </span>
        </div>

        {/* API Providers Bandeau */}
        <div className="flex items-center gap-4">
          <span className="text-[#FFFFFF80] text-xs font-inter font-normal mr-2">
            API providers:
          </span>
          <div className="flex items-center gap-6">
            <a 
              href="https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-white hover:text-[#83E9FF] transition-colors group"
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
              className="flex items-center gap-2 text-white hover:text-[#83E9FF] transition-colors group"
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
              className="flex items-center gap-2 text-white hover:text-[#83E9FF] transition-colors group"
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

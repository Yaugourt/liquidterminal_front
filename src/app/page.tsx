"use client";

import { useState } from "react";
import { useAuth } from "@/services/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from '@iconify/react';
import Image from "next/image";
import { CheckCircle, Clock } from "lucide-react";

export default function HomePage() {
  const { login, user, loading } = useAuth();
  const [isSigningUp, setIsSigningUp] = useState(false);

  const socials = [
    { name: 'Discord', href: '#', iconName: 'ic:baseline-discord' },
    { name: 'Twitter', href: '#', iconName: 'simple-icons:x' },
    { name: 'Github', href: '#', iconName: 'mdi:github' },
  ];

  const handleSignUp = async () => {
    setIsSigningUp(true);
    try {
      await login();
    } catch (error) {
      console.error('Sign up error:', error);
    } finally {
      setIsSigningUp(false);
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
          <h1 className="text-sm font-bold">
            <span className="text-[#83E9FF] font-higuen">Liquid </span>
            <span className="text-white font-inter">Terminal</span>
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
                className="h-5 w-5 text-[#83E9FFCC] group-hover:text-[#83E9FF] transition-colors relative z-10" 
              />
            </a>
          ))}
        </div>
      </div>

      {/* Contenu principal */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-6">
        {!user ? (
          // État initial - pas connecté
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight">
              The terminal to house all{" "}
              <span className="text-[#83E9FF]">Hyperliquid</span>
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
                  <span className="font-semibold text-[#83E9FF] group-hover:text-white group-hover:drop-shadow-[0_0_6px_rgba(131,233,255,0.6)] transition-all duration-300">
                    Sign up for closed beta
                  </span>
                )}
              </div>
            </Button>
          </div>
        ) : !user.verified ? (
          // État après connexion mais non vérifié
          <Card className="w-full max-w-md bg-[#051728E5] border-2 border-[#83E9FF4D] backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <div className="mx-auto mb-6 p-4 bg-[#83E9FF1A] rounded-full w-fit">
                <CheckCircle className="h-12 w-12 text-[#83E9FF]" />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-4">
                Thank you for signing up!
              </h3>
              
              <p className="text-[#FFFFFF80] mb-6">
                Your application has been submitted. We'll review it and notify you once your account is verified.
              </p>
              
              <div className="flex items-center justify-center gap-2 text-[#83E9FF] mb-6">
                <Clock className="h-5 w-5" />
                <span className="text-sm">Pending verification</span>
              </div>
              
              <Button 
                disabled
                className="w-full bg-[#83E9FF1A] text-[#83E9FF80] cursor-not-allowed"
              >
                Access pending verification
              </Button>
            </CardContent>
          </Card>
        ) : (
          // État vérifié - rediriger vers le dashboard
          <div className="text-center">
            <div className="mx-auto mb-6 p-4 bg-[#52C41A1A] rounded-full w-fit">
              <CheckCircle className="h-12 w-12 text-[#52C41A]" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">
              Welcome to Liquid Terminal!
            </h3>
            <p className="text-[#FFFFFF80] mb-6">
              Your account has been verified. Redirecting to the platform...
            </p>
            <Button 
              onClick={() => window.location.href = '/dashboard'}
              className="bg-[#83E9FF] text-[#051728] hover:bg-[#83E9FFCC]"
            >
              Go to Dashboard
            </Button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="relative z-10 flex items-center gap-4 text-[#FFFFFF80] text-sm p-6 flex-shrink-0">
        <span>v1.0.0</span>
        <span>•</span>
        <span className="bg-[#F9E3701A] text-[#F9E370] px-2 py-1 rounded text-xs font-medium">
          CLOSED BETA
        </span>
      </div>
    </div>
  );
}

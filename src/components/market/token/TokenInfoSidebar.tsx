"use client";

import { Card } from "@/components/ui/card";
import { TokenData } from "./types";

interface TokenInfoSidebarProps {
  token: TokenData;
  className?: string;
}

// Mock additional data - replace with real data from API
const mockTokenInfo = {
  description: "PIP - even the tiniest PIP can create waves of change 🌊",
  maxSupply: "1.09M",
  totalSupply: "1.2M",
  circulatingSupply: "1.0932B",
  auctionPrice: "$304K",
  deployer: "0x12...bde",
  tokenAddress: "0x12...bde",
  socialLinks: {
    discord: "#",
    twitter: "#",
    github: "#"
  }
};

export function TokenInfoSidebar({ token, className }: TokenInfoSidebarProps) {
  return (
    <Card className={`bg-[#051728E5] border-2 border-[#83E9FF4D] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] ${className}`}>
      <div className="p-4 space-y-4">
        {/* Token Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-gradient-to-br from-[#83E9FF] to-[#4ADE80] rounded-full flex items-center justify-center mx-auto">
            <span className="text-[#051728] text-2xl font-bold">
              {token.symbol.split('/')[0].charAt(0)}
            </span>
          </div>
          <h3 className="text-white text-lg font-bold">{token.symbol.split('/')[0]}</h3>
          <p className="text-gray-400 text-sm">{mockTokenInfo.description}</p>
        </div>

        {/* Social Links */}
        <div className="flex justify-center gap-4">
          <a href={mockTokenInfo.socialLinks.discord} className="text-gray-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
          </a>
          <a href={mockTokenInfo.socialLinks.twitter} className="text-gray-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
          <a href={mockTokenInfo.socialLinks.github} className="text-gray-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385c.6.105.825-.255.825-.57c0-.285-.015-1.23-.015-2.235c-3.015.555-3.795-.735-4.035-1.41c-.135-.345-.72-1.41-1.23-1.695c-.42-.225-1.02-.78-.015-.795c.945-.015 1.62.87 1.845 1.23c1.08 1.815 2.805 1.305 3.495.99c.105-.78.42-1.305.765-1.605c-2.67-.3-5.46-1.335-5.46-5.925c0-1.305.465-2.385 1.23-3.225c-.12-.3-.54-1.53.12-3.18c0 0 1.005-.315 3.3 1.23c.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23c.66 1.65.24 2.88.12 3.18c.765.84 1.23 1.905 1.23 3.225c0 4.605-2.805 5.625-5.475 5.925c.435.375.81 1.095.81 2.22c0 1.605-.015 2.895-.015 3.3c0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </a>
        </div>

        {/* Token Stats */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Max supply</span>
            <span className="text-white text-sm font-medium">{mockTokenInfo.maxSupply}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Total supply</span>
            <span className="text-white text-sm font-medium">{mockTokenInfo.totalSupply}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Circulating supply</span>
            <span className="text-white text-sm font-medium">{mockTokenInfo.circulatingSupply}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Auction price</span>
            <span className="text-white text-sm font-medium">{mockTokenInfo.auctionPrice}</span>
          </div>
        </div>

        {/* Addresses */}
        <div className="space-y-3 border-t border-[#83E9FF33] pt-4">
          <div>
            <span className="text-gray-400 text-sm block mb-1">Deployer</span>
            <div className="flex items-center justify-between">
              <span className="text-[#83E9FF] text-sm">{mockTokenInfo.deployer}</span>
              <button className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </button>
            </div>
          </div>
          
          <div>
            <span className="text-gray-400 text-sm block mb-1">Token address</span>
            <div className="flex items-center justify-between">
              <span className="text-[#83E9FF] text-sm">{mockTokenInfo.tokenAddress}</span>
              <button className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

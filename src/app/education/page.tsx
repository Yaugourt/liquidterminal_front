"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { SearchBar } from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { EducationContent } from "@/components/education/EducationContent";
import { EducationSidebar } from "@/components/education/EducationSidebar";
import { ResourcesSection } from "@/components/education/ResourcesSection";
import { CategoryFilter } from "@/components/education/CategoryFilter";

// Mock data pour le moment
const MOCK_CHAPTERS = [
  {
    id: 1,
    title: "Introduction",
    description: "Welcome to the world of blockchain technology. This chapter covers the fundamental concepts of distributed ledger technology, consensus mechanisms, and the revolutionary impact of blockchain on various industries.\n\nWe'll explore how blockchain works at its core, why it matters, and what makes it different from traditional databases."
  },
  {
    id: 2,
    title: "Fundamentals",
    description: "Deep dive into the technical foundations of blockchain. Learn about cryptographic hashing, digital signatures, merkle trees, and how blocks are linked together to form an immutable chain.\n\nUnderstand the role of nodes, miners, and validators in maintaining the network's security and integrity."
  },
  {
    id: 3,
    title: "Smart Contracts",
    description: "Explore the world of programmable money through smart contracts. Learn how self-executing contracts with the terms directly written into code are revolutionizing agreements and automation.\n\nDiscover popular smart contract platforms and their unique features."
  },
  {
    id: 4,
    title: "Use Cases",
    description: "Real-world applications of blockchain technology across industries. From finance and supply chain to healthcare and voting systems, see how blockchain is solving real problems.\n\nCase studies and success stories from leading blockchain implementations."
  }
];

const MOCK_SECTION_INFO = {
  title: "Blockchain Fundamentals",
  description: "Master the core concepts of blockchain technology",
  color: "#83E9FF",
  creator: "Satoshi Nakamoto",
  consensus: "Proof of Work",
  whitepaperLink: "https://bitcoin.org/bitcoin.pdf",
  websiteLink: "https://blockchain.com",
  twitterLink: "https://twitter.com/blockchain"
};

const MOCK_CATEGORIES = [
  {
    id: 1,
    title: "Articles",
    count: 24,
    resources: [
      { id: "1", title: "Understanding Blockchain Basics", description: "A comprehensive guide to blockchain fundamentals", url: "https://example.com/1", image: "/api/placeholder/400/200" },
      { id: "2", title: "Smart Contract Development", description: "Learn to build your first smart contract", url: "https://example.com/2", image: "/api/placeholder/400/200" },
      { id: "3", title: "DeFi Explained", description: "Decentralized finance and its applications", url: "https://example.com/3", image: "/api/placeholder/400/200" },
      { id: "4", title: "NFTs and Digital Ownership", description: "The revolution of digital assets", url: "https://example.com/4", image: "/api/placeholder/400/200" },
    ]
  },
  {
    id: 2,
    title: "Videos",
    count: 18,
    resources: [
      { id: "5", title: "Blockchain in 10 Minutes", description: "Quick introduction to blockchain technology", url: "https://example.com/5", image: "/api/placeholder/400/200" },
      { id: "6", title: "Ethereum Masterclass", description: "Deep dive into Ethereum ecosystem", url: "https://example.com/6", image: "/api/placeholder/400/200" },
    ]
  },
  {
    id: 3,
    title: "Tutorials",
    count: 12,
    resources: [
      { id: "7", title: "Build Your First DApp", description: "Step-by-step guide to DApp development", url: "https://example.com/7", image: "/api/placeholder/400/200" },
      { id: "8", title: "Web3 Integration Guide", description: "Connect your app to the blockchain", url: "https://example.com/8", image: "/api/placeholder/400/200" },
    ]
  }
];

export default function EducationPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

  const filteredCategories = selectedCategories.length > 0
    ? MOCK_CATEGORIES.filter(cat => selectedCategories.includes(cat.id))
    : MOCK_CATEGORIES;

  return (
    <div className="min-h-screen">
      {/* Mobile menu button */}
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          className="bg-[#051728] hover:bg-[#112941]"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <Menu className="h-6 w-6 text-white" />
        </Button>
      </div>

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Main content */}
      <div className="">
        <Header customTitle="Education" showFees={true} />
        
        <div className="p-2 lg:hidden">
          <SearchBar placeholder="Search educational content..." />
        </div>

        <main className="px-2 py-2 sm:px-4 sm:py-4 lg:px-6 xl:px-12 lg:py-6 space-y-8 max-w-[1920px] mx-auto">
          {/* Main content area */}
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <EducationContent chapters={MOCK_CHAPTERS} />
            </div>
            <div className="w-full lg:w-[320px]">
              <EducationSidebar info={MOCK_SECTION_INFO} />
            </div>
          </div>

          {/* Category filter */}
          <CategoryFilter 
            categories={MOCK_CATEGORIES}
            selectedCategories={selectedCategories}
            onCategoryChange={setSelectedCategories}
          />

          {/* Resources section */}
          <ResourcesSection 
            categories={filteredCategories}
            sectionColor={MOCK_SECTION_INFO.color}
          />
        </main>
      </div>
    </div>
  );
}

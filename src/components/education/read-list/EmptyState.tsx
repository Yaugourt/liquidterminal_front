import { BookOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useReadListStore } from "@/store/use-read-list";

interface EmptyStateProps {
  onCreateReadList: () => void;
}

export function EmptyState({ onCreateReadList }: EmptyStateProps) {
  const { createReadList, addItemToReadList } = useReadListStore();

  const createSampleData = () => {
    // Create a sample read list
    const readList = createReadList({
      name: "Blockchain Basics",
      description: "Essential articles about blockchain technology",
      isPublic: true,
    });

    // Add sample articles
    const sampleArticles = [
      {
        title: "Understanding Blockchain Technology",
        description: "A comprehensive guide to how blockchain works and why it matters for the future of digital transactions.",
        url: "https://example.com/blockchain-basics",
        category: "Technology",
        tags: ["blockchain", "cryptocurrency", "technology"],
      },
      {
        title: "Smart Contracts Explained",
        description: "Learn about self-executing contracts with terms directly written into code and their revolutionary applications.",
        url: "https://example.com/smart-contracts",
        category: "Development",
        tags: ["smart-contracts", "ethereum", "programming"],
      },
      {
        title: "DeFi: The Future of Finance",
        description: "Explore decentralized finance and how it's reshaping traditional financial services through blockchain technology.",
        url: "https://example.com/defi-guide",
        category: "Finance",
        tags: ["defi", "finance", "dapps"],
      },
    ];

    sampleArticles.forEach(article => {
      addItemToReadList(readList.id, article);
    });
  };

  return (
    <Card className="bg-[#051728] border-2 border-[#83E9FF4D] rounded-lg p-12 text-center">
      <div className="flex flex-col items-center space-y-6">
        <div className="w-16 h-16 bg-[#83E9FF1A] rounded-full flex items-center justify-center">
          <BookOpen className="w-8 h-8 text-[#83E9FF]" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-white text-xl font-semibold">Create Your First Read List</h2>
          <p className="text-[#FFFFFF80] text-sm max-w-md">
            Organize your educational content by creating custom read lists. 
            Save articles, tutorials, and resources for later reading.
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button
            onClick={onCreateReadList}
            className="bg-[#83E9FF] hover:bg-[#83E9FF]/90 text-[#051728] font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Read List
          </Button>
          <Button
            onClick={createSampleData}
            variant="outline"
            className="border-[#83E9FF4D] text-white hover:bg-[#83E9FF1A]"
          >
            Try with Sample Data
          </Button>
        </div>
      </div>
    </Card>
  );
} 
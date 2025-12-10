"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { EducationalCategory, EducationalResource } from "@/services/wiki/types";
import { ProtectedAction } from "@/components/common/ProtectedAction";
import { useAuthContext } from "@/contexts/auth.context";
import { Plus } from "lucide-react";
import { CategoryForm } from "./forms/CategoryForm";
import { ResourceForm } from "./forms/ResourceForm";
import { CsvUploadForm } from "./forms/CsvUploadForm";

interface EducationModalProps {
  onSuccess?: (item?: EducationalCategory | EducationalResource) => void;
}

export function EducationModal({ onSuccess }: EducationModalProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("category");
  const { user } = useAuthContext();

  const handleSuccess = (item?: EducationalCategory | EducationalResource) => {
    onSuccess?.(item);
    setOpen(false);
  };

  return (
    <ProtectedAction requiredRole="MODERATOR" user={user}>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="bg-brand-accent hover:bg-brand-accent/90 text-brand-tertiary font-semibold rounded-lg">
            <Plus className="w-4 h-4 mr-2" />
            Add Content
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-brand-secondary border border-white/10 rounded-2xl shadow-xl shadow-black/20 text-white max-w-md">
          <DialogTitle className="sr-only">Add Educational Content</DialogTitle>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-brand-dark rounded-lg p-1 border border-white/5">
              <TabsTrigger
                value="category"
                className="text-zinc-400 data-[state=active]:bg-brand-accent data-[state=active]:text-brand-tertiary data-[state=active]:font-bold rounded-md text-xs transition-all"
              >
                Add Category
              </TabsTrigger>
              <TabsTrigger
                value="resource"
                className="text-zinc-400 data-[state=active]:bg-brand-accent data-[state=active]:text-brand-tertiary data-[state=active]:font-bold rounded-md text-xs transition-all"
              >
                Add Resource
              </TabsTrigger>
              <TabsTrigger
                value="csv"
                className="text-zinc-400 data-[state=active]:bg-brand-accent data-[state=active]:text-brand-tertiary data-[state=active]:font-bold rounded-md text-xs transition-all"
              >
                Upload CSV
              </TabsTrigger>
            </TabsList>

            <TabsContent value="category" className="mt-6">
              <CategoryForm onSuccess={handleSuccess} onCancel={() => setOpen(false)} />
            </TabsContent>

            <TabsContent value="resource" className="mt-6">
              <ResourceForm onSuccess={handleSuccess} onCancel={() => setOpen(false)} />
            </TabsContent>

            <TabsContent value="csv" className="mt-6">
              <CsvUploadForm onSuccess={() => handleSuccess()} onCancel={() => setOpen(false)} />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </ProtectedAction>
  );
} 
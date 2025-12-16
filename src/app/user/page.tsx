"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Menu, Loader2, ShieldX } from 'lucide-react';
import { SearchBar } from '@/components/SearchBar';
import { Header } from '@/components/Header';
import { UserManagement } from '@/components/user/UserManagement';
import { WikiModerationCard } from '@/components/wiki/moderation/WikiModerationCard';
import { ProtectedAction } from '@/components/common/ProtectedAction';
import { useAuthContext } from '@/contexts/auth.context';
import { useWindowSize } from '@/hooks/use-window-size';

export default function UserPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, loading: isLoading } = useAuthContext();
  const router = useRouter();
  const { width } = useWindowSize();

  // Close sidebar on desktop
  useEffect(() => {
    if (width && width >= 1024) {
      setIsSidebarOpen(false);
    }
  }, [width]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0E14] text-zinc-100 font-inter bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a2c38] via-[#0B0E14] to-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#83E9FF] mb-3" />
          <span className="text-zinc-500 text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  // Redirect or show access denied if not ADMIN
  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-[#0B0E14] text-zinc-100 font-inter bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a2c38] via-[#0B0E14] to-[#050505] flex items-center justify-center">
        <div className="bg-[#151A25]/60 backdrop-blur-md border border-white/5 rounded-2xl p-8 text-center shadow-xl shadow-black/20 max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center mx-auto mb-4">
            <ShieldX className="h-8 w-8 text-rose-400" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-zinc-400 text-sm mb-6">
            This page is restricted to administrators only.
          </p>
          <Button
            onClick={() => router.push('/')}
            className="bg-[#83E9FF] text-[#051728] hover:bg-[#83E9FF]/80 font-medium"
          >
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0E14] text-zinc-100 font-inter bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a2c38] via-[#0B0E14] to-[#050505]">
      {/* Mobile menu button - fixed position */}
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div>
        {/* Header with glass effect */}
        <div className="sticky top-0 z-40 backdrop-blur-xl bg-[#0B0E14]/80 border-b border-white/5">
          <Header customTitle="Administration" />
        </div>

        {/* Mobile SearchBar */}
        <div className="p-2 lg:hidden">
          <SearchBar placeholder="Search users..." />
        </div>

        {/* Main content */}
        <main className="px-2 py-4 sm:px-4 sm:py-6 lg:px-6 xl:px-12 lg:py-8 space-y-6 max-w-[1920px] mx-auto">
          {/* Stacked layout for admin cards */}
          <div className="space-y-6">
            <UserManagement />
            <ProtectedAction requiredRole="MODERATOR" user={user}>
              <WikiModerationCard />
            </ProtectedAction>
          </div>
        </main>
      </div>
    </div>
  );
}
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ShieldX } from 'lucide-react';
import { UserManagement } from '@/components/user/UserManagement';
import { WikiModerationCard } from '@/components/wiki/moderation/WikiModerationCard';
import { ProtectedAction } from '@/components/common';
import { LoadingState } from '@/components/ui/loading-state';
import { useAuthContext } from '@/contexts/auth.context';

export default function UserPage() {
  const { user, loading: isLoading } = useAuthContext();
  const router = useRouter();

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingState message="Loading..." size="md" withCard={false} />
      </div>
    );
  }

  // Redirect or show access denied if not ADMIN
  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="bg-brand-secondary/60 backdrop-blur-md border border-white/5 rounded-2xl p-8 text-center shadow-xl shadow-black/20 max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center mx-auto mb-4">
            <ShieldX className="h-8 w-8 text-rose-400" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-zinc-400 text-sm mb-6">
            This page is restricted to administrators only.
          </p>
          <Button
            onClick={() => router.push('/')}
            className="bg-brand-accent text-brand-tertiary hover:bg-brand-accent/80 font-medium"
          >
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <UserManagement />
      <ProtectedAction requiredRole="MODERATOR" user={user}>
        <WikiModerationCard />
      </ProtectedAction>
    </div>
  );
}
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ShieldX } from 'lucide-react';
import { UserManagement } from '@/components/user/UserManagement';
import { WikiModerationCard } from '@/components/wiki/moderation/WikiModerationCard';
import { ProtectedAction } from '@/components/common';
import { LoadingState } from '@/components/ui/loading-state';
import { useAuthContext } from '@/contexts/auth.context';
import { usePageTitle } from '@/store/use-page-title';

export default function UserPage() {
  const { user, loading: isLoading } = useAuthContext();
  const router = useRouter();
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle('User Management');
  }, [setTitle]);

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
        <Card padding="lg" className="text-center max-w-md mx-4 space-y-4">
          <div className="w-16 h-16 rounded-lg bg-danger/10 flex items-center justify-center mx-auto">
            <ShieldX className="h-8 w-8 text-danger" />
          </div>
          <h1 className="text-xl font-semibold text-text-primary">Access Denied</h1>
          <p className="text-text-secondary text-sm">
            This page is restricted to administrators only.
          </p>
          <Button
            onClick={() => router.push('/')}
            className="bg-brand text-brand-text-on hover:bg-brand/80 font-medium"
          >
            Return to Home
          </Button>
        </Card>
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
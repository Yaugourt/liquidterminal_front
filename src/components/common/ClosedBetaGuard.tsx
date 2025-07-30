import React from 'react';
import { useAuth } from '@/services/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, ShieldX, LogOut } from 'lucide-react';
import { hasRole } from '@/utils/roleHelpers';

interface ClosedBetaGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ClosedBetaGuard({ children, fallback }: ClosedBetaGuardProps) {
  const { user, loading, error, logout, isAuthenticated } = useAuth();

  // Si en cours de chargement, afficher un loader
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#83E9FF]"></div>
          <p className="text-white mt-4">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Si l'utilisateur n'est pas connecté
  if (!isAuthenticated || !user) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen bg-[#051728]">
        <Card className="w-full max-w-md bg-[#051728E5] border-2 border-[#83E9FF4D]">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-[#83E9FF1A] rounded-full w-fit">
              <Shield className="h-8 w-8 text-[#83E9FF]" />
            </div>
            <CardTitle className="text-white">Closed Beta Access</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-[#FFFFFF80] mb-6">
              This platform is currently in closed beta. Please log in to request access.
            </p>
            <Button 
              onClick={() => window.location.href = '/'}
              className="bg-[#83E9FF] text-[#051728] hover:bg-[#83E9FFCC] w-full"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Si l'utilisateur n'est pas vérifié ET n'est pas admin
  if (!user.verified && !hasRole(user, 'ADMIN')) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#051728]">
        <Card className="w-full max-w-md bg-[#051728E5] border-2 border-[#FF57574D]">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-[#FF57571A] rounded-full w-fit">
              <ShieldX className="h-8 w-8 text-[#FF5757]" />
            </div>
            <CardTitle className="text-white">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-[#FFFFFF80] mb-4">
              Your account is not yet verified for the closed beta.
            </p>
            {error?.message && (
              <p className="text-[#FF5757] text-sm mb-4">{error.message}</p>
            )}
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={logout}
                className="border-[#83E9FF4D] text-white hover:bg-[#83E9FF1A] flex-1"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
              <Button 
                onClick={() => window.location.href = '/'}
                className="bg-[#83E9FF] text-[#051728] hover:bg-[#83E9FFCC] flex-1"
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Si tout est OK, afficher le contenu
  return <>{children}</>;
} 
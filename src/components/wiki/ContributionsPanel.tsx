"use client";

import { FilePlus2, LogIn } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProtectedAction } from "@/components/common";
import { useAuthContext } from "@/contexts/auth.context";
import { MySubmissionsList } from "./MySubmissionsList";
import { WikiModerationCard } from "./moderation/WikiModerationCard";

/**
 * "My contributions" tab: the user's submissions with their moderation
 * status, plus the moderation queue for MODERATOR/ADMIN.
 */
export function ContributionsPanel() {
  const { user, authenticated, login } = useAuthContext();

  if (!authenticated) {
    return (
      <Card padding="lg" className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-brand/10">
          <LogIn className="h-6 w-6 text-brand" />
        </div>
        <h3 className="mb-1 text-base font-semibold text-text-primary">Sign in to contribute</h3>
        <p className="mb-5 text-sm text-text-secondary">
          Track your submissions and suggest new resources to the wiki.
        </p>
        <Button
          onClick={() => login()}
          className="bg-brand font-semibold text-brand-text-on hover:bg-brand/90"
        >
          Sign in
        </Button>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader density="compact" className="flex-row items-center gap-2 space-y-0 border-b border-border-subtle">
          <div className="rounded-lg bg-brand/10 p-1.5">
            <FilePlus2 className="h-4 w-4 text-brand" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary">My submissions</h3>
            <p className="text-xs text-text-tertiary">Suggested resources and their review status</p>
          </div>
        </CardHeader>
        <CardContent density="compact">
          <MySubmissionsList />
        </CardContent>
      </Card>

      <ProtectedAction requiredRole="MODERATOR" user={user}>
        <WikiModerationCard />
      </ProtectedAction>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ProtectedAction } from "@/components/common/ProtectedAction";
import { useAuthContext } from "@/contexts/auth.context";
import { Plus } from "lucide-react";
import { UserSubmissionForm } from "./UserSubmissionForm";

interface UserSubmissionModalProps {
    onSuccess?: () => void;
}

export function UserSubmissionModal({ onSuccess }: UserSubmissionModalProps) {
    const [open, setOpen] = useState(false);
    const { user } = useAuthContext();

    const handleSuccess = () => {
        onSuccess?.();
        setOpen(false);
    };

    return (
        <ProtectedAction requiredRole="USER" user={user}>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button className="bg-brand-accent hover:bg-brand-accent/90 text-brand-tertiary font-semibold rounded-lg">
                        <Plus className="w-4 h-4 mr-2" />
                        Suggest Resource
                    </Button>
                </DialogTrigger>
                <DialogContent className="bg-brand-secondary border border-border-hover rounded-2xl shadow-xl shadow-black/20 text-white max-w-md">
                    <DialogTitle className="text-lg font-bold">Suggest a Resource</DialogTitle>
                    <DialogDescription className="text-text-secondary text-sm">
                        Submit a link to be reviewed by moderators before publication.
                    </DialogDescription>

                    <div className="mt-4">
                        <UserSubmissionForm
                            onSuccess={handleSuccess}
                            onCancel={() => setOpen(false)}
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </ProtectedAction>
    );
}

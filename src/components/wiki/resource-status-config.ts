import { Clock, CheckCircle, XCircle } from "lucide-react";
import type { ResourceStatus } from "@/services/wiki/types";

/**
 * Status badge configuration (icon + label + Tailwind classes) for educational resources.
 * Used by `ResourceCard` and the wiki moderation views.
 */
export const resourceStatusConfig: Record<
  ResourceStatus,
  { icon: typeof Clock; label: string; color: string }
> = {
  PENDING: {
    icon: Clock,
    label: "Pending",
    color: "text-gold bg-gold/10 border-gold/20",
  },
  APPROVED: {
    icon: CheckCircle,
    label: "Approved",
    color: "text-success bg-success/10 border-success/20",
  },
  REJECTED: {
    icon: XCircle,
    label: "Rejected",
    color: "text-danger bg-danger/10 border-danger/20",
  },
};

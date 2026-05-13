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
    color: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  },
  APPROVED: {
    icon: CheckCircle,
    label: "Approved",
    color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  },
  REJECTED: {
    icon: XCircle,
    label: "Rejected",
    color: "text-rose-400 bg-rose-400/10 border-rose-400/20",
  },
};

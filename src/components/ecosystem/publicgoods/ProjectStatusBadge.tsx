import { StatusBadge } from "@/components/ui/status-badge";

export function ProjectStatusBadge({ status, className }: { status: string, className?: string }) {
    const getVariant = (status: string) => {
        switch (status.toUpperCase()) {
            case 'APPROVED':
                return 'success';
            case 'REJECTED':
                return 'error';
            case 'PENDING':
                return 'warning';
            default:
                return 'default';
        }
    };

    return (
        <StatusBadge variant={getVariant(status)} className={className}>
            {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
        </StatusBadge>
    );
}

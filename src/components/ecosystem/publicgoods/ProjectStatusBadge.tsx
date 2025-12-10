import { StatusBadge } from "@/components/ui/status-badge";

export function ProjectStatusBadge({ status }: { status: string }) {
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
        <StatusBadge variant={getVariant(status)}>
            {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
        </StatusBadge>
    );
}

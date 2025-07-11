import { PerpTokenTabs } from "./PerpTokenTabs";
import { PerpTokenTable } from "./PerpTokenTable";

export function PerpTokensSection() {
    return (
        <div>
            <PerpTokenTabs />
                <PerpTokenTable />
        </div>
    );
} 
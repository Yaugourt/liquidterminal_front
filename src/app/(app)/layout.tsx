import { LegalFooter } from "@/components/common";
import { Providers } from "@/components/Providers";
import { AppShell } from "@/components/AppShell";

// Server component: the interactive frame is the <AppShell> client island;
// the footer is static and renders here, without shipping JS.
export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <Providers>
            <AppShell footer={<LegalFooter />}>{children}</AppShell>
        </Providers>
    );
}

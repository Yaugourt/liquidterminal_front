import "@usdh-kit/widget/styles.css";
import { UsdhProviders } from "@/components/usdh/UsdhProviders";

export default function UsdhLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <UsdhProviders>{children}</UsdhProviders>;
}

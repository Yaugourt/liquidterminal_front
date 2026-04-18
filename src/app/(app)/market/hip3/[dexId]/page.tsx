"use client";

import { useParams } from "next/navigation";
import { Hip3DexDetailContent } from "@/components/market/hip3";

export default function Hip3DexPage() {
  const params = useParams();
  const dexId = typeof params?.dexId === "string" ? params.dexId : "";
  if (!dexId) {
    return <p className="text-sm text-text-muted">Missing DEX id.</p>;
  }
  return <Hip3DexDetailContent dexId={dexId} />;
}

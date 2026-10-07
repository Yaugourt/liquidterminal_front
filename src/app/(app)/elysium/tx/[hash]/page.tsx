"use client";

import { useParams } from "next/navigation";
import { ElysiumTxInspector } from "@/components/elysium/ElysiumTxInspector";

export default function Page() {
  const { hash } = useParams<{ hash: string }>();
  return <ElysiumTxInspector hash={decodeURIComponent(hash ?? "").toLowerCase()} />;
}

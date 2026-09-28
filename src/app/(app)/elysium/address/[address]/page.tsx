"use client";

import { use } from "react";
import { ElysiumAddress } from "@/components/elysium/ElysiumAddress";
import { Empty } from "@/components/elysium/shared";

const ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/;

export default function Page({ params }: { params: Promise<{ address: string }> }) {
  const { address } = use(params);
  if (!ADDRESS_RE.test(address)) return <Empty>This is not a valid Elysium address.</Empty>;
  return <ElysiumAddress address={address.toLowerCase()} />;
}

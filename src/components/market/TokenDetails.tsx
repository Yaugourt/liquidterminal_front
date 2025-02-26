"use client";

import { useParams } from "next/navigation";

export function TokenDetails() {
  const params = useParams();
  const token = params.token;

  return (
    // ... reste du code
  );
} 
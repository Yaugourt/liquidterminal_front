import { env } from "@/lib/env";

// API Configuration
export const API_BASE_URL = env.NEXT_PUBLIC_API;

// Privy Configuration
export const PRIVY_AUDIENCE = env.NEXT_PUBLIC_PRIVY_AUDIENCE;

// Cache Configuration
export const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

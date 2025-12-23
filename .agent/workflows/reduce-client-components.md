---
description: Reduce "use client" directives by converting components to Server Components
---

# Reduce Client Components Workflow

This workflow helps reduce the number of `"use client"` directives in a Next.js 13+ App Router project, improving performance by reducing JavaScript sent to the browser.

## Prerequisites
- Next.js 13+ with App Router
- Run `grep -r "use client" src --include="*.tsx" | wc -l` to get current count

## Step 1: Identify Candidates

// turbo
```bash
# List all files with "use client"
grep -rl "use client" src --include="*.tsx" | head -30
```

Prioritize files that:
1. **Don't use hooks** (`useState`, `useEffect`, `useRef`, etc.)
2. **Don't handle events** (`onClick`, `onChange`, etc.)
3. **Only display data** (pure presentation components)
4. **Are layouts** that just wrap children

## Step 2: Analyze a Component

For each candidate file, check:
```
Does it use useState/useEffect/useRef? → Keep "use client"
Does it use onClick/onChange/onSubmit? → Keep "use client"
Does it use browser APIs (window, document)? → Keep "use client"
Does it only receive props and render JSX? → Can be Server Component ✓
```

## Step 3: Extract Interactive Parts

If a component has BOTH static and interactive parts:

**Before (all client):**
```tsx
"use client";
import { useState } from "react";

export function ProductCard({ product }) {
  const [isLiked, setIsLiked] = useState(false);
  
  return (
    <div>
      <h2>{product.name}</h2>           {/* Static */}
      <p>{product.description}</p>       {/* Static */}
      <span>${product.price}</span>      {/* Static */}
      <button onClick={() => setIsLiked(!isLiked)}>  {/* Interactive */}
        {isLiked ? "❤️" : "🤍"}
      </button>
    </div>
  );
}
```

**After (split):**
```tsx
// ProductCard.tsx - Server Component (no "use client")
import { LikeButton } from "./LikeButton";

export function ProductCard({ product }) {
  return (
    <div>
      <h2>{product.name}</h2>
      <p>{product.description}</p>
      <span>${product.price}</span>
      <LikeButton productId={product.id} />  {/* Client island */}
    </div>
  );
}
```

```tsx
// LikeButton.tsx - Client Component
"use client";
import { useState } from "react";

export function LikeButton({ productId }) {
  const [isLiked, setIsLiked] = useState(false);
  return (
    <button onClick={() => setIsLiked(!isLiked)}>
      {isLiked ? "❤️" : "🤍"}
    </button>
  );
}
```

## Step 4: Common Patterns to Fix

### Pattern A: Unnecessary "use client" on wrappers
```tsx
// ❌ Before
"use client";
export function Container({ children }) {
  return <div className="container">{children}</div>;
}

// ✅ After - Remove "use client", it's just JSX
export function Container({ children }) {
  return <div className="container">{children}</div>;
}
```

### Pattern B: Data fetching in client
```tsx
// ❌ Before - fetches on client
"use client";
import { useEffect, useState } from "react";

export function UserList() {
  const [users, setUsers] = useState([]);
  useEffect(() => { fetch('/api/users').then(...) }, []);
  return <ul>{users.map(...)}</ul>;
}

// ✅ After - Server Component with async
export async function UserList() {
  const users = await fetch('/api/users').then(r => r.json());
  return <ul>{users.map(...)}</ul>;
}
```

### Pattern C: Layout with providers
```tsx
// ❌ Before - entire layout is client
"use client";
import { ThemeProvider } from "./ThemeProvider";

export function Layout({ children }) {
  return (
    <ThemeProvider>
      <header>...</header>
      <main>{children}</main>
      <footer>...</footer>
    </ThemeProvider>
  );
}

// ✅ After - only provider is client
// ThemeProvider.tsx stays "use client"
// Layout.tsx becomes server component
import { ThemeProvider } from "./ThemeProvider";

export function Layout({ children }) {
  return (
    <ThemeProvider>
      <header>...</header>
      <main>{children}</main>
      <footer>...</footer>
    </ThemeProvider>
  );
}
```

## Step 5: Verify Changes

// turbo
```bash
npm run build
```

Check for:
1. No build errors
2. Components render correctly
3. Interactive features still work

## Step 6: Measure Impact

// turbo
```bash
# Count remaining "use client" files
grep -rl "use client" src --include="*.tsx" | wc -l
```

Compare with initial count. Target: reduce by 30-50%.

## Tips

- Start with **leaf components** (no children) - easier to convert
- **Layouts** are often good candidates
- **Card components** displaying data are usually convertible
- Keep **forms**, **modals**, **dropdowns** as client components
- Use `next/dynamic` for client-only libraries in server components

import Link from "next/link";
import { Hypurr } from "@/components/hypurr/Hypurr";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-base px-6 text-center">
      <Hypurr mood="sherlock" height={140} />
      <div className="space-y-2">
        <h1 className="font-inter text-[28px] font-semibold tracking-tight text-text-primary">
          404, nothing on-chain here.
        </h1>
        <p className="text-[13.5px] text-text-secondary">
          Even Hypurr cannot trace this page. The data lives elsewhere.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="h-9 rounded-md bg-brand px-4 text-[12.5px] font-semibold leading-9 text-brand-text-on hover:bg-brand/90"
        >
          Back to the terminal
        </Link>
        <Link
          href="/explorer"
          className="h-9 rounded-md border border-border-default px-4 text-[12.5px] font-medium leading-9 text-text-secondary hover:text-text-primary"
        >
          Open the explorer
        </Link>
      </div>
    </div>
  );
}

import { SearchBar } from "@/components/SearchBar";

export function WalletHeader() {
  return (
    <div className="flex items-center gap-6">
      <h1 className="text-2xl font-bold tracking-tight text-white">Wallet</h1>
      <SearchBar placeholder="Search wallets..." className="w-[300px]" />
    </div>
  );
}

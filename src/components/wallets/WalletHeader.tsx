import { SearchBar } from "@/components/SearchBar";

export function WalletHeader() {
  return (
    <div className="flex items-center gap-4">
      <h2 className="text-xl font-bold text-white">Wallet</h2>
      <SearchBar placeholder="Search..." className="w-[300px]" />
    </div>
  );
}

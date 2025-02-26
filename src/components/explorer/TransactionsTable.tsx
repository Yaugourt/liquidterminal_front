import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";

interface Transaction {
  hash: string;
  block: string;
  time: string;
  user: string;
  type: string;
}

interface TransactionsTableProps {
  transactions: Transaction[];
}

export function TransactionsTable({ transactions }: TransactionsTableProps) {
  const router = useRouter();

  return (
    <Card className="bg-[#051728E5] border border-[#83E9FF4D] p-4">
      <h3 className="text-white mb-4">Transactions</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-white">
          <thead className="text-[#FFFFFF99]">
            <tr>
              <th className="text-left py-2">Hash</th>
              <th className="text-left py-2">Action</th>
              <th className="text-left py-2">Block</th>
              <th className="text-left py-2">Time</th>
              <th className="text-left py-2">User</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction, i) => (
              <tr key={i} className="border-t border-[#FFFFFF1A]">
                <td className="py-4">
                  <button
                    onClick={() =>
                      router.push(`/explorer/transaction/${transaction.hash}`)
                    }
                    className="text-[#83E9FF] hover:text-[#83E9FF]/80 transition-colors"
                  >
                    {transaction.hash.slice(0, 6)}...
                    {transaction.hash.slice(-4)}
                  </button>
                </td>
                <td className="py-4">{transaction.type}</td>
                <td className="py-4 text-[#83E9FF]">{transaction.block}</td>
                <td className="py-4">{transaction.time}</td>
                <td className="py-4 text-[#83E9FF]">
                  {transaction.user.slice(0, 6)}...{transaction.user.slice(-4)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

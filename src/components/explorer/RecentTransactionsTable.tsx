import { Card } from "@/components/ui/card";

export function RecentTransactionsTable() {
  return (
    <Card className="bg-[#051728E5] border border-[#83E9FF4D] p-4">
      <h3 className="text-white mb-4">Recent Transactions</h3>
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
            {Array.from({ length: 3 }).map((_, i) => (
              <tr key={i} className="border-t border-[#FFFFFF1A]">
                <td className="py-4 text-[#83E9FF]">0xc5264...15bf</td>
                <td className="py-4">Cancel order</td>
                <td className="py-4 text-[#83E9FF]">45691547</td>
                <td className="py-4">0 sec ago</td>
                <td className="py-4 text-[#83E9FF]">0xc5264...15bf</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

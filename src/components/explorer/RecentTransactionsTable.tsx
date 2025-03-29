import { Card } from "@/components/ui/card";

export function RecentTransactionsTable() {
  return (
    <Card className="bg-[#051728E5]  border-2 border-[#83E9FF4D] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] p-6">
      <h3 className="text-white text-lg mb-4">Recent Transactions</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-white">
          <thead className="text-[#FFFFFF99]">
            <tr>
              <th className="text-left py-3 px-2 font-normal border-b border-[#83E9FF4D]">
                Hash
              </th>
              <th className="text-left py-3 px-2 font-normal border-b border-[#83E9FF4D]">
                Action
              </th>
              <th className="text-left py-3 px-2 font-normal border-b border-[#83E9FF4D]">
                Block
              </th>
              <th className="text-left py-3 px-2 font-normal border-b border-[#83E9FF4D]">
                Time
              </th>
              <th className="text-left py-3 px-2 font-normal border-b border-[#83E9FF4D]">
                User
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 3 }).map((_, i) => (
              <tr
                key={i}
                className="border-b border-[#FFFFFF1A] hover:bg-[#FFFFFF0A]"
              >
                <td className="py-3 px-2 text-[#83E9FF]">0xc5264...15bf</td>
                <td className="py-3 px-2">Cancel order</td>
                <td className="py-3 px-2 text-[#83E9FF]">45691547</td>
                <td className="py-3 px-2">0 sec ago</td>
                <td className="py-3 px-2 text-[#83E9FF]">0xc5264...15bf</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

import { Card } from "@/components/ui/card";

export function ValidatorsTable() {
  return (
    <Card className="bg-[#051728E5] border border-[#83E9FF4D] p-4">
      <h3 className="text-white mb-4">Validators</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-white">
          <thead className="text-[#FFFFFF99]">
            <tr>
              <th className="text-left py-2">Validator</th>
              <th className="text-left py-2">Status</th>
              <th className="text-left py-2">Staked HYPE</th>
              <th className="text-left py-2">Commission</th>
              <th className="text-left py-2">Uptime</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 3 }).map((_, i) => (
              <tr key={i} className="border-t border-[#FFFFFF1A]">
                <td className="py-4 text-[#83E9FF]">Validator_{i + 1}</td>
                <td className="py-4">Active</td>
                <td className="py-4">100,000</td>
                <td className="py-4">5%</td>
                <td className="py-4">99.9%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

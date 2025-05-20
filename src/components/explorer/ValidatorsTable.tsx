import { Card } from "@/components/ui/card";
import { useTrendingValidators } from "@/services/dashboard/hooks/useTrendingValidators";

export function ValidatorsTable() {
  const { validators, isLoading, error } = useTrendingValidators();

  return (
    <Card className="bg-[#051728E5] border-2 border-[#83E9FF4D] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] p-6">
      <h3 className="text-white text-lg mb-4">Validators</h3>
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#83E9FF4D] scrollbar-track-[#051728] scrollbar-thumb-rounded-full">
        <table className="w-full text-sm text-white">
          <thead className="text-[#FFFFFF99]">
            <tr>
              <th className="text-left py-3 px-2 font-normal border-b border-[#83E9FF4D]">Validator</th>
              <th className="text-left py-3 px-2 font-normal border-b border-[#83E9FF4D]">Status</th>
              <th className="text-left py-3 px-2 font-normal border-b border-[#83E9FF4D]">Staked HYPE</th>
              <th className="text-left py-3 px-2 font-normal border-b border-[#83E9FF4D]">Commission</th>
              <th className="text-left py-3 px-2 font-normal border-b border-[#83E9FF4D]">Uptime</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="text-center py-4 text-[#FFFFFF99]">
                  Loading validators...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={5} className="text-center py-4 text-red-500">
                  {error.message}
                </td>
              </tr>
            ) : (
              validators.map((validator) => (
                <tr key={validator.name} className="border-b border-[#FFFFFF1A] hover:bg-[#FFFFFF0A]">
                  <td className="py-3 px-2 text-[#83E9FF]">{validator.name}</td>
                  <td className="py-3 px-2">
                    <span className="text-[#00FF85]">
                      {validator.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-2">{validator.stake.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                  <td className="py-3 px-2">{validator.commission}%</td>
                  <td className="py-3 px-2">{validator.uptime.toFixed(2)}%</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

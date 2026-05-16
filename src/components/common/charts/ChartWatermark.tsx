/**
 * V4 brand watermark — "LIQUID" filigrane on chart backgrounds.
 *
 * Renders an absolutely-positioned, very low-opacity (2.5%) brand mark
 * centered behind the chart. Pointer-events disabled. Used on the main
 * data-viz cards so screenshots are silently attributed.
 *
 * Parent must be `position: relative`.
 *
 * @example
 * <div className="relative">
 *   <ChartWatermark />
 *   <PieChart ... />
 * </div>
 */
export function ChartWatermark() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <span className="text-6xl font-semibold text-brand opacity-[0.025] tracking-widest select-none">
        LIQUID
      </span>
    </div>
  );
}

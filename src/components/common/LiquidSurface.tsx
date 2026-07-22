"use client";

import { createContext, useContext, type ReactNode } from "react";
import { DataFlow, type DataFlowProps } from "./DataFlow";

/**
 * LiquidSurface — the only sanctioned way to put a flow field on a page
 * (DESIGN_SYSTEM §13).
 *
 * It exists because two rules of the liquid layer were prose, and prose does
 * not survive contact with a second contributor:
 *
 *  1. "the field is z-0, content MUST be relative z-10". Every consumer was
 *     hand-writing that wrapper, and getting it wrong washes the copy out.
 *  2. "the layer never sits behind a number". A page can only honour that if a
 *     component rendering numbers can find out it is standing in the water.
 *     Marking the container with a data attribute is a rule someone forgets;
 *     a provider you cannot get the field without is a rule you cannot forget.
 *
 * Anything that renders values (today `<KpiRibbon>`) reads the context and
 * refuses a transparent treatment inside it.
 */

const LiquidSurfaceContext = createContext(false);

/** True when the calling component is rendered inside a <LiquidSurface>. */
export function useLiquidSurface(): boolean {
  return useContext(LiquidSurfaceContext);
}

export interface LiquidSurfaceProps {
  children: ReactNode;
  /** Field configuration, forwarded to <DataFlow>. */
  field?: DataFlowProps;
  /**
   * Positioning classes for the field wrapper. Defaults to `inset-0`. Override
   * to start the field on the source rather than on the box, e.g.
   * `"inset-x-0 top-[95px] bottom-0"` to hang it off a 62px mark under `pt-16`.
   */
  fieldClassName?: string;
  /** Classes on the outer positioned container. */
  className?: string;
  /** Classes on the content layer, which already carries `relative z-10`. */
  contentClassName?: string;
}

export function LiquidSurface({
  children,
  field,
  fieldClassName = "inset-0",
  className = "",
  contentClassName = "",
}: LiquidSurfaceProps) {
  return (
    <LiquidSurfaceContext.Provider value={true}>
      <div className={`relative ${className}`}>
        <div className={`pointer-events-none absolute z-0 ${fieldClassName}`}>
          <DataFlow {...field} />
        </div>
        <div className={`relative z-10 ${contentClassName}`}>{children}</div>
      </div>
    </LiquidSurfaceContext.Provider>
  );
}

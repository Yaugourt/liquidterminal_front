"use client";

import { memo, useId } from "react";
import { chartPalette } from "./charts/chartTheme";

interface SparklineProps {
  /** Série de valeurs (ordre chronologique). */
  data: number[];
  /** Couleur de tracé. Défaut : brand cyan (`chartPalette.accent`). */
  color?: string;
  /** Hauteur en px. */
  height?: number;
  className?: string;
}

/** Largeur du repère interne — le SVG s'étire ensuite à 100 %. */
const VB_W = 300;

/**
 * Sparkline — mini-courbe inline (SVG) pour une série de valeurs.
 * S'étire en largeur sur son conteneur ; trait d'épaisseur constante.
 */
export const Sparkline = memo(function Sparkline({
  data,
  color = chartPalette.accent,
  height = 34,
  className,
}: SparklineProps) {
  const gradientId = useId();

  if (data.length < 2) {
    return <div style={{ height }} className={className} />;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = VB_W / (data.length - 1);

  const coords = data.map((v, i) => {
    const x = i * step;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x.toFixed(1)} ${y.toFixed(1)}`;
  });
  const line = coords.map((c, i) => `${i ? "L" : "M"}${c}`).join(" ");
  const area = `${line} L${VB_W} ${height} L0 ${height} Z`;

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${height}`}
      width="100%"
      height={height}
      preserveAspectRatio="none"
      className={className}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.22" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradientId})`} />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
});

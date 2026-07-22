import { readFileSync, writeFileSync } from 'fs';

const W = 1500, H = 500;

// --- Source ----------------------------------------------------------------
// On an X profile the avatar sits over the bottom-left of the banner: measured
// from a live capture it spans ~23% of banner width, centred near x=216 with its
// centre on the bottom edge. So the streams converge there and appear to pour out
// of the avatar itself. No second droplet is drawn: the avatar IS the mark.
const SRC = { x: 216, y: 498 };

// --- Streamlines ------------------------------------------------------------
const N = 58;
const SPREAD = 640;   // fan height once fully open
const UP = 0.86;      // almost everything climbs, since the source sits on the floor
const SEED = 6;       // small spread at birth: a bundle, not a laser

let paths = '';
for (let i = 0; i < N; i++) {
  const t = i / (N - 1);
  const signed = t - UP;
  const phase = i * 0.79;

  const pts = [];
  for (let x = SRC.x; x <= W + 60; x += 10) {
    const u = (x - SRC.x) / (W + 60 - SRC.x);
    const open = Math.pow(u, 1.3);               // opens through the frame, past the headline
    const amp = 32 * open * (0.5 + 0.5 * Math.sin(phase));
    const y = SRC.y + signed * (SEED + SPREAD * open) + amp * Math.sin(x / 250 + phase);
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }

  // Weight the light across the body of the fan, not along the emission axis,
  // otherwise every bright line ends up hugging the floor.
  const core = 1 - Math.abs(t - 0.46) / 0.54;
  const op = (0.06 + 0.26 * Math.max(0, core)).toFixed(3);
  const sw = (0.85 + 1.0 * Math.max(0, core)).toFixed(2);
  paths += `    <polyline points="${pts.join(' ')}" fill="none" stroke="#83E9FF" stroke-opacity="${op}" stroke-width="${sw}" stroke-linecap="round"/>\n`;
}

const flow = `<svg class="flow" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">\n${paths}  </svg>`;

const css = `
  .spark{left:${SRC.x - 150}px;top:${SRC.y - 150}px;}
`;

writeFileSync('banner.built.html', readFileSync('banner.html', 'utf8')
  .replaceAll('__FONTS__', readFileSync('fonts-inline.css', 'utf8'))
  .replaceAll('__FLOW__', flow)
  .replaceAll('__GEOM__', css));

console.log(`source ${SRC.x},${SRC.y} (avatar zone) | ${N} streams, no droplet drawn`);

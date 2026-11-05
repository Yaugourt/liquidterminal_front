import { doneFraction, type TwapProgressInput } from './twap-progress';

/**
 * The amount left of a running TWAP as a row shows it, drained continuously:
 * the board's model (`doneFraction`, times the full size in USD) evaluated at
 * every frame rather than once a second, and carried on smoothly when fresh
 * data moves the model at once (a fill bigger or smaller than the schedule's,
 * the price re-read at the poll, a TWAP switching between exact and
 * estimated): what is on screen does not jump, the gap fades out while the
 * drain goes on. The share done and the full size fade apart, so the progress
 * bar (the share) never moves with the price.
 */

/** Time constant of the fade: two thirds of a gap gone within this time, nearly all of it within 2 s. */
const DRAIN_BLEND_MS = 700;

/** What a row's drain runs: the board's model input and the full size in USD at the current price. */
interface DrainModel {
  progress: TwapProgressInput;
  totalUsd: number;
}

export interface Drain {
  model: DrainModel;
  /** On screen minus model when the gaps started to fade (0: none): share done, full size in USD. */
  doneGap: number;
  totalGap: number;
  /** When the gaps started to fade, epoch ms. */
  at: number;
}

interface DrainView {
  /** Share done, 0..1. */
  done: number;
  totalUsd: number;
  leftUsd: number;
}

const fade = (gap: number, since: number) => (gap === 0 ? 0 : gap * Math.exp(-Math.max(0, since) / DRAIN_BLEND_MS));

/** What the row shows at `now`: the model plus what is left of the gaps. */
export function drainAt(d: Drain, now: number): DrainView {
  const since = now - d.at;
  const done = Math.min(1, Math.max(0, doneFraction(d.model.progress, now) + fade(d.doneGap, since)));
  const totalUsd = Math.max(0, d.model.totalUsd + fade(d.totalGap, since));
  return { done, totalUsd, leftUsd: totalUsd * (1 - done) };
}

/**
 * Fresh data for a row (each board: every second, and at each push of the
 * live feed). The drain carries on from what is on screen at `now` and the gap
 * to the new model fades out; the same model again changes nothing. Without a
 * previous drain, or with `blend` off (reduced motion), it starts on the model.
 */
export function nextDrain(prev: Drain | null, model: DrainModel, now: number, blend: boolean): Drain {
  if (!prev || !blend) return { model, doneGap: 0, totalGap: 0, at: now };
  const shown = drainAt(prev, now);
  return {
    model,
    doneGap: shown.done - doneFraction(model.progress, now),
    totalGap: shown.totalUsd - model.totalUsd,
    at: now,
  };
}

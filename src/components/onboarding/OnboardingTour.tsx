"use client";

import { useCallback, useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useOnboardingStore } from "@/store/use-onboarding";
import { ONBOARDING_STEPS } from "./onboardingSteps";
import { OnboardingVisual } from "./OnboardingVisual";

interface OnboardingTourProps {
  open: boolean;
  /** Called when the user reaches the end and clicks "Start exploring". */
  onComplete: () => void;
  /** Called on Skip / Esc / overlay click — never trap the user. */
  onSkip: () => void;
}

/** Horizontal slide distance between steps (px). */
const SLIDE_X = 32;

/**
 * Multi-step welcome tour. Centered modal on desktop, bottom sheet on
 * mobile (<640px). Radix Dialog provides focus trap, Esc handling, overlay
 * dismiss and aria wiring; Framer Motion animates step transitions.
 */
export function OnboardingTour({ open, onComplete, onSkip }: OnboardingTourProps) {
  const currentStep = useOnboardingStore((s) => s.currentStep);
  const setStep = useOnboardingStore((s) => s.setStep);
  /** +1 forward, -1 backward — drives the slide direction. */
  const [direction, setDirection] = useState(1);
  const prefersReducedMotion = useReducedMotion();

  const stepCount = ONBOARDING_STEPS.length;
  const safeIndex = Math.min(Math.max(currentStep, 0), stepCount - 1);
  const step = ONBOARDING_STEPS[safeIndex];
  const isFirst = safeIndex === 0;
  const isLast = safeIndex === stepCount - 1;

  // Clamp a stale persisted index (e.g. steps were removed between releases).
  useEffect(() => {
    if (open && currentStep !== safeIndex) setStep(safeIndex);
  }, [open, currentStep, safeIndex, setStep]);

  const goTo = useCallback(
    (index: number) => {
      const clamped = Math.min(Math.max(index, 0), stepCount - 1);
      if (clamped === safeIndex) return;
      setDirection(clamped > safeIndex ? 1 : -1);
      setStep(clamped);
    },
    [safeIndex, setStep, stepCount]
  );

  const handleNext = useCallback(() => {
    if (isLast) onComplete();
    else goTo(safeIndex + 1);
  }, [isLast, onComplete, goTo, safeIndex]);

  const handleBack = useCallback(() => goTo(safeIndex - 1), [goTo, safeIndex]);

  /** Arrow-key navigation on top of the native tab order. */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "ArrowRight" && !isLast) {
        e.preventDefault();
        goTo(safeIndex + 1);
      } else if (e.key === "ArrowLeft" && !isFirst) {
        e.preventDefault();
        goTo(safeIndex - 1);
      }
    },
    [goTo, safeIndex, isFirst, isLast]
  );

  const slide = prefersReducedMotion ? 0 : SLIDE_X;
  const variants = {
    enter: (dir: number) => ({ x: dir * slide, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir * -slide, opacity: 0 }),
  };

  const StepIcon = step.icon;

  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && onSkip()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <Dialog.Content
          onKeyDown={handleKeyDown}
          aria-label="Welcome to Liquid Terminal"
          className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full overflow-hidden rounded-t-2xl border border-border-default bg-surface text-text-primary shadow-2xl shadow-black/50 focus:outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-8 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-[min(540px,calc(100vw-2rem))] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:data-[state=open]:zoom-in-95 sm:data-[state=open]:slide-in-from-bottom-0"
        >
          {/* Visual stage */}
          <div className="relative h-[164px] overflow-hidden border-b border-border-subtle bg-gradient-to-b from-surface-2/60 to-surface sm:h-[184px]">
            <AnimatePresence mode="wait" custom={direction} initial={false}>
              <motion.div
                key={step.id}
                className="absolute inset-0"
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.24, ease: "easeOut" }}
              >
                <OnboardingVisual stepId={step.id} />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Copy */}
          <div className="min-h-[168px] px-6 pb-5 pt-5 sm:min-h-[160px]">
            <AnimatePresence mode="wait" custom={direction} initial={false}>
              <motion.div
                key={step.id}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.24, ease: "easeOut", delay: 0.04 }}
              >
                <div className="flex items-center gap-2">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-brand/10">
                    <StepIcon size={13} className="text-brand" />
                  </span>
                  <span className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
                    {step.kicker}
                  </span>
                </div>
                <Dialog.Title className="mt-2.5 text-[20px] font-semibold tracking-[-0.02em] text-text-primary">
                  {step.title}
                </Dialog.Title>
                <Dialog.Description className="mt-1.5 text-[13px] leading-relaxed text-text-secondary">
                  {step.description}
                </Dialog.Description>
                {step.bullets && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {step.bullets.map((bullet) => (
                      <span
                        key={bullet}
                        className="rounded border border-border-subtle bg-surface-2 px-1.5 py-0.5 text-[10px] font-semibold text-text-tertiary"
                      >
                        {bullet}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer: Skip · dots · Back / Next */}
          <div className="flex items-center gap-3 border-t border-border-subtle px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:pb-4">
            <button
              type="button"
              onClick={onSkip}
              className="text-[12px] font-medium text-text-tertiary transition-colors hover:text-text-secondary focus:outline-none focus-visible:ring-1 focus-visible:ring-brand/50 rounded"
            >
              Skip
            </button>

            <div className="mx-auto flex items-center gap-1.5" role="tablist" aria-label="Tour progress">
              {ONBOARDING_STEPS.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  aria-selected={i === safeIndex}
                  aria-label={`Step ${i + 1} of ${stepCount}: ${s.title}`}
                  onClick={() => goTo(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-brand/50 ${
                    i === safeIndex
                      ? "w-4 bg-brand"
                      : "w-1.5 bg-surface-3 hover:bg-border-strong"
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              {!isFirst && (
                <button
                  type="button"
                  onClick={handleBack}
                  aria-label="Previous step"
                  className="flex h-8 items-center gap-1 rounded-md border border-border-default px-2.5 text-[12px] font-medium text-text-secondary transition-colors hover:bg-surface-2 hover:text-text-primary focus:outline-none focus-visible:ring-1 focus-visible:ring-brand/50"
                >
                  <ArrowLeft size={13} />
                  Back
                </button>
              )}
              <button
                type="button"
                onClick={handleNext}
                aria-label={isLast ? "Finish tour and start exploring" : "Next step"}
                className="flex h-8 items-center gap-1.5 rounded-md bg-brand px-3 text-[12px] font-semibold text-brand-text-on transition-colors hover:bg-brand-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-1 focus-visible:ring-offset-surface"
              >
                {isLast ? (
                  <>
                    Start exploring
                    <Check size={13} />
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight size={13} />
                  </>
                )}
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

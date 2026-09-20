"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
import { PROCESSING_DURATION_MS, PROCESSING_STEPS } from "@/lib/risk-engine"

/**
 * The deliberate pause before the result (PRD §2, State 2 — the labour
 * illusion), cycling one line of microcopy per third of the wait.
 */
export function ProcessingView({
  reducedMotion,
  onAnnounce,
}: {
  reducedMotion: boolean
  onAnnounce: (message: string) => void
}) {
  const [messageIndex, setMessageIndex] = React.useState(0)

  React.useEffect(() => {
    const interval = window.setInterval(() => {
      setMessageIndex((current) => Math.min(current + 1, PROCESSING_STEPS.length - 1))
    }, PROCESSING_DURATION_MS / PROCESSING_STEPS.length)

    return () => window.clearInterval(interval)
  }, [])

  // Each step of the microcopy reaches screen readers too, not just sighted users.
  React.useEffect(() => {
    onAnnounce(PROCESSING_STEPS[messageIndex])
  }, [messageIndex, onAnnounce])

  /**
   * The bar advances one step per message so aria-valuenow always reflects
   * what is actually on screen; the CSS transition smooths between steps.
   */
  const progress = Math.round(((messageIndex + 1) / PROCESSING_STEPS.length) * 100)
  const stepDuration = Math.round(PROCESSING_DURATION_MS / PROCESSING_STEPS.length)

  return (
    <>
      <span className="relative flex size-14 items-center justify-center">
        {!reducedMotion && (
          <motion.span
            aria-hidden="true"
            className="absolute inset-0 rounded-full bg-blue-100"
            animate={{ scale: [1, 1.25, 1], opacity: [0.7, 0.2, 0.7] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
        <span className="relative flex size-12 items-center justify-center rounded-full bg-blue-600 text-white">
          <ShieldCheck className="size-6" aria-hidden="true" />
        </span>
      </span>

      <div className="flex w-full max-w-sm flex-col gap-3">
        <Progress
          value={progress}
          aria-label="Postęp analizy ryzyka"
          style={
            {
              "--progress-step-duration": reducedMotion ? "0ms" : `${stepDuration}ms`,
            } as React.CSSProperties
          }
          className={cn(
            "[&_[data-slot=progress-indicator]]:bg-blue-600",
            "[&_[data-slot=progress-track]]:h-1.5 [&_[data-slot=progress-track]]:bg-slate-100",
            "[&_[data-slot=progress-indicator]]:duration-(--progress-step-duration)",
            "[&_[data-slot=progress-indicator]]:ease-linear"
          )}
        />

        <div className="min-h-10">
          <AnimatePresence mode="wait">
            <motion.p
              key={messageIndex}
              initial={reducedMotion ? undefined : { opacity: 0, y: 6 }}
              animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
              exit={reducedMotion ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="text-sm font-medium text-slate-900"
            >
              {PROCESSING_STEPS[messageIndex]}
            </motion.p>
          </AnimatePresence>
          <p className="mt-1 text-xs text-slate-600">
            Porównuję Twój profil z bazą incydentów z ostatnich 24 miesięcy.
          </p>
        </div>
      </div>
    </>
  )
}

"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  MAX_SCORE,
  MIN_SCORE,
  RISK_STYLES,
  TIER_LABELS,
  TIER_ORDER,
  type RiskTier,
} from "@/lib/risk-engine"

/**
 * A single continuous green-to-red scale with a marker at the user's score,
 * so the result reads as a position on a spectrum rather than three buckets.
 */
export function TierScale({
  tier,
  score,
  reducedMotion,
}: {
  tier: RiskTier
  score: number
  reducedMotion: boolean
}) {
  // Score runs 2–10; inset the ends so the marker never overhangs the track.
  const position = 4 + ((score - MIN_SCORE) / (MAX_SCORE - MIN_SCORE)) * 92

  return (
    <div className="flex w-full flex-col gap-2" role="group" aria-label="Skala ryzyka">
      {/*
       * 600-level stops (3.19–4.70:1 on white) plus a hairline ring, so the
       * track is perceivable as a shape — the 500 stops measured 2.15–2.54:1
       * and failed WCAG 1.4.11.
       */}
      <div className="relative h-2.5 w-full rounded-full bg-gradient-to-r from-emerald-600 via-amber-600 to-rose-600 ring-1 ring-slate-900/10 ring-inset">
        <motion.span
          aria-hidden="true"
          className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-slate-900 shadow-md"
          initial={reducedMotion ? false : { left: "4%", opacity: 0 }}
          animate={{ left: `${position}%`, opacity: 1 }}
          transition={{ duration: 0.9, ease: "easeOut", delay: reducedMotion ? 0 : 0.3 }}
        />
      </div>

      {/* Weight, not just colour, marks the active tier (WCAG 1.4.1). */}
      <div className="flex justify-between text-[11px]">
        {TIER_ORDER.map((segment) => (
          <span
            key={segment}
            className={cn(
              "transition-colors duration-300",
              segment === tier
                ? cn("font-semibold", RISK_STYLES[segment].text)
                : "font-medium text-slate-600"
            )}
          >
            {TIER_LABELS[segment]}
            {segment === tier && <span className="sr-only"> — Twój poziom</span>}
          </span>
        ))}
      </div>

      <span className="sr-only">
        Twój wynik: {score} na {MAX_SCORE} punktów — {TIER_LABELS[tier].toLowerCase()}.
      </span>
    </div>
  )
}

"use client"

import { motion } from "framer-motion"
import { RotateCcw, ShieldCheck, TrendingUp, TriangleAlert } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  QUESTIONS,
  RISK_STYLES,
  formatCurrency,
  labelFor,
  type Answers,
  type RiskResult,
} from "@/lib/risk-engine"
import { AnimatedAmount } from "./animated-amount"
import { PRIMARY_CTA } from "./constants"
import { TierScale } from "./tier-scale"

/**
 * The result panel: the figure and scale, then the answers it came from, then
 * what drives the score, then the CTA.
 */
export function ResultView({
  result,
  answers,
  reducedMotion,
  onSecure,
  onReset,
}: {
  result: RiskResult
  answers: Answers
  reducedMotion: boolean
  onSecure: () => void
  onReset: () => void
}) {
  const styles = RISK_STYLES[result.tier]

  return (
    <div className="flex flex-col gap-7">
      {/* The tier colour is an accent — a strip, a badge and the figure — not a wash. */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className={cn("h-1.5 w-full", styles.bar)} aria-hidden="true" />

        <div className="flex flex-col items-center gap-5 p-6 text-center">
          <Badge
            className={cn(
              "h-auto gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold tracking-wide uppercase",
              styles.badge
            )}
          >
            <TrendingUp className="size-3" aria-hidden="true" />
            {result.label}
          </Badge>

          <div className="flex w-full flex-col gap-2">
            <p className="text-xs font-medium tracking-wide text-slate-600 uppercase">
              Szacowany koszt jednego incydentu
            </p>
            <AnimatedAmount
              value={result.headline}
              openEnded={result.openEnded}
              reducedMotion={reducedMotion}
              className={cn(
                "text-4xl font-bold tracking-tight tabular-nums md:text-5xl",
                styles.text
              )}
            />
            <p className="text-sm text-slate-600">
              Widełki dla Twojego profilu: {formatCurrency(result.min)} –{" "}
              {formatCurrency(result.max)}
              {result.openEnded ? " i więcej" : ""}
            </p>
          </div>

          <TierScale
            tier={result.tier}
            score={result.score}
            reducedMotion={reducedMotion}
          />
        </div>
      </div>

      <dl className="grid grid-cols-1 gap-x-2 gap-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-3 sm:text-center">
        {QUESTIONS.map((question) => (
          <div
            key={question.key}
            className="flex items-baseline justify-between gap-3 sm:flex-col sm:items-center sm:gap-1"
          >
            <dt className="text-[11px] font-medium tracking-wide text-slate-600 uppercase">
              {question.title}
            </dt>
            <dd className="text-right text-sm font-semibold text-slate-900 sm:text-center">
              {labelFor(question.key, answers)}
            </dd>
          </div>
        ))}
      </dl>

      <div className="flex flex-col gap-5">
        <p className="text-base leading-relaxed text-slate-700">{result.summary}</p>

        <div className="flex flex-col gap-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold tracking-wide text-slate-900 uppercase">
            <TriangleAlert
              className={cn("size-4 shrink-0", styles.text)}
              aria-hidden="true"
            />
            Co podnosi Twoje ryzyko
          </h3>

          {/*
           * Each driver is tied to the answer that produced it and carries its
           * weight. No check marks: these are warnings, not things done right.
           */}
          <ul className="flex flex-col divide-y divide-slate-100 rounded-xl border border-slate-200">
            {result.factors.map((factor, index) => {
              const Icon = factor.icon
              return (
                <motion.li
                  key={factor.key}
                  initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut", delay: 0.2 + index * 0.1 }}
                  className="flex items-start gap-3.5 p-4"
                >
                  <span
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-lg",
                      styles.bg,
                      styles.text
                    )}
                    aria-hidden="true"
                  >
                    <Icon className="size-4.5" />
                  </span>

                  <div className="flex min-w-0 flex-col gap-0.5">
                    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold text-slate-900">
                      {factor.label}
                      <span
                        className={cn(
                          "rounded-full px-1.5 py-0.5 text-[10px] font-semibold tracking-wide tabular-nums",
                          styles.badge
                        )}
                      >
                        +{factor.points} pkt
                      </span>
                    </p>
                    <p className="text-sm leading-relaxed text-slate-600">{factor.detail}</p>
                  </div>
                </motion.li>
              )
            })}
          </ul>
        </div>
      </div>

      {/* gap-5 keeps the CTA's glow from bleeding onto the secondary action. */}
      <div className="flex flex-col gap-5 border-t border-slate-100 pt-6">
        <div className="relative isolate">
          {/*
           * The pulse lives entirely on these decorative layers. The button
           * itself never moves: a click target that drifts is harder to hit,
           * and it makes the control fail automated stability checks.
           */}
          {!reducedMotion && (
            <>
              {/*
               * A sonar ring drawn with box-shadow spread rather than scale:
               * it grows the same number of pixels on every edge, so a
               * full-width button does not push it outside the card.
               */}
              <motion.span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-10 rounded-xl"
                animate={{
                  boxShadow: [
                    "0 0 0 0px rgba(37, 99, 235, 0.55)",
                    "0 0 0 14px rgba(37, 99, 235, 0)",
                  ],
                }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
              />
              {/* A soft glow breathing underneath it. */}
              <motion.span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-10 rounded-xl bg-blue-500 blur-lg"
                animate={{ opacity: [0.8, 0.3, 0.8] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              />
            </>
          )}

          <motion.div
            className="relative"
            whileHover={reducedMotion ? undefined : { scale: 1.03 }}
            whileTap={reducedMotion ? undefined : { scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
          >
            <Button
              type="button"
              onClick={onSecure}
              className={cn(
                PRIMARY_CTA,
                "bg-blue-600 text-white shadow-xl shadow-blue-600/35 hover:bg-blue-700"
              )}
            >
              <ShieldCheck className="size-5" aria-hidden="true" />
              Zabezpiecz się
            </Button>
          </motion.div>
        </div>

        <Button
          type="button"
          variant="ghost"
          onClick={onReset}
          className="h-10 w-full cursor-pointer gap-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        >
          <RotateCcw className="size-3.5" aria-hidden="true" />
          Policz ponownie
        </Button>
      </div>
    </div>
  )
}

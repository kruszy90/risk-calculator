"use client"

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { CyberRiskCalculator, type Step } from "@/components/cyber-risk-calculator"

/**
 * Owns just enough calculator state to decide whether the page intro is shown.
 * The intro and trust strip stay siblings of <main> so they keep mapping to the
 * banner and contentinfo landmarks; only their visibility is driven from here.
 */
export function CalculatorLanding({
  intro,
  trust,
}: {
  intro: React.ReactNode
  trust: React.ReactNode
}) {
  const [step, setStep] = React.useState<Step>("idle")
  const prefersReducedMotion = useReducedMotion()

  // Once there is a result on screen, the marketing intro just pushes it down.
  const showIntro = step === "idle" || step === "calculating"

  return (
    <>
      <AnimatePresence initial={false}>
        {showIntro && (
          <motion.header
            key="intro"
            className="flex w-full max-w-2xl flex-col items-center gap-4 overflow-hidden text-center"
            initial={prefersReducedMotion ? false : { opacity: 0, height: 0 }}
            animate={
              prefersReducedMotion ? { opacity: 1 } : { opacity: 1, height: "auto" }
            }
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            {intro}
          </motion.header>
        )}
      </AnimatePresence>

      <main className="w-full max-w-2xl">
        <CyberRiskCalculator onStepChange={setStep} />
      </main>

      <footer className="flex w-full max-w-2xl flex-col items-center gap-3">{trust}</footer>
    </>
  )
}

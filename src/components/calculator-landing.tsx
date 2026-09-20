"use client"

import * as React from "react"
import { AnimatePresence } from "framer-motion"
import { CollapsibleReveal } from "@/components/collapsible-reveal"
import { CyberRiskCalculator, type Step } from "@/components/risk-calculator"

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

  // The intro belongs to the questionnaire only — during analysis and after it,
  // it just pushes the thing the user is waiting for further down the page.
  const showIntro = step === "idle"

  return (
    <>
      <AnimatePresence initial={false}>
        {showIntro && (
          <CollapsibleReveal
            key="intro"
            as="header"
            className="flex w-full max-w-2xl flex-col items-center gap-4 text-center"
          >
            {intro}
          </CollapsibleReveal>
        )}
      </AnimatePresence>

      {/*
       * The visible h1 lives in the intro, which is hidden from the analysis
       * step onwards. Keep a screen-reader-only one so the document never ends
       * up without a top-level heading.
       */}
      {!showIntro && <h1 className="sr-only">Kalkulator cyberryzyka</h1>}

      <main className="w-full max-w-2xl">
        <CyberRiskCalculator onStepChange={setStep} />
      </main>

      <footer className="flex w-full max-w-2xl flex-col items-center gap-3">{trust}</footer>
    </>
  )
}

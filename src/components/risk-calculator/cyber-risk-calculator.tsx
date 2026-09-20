"use client"

import * as React from "react"
import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from "framer-motion"
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  Lock,
  RotateCcw,
  TriangleAlert,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  CollapsibleReveal,
  PANEL_DURATION_S,
  PANEL_EXIT_MS,
} from "@/components/collapsible-reveal"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  COMPANY_SIZES,
  EMPTY_ANSWERS,
  INDUSTRIES,
  PROCESSING_DURATION_MS,
  QUESTIONS,
  REMOTE_MODES,
  RISK_STYLES,
  calculateRisk,
  isComplete,
  type AnswerKey,
  type Answers,
  type RiskResult,
} from "@/lib/risk-engine"
import { EMAIL_PATTERN, EMPTY_LEAD, PRIMARY_CTA } from "./constants"
import { Field } from "./field"
import { HintPopover } from "./hint-popover"
import { PanelHeading } from "./panel-heading"
import { ProcessingView } from "./processing-view"
import { ResultView } from "./result-view"
import { TileGroup } from "./tile-group"
import type { LeadErrors, LeadForm, Step } from "./types"

const stepTransition = { duration: PANEL_DURATION_S, ease: "easeOut" as const }

export function CyberRiskCalculator({
  onStepChange,
}: {
  /** Lets the page chrome react to the step (it hides the intro after the result). */
  onStepChange?: (step: Step) => void
} = {}) {
  const prefersReducedMotion = useReducedMotion()

  const [step, setStep] = React.useState<Step>("idle")
  const [answers, setAnswers] = React.useState<Answers>(EMPTY_ANSWERS)
  const [missing, setMissing] = React.useState<AnswerKey[]>([])
  const [result, setResult] = React.useState<RiskResult | null>(null)
  const [lead, setLead] = React.useState<LeadForm>(EMPTY_LEAD)
  const [leadErrors, setLeadErrors] = React.useState<LeadErrors>({})
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [announcement, setAnnouncement] = React.useState("")

  /*
   * A live region only speaks when its text actually changes, and React bails
   * out on an identical string — so submitting the same incomplete form twice
   * would announce nothing the second time. Alternating an invisible
   * zero-width space guarantees a real mutation on every call.
   */
  const announceParity = React.useRef(0)
  const announce = React.useCallback((message: string) => {
    if (message === "") {
      setAnnouncement("")
      return
    }
    announceParity.current += 1
    setAnnouncement(announceParity.current % 2 === 0 ? message : `${message}\u200B`)
  }, [])

  /**
   * AnimatePresence unmounts each panel on a step change, so focus would fall
   * back to <body>. Every panel heading pulls focus to itself when it mounts —
   * but only once the user has actually navigated, never on first paint.
   */
  const [hasNavigated, setHasNavigated] = React.useState(false)

  /*
   * Held in a ref so goToStep keeps a stable identity: it is a dependency of
   * the timer effects below, and an unstable one would restart them on every
   * render. Notifying here rather than from an effect keeps the parent's chrome
   * in the same commit as the step change.
   */
  const onStepChangeRef = React.useRef(onStepChange)
  React.useEffect(() => {
    onStepChangeRef.current = onStepChange
  }, [onStepChange])

  const goToStep = React.useCallback((next: Step) => {
    setHasNavigated(true)
    setStep(next)
    onStepChangeRef.current?.(next)
  }, [])

  const industryControls = useAnimationControls()
  const sizeControls = useAnimationControls()
  const remoteControls = useAnimationControls()
  const shakeControls = React.useMemo(
    () => ({
      industry: industryControls,
      size: sizeControls,
      remote: remoteControls,
    }),
    [industryControls, sizeControls, remoteControls]
  )

  const select = React.useCallback(
    <TKey extends AnswerKey>(key: TKey, value: Answers[TKey]) => {
      setAnswers((current) => ({ ...current, [key]: value }))
      setMissing((current) => {
        const remaining = current.filter((entry) => entry !== key)
        // Drop the stale validation announcement once nothing is outstanding.
        if (current.length > 0 && remaining.length === 0) announce("")
        return remaining
      })
    },
    [announce]
  )

  const handleCalculate = React.useCallback(() => {
    if (!isComplete(answers)) {
      const unanswered = QUESTIONS.filter((question) => answers[question.key] === null)
      setMissing(unanswered.map((question) => question.key))
      announce(
        `Uzupełnij, aby kontynuować: ${unanswered.map((question) => question.title).join(", ")}.`
      )

      if (!prefersReducedMotion) {
        unanswered.forEach((question) => {
          shakeControls[question.key].start({
            x: [0, -8, 8, -6, 6, 0],
            transition: { duration: 0.4, ease: "easeInOut" },
          })
        })
      }
      return
    }

    setMissing([])
    setResult(calculateRisk(answers))
    announce("Analizuję dane Twojej firmy…")
    goToStep("calculating")
  }, [announce, answers, goToStep, prefersReducedMotion, shakeControls])

  const reset = React.useCallback(() => {
    setAnswers(EMPTY_ANSWERS)
    setMissing([])
    setResult(null)
    setLead(EMPTY_LEAD)
    setLeadErrors({})
    setIsSubmitting(false)
    announce("Kalkulator został zresetowany.")
    goToStep("idle")
  }, [announce, goToStep])

  const handleLeadSubmit = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      const errors: LeadErrors = {}
      if (!lead.email.trim()) {
        errors.email = "Podaj służbowy adres e-mail."
      } else if (!EMAIL_PATTERN.test(lead.email.trim())) {
        errors.email = "To nie wygląda na poprawny adres e-mail."
      }
      if (!lead.company.trim()) {
        errors.company = "Podaj nazwę firmy."
      }

      setLeadErrors(errors)

      if (Object.keys(errors).length > 0) {
        announce("Formularz zawiera błędy. Sprawdź zaznaczone pola.")
        return
      }

      setIsSubmitting(true)
      announce("Wysyłam zgłoszenie…")
    },
    [announce, lead]
  )

  // Deliberate processing delay (PRD §2, State 2 — the labour illusion).
  React.useEffect(() => {
    if (step !== "calculating") return

    const timeout = window.setTimeout(() => {
      goToStep("result")
      announce("Raport gotowy.")
    }, PROCESSING_DURATION_MS)

    return () => window.clearTimeout(timeout)
  }, [announce, goToStep, step])

  // Simulated lead submission round-trip.
  React.useEffect(() => {
    if (!isSubmitting) return

    const timeout = window.setTimeout(() => {
      setIsSubmitting(false)
      goToStep("submitted")
      announce("Zgłoszenie wysłane. Doradca skontaktuje się w ciągu 24 godzin.")
    }, 900)

    return () => window.clearTimeout(timeout)
  }, [announce, goToStep, isSubmitting])

  const motionProps = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 15 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -15 },
        transition: stepTransition,
      }

  /** Title block rendered above the card, once the questionnaire is done. */
  const outsideHeading: {
    key: Extract<Step, "result" | "lead" | "submitted">
    title: string
    subtitle?: React.ReactNode
  } | null =
    step === "result"
      ? { key: "result", title: "Twój profil ryzyka" }
      : step === "lead" && result
        ? {
            key: "lead",
            title: "Zabezpiecz swoją firmę",
            subtitle: (
              <>
                Oferta dopasowana do profilu{" "}
                <span className={cn("font-medium", RISK_STYLES[result.tier].text)}>
                  {result.label.toLowerCase()}
                </span>
                . Bez zobowiązań, odpowiedź w 24 h.
              </>
            ),
          }
        : step === "submitted"
          ? {
              key: "submitted",
              title: "Dziękujemy, zgłoszenie przyjęte",
              subtitle: (
                <>
                  Doradca odezwie się na{" "}
                  <span className="font-medium text-slate-900">{lead.email}</span> w ciągu
                  24 h.
                </>
              ),
            }
          : null

  return (
    <div className="flex w-full flex-col gap-6">
      {/*
       * Every step past the questionnaire titles itself the same way: heading
       * and supporting line outside the card, the panel's content inside it.
       */}
      <AnimatePresence initial={false}>
        {outsideHeading && (
          <CollapsibleReveal
            key={outsideHeading.key}
            className="flex flex-col items-center gap-2 text-center"
          >
            <PanelHeading
              autoFocus={hasNavigated}
              // The block is still collapsed for PANEL_EXIT_MS; focusing before
              // it has height would scroll the page to a zero-height box.
              focusDelayMs={PANEL_EXIT_MS}
              className="rounded-md text-3xl font-bold tracking-tight text-slate-900 md:text-4xl"
            >
              {outsideHeading.title}
            </PanelHeading>
            {outsideHeading.subtitle && (
              <p className="text-sm text-slate-600 md:text-base">
                {outsideHeading.subtitle}
              </p>
            )}
          </CollapsibleReveal>
        )}
      </AnimatePresence>

      <Card className="w-full border border-slate-200 bg-white shadow-lg shadow-slate-200/50 ring-0 [--card-spacing:--spacing(5)] md:[--card-spacing:--spacing(7)]">
        <CardContent className="px-(--card-spacing)">
        <p aria-live="polite" className="sr-only">
          {announcement}
        </p>

        <AnimatePresence mode="wait" initial={false}>
          {step === "idle" && (
            <motion.div key="idle" {...motionProps} className="flex flex-col gap-10 md:gap-12">
              <PanelHeading autoFocus={hasNavigated} className="sr-only">
                Kwestionariusz ryzyka — trzy pytania
              </PanelHeading>
              {QUESTIONS.map((question, index) => (
                <motion.fieldset
                  key={question.key}
                  animate={shakeControls[question.key]}
                  className="flex flex-col border-0 p-0"
                >
                  <legend className="mb-4 flex w-full items-center gap-2.5">
                    <span
                      className={cn(
                        "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors duration-200",
                        answers[question.key]
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-600"
                      )}
                      aria-hidden="true"
                    >
                      {index + 1}
                    </span>
                    <span className="text-lg font-semibold tracking-tight text-slate-900 md:text-xl">
                      {question.title}
                    </span>
                    <HintPopover
                      title={question.title}
                      hint={question.hint}
                      explanation={question.explanation}
                    />
                  </legend>

                  {question.key === "industry" && (
                    <TileGroup
                      name="Branża"
                      options={INDUSTRIES}
                      value={answers.industry}
                      invalid={missing.includes("industry")}
                      errorId="calculate-error"
                      onSelect={(id) => select("industry", id)}
                      className="grid grid-cols-1 gap-2.5 sm:grid-cols-2"
                      reducedMotion={Boolean(prefersReducedMotion)}
                    />
                  )}
                  {question.key === "size" && (
                    <TileGroup
                      name="Liczba pracowników"
                      options={COMPANY_SIZES}
                      value={answers.size}
                      invalid={missing.includes("size")}
                      errorId="calculate-error"
                      onSelect={(id) => select("size", id)}
                      className="grid grid-cols-2 gap-2.5 sm:grid-cols-4"
                      compact
                      reducedMotion={Boolean(prefersReducedMotion)}
                    />
                  )}
                  {question.key === "remote" && (
                    <TileGroup
                      name="Tryb pracy"
                      options={REMOTE_MODES}
                      value={answers.remote}
                      invalid={missing.includes("remote")}
                      errorId="calculate-error"
                      onSelect={(id) => select("remote", id)}
                      className="grid grid-cols-1 gap-2.5 sm:grid-cols-3"
                      reducedMotion={Boolean(prefersReducedMotion)}
                    />
                  )}
                </motion.fieldset>
              ))}

              <div className="flex flex-col gap-3 border-t border-slate-100 pt-5">
                {missing.length > 0 && (
                  <p id="calculate-error" className="flex items-start gap-2 text-sm text-rose-600">
                    <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                    <span>
                      Uzupełnij, aby kontynuować:{" "}
                      {QUESTIONS.filter((question) => missing.includes(question.key))
                        .map((question) => question.title)
                        .join(", ")}
                      .
                    </span>
                  </p>
                )}

                <motion.div whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}>
                  {/*
                   * Deliberately NOT disabled: PRD §4 requires a shake + error when
                   * an incomplete form is submitted, which a disabled button can
                   * never trigger. It is muted until complete, but stays operable
                   * for both pointer and keyboard users.
                   */}
                  <Button
                    type="button"
                    onClick={handleCalculate}
                    aria-invalid={missing.length > 0}
                    aria-describedby={
                      missing.length > 0 ? "calculate-error" : "calculate-hint"
                    }
                    className={cn(
                      PRIMARY_CTA,
                      isComplete(answers)
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                    )}
                  >
                    Oblicz moje ryzyko
                    <ArrowRight className="size-5" aria-hidden="true" />
                  </Button>
                </motion.div>

                <p id="calculate-hint" className="text-center text-xs text-slate-600">
                  {isComplete(answers)
                    ? "Wynik otrzymasz od razu — bez podawania danych kontaktowych."
                    : "Odpowiedz na wszystkie trzy pytania, aby poznać wynik."}
                </p>
              </div>
            </motion.div>
          )}

          {step === "calculating" && (
            <motion.div
              key="calculating"
              {...motionProps}
              className="flex min-h-[22rem] flex-col items-center justify-center gap-6 py-6 text-center"
            >
              <PanelHeading autoFocus={hasNavigated} className="sr-only">
                Trwa analiza Twoich odpowiedzi
              </PanelHeading>
              <ProcessingView
                reducedMotion={Boolean(prefersReducedMotion)}
                onAnnounce={announce}
              />
            </motion.div>
          )}

          {step === "result" && result && (
            <motion.div key="result" {...motionProps}>
              <ResultView
                result={result}
                answers={answers}
                reducedMotion={Boolean(prefersReducedMotion)}
                onSecure={() => {
                  goToStep("lead")
                  setAnnouncement("Zostaw kontakt, aby otrzymać ofertę.")
                }}
                onReset={reset}
              />
            </motion.div>
          )}

          {step === "lead" && result && (
            <motion.div key="lead" {...motionProps} className="flex flex-col">
              <form className="flex flex-col gap-4" onSubmit={handleLeadSubmit} noValidate>
                <Field
                  id="lead-email"
                  label="Służbowy e-mail"
                  type="email"
                  placeholder="jan.kowalski@firma.pl"
                  autoComplete="email"
                  value={lead.email}
                  error={leadErrors.email}
                  onChange={(value) => {
                    setLead((current) => ({ ...current, email: value }))
                    setLeadErrors((current) => ({ ...current, email: undefined }))
                  }}
                />
                <Field
                  id="lead-company"
                  label="Nazwa firmy"
                  type="text"
                  placeholder="Firma Sp. z o.o."
                  autoComplete="organization"
                  value={lead.company}
                  error={leadErrors.company}
                  onChange={(value) => {
                    setLead((current) => ({ ...current, company: value }))
                    setLeadErrors((current) => ({ ...current, company: undefined }))
                  }}
                />
                <Field
                  id="lead-phone"
                  label="Telefon"
                  optionalLabel="opcjonalnie"
                  type="tel"
                  placeholder="+48 600 000 000"
                  autoComplete="tel"
                  value={lead.phone}
                  error={leadErrors.phone}
                  onChange={(value) => setLead((current) => ({ ...current, phone: value }))}
                />

                <div className="flex flex-col gap-3 pt-1">
                  <motion.div whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className={cn(PRIMARY_CTA, "bg-blue-600 text-white hover:bg-blue-700")}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="size-5 animate-spin" aria-hidden="true" />
                          Wysyłam…
                        </>
                      ) : (
                        "Wyślij zapytanie o ofertę"
                      )}
                    </Button>
                  </motion.div>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => goToStep("result")}
                    className="h-10 w-full cursor-pointer text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  >
                    Wróć do wyniku
                  </Button>
                </div>

                <p className="flex items-start gap-2 text-xs leading-relaxed text-slate-600">
                  <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                  Twoje dane wykorzystamy wyłącznie do przygotowania oferty. Nie przekazujemy ich
                  podmiotom trzecim.
                </p>
              </form>
            </motion.div>
          )}

          {step === "submitted" && (
            <motion.div
              key="submitted"
              {...motionProps}
              className="flex flex-col items-center justify-center gap-6 py-8 text-center"
            >
              <motion.span
                initial={prefersReducedMotion ? undefined : { scale: 0.8, opacity: 0 }}
                animate={prefersReducedMotion ? undefined : { scale: 1, opacity: 1 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="flex size-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200"
              >
                <CheckCircle2 className="size-8" aria-hidden="true" />
              </motion.span>

              <Button
                type="button"
                variant="outline"
                onClick={reset}
                className={cn(
                  PRIMARY_CTA,
                  "mt-2 max-w-sm border-slate-200 text-slate-700 hover:bg-slate-50"
                )}
              >
                <RotateCcw className="size-5" aria-hidden="true" />
                Policz ryzyko jeszcze raz
              </Button>
            </motion.div>
          )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  )
}

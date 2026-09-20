"use client"

import * as React from "react"
import {
  AnimatePresence,
  animate,
  motion,
  useAnimationControls,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion"
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Loader2,
  Lock,
  RotateCcw,
  ShieldCheck,
  TrendingUp,
  TriangleAlert,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  COMPANY_SIZES,
  EMPTY_ANSWERS,
  INDUSTRIES,
  PROCESSING_DURATION_MS,
  PROCESSING_STEPS,
  QUESTIONS,
  REMOTE_MODES,
  RISK_STYLES,
  calculateRisk,
  formatCurrency,
  isComplete,
  labelFor,
  type AnswerKey,
  type Answers,
  type Option,
  type RiskResult,
} from "@/lib/risk-engine"

type Step = "idle" | "calculating" | "result" | "lead" | "submitted"

type LeadForm = { email: string; company: string; phone: string }
type LeadErrors = Partial<Record<keyof LeadForm, string>>

const EMPTY_LEAD: LeadForm = { email: "", company: "", phone: "" }

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/

const stepTransition = { duration: 0.4, ease: "easeOut" as const }

export function CyberRiskCalculator() {
  const prefersReducedMotion = useReducedMotion()

  const [step, setStep] = React.useState<Step>("idle")
  const [answers, setAnswers] = React.useState<Answers>(EMPTY_ANSWERS)
  const [missing, setMissing] = React.useState<AnswerKey[]>([])
  const [result, setResult] = React.useState<RiskResult | null>(null)
  const [lead, setLead] = React.useState<LeadForm>(EMPTY_LEAD)
  const [leadErrors, setLeadErrors] = React.useState<LeadErrors>({})
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [announcement, setAnnouncement] = React.useState("")

  /**
   * AnimatePresence unmounts each panel on a step change, so focus would fall
   * back to <body>. Every panel heading pulls focus to itself when it mounts —
   * but only once the user has actually navigated, never on first paint.
   */
  const [hasNavigated, setHasNavigated] = React.useState(false)
  const goToStep = React.useCallback((next: Step) => {
    setHasNavigated(true)
    setStep(next)
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
        if (current.length > 0 && remaining.length === 0) setAnnouncement("")
        return remaining
      })
    },
    []
  )

  const handleCalculate = React.useCallback(() => {
    if (!isComplete(answers)) {
      const unanswered = QUESTIONS.filter((question) => answers[question.key] === null)
      setMissing(unanswered.map((question) => question.key))
      setAnnouncement(
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
    setAnnouncement("Analizuję dane Twojej firmy…")
    goToStep("calculating")
  }, [answers, goToStep, prefersReducedMotion, shakeControls])

  const reset = React.useCallback(() => {
    setAnswers(EMPTY_ANSWERS)
    setMissing([])
    setResult(null)
    setLead(EMPTY_LEAD)
    setLeadErrors({})
    setIsSubmitting(false)
    setAnnouncement("Kalkulator został zresetowany.")
    goToStep("idle")
  }, [goToStep])

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
        setAnnouncement("Formularz zawiera błędy. Sprawdź zaznaczone pola.")
        return
      }

      setIsSubmitting(true)
      setAnnouncement("Wysyłam zgłoszenie…")
    },
    [lead]
  )

  // Deliberate processing delay (PRD §2, State 2 — the labour illusion).
  React.useEffect(() => {
    if (step !== "calculating") return

    const timeout = window.setTimeout(() => {
      goToStep("result")
      setAnnouncement("Raport gotowy.")
    }, PROCESSING_DURATION_MS)

    return () => window.clearTimeout(timeout)
  }, [goToStep, step])

  // Simulated lead submission round-trip.
  React.useEffect(() => {
    if (!isSubmitting) return

    const timeout = window.setTimeout(() => {
      setIsSubmitting(false)
      goToStep("submitted")
      setAnnouncement("Zgłoszenie wysłane. Doradca skontaktuje się w ciągu 24 godzin.")
    }, 900)

    return () => window.clearTimeout(timeout)
  }, [goToStep, isSubmitting])

  const motionProps = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 15 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -15 },
        transition: stepTransition,
      }

  return (
    <Card className="w-full border border-slate-200 bg-white shadow-lg shadow-slate-200/50 ring-0 [--card-spacing:--spacing(5)] md:[--card-spacing:--spacing(7)]">
      <CardContent className="px-(--card-spacing)">
        <p aria-live="polite" className="sr-only">
          {announcement}
        </p>

        <AnimatePresence mode="wait" initial={false}>
          {step === "idle" && (
            <motion.div key="idle" {...motionProps} className="flex flex-col gap-7">
              <PanelHeading autoFocus={hasNavigated} className="sr-only">
                Kwestionariusz ryzyka — trzy pytania
              </PanelHeading>
              {QUESTIONS.map((question, index) => (
                <motion.fieldset
                  key={question.key}
                  animate={shakeControls[question.key]}
                  className="flex flex-col gap-3 border-0 p-0"
                >
                  <legend className="flex w-full flex-col gap-0.5">
                    <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <span
                        className={cn(
                          "flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
                          answers[question.key]
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-500"
                        )}
                        aria-hidden="true"
                      >
                        {index + 1}
                      </span>
                      {question.title}
                    </span>
                    <span className="pl-7 text-xs text-slate-500">{question.hint}</span>
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
                      "h-12 w-full gap-2 rounded-lg text-base font-semibold transition-all duration-200",
                      isComplete(answers)
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                    )}
                  >
                    Oblicz moje ryzyko
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Button>
                </motion.div>

                <p id="calculate-hint" className="text-center text-xs text-slate-500">
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
                Analizuję Twój profil ryzyka
              </PanelHeading>
              <ProcessingView
                reducedMotion={Boolean(prefersReducedMotion)}
                onAnnounce={setAnnouncement}
              />
            </motion.div>
          )}

          {step === "result" && result && (
            <motion.div key="result" {...motionProps}>
              <ResultView
                result={result}
                answers={answers}
                autoFocusHeading={hasNavigated}
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
            <motion.div key="lead" {...motionProps} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <PanelHeading
                  autoFocus={hasNavigated}
                  className="text-xl font-semibold tracking-tight text-slate-900"
                >
                  Zabezpiecz swoją firmę
                </PanelHeading>
                <p className="text-sm text-slate-500">
                  Przygotujemy ofertę dopasowaną do profilu{" "}
                  <span className={cn("font-medium", RISK_STYLES[result.tier].text)}>
                    {result.label.toLowerCase()}
                  </span>
                  . Bez zobowiązań, odpowiedź w ciągu 24 godzin.
                </p>
              </div>

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
                      className="h-12 w-full gap-2 rounded-lg bg-blue-600 text-base font-semibold text-white transition-all duration-200 hover:bg-blue-700"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                          Wysyłam…
                        </>
                      ) : (
                        <>
                          Wyślij zapytanie o ofertę
                          <ArrowRight className="size-4" aria-hidden="true" />
                        </>
                      )}
                    </Button>
                  </motion.div>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => goToStep("result")}
                    className="h-10 w-full text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  >
                    Wróć do wyniku
                  </Button>
                </div>

                <p className="flex items-start gap-2 text-xs leading-relaxed text-slate-500">
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
              className="flex min-h-[22rem] flex-col items-center justify-center gap-4 py-6 text-center"
            >
              <motion.span
                initial={prefersReducedMotion ? undefined : { scale: 0.8, opacity: 0 }}
                animate={prefersReducedMotion ? undefined : { scale: 1, opacity: 1 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="flex size-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200"
              >
                <CheckCircle2 className="size-7" aria-hidden="true" />
              </motion.span>

              <div className="flex flex-col gap-2">
                <PanelHeading
                  autoFocus={hasNavigated}
                  className="text-xl font-semibold tracking-tight text-slate-900"
                >
                  Dziękujemy, zgłoszenie przyjęte
                </PanelHeading>
                <p className="mx-auto max-w-sm text-sm text-slate-500">
                  Doradca skontaktuje się z Tobą na adres{" "}
                  <span className="font-medium text-slate-900">{lead.email}</span> w ciągu 24 godzin
                  roboczych z ofertą dopasowaną do Twojego profilu ryzyka.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={reset}
                className="mt-2 h-11 gap-2 rounded-lg border-slate-200 px-5 text-sm text-slate-700 hover:bg-slate-50"
              >
                <RotateCcw className="size-4" aria-hidden="true" />
                Policz ryzyko jeszcze raz
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}

/**
 * A step panel's heading. Takes focus when its panel mounts so keyboard and
 * screen-reader users land on the new content instead of on <body>.
 */
function PanelHeading({
  autoFocus,
  className,
  children,
}: {
  autoFocus: boolean
  className?: string
  children: React.ReactNode
}) {
  const ref = React.useRef<HTMLHeadingElement>(null)

  React.useEffect(() => {
    if (autoFocus) ref.current?.focus()
  }, [autoFocus])

  return (
    <h2 ref={ref} tabIndex={-1} className={cn("outline-none", className)}>
      {children}
    </h2>
  )
}

function TileGroup<TId extends string>({
  name,
  options,
  value,
  invalid,
  errorId,
  onSelect,
  className,
  compact = false,
  reducedMotion,
}: {
  name: string
  options: Option<TId>[]
  value: TId | null
  invalid: boolean
  errorId?: string
  onSelect: (id: TId) => void
  className?: string
  compact?: boolean
  reducedMotion: boolean
}) {
  const groupRef = React.useRef<HTMLDivElement>(null)

  /**
   * Roving tabindex + arrow keys, per the WAI-ARIA radiogroup pattern:
   * the group is a single tab stop and arrows move focus *and* selection.
   */
  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End"]
      if (!keys.includes(event.key)) return

      event.preventDefault()

      const tiles = groupRef.current
        ? [...groupRef.current.querySelectorAll<HTMLButtonElement>('[role="radio"]')]
        : []

      /*
       * Anchor on where focus actually is, not on what is selected — with
       * nothing chosen yet, focus sits on the first tile and ArrowRight must
       * advance to the second rather than re-selecting the first.
       */
      const focusedIndex = tiles.indexOf(document.activeElement as HTMLButtonElement)
      const currentIndex =
        focusedIndex >= 0 ? focusedIndex : options.findIndex((o) => o.id === value)
      const lastIndex = options.length - 1

      let nextIndex: number
      if (event.key === "Home") {
        nextIndex = 0
      } else if (event.key === "End") {
        nextIndex = lastIndex
      } else if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        nextIndex = currentIndex >= lastIndex ? 0 : currentIndex + 1
      } else {
        nextIndex = currentIndex <= 0 ? lastIndex : currentIndex - 1
      }

      onSelect(options[nextIndex].id)
      tiles[nextIndex]?.focus()
    },
    [onSelect, options, value]
  )

  // The group owns one tab stop: the selected tile, or the first when nothing is chosen.
  const tabStopIndex = value === null ? 0 : options.findIndex((o) => o.id === value)

  return (
    <div
      ref={groupRef}
      role="radiogroup"
      aria-label={name}
      aria-required="true"
      aria-invalid={invalid}
      aria-describedby={invalid ? errorId : undefined}
      onKeyDown={handleKeyDown}
      className={className}
    >
      {options.map((option, index) => {
        const Icon = option.icon
        const selected = value === option.id

        return (
          <motion.button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={index === tabStopIndex ? 0 : -1}
            onClick={() => onSelect(option.id)}
            whileHover={reducedMotion ? undefined : { scale: 1.02 }}
            whileTap={reducedMotion ? undefined : { scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className={cn(
              "flex min-h-14 w-full cursor-pointer items-center gap-3 rounded-xl border bg-white p-3 text-left transition-colors duration-200 outline-none",
              "focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2",
              compact && "flex-col items-center justify-center gap-1 px-2 py-3 text-center",
              selected
                ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600"
                : invalid
                  ? // rose-500 clears the 3:1 non-text contrast bar; rose-300/400 do not.
                    "border-rose-500 hover:border-rose-600 hover:bg-rose-50/40"
                  : "border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-md"
            )}
          >
            <span
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors duration-200",
                compact && "size-7",
                selected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
              )}
              aria-hidden="true"
            >
              <Icon className={cn("size-4.5", compact && "size-4")} />
            </span>

            <span className={cn("flex min-w-0 flex-col", compact && "items-center")}>
              <span
                className={cn(
                  "text-sm font-medium",
                  selected ? "text-blue-900" : "text-slate-900"
                )}
              >
                {option.label}
              </span>
              {/* slate-600, not slate-500: on the selected tile's blue-50 the
                  lighter token measures 4.37:1 and fails AA. */}
              <span
                className={cn(
                  "text-xs leading-snug text-slate-600",
                  compact && "text-[11px]"
                )}
              >
                {option.description}
              </span>
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}

function ProcessingView({
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
          <p className="mt-1 text-xs text-slate-500">
            Porównuję Twój profil z bazą incydentów z ostatnich 24 miesięcy.
          </p>
        </div>
      </div>
    </>
  )
}

function ResultView({
  result,
  answers,
  autoFocusHeading,
  reducedMotion,
  onSecure,
  onReset,
}: {
  result: RiskResult
  answers: Answers
  autoFocusHeading: boolean
  reducedMotion: boolean
  onSecure: () => void
  onReset: () => void
}) {
  const styles = RISK_STYLES[result.tier]
  const scorePercent = Math.round(((result.score - 2) / 8) * 100)

  return (
    <div className="flex flex-col gap-6">
      <PanelHeading
        autoFocus={autoFocusHeading}
        className="text-xl font-semibold tracking-tight text-slate-900"
      >
        Twój wynik: {result.label.toLowerCase()}
      </PanelHeading>

      <div
        className={cn(
          "flex flex-col items-center gap-4 rounded-xl border p-6 text-center",
          styles.bg,
          styles.border
        )}
      >
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
          <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
            Szacowany koszt jednego incydentu
          </p>
          <AnimatedAmount
            value={result.headline}
            openEnded={result.openEnded}
            reducedMotion={reducedMotion}
            className={cn("text-4xl font-bold tracking-tight tabular-nums md:text-5xl", styles.text)}
          />
          <p className="text-xs text-slate-500">
            Widełki dla Twojego profilu: {formatCurrency(result.min)} –{" "}
            {formatCurrency(result.max)}
            {result.openEnded ? " i więcej" : ""}
          </p>
        </div>

        <div className="flex w-full flex-col gap-1.5">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/70">
            <motion.div
              className={cn("h-full rounded-full", styles.bar)}
              initial={reducedMotion ? false : { width: 0 }}
              animate={{ width: `${scorePercent}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            />
          </div>
          <div className="flex justify-between text-[11px] font-medium text-slate-500">
            <span>Niskie</span>
            <span>Średnie</span>
            <span>Wysokie</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-sm leading-relaxed text-slate-700">{result.summary}</p>

        <ul className="flex flex-col gap-2.5">
          {result.factors.map((factor, index) => (
            <motion.li
              key={factor}
              initial={reducedMotion ? false : { opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, ease: "easeOut", delay: 0.25 + index * 0.1 }}
              className="flex items-start gap-2.5 text-sm text-slate-600"
            >
              <BadgeCheck className="mt-0.5 size-4 shrink-0 text-blue-600" aria-hidden="true" />
              <span>{factor}</span>
            </motion.li>
          ))}
        </ul>
      </div>

      <dl className="grid grid-cols-1 gap-x-2 gap-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-3 sm:text-center">
        {QUESTIONS.map((question) => (
          <div
            key={question.key}
            className="flex items-baseline justify-between gap-3 sm:flex-col sm:items-center sm:gap-0.5"
          >
            <dt className="text-[11px] font-medium tracking-wide text-slate-600 uppercase">
              {question.title}
            </dt>
            <dd className="text-right text-xs font-semibold text-slate-900 sm:text-center">
              {labelFor(question.key, answers)}
            </dd>
          </div>
        ))}
      </dl>

      <div className="flex flex-col gap-3 border-t border-slate-100 pt-5">
        <motion.div
          whileHover={reducedMotion ? undefined : { scale: 1.02 }}
          whileTap={reducedMotion ? undefined : { scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
        >
          <Button
            type="button"
            onClick={onSecure}
            className="h-12 w-full gap-2 rounded-lg bg-blue-600 text-base font-semibold text-white shadow-md shadow-blue-600/20 transition-colors duration-200 hover:bg-blue-700"
          >
            <ShieldCheck className="size-4" aria-hidden="true" />
            Zabezpiecz się
          </Button>
        </motion.div>

        <Button
          type="button"
          variant="ghost"
          onClick={onReset}
          className="h-10 w-full gap-2 text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-900"
        >
          <RotateCcw className="size-3.5" aria-hidden="true" />
          Policz ponownie
        </Button>
      </div>
    </div>
  )
}

function AnimatedAmount({
  value,
  openEnded,
  reducedMotion,
  className,
}: {
  value: number
  openEnded: boolean
  reducedMotion: boolean
  className?: string
}) {
  const count = useMotionValue(reducedMotion ? value : 0)
  const formatted = useTransform(count, (latest) => formatCurrency(latest))

  React.useEffect(() => {
    if (reducedMotion) {
      count.set(value)
      return
    }

    count.set(0)
    const controls = animate(count, value, { duration: 2, ease: "easeOut" })
    return () => controls.stop()
  }, [count, reducedMotion, value])

  return (
    <p className={className}>
      <motion.span>{formatted}</motion.span>
      {openEnded && <span aria-hidden="true">+</span>}
      <span className="sr-only">
        {formatCurrency(value)}
        {openEnded ? " i więcej" : ""}
      </span>
    </p>
  )
}

function Field({
  id,
  label,
  optionalLabel,
  type,
  placeholder,
  autoComplete,
  value,
  error,
  onChange,
}: {
  id: string
  label: string
  optionalLabel?: string
  type: React.HTMLInputTypeAttribute
  placeholder: string
  autoComplete: string
  value: string
  error?: string
  onChange: (value: string) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="justify-between text-slate-900">
        <span>{label}</span>
        {optionalLabel && (
          <span className="text-xs font-normal text-slate-500">{optionalLabel}</span>
        )}
      </Label>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(
          "h-11 rounded-lg border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-500",
          "focus-visible:border-blue-600 focus-visible:ring-2 focus-visible:ring-blue-600/20",
          error && "border-rose-400 focus-visible:border-rose-500 focus-visible:ring-rose-500/20"
        )}
      />
      {error && (
        <p id={`${id}-error`} className="flex items-center gap-1.5 text-xs text-rose-600">
          <TriangleAlert className="size-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  )
}

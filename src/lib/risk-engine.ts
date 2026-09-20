import {
  Briefcase,
  Building,
  Building2,
  Factory,
  Globe,
  HeartPulse,
  Landmark,
  Laptop,
  ShoppingCart,
  User,
  Users,
  type LucideIcon,
} from "lucide-react"

/**
 * Deterministic risk engine for the B2B cyber risk calculator.
 * Pure data + pure functions — no React, no side effects.
 */

export type IndustryId = "tech-finance" | "ecommerce" | "healthcare" | "manufacturing"
export type CompanySizeId = "1-10" | "11-50" | "51-200" | "200-plus"
export type RemoteModeId = "remote" | "hybrid" | "office"

export type RiskTier = "LOW" | "MEDIUM" | "HIGH"

export type Option<TId extends string> = {
  id: TId
  label: string
  /** Optional: the work-mode tiles read clearly enough from their label alone. */
  description?: string
  icon: LucideIcon
  points: number
}

export const INDUSTRIES: Option<IndustryId>[] = [
  {
    id: "tech-finance",
    label: "Technologia / Finanse",
    description: "SaaS, fintech, bankowość",
    icon: Landmark,
    points: 3,
  },
  {
    id: "ecommerce",
    label: "E-commerce / Handel",
    description: "Sklepy online, retail",
    icon: ShoppingCart,
    points: 2,
  },
  {
    id: "healthcare",
    label: "Ochrona zdrowia",
    description: "Placówki, dane pacjentów",
    icon: HeartPulse,
    points: 2,
  },
  {
    id: "manufacturing",
    label: "Produkcja / Inne",
    description: "Przemysł, logistyka, usługi",
    icon: Factory,
    points: 1,
  },
]

export const COMPANY_SIZES: Option<CompanySizeId>[] = [
  { id: "1-10", label: "1–10", description: "Mikrofirma", icon: User, points: 1 },
  { id: "11-50", label: "11–50", description: "Mała firma", icon: Users, points: 2 },
  { id: "51-200", label: "51–200", description: "Średnia firma", icon: Building2, points: 3 },
  { id: "200-plus", label: "200+", description: "Duża organizacja", icon: Building, points: 4 },
]

export const REMOTE_MODES: Option<RemoteModeId>[] = [
  { id: "remote", label: "W pełni zdalna", icon: Globe, points: 3 },
  { id: "hybrid", label: "Hybrydowa", icon: Laptop, points: 2 },
  { id: "office", label: "Tylko biuro", icon: Briefcase, points: 0 },
]

export type Answers = {
  industry: IndustryId | null
  size: CompanySizeId | null
  remote: RemoteModeId | null
}

export const EMPTY_ANSWERS: Answers = { industry: null, size: null, remote: null }

export type AnswerKey = keyof Answers

/**
 * Question metadata, used to render the form and to name missing answers in
 * errors. `hint` is the short prompt; `explanation` is the "why we ask" text
 * behind the ? affordance.
 */
export const QUESTIONS: {
  key: AnswerKey
  title: string
  hint: string
  explanation: string
}[] = [
  {
    key: "industry",
    title: "Branża",
    hint: "W czym działa Twoja firma?",
    explanation:
      "Branża decyduje o tym, jakie dane przechowujesz i kto Cię atakuje. Firmy technologiczne i finansowe są celem ataków ukierunkowanych na płatności, a placówki medyczne odpowiadają dodatkowo przed RODO. Jedno i drugie wyraźnie podnosi koszt pojedynczego incydentu.",
  },
  {
    key: "size",
    title: "Liczba pracowników",
    hint: "Ilu masz pracowników?",
    explanation:
      "Każdy pracownik to kolejne konta, urządzenia i skrzynki pocztowe — czyli kolejne drzwi do Twojej sieci. Im większy zespół, tym większa powierzchnia ataku i tym dłużej trwa wykrycie oraz opanowanie incydentu.",
  },
  {
    key: "remote",
    title: "Tryb pracy",
    hint: "Jak pracuje Twój zespół?",
    explanation:
      "Praca poza biurem wynosi firmowe dane poza kontrolowaną sieć. Domowe routery, prywatne Wi-Fi i urządzenia bez nadzoru działu IT to dziś najczęstszy wektor wejścia do organizacji — dlatego model pracy tak mocno waży na wyniku.",
  },
]

type TierDefinition = {
  tier: RiskTier
  label: string
  summary: string
  min: number
  max: number
  /** Whether the upper bound should read as "and above". */
  openEnded: boolean
}

const TIERS: TierDefinition[] = [
  {
    tier: "LOW",
    label: "Niskie ryzyko",
    summary:
      "Twój profil jest odporny, ale jeden incydent zatrzyma firmę na kilka dni.",
    min: 15_000,
    max: 50_000,
    openEnded: false,
  },
  {
    tier: "MEDIUM",
    label: "Średnie ryzyko",
    summary:
      "Masz realną ekspozycję na ransomware i wyłudzenia płatności.",
    min: 50_000,
    max: 250_000,
    openEnded: false,
  },
  {
    tier: "HIGH",
    label: "Wysokie ryzyko",
    summary:
      "Jesteś atrakcyjnym celem dla zorganizowanych grup przestępczych.",
    min: 250_000,
    max: 1_500_000,
    openEnded: true,
  },
]

export type RiskResult = {
  score: number
  tier: RiskTier
  label: string
  summary: string
  min: number
  max: number
  openEnded: boolean
  /** The figure the animated counter drives towards. */
  headline: number
  factors: RiskFactor[]
}

/** Type guard: every question answered. */
export function isComplete(answers: Answers): answers is {
  industry: IndustryId
  size: CompanySizeId
  remote: RemoteModeId
} {
  return answers.industry !== null && answers.size !== null && answers.remote !== null
}

function pointsFor<TId extends string>(options: Option<TId>[], id: TId): number {
  const option = options.find((candidate) => candidate.id === id)
  return option ? option.points : 0
}

function optionFor<TId extends string>(options: Option<TId>[], id: TId): Option<TId> {
  const option = options.find((candidate) => candidate.id === id)
  if (!option) throw new Error(`Unknown option id: ${id}`)
  return option
}

/**
 * A driver of the score: which answer caused it, and why it matters. Carrying
 * the answer's own label and icon lets the result tie each line back to what
 * the user actually picked.
 */
export type RiskFactor = {
  key: AnswerKey
  label: string
  detail: string
  icon: LucideIcon
  /** Points this answer contributed, shown as the weight of the driver. */
  points: number
}

/** Personalised drivers shown under the result. */
function buildFactors(answers: {
  industry: IndustryId
  size: CompanySizeId
  remote: RemoteModeId
}): RiskFactor[] {
  const industryFactors: Record<IndustryId, string> = {
    "tech-finance":
      "Branża technologiczna i finansowa jest celem numer jeden dla ataków ukierunkowanych na dane i płatności.",
    ecommerce:
      "Sklepy internetowe tracą przychód z każdą godziną przestoju, a dane kart są łakomym kąskiem dla atakujących.",
    healthcare:
      "Dane medyczne są objęte szczególną ochroną RODO — ich wyciek oznacza kary administracyjne obok kosztów odtworzenia.",
    manufacturing:
      "Przestój linii produkcyjnej lub łańcucha dostaw generuje straty szybciej niż sam koszt odzyskania danych.",
  }

  const sizeFactors: Record<CompanySizeId, string> = {
    "1-10":
      "Mały zespół zwykle nie ma dedykowanego działu IT — reakcja na incydent trwa dłużej niż w większych firmach.",
    "11-50":
      "Przy kilkudziesięciu pracownikach rośnie liczba urządzeń i kont, a wraz z nią powierzchnia ataku.",
    "51-200":
      "Średnia organizacja to setki kont i integracji — wystarczy jedno przejęte hasło, by uzyskać dostęp do całej sieci.",
    "200-plus":
      "Duża organizacja oznacza rozbudowaną infrastrukturę i wielu dostawców — ryzyko ataku przez łańcuch dostaw jest znaczące.",
  }

  const remoteFactors: Record<RemoteModeId, string> = {
    remote:
      "Praca w pełni zdalna wynosi dane poza sieć firmową: prywatne Wi-Fi i urządzenia to najczęstszy wektor wejścia.",
    hybrid:
      "Model hybrydowy oznacza urządzenia krążące między biurem a domem — trudniej utrzymać spójną politykę bezpieczeństwa.",
    office:
      "Praca wyłącznie z biura ogranicza ekspozycję, ale nie chroni przed phishingiem ani atakiem na pocztę firmową.",
  }

  const industry = optionFor(INDUSTRIES, answers.industry)
  const size = optionFor(COMPANY_SIZES, answers.size)
  const remote = optionFor(REMOTE_MODES, answers.remote)

  return [
    {
      key: "industry",
      label: industry.label,
      detail: industryFactors[answers.industry],
      icon: industry.icon,
      points: industry.points,
    },
    {
      key: "size",
      label: `${size.label} pracowników`,
      detail: sizeFactors[answers.size],
      icon: size.icon,
      points: size.points,
    },
    {
      key: "remote",
      label: remote.label,
      detail: remoteFactors[answers.remote],
      icon: remote.icon,
      points: remote.points,
    },
  ]
}

/**
 * Score = industry + size + remote (range 2–10), mapped onto three tiers
 * exactly as defined in docs/PRD.md §3.
 */
export function calculateRisk(answers: {
  industry: IndustryId
  size: CompanySizeId
  remote: RemoteModeId
}): RiskResult {
  const score =
    pointsFor(INDUSTRIES, answers.industry) +
    pointsFor(COMPANY_SIZES, answers.size) +
    pointsFor(REMOTE_MODES, answers.remote)

  const definition = score >= 8 ? TIERS[2] : score >= 5 ? TIERS[1] : TIERS[0]

  return {
    score,
    tier: definition.tier,
    label: definition.label,
    summary: definition.summary,
    min: definition.min,
    max: definition.max,
    openEnded: definition.openEnded,
    headline: definition.max,
    factors: buildFactors(answers),
  }
}

/** Human-readable label for the selected option of a given question. */
export function labelFor(key: AnswerKey, answers: Answers): string | null {
  if (key === "industry") {
    return answers.industry ? optionFor(INDUSTRIES, answers.industry).label : null
  }
  if (key === "size") {
    return answers.size ? optionFor(COMPANY_SIZES, answers.size).label : null
  }
  return answers.remote ? optionFor(REMOTE_MODES, answers.remote).label : null
}

/**
 * Polish thousands grouping, with a leading symbol as the PRD writes its
 * figures ("$250,000"). Swap the symbol and the tier amounts above together
 * to price the prototype in another currency.
 */
const amountFormatter = new Intl.NumberFormat("pl-PL", { maximumFractionDigits: 0 })

export const CURRENCY_SYMBOL = "$"

export function formatCurrency(value: number): string {
  return `${CURRENCY_SYMBOL}${amountFormatter.format(Math.round(value))}`
}

/** Score bounds: industry(1–3) + size(1–4) + remote(0–3). */
export const MIN_SCORE = 2
export const MAX_SCORE = 10

/** Low → high, for labelling the risk scale. */
export const TIER_ORDER: RiskTier[] = ["LOW", "MEDIUM", "HIGH"]

/** Short labels for the scale beneath the figure. */
export const TIER_LABELS: Record<RiskTier, string> = {
  LOW: "Niskie",
  MEDIUM: "Średnie",
  HIGH: "Wysokie",
}

/** Light-theme colour sets per risk tier (docs/PROJECT_SPEC.md §3). */
export const RISK_STYLES: Record<
  RiskTier,
  {
    text: string
    bg: string
    badge: string
    bar: string
  }
> = {
  LOW: {
    text: "text-emerald-700",
    bg: "bg-emerald-50",
    badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
    bar: "bg-emerald-500",
  },
  MEDIUM: {
    text: "text-amber-700",
    bg: "bg-amber-50",
    badge: "bg-amber-100 text-amber-800 border-amber-200",
    bar: "bg-amber-500",
  },
  HIGH: {
    text: "text-rose-700",
    bg: "bg-rose-50",
    badge: "bg-rose-100 text-rose-800 border-rose-200",
    bar: "bg-rose-500",
  },
}

/** Microcopy cycled during the deliberate processing delay (PRD §2, State 2). */
export const PROCESSING_STEPS = [
  "Analizuję zagrożenia w Twojej branży…",
  "Oceniam ryzyko pracy zdalnej…",
  "Generuję raport ryzyka…",
]

/**
 * Longer than the PRD's 1.5–2 s so each line of microcopy is actually readable
 * (3 messages × 1.2 s). Still a deliberate delay, per PRD §2's labour illusion.
 */
export const PROCESSING_DURATION_MS = 3600

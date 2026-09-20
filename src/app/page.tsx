import { Lock, ShieldCheck, Zap } from "lucide-react";
import { CyberRiskCalculator } from "@/components/cyber-risk-calculator";

/**
 * <header> and <footer> are siblings of <main>, not descendants: nested inside
 * main they would stop mapping to the banner / contentinfo landmarks.
 */
export default function Home() {
  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center gap-8 bg-slate-50 px-4 py-10 md:px-6 md:py-16">
      <header className="flex w-full max-w-2xl flex-col items-center gap-4 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
          <ShieldCheck className="size-3.5" aria-hidden="true" />
          Bezpłatny audyt cyberryzyka
        </span>

        <h1 className="text-3xl font-bold tracking-tight text-balance text-slate-900 md:text-4xl">
          Ile kosztuje Cię brak ochrony przed cyberatakiem?
        </h1>

        <p className="max-w-lg text-sm leading-relaxed text-pretty text-slate-600 md:text-base">
          Odpowiedz na trzy pytania i poznaj szacowany koszt jednego incydentu w Twojej firmie.
          Trwa to minutę i nie wymaga podawania danych kontaktowych.
        </p>
      </header>

      <main className="w-full max-w-2xl">
        <CyberRiskCalculator />
      </main>

      <footer className="flex w-full max-w-2xl flex-col items-center gap-3">
        <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-slate-600">
          <li className="flex items-center gap-1.5">
            <Lock className="size-3.5 text-slate-500" aria-hidden="true" />
            Zgodność z RODO
          </li>
          <li className="flex items-center gap-1.5">
            <Zap className="size-3.5 text-slate-500" aria-hidden="true" />
            Wynik w 60 sekund
          </li>
          <li className="flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-slate-500" aria-hidden="true" />
            Ponad 2 400 wykonanych audytów
          </li>
        </ul>

        <p className="max-w-md text-center text-[11px] leading-relaxed text-slate-500">
          Szacunki mają charakter poglądowy i opierają się na publicznych danych o kosztach
          incydentów. Ostateczna wycena ochrony wymaga indywidualnej analizy.
        </p>
      </footer>
    </div>
  );
}

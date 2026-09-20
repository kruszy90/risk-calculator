"use client"

import { HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { FOCUS_RING } from "./constants"

/**
 * The per-question hint, behind a "?" affordance. A Popover rather than a
 * Tooltip because it opens on click — tooltips are hover/focus-only and never
 * open on touch.
 */
export function HintPopover({
  title,
  hint,
  explanation,
}: {
  title: string
  hint: string
  explanation: string
}) {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <button
            type="button"
            aria-label={`Więcej o pytaniu: ${title}`}
            /*
             * The circle stays 24px so it does not compete with the question
             * title, but a centred pseudo-element gives it a 44px tap target.
             */
            className={cn(
              "relative flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors duration-200 outline-none before:absolute before:top-1/2 before:left-1/2 before:size-11 before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']",
              "hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700",
              "data-[popup-open]:border-blue-600 data-[popup-open]:bg-blue-50 data-[popup-open]:text-blue-700",
              FOCUS_RING
            )}
          >
            <HelpCircle className="size-3.5" aria-hidden="true" />
          </button>
        }
      />
      <PopoverContent
        side="top"
        sideOffset={8}
        className="w-[min(20rem,calc(100vw-2rem))] gap-2 border border-slate-200 bg-white p-4 shadow-xl ring-0"
      >
        <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <HelpCircle className="size-4 shrink-0 text-blue-600" aria-hidden="true" />
          {hint}
        </p>
        <p className="text-sm leading-relaxed text-slate-600">{explanation}</p>
      </PopoverContent>
    </Popover>
  )
}

"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import type { Option } from "@/lib/risk-engine"
import { FOCUS_RING } from "./constants"

/**
 * One question's answers, as a WAI-ARIA radiogroup built from native buttons:
 * the group is a single tab stop and arrow keys move focus and selection.
 */
export function TileGroup<TId extends string>({
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
              FOCUS_RING,
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
                selected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
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
              {option.description && (
                <span
                  className={cn(
                    "text-xs leading-snug text-slate-600",
                    compact && "text-[11px]"
                  )}
                >
                  {option.description}
                </span>
              )}
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}

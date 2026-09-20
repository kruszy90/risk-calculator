"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * A step panel's heading. Takes focus when its panel mounts so keyboard and
 * screen-reader users land on the new content instead of on <body>.
 */
export function PanelHeading({
  autoFocus,
  focusDelayMs = 0,
  className,
  children,
}: {
  autoFocus: boolean
  /** Wait for the panel's reveal before taking focus. */
  focusDelayMs?: number
  className?: string
  children: React.ReactNode
}) {
  const ref = React.useRef<HTMLHeadingElement>(null)

  React.useEffect(() => {
    if (!autoFocus) return

    // preventScroll: the heading may still be mid-reveal, and scrolling to a
    // collapsed box jumps the page.
    const take = () => ref.current?.focus({ preventScroll: true })

    if (focusDelayMs <= 0) {
      take()
      return
    }

    const timeout = window.setTimeout(take, focusDelayMs)
    return () => window.clearTimeout(timeout)
  }, [autoFocus, focusDelayMs])

  return (
    <h2
      ref={ref}
      tabIndex={-1}
      /*
       * The heading is a focus target, not a control: it is not in the tab
       * order, so 2.4.7 does not demand an indicator on it. :focus-visible
       * (not :focus) keeps a ring available if a browser decides the focus was
       * keyboard-driven, while staying invisible for the automatic move on
       * every step change — a box drawn round a title the user never focused
       * just reads as an artefact.
       */
      className={cn(
        "outline-none focus-visible:ring-2 focus-visible:ring-blue-600/50 focus-visible:ring-offset-4",
        className
      )}
    >
      {children}
    </h2>
  )
}

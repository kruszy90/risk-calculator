"use client"

import * as React from "react"
import { motion, useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils"

/** How long a step panel takes to enter or leave. */
export const PANEL_DURATION_S = 0.4

/**
 * Chrome rendered outside the card's AnimatePresence waits out the outgoing
 * panel before entering, so it arrives with the incoming one rather than ahead
 * of it. Derived, not a second literal: the two must stay equal.
 */
export const PANEL_EXIT_S = PANEL_DURATION_S

/** Milliseconds, for focus handling that works in timers rather than seconds. */
export const PANEL_EXIT_MS = PANEL_EXIT_S * 1000

const ELEMENTS = { div: motion.div, header: motion.header } as const

/**
 * Collapses to zero height on exit and expands on enter, delayed so it lands
 * together with the incoming step panel. Used for the page intro and for each
 * step's title block, which both sit outside the card.
 */
export function CollapsibleReveal({
  as = "div",
  className,
  children,
}: {
  as?: keyof typeof ELEMENTS
  className?: string
  children: React.ReactNode
}) {
  const prefersReducedMotion = useReducedMotion()
  const Element = ELEMENTS[as]

  return (
    <Element
      className={cn("overflow-hidden", className)}
      initial={prefersReducedMotion ? false : { opacity: 0, height: 0, y: 15 }}
      animate={
        prefersReducedMotion
          ? { opacity: 1 }
          : {
              opacity: 1,
              height: "auto",
              y: 0,
              transition: {
                duration: PANEL_DURATION_S,
                ease: "easeOut",
                delay: PANEL_EXIT_S,
              },
            }
      }
      exit={
        prefersReducedMotion
          ? { opacity: 0 }
          : {
              opacity: 0,
              height: 0,
              y: -15,
              transition: { duration: PANEL_DURATION_S, ease: "easeOut" },
            }
      }
    >
      {children}
    </Element>
  )
}

"use client"

import * as React from "react"
import { motion, useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils"
import { CHROME_ENTER, CHROME_EXIT, INSTANT } from "@/lib/motion"

const ELEMENTS = { div: motion.div, header: motion.header } as const

/**
 * Collapses to zero height on exit and expands on enter, timed so it lands
 * alongside the incoming step panel. Used for the page intro and for each step's
 * title block, which both sit outside the card.
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
      /*
       * Fade plus height only — no y-translate. The height change is what keeps
       * the rest of the page from jumping; adding a slide on top of it is the
       * part that reads as a glitch.
       */
      initial={{ opacity: 0, height: 0 }}
      animate={{
        opacity: 1,
        height: "auto",
        transition: prefersReducedMotion ? INSTANT : CHROME_ENTER,
      }}
      exit={{
        opacity: 0,
        height: 0,
        transition: prefersReducedMotion ? INSTANT : CHROME_EXIT,
      }}
    >
      {children}
    </Element>
  )
}

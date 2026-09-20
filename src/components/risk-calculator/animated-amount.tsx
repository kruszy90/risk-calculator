"use client"

import * as React from "react"
import { animate, motion, useMotionValue, useTransform } from "framer-motion"
import { formatCurrency } from "@/lib/risk-engine"

/**
 * The headline figure, counting up from zero (PRD §2, State 3).
 * The MotionValue is rendered directly as a child, so the count animates
 * without re-rendering React on every frame.
 */
export function AnimatedAmount({
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
      {/* The animating text is unreliable for assistive tech; state the final figure. */}
      <span className="sr-only">
        {formatCurrency(value)}
        {openEnded ? " i więcej" : ""}
      </span>
    </p>
  )
}

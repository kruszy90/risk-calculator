"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { PANEL_HEIGHT } from "@/lib/motion"

/**
 * Gives the card a height it can animate, so swapping panels resizes it instead
 * of snapping it.
 *
 * The panels differ wildly in length — the questionnaire is roughly three times
 * the analysis panel — and a card that jumps straight from one to the other is
 * the single thing that makes an otherwise clean fade read as a glitch. The
 * inner wrapper is measured, the outer box animates towards that number, and
 * being the nearest positioned ancestor it is also what AnimatePresence's
 * popLayout anchors the outgoing panel to while it fades.
 */
export function PanelStage({
  reducedMotion,
  children,
}: {
  reducedMotion: boolean
  children: React.ReactNode
}) {
  const contentRef = React.useRef<HTMLDivElement>(null)
  const measured = React.useRef<number | null>(null)
  const [height, setHeight] = React.useState<number | null>(null)

  /*
   * Clip only while the box is mid-resize. Clipping permanently would cut the
   * focus ring off whatever sits against the panel's top or bottom edge.
   */
  const [resizing, setResizing] = React.useState(false)

  React.useLayoutEffect(() => {
    const node = contentRef.current
    if (!node || reducedMotion) return

    const sync = () => {
      const next = node.offsetHeight
      if (next === measured.current) return
      // The first measurement is the height the card already has — adopting it
      // is not a resize, so it must not turn on clipping.
      if (measured.current !== null) setResizing(true)
      measured.current = next
      setHeight(next)
    }

    sync()
    const observer = new ResizeObserver(sync)
    observer.observe(node)

    return () => observer.disconnect()
  }, [reducedMotion])

  /*
   * One tree for both preferences — a reduced-motion branch that renders
   * something structurally different would fail to hydrate. With no measurement
   * taken the box simply stays at height:auto, which is what it would have been.
   */
  return (
    <motion.div
      initial={false}
      animate={{ height: height ?? "auto" }}
      transition={PANEL_HEIGHT}
      onAnimationComplete={() => setResizing(false)}
      style={{ overflow: resizing ? "hidden" : "visible" }}
    >
      <div ref={contentRef} className="relative">
        {children}
      </div>
    </motion.div>
  )
}

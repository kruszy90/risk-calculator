/**
 * Timing for the step choreography.
 *
 * A step change moves three things at once: the panel inside the card, the
 * card's own height, and the chrome above it. They are tuned together here so
 * the change reads as one movement instead of three that happen to overlap.
 */

/**
 * The reduced-motion substitute for any of the transitions below.
 *
 * Swapping the transition rather than dropping the animation keeps the markup
 * identical either way: the server has no idea what the visitor's motion
 * preference is, so a branch that changes what gets rendered breaks hydration
 * for exactly the people who asked for less movement.
 */
export const INSTANT = { duration: 0 }

/** Gentle deceleration — nothing in the widget should arrive at a hard stop. */
export const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1]

/** Ease in and out, for values that travel a long way (the card's height). */
export const EASE_SOFT: [number, number, number, number] = [0.4, 0, 0.2, 1]

/** The outgoing panel leaves first and fastest. */
export const PANEL_EXIT = { duration: 0.22, ease: EASE_OUT }

/**
 * The incoming panel overlaps the tail of that fade rather than queueing behind
 * it. AnimatePresence's popLayout takes the outgoing panel out of the flow the
 * moment it starts leaving, so the two are never stacked — they cross in place.
 */
export const PANEL_ENTER_DELAY_S = 0.12
export const PANEL_ENTER = {
  duration: 0.32,
  delay: PANEL_ENTER_DELAY_S,
  ease: EASE_OUT,
}

/**
 * The card resizing between two panels. Slower than either fade and eased at
 * both ends, so a 900px change still glides instead of snapping.
 */
export const PANEL_HEIGHT = { duration: 0.42, ease: EASE_SOFT }

/**
 * Chrome outside the card collapses before its replacement expands. The delay
 * equals the collapse: while both are open the page would be pushed down by the
 * sum of their heights, which is exactly the bump this avoids.
 */
export const CHROME_COLLAPSE_S = 0.24
export const CHROME_EXIT = { duration: CHROME_COLLAPSE_S, ease: EASE_SOFT }
export const CHROME_ENTER = {
  duration: 0.34,
  delay: CHROME_COLLAPSE_S,
  ease: EASE_SOFT,
}

/** Milliseconds, for focus handling that works in timers rather than seconds. */
export const CHROME_ENTER_DELAY_MS = CHROME_COLLAPSE_S * 1000

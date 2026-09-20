import type { LeadForm } from "./types"

/** Every step's primary action shares this footprint. */
export const PRIMARY_CTA =
  "h-14 w-full cursor-pointer gap-2.5 rounded-xl text-lg font-semibold transition-colors duration-200"

/**
 * Focus ring for the controls that draw their own rather than relying on the
 * --ring token: blue-600 measures 5.17:1 on white, well clear of WCAG 1.4.11.
 */
export const FOCUS_RING =
  "focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"

export const EMPTY_LEAD: LeadForm = { email: "", company: "", phone: "" }

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/

/** The calculator's state machine, in the order the user walks it. */
export type Step = "idle" | "calculating" | "result" | "lead" | "submitted"

export type LeadForm = { email: string; company: string; phone: string }

export type LeadErrors = Partial<Record<keyof LeadForm, string>>

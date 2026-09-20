"use client"

import * as React from "react"
import { TriangleAlert } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

/** A labelled lead-form input with its error wired up for assistive tech. */
export function Field({
  id,
  label,
  optionalLabel,
  type,
  placeholder,
  autoComplete,
  value,
  error,
  onChange,
}: {
  id: string
  label: string
  optionalLabel?: string
  type: React.HTMLInputTypeAttribute
  placeholder: string
  autoComplete: string
  value: string
  error?: string
  onChange: (value: string) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="justify-between text-slate-900">
        <span>{label}</span>
        {optionalLabel && (
          <span className="text-xs font-normal text-slate-600">{optionalLabel}</span>
        )}
      </Label>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(
          "h-11 rounded-lg border-slate-200 bg-white px-3 text-sm text-slate-900",
          // Placeholders stay lighter than entered text (slate-900) so an empty
          // field never reads as a filled one; slate-500 still clears 4.5:1.
          "placeholder:text-slate-500",
          "focus-visible:border-blue-600 focus-visible:ring-2 focus-visible:ring-blue-600/20",
          // rose-500 clears 3:1; rose-400 (2.69:1) does not — same rule as the tiles.
          error && "border-rose-500 focus-visible:border-rose-600 focus-visible:ring-rose-500/20"
        )}
      />
      {error && (
        <p id={`${id}-error`} className="flex items-center gap-1.5 text-xs text-rose-600">
          <TriangleAlert className="size-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  )
}

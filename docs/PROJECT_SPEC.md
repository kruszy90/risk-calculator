# Project Specifications & Design System
**Project:** B2B Cyber Risk Calculator

## 1. Technology Stack
- **Framework:** Next.js (App Router, strict mode)
- **Styling:** Tailwind CSS
- **Components:** shadcn/ui (Radix UI primitives)
- **Animations:** framer-motion
- **Icons:** lucide-react

### 2. Global "Vibe" & Design Language
The UI must look highly professional, trustworthy, and enterprise-ready. We are targeting C-level executives for corporate insurance. 
- **Theme:** Light mode default. Do NOT use dark/hacker aesthetics. The design should convey transparency, financial stability, and security.
- **Style:** Clean Enterprise SaaS (similar to Stripe or modern banking apps). Use crisp white cards on very subtle off-white backgrounds.
- **Shapes:** Professional and grounded. Use `rounded-xl` for cards with very subtle, elegant drop shadows (`shadow-sm` or `shadow-md`).

## 3. Design Tokens (Tailwind Classes)

### Backgrounds & Surfaces
- **Global Background:** Very subtle, clean off-white (e.g., `bg-slate-50` or `bg-gray-50`).
- **Main Cards/Containers:** Crisp white `bg-white` with a delicate border `border-slate-200` and soft shadow `shadow-lg shadow-slate-200/50`.
- **Tile Hover State:** `hover:border-blue-300 hover:shadow-md hover:bg-blue-50/50 transition-all duration-200`.
- **Active/Selected Tile:** `bg-blue-50 border-blue-600 ring-1 ring-blue-600`.

### Typography
- **Primary Text:** High contrast, serious `text-slate-900`.
- **Secondary Text (Muted):** `text-slate-500`.
- **Fonts:** System sans-serif (Inter/Geist) provided by Next.js.

### Risk Level Colors (Adapted for Light Theme)
- **LOW Risk:** `text-emerald-700`, `bg-emerald-50`, `border-emerald-200`.
- **MEDIUM Risk:** `text-amber-700`, `bg-amber-50`, `border-amber-200`.
- **HIGH Risk:** `text-rose-700`, `bg-rose-50`, `border-rose-200`.

### Call to Action (CTA)
- The final "Zabezpiecz się" button must inspire confidence and security.
- Style: Trustworthy Corporate Blue (e.g., `bg-blue-600 hover:bg-blue-700 text-white`).
- Animation: A subtle scale on hover (`hover:scale-[1.02]`) rather than a glowing pulse, keeping it professional.

## 4. Animation Specifications (Framer Motion)
- **Page/Step Transitions:** Use `<AnimatePresence mode="wait">`. 
  - *Enter:* `initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: "easeOut" }}`
  - *Exit:* `exit={{ opacity: 0, y: -15 }}`
- **Micro-interactions:** All clickable tiles must have a tap state (`whileTap={{ scale: 0.98 }}`).
- **Financial Counter:** The final dollar amount must increment smoothly from $0 to the target number over 2 seconds using a `useSpring` or animated state.

## 5. Layout Rules
- **Container:** Max-width of `max-w-2xl` to keep the widget compact and easy to read on desktop.
- **Centering:** The calculator should be perfectly centered in the viewport (`min-h-screen flex items-center justify-center`).
- **Responsiveness:** Must look perfect on mobile. Stack tiles vertically (`flex-col`) on small screens and horizontally (`md:grid-cols-2` or `md:grid-cols-3`) on larger screens.
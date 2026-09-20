# Product Requirements Document (PRD)
**Product:** B2B Cyber Risk Calculator (Lead Generation Widget)
**Target Audience:** Business owners, IT directors, and C-level executives seeking cyber insurance.
**Primary Goal:** Maximize form conversion (lead capture) by providing immediate, high-impact, personalized value (a risk audit) with minimal user friction.

## 1. UX Philosophy & Core Flow
This is not a traditional form; it is an interactive audit experience. We must eliminate "form fatigue."
- **Zero Typing:** The entire input process must be click-based using large, accessible hit areas (tiles/cards).
- **Psychological Friction:** We introduce an artificial delay (loading state) before the result. This cognitive bias (Labor Illusion) makes the user value the result more, increasing the likelihood they will click the CTA.
- **Progressive Disclosure:** Only show one step or clearly separated sections at a time to avoid overwhelming the user.

## 2. User Journey (3-Step State Machine)

### State 1: Input (The Questionnaire)
The user answers three questions via selectable UI tiles.
*   **Question 1: Industry (Branża)**
    *   Options: Technology/Finance, E-commerce/Retail, Healthcare, Manufacturing/Other.
    *   UI: Large grid tiles with relevant `lucide-react` icons.
*   **Question 2: Company Size (Liczba pracowników)**
    *   Options: 1-10, 11-50, 51-200, 200+
    *   UI: Horizontal segmented control or compact cards.
*   **Question 3: Remote Work (Praca zdalna)**
    *   Options: Fully Remote, Hybrid, Office Only.
    *   UI: Cards with icons.
*   **Action:** A primary "Calculate My Risk" button that becomes active ONLY when all 3 questions are answered.

### State 2: Processing (The Labor Illusion)
*   **Trigger:** User clicks "Calculate My Risk".
*   **Duration:** Exactly 1.5 to 2 seconds.
*   **UI:** Hide the form. Show a centered `shadcn/ui` Progress bar or a pulsing spinner.
*   **Microcopy:** Cycle through dynamic text (e.g., "Analyzing industry threats...", "Evaluating remote vulnerabilities...", "Generating risk report...").

### State 3: The Result (The Hook)
*   **Visual Hierarchy:** The Risk Level is the focal point, followed by the Financial Loss counter, ending with the CTA.
*   **Risk Level Indicator:** 
    *   LOW (Emerald Green)
    *   MEDIUM (Amber/Yellow)
    *   HIGH (Destructive/Red)
*   **Financial Impact:** An animated counter (using Framer Motion) counting up from $0 to the estimated loss amount.
*   **Call to Action (CTA):** A highly visible, pulsing, or glowing primary button: "Zabezpiecz się" (Secure Your Business).

## 3. Business Logic (Risk Engine Algorithm)
To ensure the prototype functions deterministically without needing a backend, use this simple scoring system:

**Points Assignment:**
- *Industry:* Tech/Finance (3), E-commerce/Retail (2), Healthcare (2), Manufacturing/Other (1)
- *Size:* 1-10 (1), 11-50 (2), 51-200 (3), 200+ (4)
- *Remote:* Fully Remote (3), Hybrid (2), Office Only (0)

**Risk Tier Output:**
Calculate Total Score = (Industry + Size + Remote)
- **Score 2 - 4:** Risk Level = LOW. Estimated Loss: $15,000 - $50,000
- **Score 5 - 7:** Risk Level = MEDIUM. Estimated Loss: $50,000 - $250,000
- **Score 8 - 10:** Risk Level = HIGH. Estimated Loss: $250,000 - $1,500,000+

## 4. Accessibility & Error Handling
- All clickable tiles must have clear `focus-visible` states for keyboard navigation.
- If a user tries to submit without answering all questions, highlight the missing fields with a subtle shake animation (framer-motion) and a red border.
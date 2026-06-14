export type Option = { value: string; label: string; emoji?: string; image?: string; imageFemale?: string; color?: string }

export type Plan = {
  id: string
  name: string
  price: string
  perDay: string
  old?: string
  popular?: boolean
}

export type Step =
  | { id: string; type: 'gender'; title: string; accent?: string; subtitle?: string; disclaimer?: string; options: Option[]; saveAs: string }
  | { id: string; type: 'single'; title: string; subtitle?: string; options: Option[]; image?: string; saveAs?: string }
  | { id: string; type: 'scale'; title: string; subtitle?: string; options: Option[]; image?: string; saveAs?: string }
  | { id: string; type: 'multi'; title: string; subtitle?: string; options: Option[]; max?: number; image?: string; saveAs?: string }
  | { id: string; type: 'info'; title: string; body?: string; callout?: string; goldWords?: string[]; card?: boolean; emoji?: string; image?: string; fullBleed?: boolean; cta?: string }
  | { id: string; type: 'input'; field: 'name' | 'email'; title: string; subtitle?: string; placeholder: string; image?: string; cta?: string; saveAs: string }
  | { id: string; type: 'loader'; title: string; duration?: number }
  | { id: string; type: 'summary'; title: string; body?: string; image?: string; cta?: string }
  | { id: string; type: 'paywall'; title: string; subtitle?: string; plans: Plan[]; cta?: string }
  | { id: string; type: 'upsell'; title: string; body?: string; image?: string; price: string; accept: string; decline: string }
  | { id: string; type: 'success'; title: string; body?: string; cta?: string }

export type Answers = Record<string, string | string[]>

// Step types that count as "questions" for the progress bar.
export const QUESTION_TYPES = ['gender', 'single', 'scale', 'multi', 'input'] as const

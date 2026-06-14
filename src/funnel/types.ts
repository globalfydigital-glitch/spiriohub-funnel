export type Option = { value: string; label: string; emoji?: string; image?: string; imageFemale?: string; color?: string }

export type Plan = {
  id: string
  name: string
  price: string
  perDay: string
  old?: string
  popular?: boolean
}

// 3-in-1 bundle line items.
export type BundleItem = { name: string; desc?: string; oldPrice?: string; priceLabel: string; free?: boolean }

// One stage of the "Creating your plan" multi-stage loader.
export type LoaderStage = {
  label: string
  modal?: { question: string; prompt: string; no: string; yes: string }
  testimonial: { rating: number; title: string; name: string; quote: string }
}

// One row in the result/summary breakdown.
export type SummaryRow = { title: string; description: string; emoji?: string }

// Authority/credibility card (university logos screen).
export type InfoCard = { image: string; text: string; gold?: string[] }

export type Step =
  | { id: string; type: 'gender'; title: string; accent?: string; subtitle?: string; disclaimer?: string; options: Option[]; saveAs: string }
  | { id: string; type: 'single'; title: string; subtitle?: string; options: Option[]; image?: string; saveAs?: string; hideProgress?: boolean }
  | { id: string; type: 'scale'; title: string; subtitle?: string; options: Option[]; image?: string; saveAs?: string }
  | { id: string; type: 'multi'; title: string; subtitle?: string; options: Option[]; max?: number; image?: string; saveAs?: string; hasOther?: boolean }
  | {
      id: string; type: 'info'; title: string; titleGold?: string; subtitle?: string; body?: string
      callout?: string; goldWords?: string[]; card?: boolean; emoji?: string; image?: string
      fullBleed?: boolean; waveform?: boolean; sequential?: boolean; cta?: string; decline?: string; infoCards?: InfoCard[]
    }
  | {
      id: string; type: 'input'; field: 'name' | 'email'; title: string; titleGold?: string; subtitle?: string
      placeholder: string; image?: string; caption?: string; captionAccent?: string; tip?: string
      error?: string; skip?: string; cta?: string; saveAs: string
    }
  | { id: string; type: 'loader'; title: string; titleGold?: string; duration?: number; stages?: LoaderStage[] }
  | {
      id: string; type: 'summary'; title: string; titleAccent?: string; body?: string; image?: string; cta?: string
      alertTitle?: string; alertDescription?: string; gaugeValue?: number; gaugeTarget?: string
      rows?: SummaryRow[]; goalFrom?: string
    }
  | { id: string; type: 'plan-chart'; title: string; goldWords?: string[]; weeks: string[]; goalLabel?: string; disclaimer?: string; cta?: string; goalFrom?: string }
  | { id: string; type: 'eventchart'; goalFrom?: string; defaultGoal?: string; title: string; subtitle?: string; milestones: string[]; footnote?: string; cta?: string }
  | {
      id: string; type: 'scratch'; title: string; goldWords?: string[]; subtitle?: string; instruction: string
      scratchValue: string; scratchValueLabel: string; revealEmoji?: string; revealTitle: string
      revealSubtitle?: string; revealDiscount: string; revealNote?: string; cta: string
    }
  | {
      id: string; type: 'signup'; title: string; subtitle?: string; tipTitle?: string; tipBody?: string
      emailPlaceholder: string; emailError?: string; passwordPlaceholder: string; passwordHelper?: string
      cta?: string; saveEmailAs: string; savePasswordAs: string
    }
  | {
      id: string; type: 'paywall'; title: string; titleGold?: string; subtitle?: string; plans: Plan[]; cta?: string
      moneyBackTitle?: string; moneyBackBody?: string; moneyBackLinkPrefix?: string; moneyBackLinkText?: string; moneyBackLinkUrl?: string
    }
  | {
      id: string; type: 'upsell'; title: string; titleGold?: string; body?: string; image?: string
      price: string; oldPrice?: string; badge?: string; items?: BundleItem[]; accept: string; decline: string; note?: string
    }
  | {
      id: string; type: 'success'; title: string; freeCourse?: string; goldWords?: string[]; steps?: string[]
      cta?: string; webLinkLabel?: string; webLinkUrl?: string; loginLinkText?: string
      supportText?: string; supportEmail?: string; progressChips?: string[]; supportTag?: string; body?: string
    }

export type Answers = Record<string, string | string[]>

// Step types that count as "questions" for the progress bar.
export const QUESTION_TYPES = ['gender', 'single', 'scale', 'multi', 'input'] as const

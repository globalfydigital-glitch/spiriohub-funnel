import { useEffect, useState } from 'react'
import type { Step, Answers, Option, Plan, BundleItem, LoaderStage, SummaryRow, InfoCard } from './types'

const RED = '#e0584f'

/* ------------------------------ Token helpers ----------------------------- */
// Split a string and paint the matched words in accent gold.
function gold(text: string, words?: string[]) {
  if (!text) return text
  if (!words || !words.length) return text
  const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const parts = text.split(new RegExp('(' + words.map(esc).join('|') + ')', 'g'))
  return parts.map((p, i) => (words.includes(p) ? <span key={i} className="text-gold">{p}</span> : <span key={i}>{p}</span>))
}

// Consciousness-scale row color: cyan (top / high vibration) -> red (bottom / low).
function scaleColor(i: number, n: number): string {
  const t = n > 1 ? i / (n - 1) : 0
  const hue = 190 * Math.pow(1 - t, 1.6)
  return `hsl(${Math.round(hue)}, 80%, 62%)`
}

// Build a single horizontal sine-wave path for one consciousness level.
function wavePath(w: number, yc: number, amp: number, wl: number): string {
  let d = `M0 ${yc.toFixed(2)}`
  for (let x = 2; x <= w; x += 2) {
    const y = yc + amp * Math.sin((2 * Math.PI * x) / wl)
    d += ` L${x} ${y.toFixed(2)}`
  }
  return d
}

// Goal value -> display word (lowercase, used inside sentences).
const GOAL_WORDS: Record<string, string> = {
  love: 'love', abundance: 'abundance', success: 'success', joy: 'joy', confidence: 'confidence', 'dream-life': 'dream life',
}
function firstGoal(answers: Answers): string | undefined {
  const g = answers['goal']
  if (Array.isArray(g)) return g[0]
  return typeof g === 'string' ? g : undefined
}
function goalWord(answers: Answers, fallback = 'love'): string {
  const g = firstGoal(answers)
  return (g && GOAL_WORDS[g]) || GOAL_WORDS[fallback] || fallback
}
function cap(s: string) {
  return s.length ? s.charAt(0).toUpperCase() + s.slice(1) : s
}
// Resolve {{name}} / {{goal}} / {goal} tokens against the collected answers.
function fill(text: string | undefined, answers: Answers): string {
  if (!text) return ''
  const name = (answers['name'] as string) || ''
  let s = text
  if (s.includes('{{name}}')) s = name ? s.replace(/\{\{name\}\}/g, name) : s.replace(/\{\{name\}\},?\s*/g, '')
  if (s.includes('{{goal}}')) s = s.replace(/\{\{goal\}\}/g, cap(goalWord(answers)))
  if (s.includes('{goal}')) s = s.replace(/\{goal\}/g, goalWord(answers))
  return cap(s)
}

/* ------------------------------- UI helpers ------------------------------- */
function Title({ children }: { children: React.ReactNode }) {
  return <h1 className="text-[1.6rem] leading-tight font-semibold text-white text-center">{children}</h1>
}
function Subtitle({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted text-center mt-2">{children}</p>
}
function PrimaryButton({
  children,
  disabled,
  onClick,
}: {
  children: React.ReactNode
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-2xl bg-[#1f9d6b] text-white font-semibold py-4 text-base transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 active:scale-[0.99]"
    >
      {children}
    </button>
  )
}
function DeclineButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full text-muted text-sm py-2 hover:text-white transition-colors">
      {children}
    </button>
  )
}

function OptionCard({
  option,
  selected,
  onClick,
}: {
  option: Option
  selected?: boolean
  onClick: () => void
}) {
  // Answer button: dark with a thin border by default; fills with its color only when selected.
  return (
    <button
      onClick={onClick}
      style={selected && option.color ? { backgroundColor: option.color } : undefined}
      className={[
        'w-full flex items-center gap-3 rounded-2xl border px-5 py-4 text-left transition-all active:scale-[0.99]',
        selected
          ? option.color
            ? 'border-transparent text-white'
            : 'border-gold bg-gold/10 text-white'
          : 'border-white/15 bg-white/[0.03] text-white/90 hover:border-white/40 hover:bg-white/[0.06]',
      ].join(' ')}
    >
      {option.emoji && <span className="text-xl">{option.emoji}</span>}
      <span className="font-medium">{option.label}</span>
      {selected && !option.color && <span className="ml-auto text-gold">✓</span>}
    </button>
  )
}

// Multi-select option: dark card + right-side check circle (empty -> checked).
function MultiOptionCard({
  option,
  selected,
  onClick,
}: {
  option: Option
  selected?: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={[
        'w-full flex items-center gap-3 rounded-2xl border px-5 py-4 text-left transition-all active:scale-[0.99]',
        selected
          ? 'border-white/45 bg-white/[0.07] text-white'
          : 'border-white/12 bg-white/[0.03] text-white/90 hover:border-white/30 hover:bg-white/[0.05]',
      ].join(' ')}
    >
      {option.emoji && <span className="text-xl">{option.emoji}</span>}
      <span className="font-medium">{option.label}</span>
      <span
        aria-hidden
        className="ml-auto flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-2 transition-colors"
        style={selected ? { borderColor: 'rgba(255,255,255,0.7)', backgroundColor: 'rgba(255,255,255,0.12)' } : { borderColor: 'rgba(255,255,255,0.28)' }}
      >
        {selected && <span className="text-[13px] font-bold leading-none text-white">✓</span>}
      </span>
    </button>
  )
}

// Hero image shown on info / summary screens.
function Hero({ src, fallbackEmoji, className }: { src?: string; fallbackEmoji?: string; className?: string }) {
  if (src) {
    return (
      <img
        src={src}
        alt=""
        loading="lazy"
        className={className ?? 'mx-auto mb-5 max-h-60 w-auto max-w-xs rounded-2xl object-contain'}
      />
    )
  }
  if (fallbackEmoji) return <div className="mb-2 text-center text-6xl">{fallbackEmoji}</div>
  return null
}

// Two-tone title: white base + gold accent appended.
function RichTitle({ title, accent, accentColor }: { title: string; accent?: string; accentColor?: string }) {
  return (
    <h1 className="text-[1.7rem] leading-tight font-semibold text-white text-center">
      {title}
      {accent && <span style={accentColor ? { color: accentColor } : undefined} className={accentColor ? '' : 'text-gold'}>{accent}</span>}
    </h1>
  )
}

function Disclaimer({ text }: { text: string }) {
  const parts = text.split(/(Terms of Use and Service|Privacy Policy|Cookie Policy)/g)
  return (
    <p className="text-[11px] leading-relaxed text-muted mt-2">
      {parts.map((p, i) =>
        /Terms of Use and Service|Privacy Policy|Cookie Policy/.test(p) ? <u key={i}>{p}</u> : <span key={i}>{p}</span>,
      )}
    </p>
  )
}

// Gold callout: whole line gold, or only the goldWords gold if given.
function Callout({ text, goldWords }: { text: string; goldWords?: string[] }) {
  if (!goldWords || !goldWords.length) {
    return <p className="mt-3 text-sm font-semibold leading-relaxed text-gold">{text}</p>
  }
  return <p className="text-sm font-semibold leading-relaxed text-white">{gold(text, goldWords)}</p>
}

// Star rating (precise partial fill via CSS clip — no obscure glyphs).
function Stars({ rating }: { rating: number }) {
  const pct = Math.max(0, Math.min(100, (rating / 5) * 100))
  return (
    <span className="relative inline-block text-sm leading-none" aria-label={`${rating} / 5`}>
      <span className="text-gold/25">★★★★★</span>
      <span className="absolute left-0 top-0 overflow-hidden whitespace-nowrap text-gold" style={{ width: `${pct}%` }}>★★★★★</span>
    </span>
  )
}

// Small animated sound-wave / equalizer accent shown above the title on the
// full-bleed teaser screens (compact, like the original).
const WAVE_BARS = Array.from({ length: 24 }, (_, i) => {
  const env = Math.sin((Math.PI * i) / 23) // symmetric envelope (taller in the middle)
  const jitter = 0.5 + 0.5 * Math.abs(Math.sin(i * 1.9))
  return { h: Math.round(4 + env * 16 * jitter), delay: ((i * 41) % 100) / 150, dur: 0.8 + ((i * 53) % 60) / 100 }
})
function Waveform() {
  return (
    <div className="flex items-center justify-center gap-[1.5px]" aria-hidden style={{ height: 24 }}>
      {WAVE_BARS.map((b, i) => (
        <span
          key={i}
          className="w-[2px] rounded-full bg-white/80"
          style={{ height: `${b.h}px`, transformOrigin: 'center', animation: `wave ${b.dur}s ease-in-out ${b.delay}s infinite alternate` }}
        />
      ))}
    </div>
  )
}

// Consciousness scale: each text row is in the SAME grid row as its own wave line,
// so labels and waves always align. Waves go flat/high-frequency at the top
// (Expansive) to large/low-frequency at the bottom (Destructive).
function ConsciousnessChart({ rows }: { rows: { label: string; value: string }[] }) {
  const n = rows.length
  const ROW = 15 // px per row
  const W = 150 // wave viewBox width
  return (
    <div className="flex items-stretch gap-2" style={{ height: n * ROW }}>
      <div className="flex flex-1 flex-col">
        {rows.map((r, i) => {
          const color = scaleColor(i, n)
          const t = n > 1 ? i / (n - 1) : 0
          const amp = Math.pow(t, 1.5) * 5.6
          const wl = 7 + t * 28
          return (
            <div key={r.label} className="flex items-center" style={{ height: ROW }}>
              <div
                className="flex w-[108px] shrink-0 items-baseline justify-between pr-1.5 text-[9px] font-semibold leading-none"
                style={{ color }}
              >
                <span className="truncate">{r.label}</span>
                <span className="tabular-nums">{r.value}</span>
              </div>
              <svg viewBox={`0 0 ${W} ${ROW}`} preserveAspectRatio="none" className="h-full flex-1" aria-hidden>
                <path d={wavePath(W, ROW / 2, amp, wl)} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
              </svg>
            </div>
          )
        })}
      </div>
      {/* Expansive (top) / Destructive (bottom) with arrows */}
      <div className="flex w-[58px] shrink-0 flex-col items-center justify-between py-0.5">
        <span className="text-[9px] font-bold leading-none" style={{ color: scaleColor(0, n) }}>Expansive</span>
        <svg viewBox="0 0 20 100" preserveAspectRatio="none" className="w-4 flex-1" aria-hidden>
          <defs>
            <linearGradient id="arrUp" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0" stopColor="#a3e635" /><stop offset="1" stopColor="#22d3ee" />
            </linearGradient>
            <linearGradient id="arrDn" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#f59e0b" /><stop offset="1" stopColor="#f87171" />
            </linearGradient>
          </defs>
          <line x1="10" y1="46" x2="10" y2="9" stroke="url(#arrUp)" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
          <path d="M5 16 L10 6 L15 16" fill="none" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          <line x1="10" y1="54" x2="10" y2="91" stroke="url(#arrDn)" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
          <path d="M5 84 L10 94 L15 84" fill="none" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        </svg>
        <span className="text-[9px] font-bold leading-none" style={{ color: scaleColor(n - 1, n) }}>Destructive</span>
      </div>
    </div>
  )
}

// Photo card: image on top + colored bar with label + chevron (gender / age).
function PhotoCard({
  option,
  aspect = 'aspect-[4/5]',
  onClick,
}: {
  option: Option
  aspect?: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="group overflow-hidden rounded-2xl border border-cardborder transition-all hover:border-violet/60 active:scale-[0.99]"
    >
      {option.image && <img src={option.image} alt="" loading="lazy" className={`w-full ${aspect} object-cover`} />}
      <div className="flex items-center justify-between px-4 py-3 font-medium text-white" style={{ backgroundColor: option.color }}>
        <span>{option.label}</span>
        <span aria-hidden className="text-lg leading-none font-semibold text-white">›</span>
      </div>
    </button>
  )
}

/* ------------------------------ Gender screen ----------------------------- */
function GenderScreen({
  step,
  onAnswer,
  onNext,
}: {
  step: Extract<Step, { type: 'gender' }>
  onAnswer: (k: string, v: string) => void
  onNext: () => void
}) {
  return (
    <Stack>
      <RichTitle title={step.title} accent={step.accent} />
      {step.subtitle && <Subtitle>{step.subtitle}</Subtitle>}
      <div className="grid grid-cols-2 gap-3 mt-6">
        {step.options.map((o) => (
          <PhotoCard key={o.value} option={o} onClick={() => { onAnswer(step.saveAs, o.value); onNext() }} />
        ))}
      </div>
      <div className="mt-7 text-center">
        <div className="text-xs font-bold tracking-wider text-white/90">1-MINUTE QUIZ</div>
        {step.disclaimer && <Disclaimer text={step.disclaimer} />}
      </div>
    </Stack>
  )
}

/* ------------------------------- Step view -------------------------------- */
export function StepView({
  step,
  answers,
  onAnswer,
  onNext,
}: {
  step: Step
  answers: Answers
  onAnswer: (key: string, value: string | string[]) => void
  onNext: () => void
}) {
  switch (step.type) {
    case 'gender':
      return <GenderScreen step={step} onAnswer={onAnswer} onNext={onNext} />

    case 'single':
    case 'scale': {
      const hasImages = step.options.some((o) => o.image)
      const choose = (v: string) => { if (step.saveAs) onAnswer(step.saveAs, v); onNext() }
      return (
        <Stack>
          {'image' in step && step.image ? <Hero src={step.image} /> : null}
          <Title>{step.title}</Title>
          {'subtitle' in step && step.subtitle && <Subtitle>{step.subtitle}</Subtitle>}
          {hasImages ? (
            <div className="grid grid-cols-2 gap-3 mt-6">
              {step.options.map((o) => {
                const female = answers.gender === 'female' && o.imageFemale
                const opt = female ? { ...o, image: o.imageFemale } : o
                return <PhotoCard key={o.value} option={opt} aspect="aspect-[4/3]" onClick={() => choose(o.value)} />
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 mt-6">
              {step.options.map((o) => (
                <OptionCard key={o.value} option={o} onClick={() => choose(o.value)} />
              ))}
            </div>
          )}
        </Stack>
      )
    }

    case 'multi':
      return <MultiView step={step} answers={answers} onAnswer={onAnswer} onNext={onNext} />

    case 'input':
      return <InputView step={step} answers={answers} onAnswer={onAnswer} onNext={onNext} />

    case 'info':
      return <InfoView step={step} answers={answers} onNext={onNext} />

    case 'summary':
      return <SummaryView step={step} answers={answers} onNext={onNext} />

    case 'plan-chart':
      return <PlanChartView step={step} answers={answers} onNext={onNext} />

    case 'eventchart':
      return <EventChartView step={step} answers={answers} onNext={onNext} />

    case 'loader':
      return <LoaderView step={step} onNext={onNext} />

    case 'ringloader':
      return <RingLoaderView step={step} onNext={onNext} />

    case 'scratch':
      return <ScratchView step={step} onNext={onNext} />

    case 'signup':
      return <SignupView step={step} answers={answers} onAnswer={onAnswer} onNext={onNext} />

    case 'paywall':
      return <PaywallView step={step} onAnswer={onAnswer} onNext={onNext} />

    case 'upsell':
      return <UpsellView step={step} onAnswer={onAnswer} onNext={onNext} />

    case 'success':
      return <SuccessView step={step} />
  }
}

/* ------------------------------- Sub-views -------------------------------- */
function Stack({ children, center }: { children: React.ReactNode; center?: boolean }) {
  return <div className={`flex flex-col ${center ? 'justify-center min-h-[60vh]' : ''} animate-fadeUp`}>{children}</div>
}

/* ---- Info (teasers, cards, authority cards, full-bleed, subscribe) ---- */
function InfoView({
  step,
  answers,
  onNext,
}: {
  step: Extract<Step, { type: 'info' }>
  answers: Answers
  onNext: () => void
}) {
  const title = fill(step.title, answers)
  const calloutText = fill(step.callout, answers)
  // Sequential reveal: show the title first, then fade in the callout a few seconds later.
  const [revealed, setRevealed] = useState(!step.sequential)
  useEffect(() => {
    if (!step.sequential) return
    const t = setTimeout(() => setRevealed(true), 2200)
    return () => clearTimeout(t)
  }, [step.sequential])
  const calloutInner = step.callout ? <Callout text={calloutText} goldWords={step.goldWords} /> : null
  const callout = calloutInner && step.sequential
    ? <div className={`transition-opacity duration-700 ${revealed ? 'opacity-100' : 'opacity-0'}`}>{calloutInner}</div>
    : calloutInner
  const titleNode = step.titleGold ? <Title>{gold(title, [step.titleGold])}</Title> : <Title>{title}</Title>

  // Authority / credibility cards (university screen)
  if (step.infoCards && step.infoCards.length) {
    return (
      <Stack center>
        {titleNode}
        {step.subtitle && <Subtitle>{step.subtitle}</Subtitle>}
        <div className="mt-6 space-y-3">
          {step.infoCards.map((c: InfoCard, i) => (
            <div key={i} className="flex items-center gap-4 rounded-2xl border border-cardborder bg-white/[0.04] p-4">
              <img src={c.image} alt="" loading="lazy" className="h-10 w-16 shrink-0 object-contain" />
              <p className="text-[13px] leading-snug text-white/90">{gold(c.text, c.gold)}</p>
            </div>
          ))}
        </div>
        <div className="mt-8">
          <PrimaryButton onClick={onNext}>{step.cta ?? 'Continue'}</PrimaryButton>
        </div>
      </Stack>
    )
  }

  // Image card (frequency chart). With `scale`, show the consciousness scale beside the waves.
  if (step.card && step.image) {
    const scaleRows = step.scale
    return (
      <Stack center>
        {titleNode}
        {step.subtitle && <Subtitle>{step.subtitle}</Subtitle>}
        <div className="mx-auto mt-6 w-full max-w-[340px] rounded-2xl border border-cardborder bg-white/[0.04] p-3">
          {scaleRows && scaleRows.length ? (
            <ConsciousnessChart rows={scaleRows} />
          ) : (
            <img src={step.image} alt="" loading="lazy" className="mx-auto w-full rounded-xl object-contain" />
          )}
          {step.callout && <div className="mt-4 text-left">{callout}</div>}
        </div>
        <div className="mt-8">
          <PrimaryButton onClick={onNext}>{step.cta ?? 'Continue'}</PrimaryButton>
        </div>
      </Stack>
    )
  }

  // Full-bleed background teaser (signals / coping / self-conscious / really-wish / consent)
  if (step.fullBleed && step.image) {
    return (
      <>
        <div
          className="fixed inset-0 -z-10 bg-cover bg-center"
          style={{ backgroundImage: `linear-gradient(rgba(20,19,25,0.80), rgba(20,19,25,0.80)), url(${step.image})` }}
        />
        <div className="flex min-h-[78vh] flex-col animate-fadeUp">
          <div className="text-center" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.7)' }}>
            {step.waveform && <div className="mb-5 flex justify-center"><Waveform /></div>}
            {titleNode}
            {step.body && <Subtitle>{step.body}</Subtitle>}
            {callout}
          </div>
          <div className="flex-1" />
          <div className="space-y-2 pt-6">
            <PrimaryButton onClick={onNext}>{step.cta ?? 'Continue'}</PrimaryButton>
            {step.decline && <DeclineButton onClick={onNext}>{step.decline}</DeclineButton>}
          </div>
        </div>
      </>
    )
  }

  // Default info (hero + title + callout)
  return (
    <Stack center>
      <Hero src={step.image} fallbackEmoji={step.emoji} />
      {titleNode}
      {step.subtitle && <Subtitle>{step.subtitle}</Subtitle>}
      {step.body && <Subtitle>{step.body}</Subtitle>}
      {callout}
      <div className="mt-8 space-y-2">
        <PrimaryButton onClick={onNext}>{step.cta ?? 'Continue'}</PrimaryButton>
        {step.decline && <DeclineButton onClick={onNext}>{step.decline}</DeclineButton>}
      </div>
    </Stack>
  )
}

/* ---- Summary (result reveal: gauge + alert + breakdown) ---- */
function SummaryView({
  step,
  answers,
  onNext,
}: {
  step: Extract<Step, { type: 'summary' }>
  answers: Answers
  onNext: () => void
}) {
  const v = step.gaugeValue ?? 0
  const accent = step.titleAccent
  const titleNode = accent
    ? <RichTitle title={step.title.replace(accent, '')} accent={accent} accentColor={RED} />
    : <Title>{step.title}</Title>
  return (
    <Stack center>
      <Hero src={step.image} className="mx-auto mb-5 h-28 w-28 rounded-full object-cover" />
      {titleNode}
      {step.body && <Subtitle>{step.body}</Subtitle>}

      {step.gaugeValue != null && (
        <div className="mt-7">
          <div className="relative">
            <div className="absolute -top-6 -translate-x-1/2" style={{ left: `${v}%` }}>
              <span className="rounded-md bg-white px-1.5 py-0.5 text-[10px] font-bold text-ink">You</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-cardborder">
              <div className="h-full rounded-full" style={{ width: `${v}%`, background: `linear-gradient(90deg, ${RED}, #f5c451)` }} />
            </div>
          </div>
          <div className="mt-2 flex justify-between text-[10px] uppercase tracking-wide text-muted">
            <span>Low</span><span>Medium</span><span>Normal</span><span>High</span>
          </div>
          {step.gaugeTarget && <p className="mt-1 text-right text-[11px] text-muted">{step.gaugeTarget}</p>}
        </div>
      )}

      {step.alertTitle && (
        <div className="mt-5 rounded-2xl border p-4" style={{ borderColor: 'rgba(224,88,79,0.4)', background: 'rgba(224,88,79,0.08)' }}>
          <div className="text-sm font-bold tracking-wide" style={{ color: RED }}>⚠️ {step.alertTitle}</div>
          {step.alertDescription && <p className="mt-1.5 text-[13px] leading-snug text-white/85">{step.alertDescription}</p>}
        </div>
      )}

      {step.rows && step.rows.length > 0 && (
        <div className="mt-5 space-y-2">
          {step.rows.map((r: SummaryRow, i) => (
            <div key={i} className="flex items-start gap-3 rounded-2xl border border-cardborder bg-white/[0.03] px-4 py-3">
              {r.emoji && <span className="text-lg leading-none">{r.emoji}</span>}
              <div>
                <div className="text-[13px] font-semibold text-white">{r.title}</div>
                <div className="text-[13px] text-muted">{fill(r.description, answers)}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8">
        <PrimaryButton onClick={onNext}>{step.cta ?? 'Continue'}</PrimaryButton>
      </div>
    </Stack>
  )
}

/* ---- Rising-curve SVG used by plan-chart + event-chart ---- */
function RisingCurve({ dots }: { dots?: { x: number; y: number; label?: string }[] }) {
  // viewBox 0..300 x, 0..160 y. Single smooth rising path bottom-left -> top-right.
  const path = 'M4,150 C70,140 110,96 150,74 S232,26 296,12'
  const area = path + ' L296,158 L4,158 Z'
  return (
    <svg viewBox="0 0 300 160" className="w-full" role="img" aria-label="growth curve">
      <defs>
        <linearGradient id="curveArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f5c451" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#f5c451" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="curveStroke" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#f5c451" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#curveArea)" />
      <path d={path} fill="none" stroke="url(#curveStroke)" strokeWidth="3" strokeLinecap="round" />
      {dots?.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r="5" fill="#f5c451" stroke="#141319" strokeWidth="2" />
      ))}
    </svg>
  )
}

function PlanChartView({
  step,
  answers,
  onNext,
}: {
  step: Extract<Step, { type: 'plan-chart' }>
  answers: Answers
  onNext: () => void
}) {
  const title = fill(step.title, answers)
  return (
    <Stack center>
      <Title>{gold(title, step.goldWords)}</Title>
      <div className="mt-6 rounded-2xl border border-cardborder bg-white/[0.04] p-4">
        <div className="relative">
          <RisingCurve dots={[{ x: 296, y: 12 }]} />
          {step.goalLabel && (
            <span className="absolute right-1 top-0 rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold text-ink">
              {step.goalLabel}
            </span>
          )}
        </div>
        <div className="mt-1 flex justify-between px-1 text-[10px] text-muted">
          {step.weeks.map((w) => <span key={w}>{w}</span>)}
        </div>
      </div>
      {step.disclaimer && <p className="mt-3 text-center text-[11px] text-muted">{step.disclaimer}</p>}
      <div className="mt-8">
        <PrimaryButton onClick={onNext}>{step.cta ?? 'Continue'}</PrimaryButton>
      </div>
    </Stack>
  )
}

function EventChartView({
  step,
  answers,
  onNext,
}: {
  step: Extract<Step, { type: 'eventchart' }>
  answers: Answers
  onNext: () => void
}) {
  const isDream = firstGoal(answers) === 'dream-life'
  const word = goalWord(answers, step.defaultGoal ?? 'love')
  // Compute month/date span client-side to avoid SSR hydration mismatch.
  const [span, setSpan] = useState<{ start: string; end: string; date: string } | null>(null)
  useEffect(() => {
    const now = new Date()
    const end = new Date()
    end.setDate(now.getDate() + 28)
    setSpan({
      start: now.toLocaleDateString('en-US', { month: 'long' }),
      end: end.toLocaleDateString('en-US', { month: 'long' }),
      date: end.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }),
    })
  }, [])

  const title = isDream
    ? "The last plan you’ll ever need to your dream life"
    : `The last plan you’ll ever need to attract ${word} into your life`
  const titleGold = isDream ? 'your dream life' : `attract ${word} into your life`
  const subtitle = (isDream
    ? 'We predict that you’ll attract dream life by '
    : `We predict that you’ll attract ${word} by `) + (span?.date ?? '…')
  const milestones = step.milestones.map((m) => m.replace('{goal}', word))
  const dots = [
    { x: 32, y: 137 },
    { x: 150, y: 74 },
    { x: 286, y: 16 },
  ]
  return (
    <Stack center>
      <Title>{gold(title, [titleGold])}</Title>
      <p className="mt-2 text-center text-sm text-muted">{gold(subtitle, [word])}</p>
      <div className="mt-6 rounded-2xl border border-cardborder bg-white/[0.04] p-4">
        <div className="relative">
          <RisingCurve dots={dots} />
          {milestones.map((m, i) => {
            const last = i === milestones.length - 1
            const topPct = Math.max(2, (dots[i].y / 160) * 100 - 16)
            const pos: React.CSSProperties = i === 0
              ? { left: '2%' }
              : last
                ? { right: '2%' }
                : { left: `${(dots[i].x / 300) * 100}%`, transform: 'translateX(-50%)' }
            return (
              <span
                key={i}
                className="absolute max-w-[40%] rounded-md bg-ink/80 px-1.5 py-0.5 text-[9px] font-medium leading-tight text-white"
                style={{ ...pos, top: `${topPct}%` }}
              >
                {m}
              </span>
            )
          })}
        </div>
        <div className="mt-1 flex justify-between px-1 text-[10px] text-muted">
          <span>{span?.start ?? ''}</span>
          <span>{span?.end ?? ''}</span>
        </div>
      </div>
      {step.footnote && <p className="mt-3 text-center text-[11px] text-muted">{step.footnote}</p>}
      <div className="mt-8">
        <PrimaryButton onClick={onNext}>{step.cta ?? 'Continue'}</PrimaryButton>
      </div>
    </Stack>
  )
}

/* ---- Multi-select (with optional free-text "Other") ---- */
function MultiView({
  step,
  answers,
  onAnswer,
  onNext,
}: {
  step: Extract<Step, { type: 'multi' }>
  answers: Answers
  onAnswer: (key: string, value: string | string[]) => void
  onNext: () => void
}) {
  const key = step.saveAs ?? step.id
  const selected = (answers[key] as string[]) ?? []
  const [other, setOther] = useState((answers[key + '_other'] as string) ?? '')
  const toggle = (v: string) => onAnswer(key, selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v])
  const showOther = step.hasOther && selected.includes('other')
  return (
    <Stack>
      {step.image ? <Hero src={step.image} /> : null}
      <Title>{step.title}</Title>
      {step.subtitle && <Subtitle>{step.subtitle}</Subtitle>}
      <div className="grid grid-cols-1 gap-3 mt-6">
        {step.options.map((o) => (
          <MultiOptionCard key={o.value} option={o} selected={selected.includes(o.value)} onClick={() => toggle(o.value)} />
        ))}
      </div>
      {showOther && (
        <textarea
          value={other}
          onChange={(e) => { setOther(e.target.value); onAnswer(key + '_other', e.target.value) }}
          placeholder="Type your answer here"
          rows={2}
          className="mt-3 w-full resize-none rounded-2xl border border-cardborder bg-card px-4 py-3 text-white placeholder:text-muted outline-none focus:border-gold"
        />
      )}
      <div className="mt-6">
        <PrimaryButton disabled={selected.length === 0} onClick={onNext}>Continue</PrimaryButton>
      </div>
    </Stack>
  )
}

/* ---- Text input (name / email) ---- */
function InputView({
  step,
  answers,
  onAnswer,
  onNext,
}: {
  step: Extract<Step, { type: 'input' }>
  answers: Answers
  onAnswer: (key: string, value: string) => void
  onNext: () => void
}) {
  const [value, setValue] = useState((answers[step.saveAs] as string) ?? '')
  const [touched, setTouched] = useState(false)
  const valid = step.field === 'email' ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) : value.trim().length > 0
  const submit = () => {
    if (!valid) { setTouched(true); return }
    onAnswer(step.saveAs, value.trim())
    onNext()
  }
  const caption = step.caption && answers.gender === 'female' ? step.caption.replace('men', 'women') : step.caption
  const showError = touched && !valid && step.field === 'email' && value.length > 0 && step.error
  return (
    <Stack center>
      {step.image ? <Hero src={step.image} /> : null}
      {caption && (
        <p className="mb-2 text-center text-sm font-semibold text-white">
          {caption}<span className="text-gold">{step.captionAccent}</span>
        </p>
      )}
      <Title>{step.titleGold ? gold(step.title, [step.titleGold]) : step.title}</Title>
      {step.subtitle && <Subtitle>{step.subtitle}</Subtitle>}
      <input
        autoFocus
        type={step.field === 'email' ? 'email' : 'text'}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => setTouched(true)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        placeholder={step.placeholder}
        className="mt-6 w-full rounded-2xl border border-cardborder bg-card px-4 py-4 text-white placeholder:text-muted outline-none focus:border-gold"
      />
      {showError && <p className="mt-2 text-[12px]" style={{ color: RED }}>{step.error}</p>}
      {step.tip && <p className="mt-3 text-[11px] leading-relaxed text-muted">{step.tip}</p>}
      <div className="mt-6 space-y-2">
        <PrimaryButton disabled={!valid} onClick={submit}>{step.cta ?? 'Continue'}</PrimaryButton>
        {step.skip && <DeclineButton onClick={() => { onAnswer(step.saveAs, ''); onNext() }}>{step.skip}</DeclineButton>}
      </div>
    </Stack>
  )
}

/* ---- Multi-stage "creating your plan" loader ---- */
function LoaderView({ step, onNext }: { step: Extract<Step, { type: 'loader' }>; onNext: () => void }) {
  const stages: LoaderStage[] = step.stages ?? []
  const per = (step.duration ?? 8000) / Math.max(1, stages.length)
  const [si, setSi] = useState(0)
  const [p, setP] = useState(0)
  const [modal, setModal] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (modal || done) return
    if (si >= stages.length) { const t = setTimeout(onNext, 350); return () => clearTimeout(t) }
    setP(0)
    const start = performance.now()
    let raf = 0
    const tick = (t: number) => {
      const pr = Math.min(100, ((t - start) / per) * 100)
      setP(pr)
      if (pr < 100) raf = requestAnimationFrame(tick)
      else {
        if (stages[si].modal) setModal(true)
        else advance()
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [si, modal, done])

  function advance() {
    if (si + 1 >= stages.length) { setDone(true); setTimeout(onNext, 450) }
    else setSi(si + 1)
  }
  const t = stages[Math.min(si, stages.length - 1)]?.testimonial

  return (
    <Stack center>
      <Title>{step.titleGold ? gold(step.title, [step.titleGold]) : step.title}</Title>

      <div className="mt-6 space-y-3 rounded-2xl border border-cardborder bg-white/[0.04] p-4">
        {stages.map((s, i) => {
          const fillPct = i < si || done ? 100 : i === si ? p : 0
          const complete = i < si || done
          return (
            <div key={s.label} className="flex items-center gap-3">
              <div className="flex-1">
                <div className="mb-1 flex items-center justify-between text-[13px]">
                  <span className={complete || i === si ? 'text-white' : 'text-muted'}>{s.label}</span>
                  <span className="tabular-nums text-muted">{Math.round(fillPct)}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-cardborder">
                  <div className="h-full rounded-full bg-gold transition-all" style={{ width: `${fillPct}%` }} />
                </div>
              </div>
              <span className={`w-4 text-center text-gold ${complete ? '' : 'opacity-0'}`}>✓</span>
            </div>
          )
        })}
      </div>

      {t && (
        <div className="mt-4 rounded-2xl border border-cardborder bg-white/[0.03] p-4">
          <div className="flex items-center justify-between">
            <Stars rating={t.rating} />
            <span className="text-[12px] text-muted">{t.name}</span>
          </div>
          <div className="mt-1 text-sm font-semibold text-white">{t.title}</div>
          <p className="mt-1 text-[13px] leading-snug text-white/80">{t.quote}</p>
        </div>
      )}

      {modal && stages[si]?.modal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center">
          <div className="w-full max-w-[420px] rounded-2xl border border-cardborder p-5 animate-fadeUp" style={{ background: '#1a1626' }}>
            <p className="text-center text-base font-semibold text-white">{stages[si].modal!.question}</p>
            <p className="mt-1 text-center text-xs text-muted">{stages[si].modal!.prompt}</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button onClick={() => { setModal(false); advance() }} className="rounded-2xl border border-white/15 bg-white/[0.03] py-3 font-medium text-white hover:border-white/40">
                {stages[si].modal!.no}
              </button>
              <button onClick={() => { setModal(false); advance() }} className="rounded-2xl bg-[#1f9d6b] py-3 font-semibold text-white hover:brightness-110">
                {stages[si].modal!.yes}
              </button>
            </div>
          </div>
        </div>
      )}
    </Stack>
  )
}

/* ---- Circular "analyzing your answers" loader ---- */
function RingLoaderView({ step, onNext }: { step: Extract<Step, { type: 'ringloader' }>; onNext: () => void }) {
  const [pct, setPct] = useState(0)
  useEffect(() => {
    const dur = step.duration ?? 3800
    const start = performance.now()
    let raf = 0
    const tick = (t: number) => {
      const p = Math.min(100, Math.round(((t - start) / dur) * 100))
      setPct(p)
      if (p < 100) raf = requestAnimationFrame(tick)
      else setTimeout(onNext, 450)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [step.duration, onNext])

  const R = 54
  const C = 2 * Math.PI * R
  const off = C * (1 - pct / 100)
  return (
    <>
      {step.image && (
        <div
          className="fixed inset-0 -z-10 bg-cover bg-center"
          style={{ backgroundImage: `linear-gradient(rgba(20,19,25,0.78), rgba(20,19,25,0.78)), url(${step.image})` }}
        />
      )}
      <div className="flex min-h-[78vh] flex-col items-center justify-center animate-fadeUp">
        <div className="relative h-[140px] w-[140px]">
          <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
            <circle cx="70" cy="70" r={R} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="8" />
            <circle
              cx="70" cy="70" r={R} fill="none" stroke="#f5c451" strokeWidth="8" strokeLinecap="round"
              strokeDasharray={C} strokeDashoffset={off} style={{ transition: 'stroke-dashoffset 0.1s linear' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold tabular-nums text-white">{pct}%</div>
        </div>
        <p className="mt-6 text-center text-base font-semibold text-white" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.7)' }}>
          {step.title}
        </p>
      </div>
    </>
  )
}

/* ---- Scratch-and-reveal coupon ---- */
function ScratchView({ step, onNext }: { step: Extract<Step, { type: 'scratch' }>; onNext: () => void }) {
  const [revealed, setRevealed] = useState(false)
  const [modal, setModal] = useState(false)
  const reveal = () => { if (!revealed) { setRevealed(true); setModal(true) } }
  return (
    <Stack center>
      <Title>{gold(step.title, step.goldWords)}</Title>
      {step.subtitle && <Subtitle>{step.subtitle}</Subtitle>}

      <button
        onClick={reveal}
        className="relative mx-auto mt-7 flex aspect-[16/9] w-full max-w-[330px] items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-gold/60 bg-gradient-to-br from-violet/20 to-gold/10"
      >
        {revealed ? (
          <div className="text-center">
            <div className="text-4xl font-extrabold text-gold">{step.scratchValue}</div>
            <div className="text-sm text-white/90">{step.scratchValueLabel}</div>
          </div>
        ) : (
          <span className="text-sm font-bold uppercase tracking-wider text-white/90">🪙 {step.instruction}</span>
        )}
      </button>

      <div className="mt-8">
        <PrimaryButton disabled={!revealed} onClick={onNext}>{step.cta}</PrimaryButton>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-[420px] rounded-2xl border border-cardborder p-6 text-center animate-fadeUp" style={{ background: '#1a1626' }}>
            <div className="text-5xl">{step.revealEmoji}</div>
            <div className="mt-2 text-xl font-bold text-white">{step.revealTitle}</div>
            {step.revealSubtitle && <div className="mt-1 text-sm text-muted">{step.revealSubtitle}</div>}
            <div className="mx-auto mt-4 w-fit rounded-full bg-gold px-4 py-1.5 text-lg font-extrabold text-ink">{step.revealDiscount}</div>
            {step.revealNote && <div className="mt-3 text-[11px] text-muted">{step.revealNote}</div>}
            <div className="mt-5">
              <PrimaryButton onClick={onNext}>{step.cta}</PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </Stack>
  )
}

/* ---- Create-account signup form ---- */
function SignupView({
  step,
  answers,
  onAnswer,
  onNext,
}: {
  step: Extract<Step, { type: 'signup' }>
  answers: Answers
  onAnswer: (key: string, value: string) => void
  onNext: () => void
}) {
  const [email, setEmail] = useState((answers[step.saveEmailAs] as string) ?? '')
  const [pw, setPw] = useState('')
  const [touched, setTouched] = useState(false)
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const pwOk = pw.length >= 6
  const submit = () => {
    if (!emailOk || !pwOk) { setTouched(true); return }
    onAnswer(step.saveEmailAs, email.trim())
    onAnswer(step.savePasswordAs, pw)
    onNext()
  }
  return (
    <Stack center>
      <Title>{step.title}</Title>
      {step.subtitle && <Subtitle>{step.subtitle}</Subtitle>}

      {step.tipTitle && (
        <div className="mt-5 rounded-2xl border border-cardborder bg-white/[0.04] p-4">
          <div className="text-sm font-bold text-gold">{step.tipTitle}</div>
          {step.tipBody && <p className="mt-1 text-[13px] leading-snug text-white/80">{step.tipBody}</p>}
        </div>
      )}

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onBlur={() => setTouched(true)}
        placeholder={step.emailPlaceholder}
        className="mt-5 w-full rounded-2xl border border-cardborder bg-card px-4 py-4 text-white placeholder:text-muted outline-none focus:border-gold"
      />
      {touched && !emailOk && step.emailError && <p className="mt-1.5 text-[12px]" style={{ color: RED }}>{step.emailError}</p>}

      <input
        type="password"
        value={pw}
        onChange={(e) => setPw(e.target.value)}
        onBlur={() => setTouched(true)}
        placeholder={step.passwordPlaceholder}
        className="mt-3 w-full rounded-2xl border border-cardborder bg-card px-4 py-4 text-white placeholder:text-muted outline-none focus:border-gold"
      />
      {step.passwordHelper && (
        <p className="mt-1.5 text-[12px]" style={touched && !pwOk ? { color: RED } : undefined}>
          <span className={touched && !pwOk ? '' : 'text-muted'}>{step.passwordHelper}</span>
        </p>
      )}

      <div className="mt-6">
        <PrimaryButton disabled={!emailOk || !pwOk} onClick={submit}>{step.cta ?? 'Create account'}</PrimaryButton>
      </div>
    </Stack>
  )
}

/* ---- Paywall / selling page ---- */
function PaywallView({
  step,
  onAnswer,
  onNext,
}: {
  step: Extract<Step, { type: 'paywall' }>
  onAnswer: (key: string, value: string) => void
  onNext: () => void
}) {
  const [plan, setPlan] = useState<string>(step.plans.find((p) => p.popular)?.id ?? step.plans[0].id)
  return (
    <Stack>
      <Title>{step.titleGold ? gold(step.title, [step.titleGold]) : step.title}</Title>
      {step.subtitle && <Subtitle>{step.subtitle}</Subtitle>}
      <div className="grid grid-cols-1 gap-3 mt-6">
        {step.plans.map((p: Plan) => (
          <button
            key={p.id}
            onClick={() => setPlan(p.id)}
            className={[
              'relative w-full flex items-center justify-between rounded-2xl border px-4 py-4 text-left transition-all',
              plan === p.id ? 'border-gold bg-gold/10' : 'border-cardborder bg-card hover:border-violet/60',
            ].join(' ')}
          >
            {p.popular && (
              <span className="absolute -top-2 right-4 bg-gold text-ink text-[10px] font-bold px-2 py-0.5 rounded-full">
                MOST POPULAR
              </span>
            )}
            <div>
              <div className="font-semibold text-white">{p.name}</div>
              <div className="text-xs text-muted">
                {p.old && <span className="line-through mr-1">{p.old}</span>}
                {p.price}
              </div>
            </div>
            <div className="text-right">
              <div className="text-gold font-bold">{p.perDay}</div>
              <div className={`mt-1 ml-auto h-4 w-4 rounded-full border ${plan === p.id ? 'bg-gold border-gold' : 'border-muted'}`} />
            </div>
          </button>
        ))}
      </div>
      <div className="mt-6">
        <PrimaryButton onClick={() => { onAnswer('plan', plan); onNext() }}>{step.cta ?? 'Continue'}</PrimaryButton>
      </div>

      {step.moneyBackTitle && (
        <div className="mt-5 rounded-2xl border border-cardborder bg-white/[0.03] p-4 text-center">
          <div className="text-sm font-bold text-gold">🛡️ {step.moneyBackTitle}</div>
          {step.moneyBackBody && <p className="mt-1.5 text-[12px] leading-snug text-white/80">{step.moneyBackBody}</p>}
          {step.moneyBackLinkText && (
            <p className="mt-2 text-[11px] text-muted">
              {step.moneyBackLinkPrefix}
              <a href={step.moneyBackLinkUrl} target="_blank" rel="noreferrer" className="text-gold underline">{step.moneyBackLinkText}</a>
            </p>
          )}
        </div>
      )}
    </Stack>
  )
}

/* ---- Upsell (coach single price + bundle with line items) ---- */
function UpsellView({
  step,
  onAnswer,
  onNext,
}: {
  step: Extract<Step, { type: 'upsell' }>
  onAnswer: (key: string, value: string) => void
  onNext: () => void
}) {
  return (
    <Stack center>
      <Hero src={step.image} fallbackEmoji="🎁" />
      <Title>{step.titleGold ? gold(step.title, [step.titleGold]) : step.title}</Title>
      {step.body && <Subtitle>{step.body}</Subtitle>}

      {step.badge && (
        <div className="mx-auto mt-4 w-fit rounded-full bg-gold/15 px-3 py-1 text-xs font-bold text-gold">{step.badge}</div>
      )}

      <div className="mt-3 flex items-baseline justify-center gap-2">
        {step.oldPrice && <span className="text-lg text-muted line-through">{step.oldPrice}</span>}
        <span className="text-2xl font-bold text-gold">{step.price}</span>
      </div>

      {step.items && step.items.length > 0 && (
        <div className="mt-5 space-y-2 text-left">
          {step.items.map((it: BundleItem, i) => (
            <div key={i} className="rounded-2xl border border-cardborder bg-white/[0.03] p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white">{it.name}</span>
                <span className="text-sm font-bold">
                  {it.oldPrice && <span className="mr-1 text-muted line-through">{it.oldPrice}</span>}
                  <span className={it.free ? 'text-[#1f9d6b]' : 'text-gold'}>{it.priceLabel}</span>
                </span>
              </div>
              {it.desc && <p className="mt-1 text-[12px] leading-snug text-muted">{it.desc}</p>}
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 space-y-2">
        <PrimaryButton onClick={() => { onAnswer(step.id, 'accept'); onNext() }}>{step.accept}</PrimaryButton>
        <DeclineButton onClick={() => { onAnswer(step.id, 'decline'); onNext() }}>{step.decline}</DeclineButton>
      </div>
      {step.note && <p className="mt-3 text-center text-[11px] leading-relaxed text-muted">{step.note}</p>}
    </Stack>
  )
}

/* ---- Activation / success ---- */
function SuccessView({ step }: { step: Extract<Step, { type: 'success' }> }) {
  return (
    <Stack center>
      {(step.progressChips?.length || step.supportTag) && (
        <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
          {step.progressChips?.map((c) => (
            <span key={c} className="rounded-full border border-cardborder bg-white/[0.04] px-2.5 py-1 text-[11px] text-white/80">✓ {c}</span>
          ))}
          {step.supportTag && <span className="rounded-full bg-gold/15 px-2.5 py-1 text-[11px] font-medium text-gold">{step.supportTag}</span>}
        </div>
      )}
      <Title>{step.title}</Title>
      {step.freeCourse && <p className="mt-2 text-center text-sm text-white/85">{gold(step.freeCourse, step.goldWords)}</p>}

      {step.steps && step.steps.length > 0 && (
        <ol className="mt-6 space-y-3">
          {step.steps.map((s, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold text-sm font-bold text-ink">{i + 1}</span>
              <p className="text-[13px] leading-snug text-white/90">
                {step.loginLinkText && s.includes(step.loginLinkText) ? (
                  <>
                    {s.split(step.loginLinkText)[0]}
                    <a href={step.webLinkUrl} target="_blank" rel="noreferrer" className="text-gold underline">{step.loginLinkText}</a>
                    {s.split(step.loginLinkText)[1]}
                  </>
                ) : s}
              </p>
            </li>
          ))}
        </ol>
      )}

      <div className="mt-8 space-y-3">
        <PrimaryButton onClick={() => step.webLinkUrl && window.open(step.webLinkUrl, '_blank')}>{step.cta ?? 'Download App'}</PrimaryButton>
        {step.webLinkLabel && (
          <a href={step.webLinkUrl} target="_blank" rel="noreferrer" className="block text-center text-sm text-muted hover:text-white">
            {step.webLinkLabel}
          </a>
        )}
      </div>

      {step.supportText && (
        <p className="mt-5 text-center text-[11px] leading-relaxed text-muted">
          {step.supportEmail && step.supportText.includes(step.supportEmail) ? (
            <>
              {step.supportText.split(step.supportEmail)[0]}
              <a href={`mailto:${step.supportEmail}`} className="text-gold underline">{step.supportEmail}</a>
              {step.supportText.split(step.supportEmail)[1]}
            </>
          ) : step.supportText}
        </p>
      )}
    </Stack>
  )
}

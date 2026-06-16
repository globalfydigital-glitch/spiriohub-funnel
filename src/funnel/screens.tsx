import { useEffect, useState } from 'react'
import type { Step, Answers, Option, Plan, BundleItem, LoaderStage, SummaryRow, InfoCard } from './types'
import { MEDIA } from './steps'

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
      className="w-full rounded-2xl bg-[#1f9d6b] text-white font-semibold py-4 text-base transition-all disabled:bg-[#6e6a72] disabled:text-white/80 disabled:cursor-not-allowed hover:brightness-110 active:scale-[0.99]"
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
// Trustpilot-style rating: green squares (filled to the rating) with white stars.
function TrustStars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} / 5`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const fill = Math.max(0, Math.min(1, rating - i))
        return (
          <span key={i} className="relative flex h-[18px] w-[18px] items-center justify-center overflow-hidden rounded-[3px]" style={{ background: '#c9ccd1' }}>
            <span className="absolute inset-y-0 left-0" style={{ width: `${fill * 100}%`, background: '#00b67a' }} />
            <span className="relative text-[12px] leading-none text-white">★</span>
          </span>
        )
      })}
    </div>
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
      {/* Expansive (top) / Destructive (bottom) — one continuous gradient double arrow */}
      <div className="flex w-[58px] shrink-0 flex-col items-center justify-between py-0.5">
        <span className="text-[9px] font-bold leading-none" style={{ color: scaleColor(0, n) }}>Expansive</span>
        <div className="relative my-1 w-4 flex-1">
          {/* gradient line cyan(top) -> red(bottom) */}
          <div
            className="absolute inset-y-2 left-1/2 w-[2.5px] -translate-x-1/2 rounded-full"
            style={{ background: 'linear-gradient(to bottom, #22d3ee, #4ade80, #fde047, #f59e0b, #ef4444)' }}
          />
          {/* up arrowhead (cyan) */}
          <svg viewBox="0 0 16 12" className="absolute left-1/2 top-0 h-3 w-4 -translate-x-1/2" fill="none" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M3 9 L8 3 L13 9" />
          </svg>
          {/* down arrowhead (red) */}
          <svg viewBox="0 0 16 12" className="absolute bottom-0 left-1/2 h-3 w-4 -translate-x-1/2" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M3 3 L8 9 L13 3" />
          </svg>
        </div>
        <span className="text-[9px] font-bold leading-none" style={{ color: scaleColor(n - 1, n) }}>Destructive</span>
      </div>
    </div>
  )
}

// Photo card: image on top + colored bar with label + chevron (gender / age).
function PhotoCard({
  option,
  aspect = 'aspect-[4/5]',
  objectTop,
  onClick,
}: {
  option: Option
  aspect?: string
  objectTop?: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="group overflow-hidden rounded-2xl border-2 transition-all hover:brightness-105 active:scale-[0.99]"
      style={{ borderColor: option.color }}
    >
      {option.image && <img src={option.image} alt="" loading="lazy" className={`w-full ${aspect} object-cover ${objectTop ? 'object-top' : ''}`} />}
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
        <Stack top>
          {'image' in step && step.image ? <Hero src={step.image} /> : null}
          <Title>{step.title}</Title>
          {'subtitle' in step && step.subtitle && <Subtitle>{step.subtitle}</Subtitle>}
          {hasImages ? (
            <div className="grid grid-cols-2 gap-3 mt-6">
              {step.options.map((o) => {
                const female = answers.gender === 'female' && o.imageFemale
                const opt = female ? { ...o, image: o.imageFemale } : o
                return <PhotoCard key={o.value} option={opt} aspect="aspect-[7/6]" objectTop onClick={() => choose(o.value)} />
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
      return <PaywallView step={step} answers={answers} onAnswer={onAnswer} onNext={onNext} />

    case 'upsell':
      return <UpsellView step={step} onAnswer={onAnswer} onNext={onNext} />

    case 'success':
      return <SuccessView step={step} />
  }
}

/* ------------------------------- Sub-views -------------------------------- */
function Stack({ children, center, top }: { children: React.ReactNode; center?: boolean; top?: boolean }) {
  return <div className={`flex flex-col ${center ? 'justify-center min-h-[60vh]' : top ? 'min-h-[76vh]' : ''} animate-fadeUp`}>{children}</div>
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
    const t = setTimeout(() => setRevealed(true), 2800)
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
      <div className="flex min-h-[80vh] w-full flex-col animate-fadeUp">
        {titleNode}
        {step.subtitle && <Subtitle>{step.subtitle}</Subtitle>}
        <div className="mt-6 space-y-3">
          {step.infoCards.map((c: InfoCard, i) => (
            <div
              key={i}
              className="flex items-center gap-4 overflow-hidden rounded-2xl border border-cardborder p-4"
              style={{ background: c.glow ? `radial-gradient(135% 135% at 24% 38%, ${c.glow}22 0%, ${c.glow}0a 44%, rgba(255,255,255,0.03) 80%)` : 'rgba(255,255,255,0.04)' }}
            >
              <img src={c.image} alt="" loading="lazy" className="h-16 w-16 shrink-0 object-contain" />
              <p className="text-[13px] leading-snug text-white/90">{gold(c.text, c.gold)}</p>
            </div>
          ))}
        </div>
        <div className="mt-auto pt-8">
          <PrimaryButton onClick={onNext}>{step.cta ?? 'Continue'}</PrimaryButton>
        </div>
      </div>
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
    // Sequential screens (really-wish): the question replaces the title — name in white, question in gold.
    const nm = (answers['name'] as string) || ''
    const rawQ = (step.callout || '').replace(/\{\{name\}\},?\s*/g, '')
    const questionNode = (
      <h1 className="text-center text-[1.6rem] font-semibold leading-tight text-white">
        {nm && <span>{nm}, </span>}
        <span className="text-gold">{nm ? rawQ : cap(rawQ)}</span>
      </h1>
    )
    return (
      <>
        <div
          className="fixed inset-0 -z-10 bg-cover bg-center"
          style={{ backgroundImage: `linear-gradient(rgba(20,19,25,0.80), rgba(20,19,25,0.80)), url(${step.image})` }}
        />
        <div className="flex min-h-[78vh] flex-col animate-fadeUp">
          <div className="text-center" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.7)' }}>
            {step.waveform && <div className="mb-5 flex justify-center"><Waveform /></div>}
            {step.sequential ? (
              <div className="grid">
                <div style={{ gridArea: '1 / 1' }} className={`transition-opacity duration-500 ${revealed ? 'opacity-0' : 'opacity-100'}`}>
                  {titleNode}
                </div>
                <div style={{ gridArea: '1 / 1' }} className={`transition-opacity duration-500 ${revealed ? 'opacity-100' : 'opacity-0'}`}>
                  {questionNode}
                </div>
              </div>
            ) : (
              <>
                {titleNode}
                {step.body && <Subtitle>{step.body}</Subtitle>}
                {callout}
              </>
            )}
          </div>
          <div className="flex-1" />
          <div className="space-y-2 pt-6">
            <PrimaryButton disabled={!!step.sequential && !revealed} onClick={onNext}>{step.cta ?? 'Continue'}</PrimaryButton>
            {step.decline && <DeclineButton onClick={onNext}>{step.decline}</DeclineButton>}
          </div>
        </div>
      </>
    )
  }

  // Text-first info (not-alone): title + callout at top, image below, CTA pinned to the bottom.
  if (step.imageBelow) {
    return (
      <div className="flex min-h-[80vh] w-full flex-col animate-fadeUp">
        {titleNode}
        {step.subtitle && <Subtitle>{step.subtitle}</Subtitle>}
        {step.callout && (
          <p className="mt-2 text-center text-sm font-medium leading-relaxed text-white/90">{gold(calloutText, step.goldWords)}</p>
        )}
        {step.image && <img src={step.image} alt="" loading="lazy" className="mx-auto mt-6 w-full max-w-[340px] object-contain" />}
        <div className="mt-auto space-y-2 pt-8">
          <PrimaryButton onClick={onNext}>{step.cta ?? 'Continue'}</PrimaryButton>
          {step.decline && <DeclineButton onClick={onNext}>{step.decline}</DeclineButton>}
        </div>
      </div>
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

// Line icons for the result breakdown rows (brain / cycle / target / trending).
function RowIcon({ name }: { name?: string }) {
  const p = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, className: 'h-4 w-4' }
  switch (name) {
    case 'brain':
      return (
        <svg {...p}>
          <path d="M12 5.5a2.5 2.5 0 0 0-4.9-.7A2.6 2.6 0 0 0 4 7.3c0 .6.2 1.1.5 1.5A2.6 2.6 0 0 0 4 12a2.6 2.6 0 0 0 1.4 2.3A2.5 2.5 0 0 0 8 17a2.5 2.5 0 0 0 4 .8z" />
          <path d="M12 5.5a2.5 2.5 0 0 1 4.9-.7A2.6 2.6 0 0 1 20 7.3c0 .6-.2 1.1-.5 1.5A2.6 2.6 0 0 1 20 12a2.6 2.6 0 0 1-1.4 2.3A2.5 2.5 0 0 1 16 17a2.5 2.5 0 0 1-4 .8z" />
          <path d="M12 5.5v12.3" />
        </svg>
      )
    case 'cycle':
      return (
        <svg {...p}>
          <path d="M3 12a9 9 0 0 1 9-9 9.7 9.7 0 0 1 6.7 2.7L21 8" />
          <path d="M21 3v5h-5" />
          <path d="M21 12a9 9 0 0 1-9 9 9.7 9.7 0 0 1-6.7-2.7L3 16" />
          <path d="M3 21v-5h5" />
        </svg>
      )
    case 'target':
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="12" cy="12" r="1.8" fill="currentColor" />
        </svg>
      )
    case 'trending':
      return (
        <svg {...p}>
          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
          <polyline points="16 7 22 7 22 13" />
        </svg>
      )
    default:
      return null
  }
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
  // Animate the "You" marker sliding to its position on the bar.
  const [markerPos, setMarkerPos] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setMarkerPos(v), 150)
    return () => clearTimeout(t)
  }, [v])
  const accent = step.titleAccent
  // Figure is age-binary (18-34 vs the rest) per the original; male 18-34 uses a dedicated asset.
  const young = answers.age === '18-34'
  const img = answers.gender === 'female'
    ? (young ? MEDIA.summaryWomanYoung : MEDIA.summaryWomanOld)
    : (young ? MEDIA.summaryManYoung : step.image)
  const titleNode = accent
    ? <RichTitle title={step.title.replace(accent, '')} accent={accent} accentColor={RED} />
    : <Title>{step.title}</Title>
  return (
    <div className="flex min-h-[80vh] w-full flex-col animate-fadeUp">
      {titleNode}
      {step.body && <Subtitle>{step.body}</Subtitle>}

      <div className="relative mt-5 overflow-hidden rounded-2xl border border-cardborder bg-white/[0.03] p-4">
        {/* Gauge */}
        {step.gaugeValue != null && (
          <div className="relative z-10">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm font-medium text-muted">Vibrations</span>
              {step.gaugeTarget && (
                <span className="rounded-lg border border-cardborder px-2.5 py-1 text-[11px] font-medium text-white/85">{step.gaugeTarget}</span>
              )}
            </div>
            <div className="relative mb-2 mt-9">
              {step.gaugeYou && (
                <div className="absolute -top-8 -translate-x-1/2 whitespace-nowrap" style={{ left: `${markerPos}%`, transition: 'left 1s cubic-bezier(0.22,1,0.36,1)' }}>
                  <span className="rounded-lg bg-white px-3 py-1 text-sm font-bold text-ink">{step.gaugeYou}</span>
                </div>
              )}
              <div className="h-1.5 w-full rounded-full" style={{ background: 'linear-gradient(90deg, #ef4444 0%, #f59e0b 27%, #fde047 50%, #4ade80 73%, #22d3ee 100%)' }} />
              <div className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white" style={{ left: `${markerPos}%`, background: '#ef4444', transition: 'left 1s cubic-bezier(0.22,1,0.36,1)' }} />
            </div>
            <div className="flex justify-between text-[10px] font-medium uppercase tracking-wide text-muted">
              <span>Low</span><span>Normal</span><span>Medium</span><span>High</span>
            </div>
          </div>
        )}

        {/* Alert */}
        {step.alertTitle && (
          <div className="relative z-10 mt-4 flex gap-3 rounded-xl p-3.5" style={{ background: '#753131' }}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: '#e0584f' }}>
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M10.3 3.6 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0Z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-bold tracking-wide text-white">{step.alertTitle}</div>
              {step.alertDescription && <p className="mt-1 text-[13px] leading-snug text-white/90">{step.alertDescription}</p>}
            </div>
          </div>
        )}

        {/* Breakdown rows + person image anchored to the card's bottom-right corner */}
        {step.rows && step.rows.length > 0 && (
          <div className="relative mt-5 min-h-[190px]">
            {img && (
              <img
                src={img}
                alt=""
                loading="lazy"
                className="pointer-events-none absolute -bottom-4 -right-4 z-0 h-[210px] w-auto object-contain object-bottom"
                style={{ WebkitMaskImage: 'linear-gradient(to right, transparent, #000 50%)', maskImage: 'linear-gradient(to right, transparent, #000 50%)' }}
              />
            )}
            <div className="relative z-10 max-w-[58%] space-y-5">
              {step.rows.map((r: SummaryRow, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  {(r.icon || r.emoji) && (
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-white/75">
                      {r.icon ? <RowIcon name={r.icon} /> : <span className="text-sm">{r.emoji}</span>}
                    </span>
                  )}
                  <div className="leading-tight">
                    <div className="text-[11px] text-muted">{r.title}</div>
                    <div className="mt-0.5 text-[13px] font-bold text-white">{fill(r.description, answers)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-auto pt-6">
        <PrimaryButton onClick={onNext}>{step.cta ?? 'Continue'}</PrimaryButton>
      </div>
    </div>
  )
}

/* ---- Rising-curve SVG used by plan-chart + event-chart ---- */
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
  // Bars grow week over week: gray -> orange -> yellow/green -> green/cyan (the highest = the goal).
  const bars = [
    { h: 16, grad: 'linear-gradient(to top, #4b5563, #9ca3af)' },
    { h: 42, grad: 'linear-gradient(to top, #ef4444, #f59e0b)' },
    { h: 70, grad: 'linear-gradient(to top, #eab308, #4ade80)' },
    { h: 96, grad: 'linear-gradient(to top, #22c55e, #a5f3fc)' },
  ]
  const yLabels = ['38', '34.2', '28.4', '24.2', '20', '4']
  const CHART_H = 200
  return (
    <div className="flex min-h-[80vh] w-full flex-col animate-fadeUp">
      <Title>{gold(title, step.goldWords)}</Title>
      <div className="mt-6 rounded-2xl border border-cardborder bg-white/[0.03] p-4">
        <div className="flex gap-2">
          {/* Y axis */}
          <div className="flex flex-col justify-between py-0.5 text-right text-[9px] tabular-nums text-muted" style={{ height: CHART_H }}>
            {yLabels.map((l) => <span key={l}>{l}</span>)}
          </div>
          {/* chart area */}
          <div className="flex-1">
            <div className="relative" style={{ height: CHART_H }}>
              {/* gridlines */}
              <div className="absolute inset-0 flex flex-col justify-between">
                {yLabels.map((_, i) => <div key={i} className="border-t border-white/[0.06]" />)}
              </div>
              {/* bars */}
              <div className="absolute inset-0 flex items-end justify-around gap-2.5">
                {bars.map((b, i) => {
                  const isGoal = i === bars.length - 1
                  return (
                    <div key={i} className="relative h-full w-full max-w-[46px]">
                      {isGoal && step.goalLabel && (
                        <span
                          className="absolute left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-gold px-2 py-0.5 text-[10px] font-bold text-ink"
                          style={{ bottom: `${b.h}%`, marginBottom: 6, opacity: 0, animation: 'chartfade 0.4s ease 1.3s forwards' }}
                        >
                          {step.goalLabel}
                        </span>
                      )}
                      <div
                        className="absolute bottom-0 w-full rounded-t-lg"
                        style={{ height: `${b.h}%`, background: b.grad, transformOrigin: 'bottom', animation: `grow 0.7s ease-out ${0.2 + i * 0.25}s both` }}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
            {/* X axis */}
            <div className="mt-2 flex justify-around gap-2.5 text-[10px] text-muted">
              {step.weeks.map((w) => <span key={w} className="w-full max-w-[46px] text-center">{w}</span>)}
            </div>
          </div>
        </div>
      </div>
      {step.disclaimer && <p className="mt-3 text-center text-[11px] text-muted">{step.disclaimer}</p>}
      <div className="mt-auto pt-8">
        <PrimaryButton onClick={onNext}>{step.cta ?? 'Continue'}</PrimaryButton>
      </div>
    </div>
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
  // Left axis = current month, right axis = next month (computed client-side).
  const [span, setSpan] = useState<{ start: string; end: string; date: string } | null>(null)
  useEffect(() => {
    const now = new Date()
    const end = new Date(now.getFullYear(), now.getMonth() + 1, Math.min(now.getDate(), 28))
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

  const LINE = 'M10 168 C 60 170, 96 145, 138 110 C 180 75, 215 50, 312 30'
  const AREA = `${LINE} L312 200 L10 200 Z`
  const dots = [
    { x: 74, y: 156 },
    { x: 180, y: 74 },
    { x: 305, y: 31 },
  ]

  return (
    <div className="flex min-h-[80vh] w-full flex-col animate-fadeUp">
      <Title>{gold(title, [titleGold])}</Title>
      <p className="mt-2 text-center text-sm text-muted">{gold(subtitle, span?.date ? [word, span.date] : [word])}</p>

      <div className="mt-6 rounded-2xl border border-cardborder bg-white/[0.03] p-4">
        <div className="relative">
          <svg viewBox="0 0 320 200" className="block w-full">
            <defs>
              <linearGradient id="evStroke" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="34%" stopColor="#f59e0b" />
                <stop offset="64%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#22c55e" />
              </linearGradient>
              <linearGradient id="evArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[44, 83, 122, 161].map((y) => (
              <line key={y} x1="0" y1={y} x2="320" y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            ))}
            <path d={AREA} fill="url(#evArea)" style={{ opacity: 0, animation: 'chartfade 1.6s ease 0.3s forwards' }} />
            <path
              d={LINE}
              fill="none"
              stroke="url(#evStroke)"
              strokeWidth="5"
              strokeLinecap="round"
              pathLength={100}
              style={{ strokeDasharray: 100, strokeDashoffset: 100, animation: 'draw 1.8s ease-out forwards' }}
            />
            {dots.map((d, i) => (
              <g key={i} style={{ opacity: 0, animation: `chartfade 0.4s ease ${0.6 + i * 0.55}s forwards` }}>
                <circle cx={d.x} cy={d.y} r={i === 2 ? 11 : 9} fill="#16a34a" opacity="0.25" />
                <circle cx={d.x} cy={d.y} r={i === 2 ? 8 : 7} fill="#fff" stroke="#16a34a" strokeWidth="3" />
              </g>
            ))}
          </svg>
          {milestones.map((m, i) => {
            const leftPct = (dots[i].x / 320) * 100
            const topPct = (dots[i].y / 200) * 100
            const isTop = i === milestones.length - 1
            return (
              <div
                key={i}
                className={`absolute z-10 flex flex-col ${isTop ? 'items-end' : 'items-center'}`}
                style={{
                  left: `${leftPct}%`,
                  top: `${topPct}%`,
                  transform: `translate(${isTop ? '-100%' : '-50%'}, calc(-100% - 7px))`,
                  opacity: 0,
                  animation: `chartfade 0.4s ease ${0.7 + i * 0.55}s forwards`,
                }}
              >
                <div
                  className={`w-max rounded-lg px-2.5 py-1 text-[10px] font-bold leading-tight text-white shadow-md ${isTop ? 'whitespace-nowrap' : 'max-w-[100px]'}`}
                  style={{ background: '#178a50' }}
                >
                  {m}
                </div>
                <span className={`-mt-1 h-2 w-2 rotate-45 ${isTop ? 'mr-3' : ''}`} style={{ background: '#178a50' }} />
              </div>
            )
          })}
        </div>
        <div className="mt-2 flex justify-between px-1 text-[10px] text-muted">
          <span>{span?.start ?? ''}</span>
          <span>{span?.end ?? ''}</span>
        </div>
      </div>

      {step.footnote && <p className="mt-3 text-center text-[11px] text-muted">{step.footnote}</p>}
      <div className="mt-auto pt-8">
        <PrimaryButton onClick={onNext}>{step.cta ?? 'Continue'}</PrimaryButton>
      </div>
    </div>
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
    <Stack top>
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
  const isEmail = step.field === 'email'
  const caption = step.caption && answers.gender === 'female' ? step.caption.replace('men', 'women') : step.caption
  const socialImg = answers.gender === 'female' && step.imageFemale ? step.imageFemale : step.image
  const showError = touched && !valid && isEmail && value.length > 0 && step.error
  const titleNode = <Title>{step.titleGold ? gold(step.title, [step.titleGold]) : step.title}</Title>

  // Email screen — title at top, social proof + privacy below the field, CTA pinned to the bottom.
  if (isEmail) {
    return (
      <div className="flex min-h-[80vh] w-full flex-col animate-fadeUp">
        {titleNode}
        {step.subtitle && <Subtitle>{step.subtitle}</Subtitle>}
        <div className="relative mt-6">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m3 7 9 6 9-6" />
            </svg>
          </span>
          <input
            autoFocus
            type="email"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={() => setTouched(true)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder={step.placeholder}
            className="w-full rounded-2xl border border-cardborder bg-card py-4 pl-11 pr-4 text-white placeholder:text-muted outline-none focus:border-gold"
          />
        </div>
        {showError && <p className="mt-2 text-[12px]" style={{ color: RED }}>{step.error}</p>}
        {(socialImg || caption) && (
          <div className="mt-5 flex items-center gap-3">
            {socialImg && <img src={socialImg} alt="" loading="lazy" className="h-7 w-auto shrink-0" />}
            {caption && (
              <p className="text-[13px] font-semibold leading-tight text-white">
                {caption}<span className="text-gold">{step.captionAccent}</span>
              </p>
            )}
          </div>
        )}
        {step.tip && (
          <p className="mt-4 flex gap-2 text-[11px] leading-relaxed text-muted">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 h-3.5 w-3.5 shrink-0">
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </svg>
            <span>{step.tip}</span>
          </p>
        )}
        <div className="mt-auto pt-6">
          <PrimaryButton disabled={!valid} onClick={submit}>{step.cta ?? 'Continue'}</PrimaryButton>
        </div>
      </div>
    )
  }

  // Name (and other simple inputs) — centered.
  return (
    <Stack center>
      {step.image ? <Hero src={step.image} /> : null}
      {titleNode}
      {step.subtitle && <Subtitle>{step.subtitle}</Subtitle>}
      <input
        autoFocus
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => setTouched(true)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        placeholder={step.placeholder}
        className="mt-6 w-full rounded-2xl border border-cardborder bg-card px-4 py-4 text-white placeholder:text-muted outline-none focus:border-gold"
      />
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
  const [si, setSi] = useState(0) // current stage index
  const [pct, setPct] = useState(0) // current stage fill %
  const [modal, setModal] = useState(false)

  useEffect(() => {
    if (si >= stages.length) {
      const t = setTimeout(onNext, 500)
      return () => clearTimeout(t)
    }
    if (modal) return // paused at 45% while the question is up
    const stage = stages[si]
    const from = pct
    const target = stage.modal && from < 45 ? 45 : 100
    if (from >= target) {
      if (target === 45) setModal(true)
      else { setSi((s) => s + 1); setPct(0) }
      return
    }
    const dur = Math.min(2200, Math.max(700, (target - from) * 34))
    const start = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur)
      setPct(from + (target - from) * t)
      if (t < 1) raf = requestAnimationFrame(tick)
      else if (target === 45) setModal(true)
      else { setSi((s) => s + 1); setPct(0) }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [si, modal])

  const t = stages[Math.min(si, stages.length - 1)]?.testimonial

  return (
    <div className="flex min-h-[80vh] w-full flex-col animate-fadeUp">
      <Title>{step.titleGold ? gold(step.title, [step.titleGold]) : step.title}</Title>

      {/* Stages reveal one at a time; each fills to 45% -> modal -> 100% -> gold check. */}
      <div className="mt-6 space-y-4 rounded-2xl border border-cardborder bg-white/[0.04] p-4">
        {stages.map((s, i) => {
          if (i > si) return null
          const showCheck = i < si || pct >= 100
          return (
            <div key={s.label}>
              <div className="flex items-center justify-between text-[13px]">
                <span className="font-medium text-white">{s.label}</span>
                {showCheck ? (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold text-[11px] font-bold text-ink">✓</span>
                ) : (
                  <span className="tabular-nums text-muted">{Math.round(pct)}%</span>
                )}
              </div>
              {showCheck ? (
                <div className="mt-3 h-px w-full bg-white/[0.08]" />
              ) : (
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-cardborder">
                  <div className="h-full rounded-full bg-gold" style={{ width: `${pct}%` }} />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {t && (
        <div className="mt-4 rounded-2xl border border-cardborder bg-white/[0.03] p-4">
          <TrustStars rating={t.rating} />
          <div className="mt-2.5 flex items-baseline justify-between">
            <span className="text-sm font-bold text-white">{t.title}</span>
            <span className="text-[12px] text-muted">{t.name}</span>
          </div>
          <p className="mt-1.5 text-[13px] leading-snug text-white/80">{t.quote}</p>
        </div>
      )}

      {/* White modal so it stands out against the dimmed page */}
      {modal && stages[si]?.modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-6">
          <div className="w-full max-w-[280px] rounded-2xl bg-white px-5 py-5 text-center shadow-2xl">
            <p className="text-[11px] font-medium text-gray-400">{stages[si].modal!.prompt}</p>
            <p className="mt-1 text-[15px] font-bold leading-snug text-gray-900">{stages[si].modal!.question}</p>
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <button onClick={() => setModal(false)} className="rounded-xl bg-gray-200 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-300">
                {stages[si].modal!.no}
              </button>
              <button onClick={() => setModal(false)} className="rounded-xl bg-gray-200 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-300">
                {stages[si].modal!.yes}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
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
const CONFETTI = [
  { l: '6%', t: '10%', c: '#ef4444', r: 18, round: false },
  { l: '18%', t: '20%', c: '#3b82f6', r: -20, round: true },
  { l: '30%', t: '8%', c: '#eab308', r: 40, round: false },
  { l: '44%', t: '18%', c: '#22c55e', r: -10, round: true },
  { l: '58%', t: '9%', c: '#ec4899', r: 25, round: false },
  { l: '70%', t: '19%', c: '#8b5cf6', r: -30, round: true },
  { l: '82%', t: '8%', c: '#f59e0b', r: 12, round: false },
  { l: '92%', t: '17%', c: '#06b6d4', r: -22, round: true },
]

function ScratchView({ step, onNext }: { step: Extract<Step, { type: 'scratch' }>; onNext: () => void }) {
  const [revealed, setRevealed] = useState(false)
  const [modal, setModal] = useState(false)
  const reveal = () => { if (!revealed) { setRevealed(true); setModal(true) } }
  return (
    <>
      {/* purple glow at the top, like the original */}
      <div
        className="fixed inset-0 -z-10"
        style={{ background: 'linear-gradient(to bottom, rgba(124,58,173,0.5) 0%, rgba(60,30,90,0.18) 30%, transparent 52%), #141319' }}
      />
      <div className="flex min-h-[80vh] w-full flex-col animate-fadeUp">
        <Title>{gold(step.title, step.goldWords)}</Title>
        {step.subtitle && <Subtitle>{step.subtitle}</Subtitle>}

        {/* Gold ticket */}
        <button
          onClick={reveal}
          disabled={revealed}
          className="relative mx-auto mt-8 aspect-square w-full max-w-[260px]"
          aria-label={step.instruction}
        >
          <div className="absolute inset-0 rounded-3xl shadow-lg" style={{ background: 'linear-gradient(150deg, #f9df87 0%, #e7b53c 55%, #d99f28 100%)' }} />
          <div className="absolute inset-[10px] rounded-2xl border-2 border-dashed border-white/55" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-4 text-center">
            {revealed ? (
              <>
                <div className="text-5xl font-extrabold" style={{ color: '#8a4b12' }}>{step.scratchValue}</div>
                <div className="text-sm font-semibold" style={{ color: '#8a4b12' }}>{step.scratchValueLabel}</div>
              </>
            ) : (
              <>
                <svg viewBox="0 0 64 48" className="h-12 w-16" aria-hidden>
                  <path d="M6 14 C 12 6, 18 20, 24 12 S 36 20, 42 12" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
                  <path d="M10 22 C 16 15, 22 27, 28 19 S 40 27, 46 19" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
                  <g fill="#fff" transform="translate(34 18)">
                    <path d="M6 4 a2 2 0 0 1 4 0 v6 l2-.6 a2 2 0 0 1 2.6 1.2 l1 2.6 a3.6 3.6 0 0 1-2.2 4.6 l-3 1 a4.4 4.4 0 0 1-5.4-2.4 L2 13 a1.5 1.5 0 0 1 2.6-1.4 L6 13 Z" />
                  </g>
                </svg>
                <span className="text-sm font-bold" style={{ color: '#7a4410' }}>{step.instruction}</span>
              </>
            )}
          </div>
        </button>

        <div className="mt-auto pt-8">
          <PrimaryButton disabled={!revealed} onClick={onNext}>{step.cta}</PrimaryButton>
        </div>
      </div>

      {/* Reveal: white confetti bottom-sheet */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60">
          <div className="relative w-full max-w-[460px] overflow-hidden rounded-t-3xl bg-white px-6 pb-7 pt-8 text-center" style={{ animation: 'sheetUp 0.35s ease-out' }}>
            {CONFETTI.map((c, i) => (
              <span
                key={i}
                className="pointer-events-none absolute"
                style={{ left: c.l, top: c.t, width: c.round ? 7 : 5, height: c.round ? 7 : 10, background: c.c, borderRadius: c.round ? '9999px' : '1px', transform: `rotate(${c.r}deg)` }}
              />
            ))}
            <div className="text-5xl">{step.revealEmoji}</div>
            <div className="mt-2 text-2xl font-extrabold text-gray-900">{step.revealTitle}</div>
            {step.revealSubtitle && <div className="mt-1 text-sm font-medium text-gray-500">{step.revealSubtitle}</div>}
            <div className="mt-1 text-3xl font-extrabold" style={{ color: '#ef4444' }}>{step.revealDiscount}</div>
            {step.revealNote && <div className="mx-auto mt-4 max-w-[260px] border-t border-gray-200 pt-3 text-[11px] text-gray-400">{step.revealNote}</div>}
            <button
              onClick={onNext}
              className="mt-4 w-full rounded-2xl bg-[#1f9d6b] py-4 text-base font-semibold text-white transition-all hover:brightness-110 active:scale-[0.99]"
            >
              {step.cta}
            </button>
          </div>
        </div>
      )}
    </>
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
/* ---- Pink check used in the selling-page lists ---- */
function PinkCheck() {
  return (
    <span className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full" style={{ background: '#e0598a' }}>
      <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>
    </span>
  )
}
// Lifted to module scope so the per-second countdown re-render doesn't remount the whole subtree.
function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-cardborder bg-white/[0.03] p-4 ${className}`}>{children}</div>
}
// Real payment-brand marks (inline SVG / styled wordmarks on white chips), no external CDN dependency.
function PaymentLogos() {
  const chip = 'flex h-6 items-center justify-center rounded bg-white px-1.5'
  return (
    <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
      {/* PayPal */}
      <span className={chip}><span className="text-[11px] font-bold italic leading-none"><span style={{ color: '#003087' }}>Pay</span><span style={{ color: '#009CDE' }}>Pal</span></span></span>
      {/* Apple Pay */}
      <span className={chip}>
        <span className="flex items-center gap-0.5 text-[11px] font-semibold leading-none text-black">
          <svg viewBox="0 0 14 17" className="h-3 w-3" fill="currentColor" aria-hidden="true"><path d="M11.05 9.02c-.02-1.7 1.39-2.51 1.45-2.55-.79-1.16-2.02-1.32-2.46-1.34-1.05-.11-2.04.61-2.57.61-.53 0-1.34-.6-2.21-.58-1.14.02-2.19.66-2.77 1.68-1.18 2.05-.3 5.08.85 6.74.56.81 1.23 1.72 2.1 1.69.84-.03 1.16-.54 2.18-.54 1.02 0 1.3.54 2.19.52.9-.01 1.48-.83 2.03-1.64.64-.94.9-1.85.92-1.9-.02-.01-1.77-.68-1.79-2.69zM9.34 3.7c.47-.57.78-1.36.69-2.15-.67.03-1.49.45-1.97 1.01-.43.5-.81 1.31-.71 2.08.75.06 1.51-.38 1.99-.94z"/></svg>
          Pay
        </span>
      </span>
      {/* Visa */}
      <span className={chip}><span className="text-[12px] font-bold italic leading-none tracking-tight" style={{ color: '#1434CB' }}>VISA</span></span>
      {/* Mastercard */}
      <span className={chip}><svg viewBox="0 0 38 24" className="h-4" aria-hidden="true"><circle cx="15" cy="12" r="9" fill="#EB001B"/><circle cx="23" cy="12" r="9" fill="#F79E1B"/><path d="M19 5.4a9 9 0 010 13.2 9 9 0 010-13.2z" fill="#FF5F00"/></svg></span>
      {/* Maestro */}
      <span className={chip}><svg viewBox="0 0 38 24" className="h-4" aria-hidden="true"><circle cx="15" cy="12" r="9" fill="#0099DF"/><circle cx="23" cy="12" r="9" fill="#ED0006"/><path d="M19 5.4a9 9 0 010 13.2 9 9 0 010-13.2z" fill="#6C6BBD"/></svg></span>
      {/* Discover */}
      <span className={chip}><span className="flex items-center text-[8px] font-bold leading-none tracking-tight text-[#231F20]">DISC<span className="mx-px inline-block h-1.5 w-1.5 rounded-full" style={{ background: '#F76E11' }} />VER</span></span>
      {/* Amex */}
      <span className="flex h-6 items-center justify-center rounded bg-[#2E77BB] px-1.5"><span className="text-[8px] font-bold leading-none tracking-tight text-white">AMEX</span></span>
    </div>
  )
}
const WHAT_YOU_GET = [
  'See why your energy feels blocked', 'Get a clear plan to shift daily', 'Release blocks in love and money',
  'Shift from scarcity into abundance', 'Reprogram your subconscious', 'Live as the “lucky” version of you',
  'The right people are drawn into your life', 'Feel lighter, confident, and magnetic',
]
const WITHOUT = ['Stuck in scarcity', 'Forced positivity', 'Clinging, chasing', 'Thinking one way, acting against it', 'Feeling “not one of the lucky ones”', 'Same old cycles']
const WITH = ['Abundance flows', 'Grounded mind', 'Choosing from worth', 'Your thoughts & actions are aligned', 'Money, support & chances flow more', 'Your entire life shifts']
const STATS = [
  { n: '82', pre: 'of users ', bold: 'raised their vibrations', post: ' after just 4 weeks' },
  { n: '78', pre: 'of users reached their ', bold: 'peak in abundance & life quality', post: '' },
  { n: '45', pre: 'of users started in the same ', bold: 'low-vibration state as you', post: '' },
]
const REVIEWS = [
  { name: 'Laura S.', rating: '5.0', when: '1 day ago', img: MEDIA.ageAf, text: "I didn’t realize how much inner trauma was blocking my manifestations. With Spirio, I finally healed the energy I’d been holding for years. As soon as I released it, everything started flowing—clarity, confidence, and the things I’d been trying to attract showed up effortlessly." },
  { name: 'Ann R.', rating: '5.0', when: '1 week ago', img: MEDIA.ageDf, text: 'Since using Spirio, my entire energy around abundance has shifted. I stopped chasing and started receiving. Opportunities, money, and support began flowing in once I aligned with the frequency of having—not lacking.' },
  { name: 'Scott G.', rating: '4.8', when: '2 months ago', initials: 'SG', bg: '#f0a87e', text: "I didn’t believe in manifestation until I felt completely stuck. Spirio gave me the tools to clear old energy and reprogram my mindset. Now, I feel aligned, magnetic, and finally attracting love—in every sense." },
]
const FAQS = [
  { q: "What if I’ve used other things before and they didn’t help me?", a: "Most approaches only touch the surface. Spirio works on the subconscious patterns that block your energy, with a short guided practice each day so the shift actually sticks. And if it isn’t for you, you’re covered by the 30-day money-back guarantee." },
  { q: "What if I don’t have enough willpower to stick to my plan?", a: "You don’t need willpower. Your plan is just 3–20 minutes a day, guided step by step, and it’s built around how you answered the quiz — so it fits your real life, not an ideal one." },
  { q: 'What if I feel worry about starting this plan?', a: "That’s completely normal — and there’s zero risk. Start today, follow the daily sessions at your own pace, and if you don’t feel a difference you can request a full refund within 30 days." },
]
// Free bonus modules shown in the "Additional discount" modal after GET MY PLAN.
const BONUSES = [
  { name: 'Tantric Guide To Boost Intimacy', old: '€39' },
  { name: 'Abundance Manifesto', old: '€19' },
  { name: 'Karma Cleansing Hacks', old: '€19' },
  { name: 'Energy Balance Program', old: '€59' },
]

function PaywallView({
  step,
  answers,
  onAnswer,
  onNext,
}: {
  step: Extract<Step, { type: 'paywall' }>
  answers: Answers
  onAnswer: (key: string, value: string) => void
  onNext: () => void
}) {
  const COUNTDOWN_SECS = 600
  const [plan, setPlan] = useState<string>(step.plans[0]?.id ?? '') // 1-Month selected by default (per the original)
  const [secs, setSecs] = useState(COUNTDOWN_SECS)
  const [faq, setFaq] = useState<number | null>(null)
  useEffect(() => {
    // Loop back instead of freezing at 00:00 next to a still-active discount.
    const t = setInterval(() => setSecs((s) => (s <= 1 ? COUNTDOWN_SECS : s - 1)), 1000)
    return () => clearInterval(t)
  }, [])
  const mmss = `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`

  // "Additional discount" modal shown after GET MY PLAN, with its own reserved-discount countdown.
  const [showModal, setShowModal] = useState(false)
  const [modalSecs, setModalSecs] = useState(120)
  useEffect(() => {
    if (!showModal) return
    setModalSecs(120)
    const t = setInterval(() => setModalSecs((s) => (s > 0 ? s - 1 : 0)), 1000)
    return () => clearInterval(t)
  }, [showModal])
  const mmssModal = `${String(Math.floor(modalSecs / 60)).padStart(2, '0')}:${String(modalSecs % 60).padStart(2, '0')}`

  const G = answers.gender === 'female'
  const name = (answers.name as string) || ''
  const goal = goalWord(answers, 'love')
  const goalCap = cap(goal)
  const young = answers.age === '18-34' // figure is age-binary (18-34 vs the rest)
  const nowImg = G ? (young ? MEDIA.nowWomanYoung : MEDIA.nowWomanOld) : young ? MEDIA.nowManYoung : MEDIA.nowManOld
  const goalImg = G ? (young ? MEDIA.goalWomanYoung : MEDIA.goalWomanOld) : young ? MEDIA.goalManYoung : MEDIA.goalManOld
  const selected = step.plans.find((p) => p.id === plan) ?? step.plans[0]
  const buy = () => { onAnswer('plan', selected.id); onNext() }

  const GET = (cls = '') => (
    <button onClick={() => setShowModal(true)} aria-label={`Get my plan — ${selected.name}, ${selected.price}`} className={`rounded-2xl bg-[#227e64] font-bold text-white transition-all hover:brightness-110 active:scale-[0.99] ${cls}`}>GET MY PLAN</button>
  )

  return (
    <div className="-mx-5 animate-fadeUp">
      {/* Sticky timer header */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-white/5 px-5 py-3" style={{ background: '#141319' }}>
        <span role="timer" aria-label={`Offer ends in ${mmss}`} className="text-xl font-extrabold tabular-nums text-gold">{mmss}</span>
        {GET('px-5 py-2.5 text-sm')}
      </div>

      <div className="px-5 pb-12 pt-5">
        {/* Discount + title */}
        <p className="text-center text-sm font-semibold text-muted">🎁 Special discount: <span style={{ color: '#ef4444' }}>{selected.discount ?? '-54%'}</span></p>
        <h1 className="mt-3 break-words text-center text-[1.7rem] font-bold leading-tight text-white">
          {name ? `${name}, ` : ''}your personal {gold('High-Vibration Plan', ['High-Vibration Plan'])} to attract {goal} into your life
        </h1>
        <p className="mt-2 text-center text-sm text-muted">Become a high-vibration person</p>

        {/* Now vs goal — large portrait figures filling each column (only the avatar changes by gender/age) */}
        <div className="relative mt-6 grid grid-cols-2 gap-3 overflow-hidden rounded-2xl border border-cardborder bg-white/[0.03] p-4">
          {/* full-height centered divider + animated chevron at the figures' level */}
          <div className="pointer-events-none absolute inset-y-4 left-1/2 w-px -translate-x-1/2 bg-white/10" />
          <div className="pointer-events-none absolute left-1/2 top-[8.6rem] z-20 flex -translate-x-1/2 -translate-y-1/2 items-center text-[2.4rem] font-bold leading-none text-gold">
            <span>›</span>
            <span className="-ml-3 animate-[chev2_1.3s_ease-in-out_infinite]">›</span>
          </div>
          {[{ goalCol: false, img: nowImg, pill: 'Now', vib: 'Low', val: 'Blocked', opp: 'Stalled' }, { goalCol: true, img: goalImg, pill: 'Your goal', vib: 'High', val: 'Flowing', opp: 'Showing up' }].map((c, i) => {
            const col = c.goalCol ? '#22c55e' : '#ef4444'
            return (
              <div key={i} className={i === 0 ? 'pr-2' : 'pl-2'}>
                <div className="mb-2 flex justify-center">
                  <span className="rounded-lg px-3 py-1 text-xs font-bold text-white" style={{ background: c.goalCol ? '#1f8a5c' : '#2a2535' }}>{c.pill}</span>
                </div>
                <div className="relative h-48 w-full overflow-hidden">
                  {/* colored glow behind the figure: red for Now (low), green for the goal (high) */}
                  <div className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(68% 58% at 50% 50%, ${col}66 0%, ${col}1f 42%, transparent 74%)` }} />
                  <img src={c.img} alt="" loading="lazy" className="absolute inset-0 mx-auto h-full w-auto select-none object-contain object-bottom" />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#16151c] to-transparent" />
                </div>
                <div className="mt-2 h-px w-full bg-white/10" />
                <div className="mt-3 text-[11px] text-muted">Vibrations</div>
                <div className="text-sm font-bold" style={{ color: col }}>{c.goalCol ? '↑' : '↓'} {c.vib}</div>
                <div className="mt-2 text-[11px] text-muted">{goalCap}</div>
                <div className="text-sm font-bold text-white">{c.val}</div>
                <div className="relative mt-1 h-1.5 w-full rounded-full bg-cardborder">
                  <div className="h-full rounded-full" style={{ width: c.goalCol ? '70%' : '30%', background: col }} />
                  <span className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-black/10 bg-white shadow-sm" style={{ left: c.goalCol ? '70%' : '30%' }} />
                </div>
                <div className="mt-2 text-[11px] text-muted">Opportunities</div>
                <div className="text-sm font-bold text-white">{c.opp}</div>
                <div className="mt-1 flex gap-1">{[0, 1, 2].map((s) => <div key={s} className="h-1.5 flex-1 rounded-full" style={{ background: c.goalCol ? col : s === 0 ? col : '#3a3545' }} />)}</div>
              </div>
            )
          })}
        </div>

        {/* Plan recap */}
        <h2 className="mt-8 break-words text-center text-xl font-bold text-white">{name ? `${name}, ` : ''}your personalized plan is ready!</h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="flex items-start gap-2.5 border-r border-white/10 pr-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-white/75"><RowIcon name="brain" /></span>
            <div className="leading-tight"><div className="text-[11px] text-muted">Current pattern</div><div className="text-[13px] font-bold text-white">Fear, negative loops</div></div>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-white/75"><RowIcon name="target" /></span>
            <div className="leading-tight"><div className="text-[11px] text-muted">What you want</div><div className="text-[13px] font-bold text-white">{goalCap}</div></div>
          </div>
        </div>

        {/* Promo code */}
        <div className="mt-5 rounded-2xl p-4" style={{ background: '#1f8a5c' }}>
          <div className="flex items-center gap-2 font-bold text-white">🏷️ Your promo code applied!</div>
          <div className="mt-3 flex items-stretch gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl bg-black/25 px-3 py-2.5 text-sm text-white"><span className="text-gold">✓</span> <span className="truncate">{(name || 'you').toLowerCase()}_haz26</span></div>
            <div aria-hidden="true" className="flex shrink-0 items-center rounded-xl bg-black/25 px-3 text-lg font-extrabold tabular-nums text-gold">{mmss}</div>
          </div>
        </div>

        {/* Plans */}
        <div role="radiogroup" aria-label="Choose your plan" className="mt-5 space-y-3">
          {step.plans.map((p: Plan) => {
            const sel = plan === p.id
            const m = p.perDay.match(/(\d+)[.,](\d+)/)
            return (
              <button key={p.id} type="button" role="radio" aria-checked={sel} aria-label={`${p.name}, ${p.price}${p.discount ? `, ${p.discount}` : ''}`} onClick={() => setPlan(p.id)} className={`relative block w-full overflow-hidden rounded-2xl border-2 text-left transition-all ${sel ? 'border-gold' : 'border-cardborder'}`} style={{ background: sel ? 'linear-gradient(160deg, rgba(99,64,150,0.45), rgba(58,40,86,0.4))' : 'rgba(255,255,255,0.03)' }}>
                {p.popular && <div className="bg-gold py-1 text-center text-[10px] font-bold uppercase tracking-wider text-ink">Most Popular</div>}
                <div className="flex items-center gap-3 p-4 pt-5">
                  {p.discount && <span className="absolute left-0 top-0 rounded-br-xl px-2 py-0.5 text-[11px] font-bold text-white" style={{ background: '#ef4444' }}>{p.discount}</span>}
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${sel ? 'border-gold' : 'border-muted'}`}>{sel && <span className="h-2.5 w-2.5 rounded-full bg-gold" />}</span>
                  <div className="flex-1">
                    <div className="font-bold uppercase text-white">{p.name}</div>
                    <div className="text-sm text-muted">{p.price}</div>
                  </div>
                  <div className="relative flex items-center rounded-lg px-3 py-1.5" style={{ background: sel ? '#fff' : '#b6b0c0', color: '#1a1626' }}>
                    <span className="absolute -left-1 h-2.5 w-2.5 rounded-full" style={{ background: '#141319' }} />
                    <span className="mr-0.5 text-sm font-semibold">€</span>
                    <span className="text-3xl font-extrabold leading-none">{m ? m[1] : '0'}</span>
                    <span className="ml-0.5 flex flex-col text-[10px] font-bold leading-tight"><span>{m ? m[2] : ''}</span><span className="text-gray-500">day</span></span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-[13px] font-semibold text-white"><span style={{ color: '#22c55e' }}>🛡️</span> 30-day money-back guarantee</div>
        <div className="mt-4">{GET('w-full py-4 text-base')}</div>
        <div className="mt-3 flex justify-center"><span className="rounded-full border px-3 py-1.5 text-xs font-semibold" style={{ borderColor: '#227e64', color: '#227e64' }}>🛡️ Pay safe & secure</span></div>
        <PaymentLogos />
        <p className="mt-3 text-center text-[11px] leading-relaxed text-muted">
          By completing your purchase you agree to automatic renewal of the subscription. First month for {selected.price}, then €39.99 every month. Cancel anytime in the mobile application or by emailing support@spiriohub.com. See Terms of Use.
        </p>

        {/* Money-back card */}
        {step.moneyBackTitle && (
          <Card className="mt-6 text-center">
            <div className="text-2xl">🛡️</div>
            <div className="mt-1 text-lg font-bold text-white">{step.moneyBackTitle}</div>
            {step.moneyBackBody && <p className="mt-2 text-[13px] leading-snug text-white/80">{step.moneyBackBody}</p>}
            {step.moneyBackLinkText && <p className="mt-3 text-[12px] text-muted">{step.moneyBackLinkPrefix}<a href={step.moneyBackLinkUrl} target="_blank" rel="noreferrer" className="text-gold underline">{step.moneyBackLinkText}<span className="sr-only"> (opens in a new tab)</span></a></p>}
          </Card>
        )}

        {/* Info safe */}
        <Card className="mt-4">
          <div className="text-sm font-bold text-white">🔒 Your information is safe</div>
          <p className="mt-1 text-[12px] text-muted">We won’t sell or rent your personal contact information for any marketing purposes whatsoever.</p>
          <div className="mt-3 text-sm font-bold text-white">💳 Secure checkout</div>
          <p className="mt-1 text-[12px] text-muted">All information is encrypted and transmitted without risk using a Secure Socket Layer protocol.</p>
        </Card>

        {/* What you get */}
        <h2 className="mt-8 text-center text-xl font-bold text-white">What you get</h2>
        <div className="mt-4 space-y-3">
          {WHAT_YOU_GET.map((w) => <div key={w} className="flex items-start gap-3"><PinkCheck /><span className="text-[14px] text-white/90">{w}</span></div>)}
        </div>

        {/* Without / With — the "With" card is raised and overlaps the "Without" card, drawing the eye (matches the original) */}
        <div className="relative mt-8 pb-2">
          {/* With Spirio — elevated, on top, right */}
          <div className="absolute right-0 top-0 z-10 w-[53%] rounded-2xl p-4 shadow-[0_14px_34px_rgba(0,0,0,0.5)]" style={{ background: 'linear-gradient(160deg, #45295f, #2c1d42)' }}>
            <div className="mb-3 text-sm font-bold text-white">With Spirio</div>
            {WITH.map((w) => (
              <div key={w} className="mb-2.5 flex items-start gap-2 text-[12px] leading-snug text-white/90">
                <span className="mt-0.5 flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-full" style={{ background: '#22c55e' }}>
                  <svg viewBox="0 0 24 24" className="h-2.5 w-2.5" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>
                </span>
                {w}
              </div>
            ))}
          </div>
          {/* Without Spirio — lower, behind (extra right padding so text wraps clear of the overlapping card) */}
          <div className="mt-9 w-[53%] rounded-2xl border border-cardborder bg-white/[0.02] p-4 pr-7">
            <div className="mb-3 text-sm font-bold text-white">Without Spirio</div>
            {WITHOUT.map((w) => (
              <div key={w} className="mb-2.5 flex items-start gap-2 text-[12px] leading-snug text-muted">
                <span className="mt-0.5 flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-full border" style={{ borderColor: '#5b5566', color: '#8a8494' }}>
                  <svg viewBox="0 0 24 24" className="h-2 w-2" fill="none" stroke="currentColor" strokeWidth="3.6" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
                </span>
                {w}
              </div>
            ))}
          </div>
        </div>

        {/* Harvard */}
        <Card className="mt-4 flex items-center gap-4">
          <img src={MEDIA.harvard} alt="Harvard Medical School" loading="lazy" className="h-12 w-12 shrink-0 object-contain" />
          <p className="text-[13px] leading-snug text-white/90">{gold('Harvard Medical School research shows spiritual people are happier & healthier', ['Harvard Medical School'])}</p>
        </Card>

        {/* Social proof + stats */}
        <h2 className="mt-8 text-center text-[1.4rem] font-bold leading-tight text-white">{gold(`284,620 ${G ? 'women' : 'men'} just like you`, [`284,620 ${G ? 'women' : 'men'}`])} achieved great results</h2>
        <Card className="mt-4 overflow-hidden p-0">
          <div className="relative h-52 w-full overflow-hidden" style={{ background: 'radial-gradient(115% 80% at 50% 40%, #5b4677 0%, #3b2d54 44%, #241b32 74%, #17131e 100%)' }}>
            <img src={MEDIA.socialPetals} alt="" loading="lazy" className="pointer-events-none absolute inset-x-0 top-0 w-full select-none" />
            <img src={G ? MEDIA.socialWoman : MEDIA.socialMan} alt="" loading="lazy" className="pointer-events-none absolute bottom-0 left-1/2 h-[84%] w-auto -translate-x-1/2 select-none" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#15141b] to-transparent" />
          </div>
          <div className="px-4 pb-3 pt-1">
            {STATS.map((s, i) => (
              <div key={s.n} className={`flex items-start gap-3 py-3 ${i > 0 ? 'border-t border-white/10' : ''}`}>
                <span className="shrink-0 leading-none text-gold"><span className="text-[2rem] font-extrabold">{s.n}</span><span className="align-top text-sm font-extrabold">%</span></span>
                <span className="mt-1 text-[13px] leading-snug text-white/80">{s.pre}<span className="font-bold text-white">{s.bold}</span>{s.post}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* As featured */}
        <Card className="mt-8 text-center">
          <p className="text-sm text-muted">Our program is based on methodology</p>
          <h3 className="mt-1 text-xl font-bold text-gold">As featured in</h3>
          <div className="mx-auto mt-5 flex max-w-[300px] flex-wrap items-center justify-center gap-x-7 gap-y-4 text-white/55">
            <span className="flex items-center gap-1.5 text-[13px] font-bold tracking-tight"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/55 text-[6px] font-black leading-none text-[#15141b]">USA</span>USA TODAY</span>
            <span className="font-serif text-2xl font-bold italic leading-none">Forbes</span>
            <span className="font-serif text-xl font-bold leading-none tracking-tight">WSJ</span>
            <span className="font-serif text-lg font-semibold italic leading-none">Women’s Health</span>
            <span className="text-lg font-bold lowercase leading-none tracking-tight">healthline</span>
            <span className="text-xl font-extrabold leading-none tracking-tight">Mashable</span>
          </div>
        </Card>
        <Card className="mt-6 flex items-center gap-4">
          <img src={MEDIA.awardBadge} alt="Best Well-being Product Innovation Award 2023" loading="lazy" className="h-16 w-auto shrink-0" />
          <p className="text-[13px] leading-snug text-white/90"><span className="font-bold text-gold">Spirio</span> is proudly nominated for an: <span className="font-bold">Best Well-being Product Innovation Award – 2023</span></p>
        </Card>

        {/* Blueprint */}
        <h2 className="mt-8 text-center text-xl font-bold text-white">A better version of you. Everyday.</h2>
        <p className="mt-1 text-center text-sm text-muted">Your tailored high-vibration growth blueprint</p>
        <img src={G ? MEDIA.blueprintFemale : MEDIA.blueprintMale} alt="Your tailored weekly plan" loading="lazy" className="mt-4 w-full rounded-2xl border border-cardborder" />

        {/* Testimonials */}
        <h2 className="mt-8 text-center text-xl font-bold text-white">People love Spirio</h2>
        <div className="mt-4 space-y-3">
          {REVIEWS.map((r) => (
            <Card key={r.name}>
              <div className="flex items-start gap-3">
                {r.img ? (
                  <img src={r.img} alt="" className="h-11 w-11 shrink-0 rounded-full object-cover" style={{ objectPosition: 'center 20%' }} />
                ) : (
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: r.bg }}>{r.initials}</span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-bold text-white">{r.name}</span>
                    <span className="whitespace-nowrap text-[11px] text-muted">{r.when}</span>
                  </div>
                  <div role="img" aria-label={`Rated ${r.rating} out of 5`} className="mt-0.5 text-sm leading-none text-gold"><span aria-hidden="true">★★★★★</span> <span aria-hidden="true" className="text-xs text-white/70">{r.rating}</span></div>
                </div>
              </div>
              <p className="mt-3 text-[13px] leading-snug text-white/80">{r.text}</p>
            </Card>
          ))}
        </div>

        {/* FAQ */}
        <h2 className="mt-8 text-center text-xl font-bold text-white">People often ask</h2>
        <div className="mt-4 space-y-3">
          {FAQS.map((f, i) => {
            const open = faq === i
            return (
              <div key={f.q} className="overflow-hidden rounded-2xl border border-cardborder bg-white/[0.03]">
                <button type="button" aria-expanded={open} aria-controls={`faq-panel-${i}`} onClick={() => setFaq(open ? null : i)} className="flex w-full items-start gap-3 p-4 text-left">
                  <span aria-hidden="true" className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold text-sm font-bold text-ink">?</span>
                  <span className="flex-1 text-[14px] font-medium text-white">{f.q}</span>
                  <span aria-hidden="true" className="text-muted">{open ? '▾' : '▸'}</span>
                </button>
                {open && <div id={`faq-panel-${i}`} className="px-4 pb-4 pl-[3.25rem] text-[13px] leading-snug text-white/80">{f.a}</div>}
              </div>
            )
          })}
        </div>

        {/* Offer repeated after the FAQ (price + guarantee), matching the original */}
        <h2 className="mt-10 break-words text-center text-xl font-bold text-white">{name ? `${name}, ` : ''}your personalized plan is ready!</h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="flex items-start gap-2.5 border-r border-white/10 pr-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-white/75"><RowIcon name="brain" /></span>
            <div className="leading-tight"><div className="text-[11px] text-muted">Current pattern</div><div className="text-[13px] font-bold text-white">Fear, negative loops</div></div>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-white/75"><RowIcon name="target" /></span>
            <div className="leading-tight"><div className="text-[11px] text-muted">What you want</div><div className="text-[13px] font-bold text-white">{goalCap}</div></div>
          </div>
        </div>

        <div role="radiogroup" aria-label="Choose your plan" className="mt-5 space-y-3">
          {step.plans.map((p: Plan) => {
            const sel = plan === p.id
            const m = p.perDay.match(/(\d+)[.,](\d+)/)
            return (
              <button key={p.id} type="button" role="radio" aria-checked={sel} aria-label={`${p.name}, ${p.price}${p.discount ? `, ${p.discount}` : ''}`} onClick={() => setPlan(p.id)} className={`relative block w-full overflow-hidden rounded-2xl border-2 text-left transition-all ${sel ? 'border-gold' : 'border-cardborder'}`} style={{ background: sel ? 'linear-gradient(160deg, rgba(99,64,150,0.45), rgba(58,40,86,0.4))' : 'rgba(255,255,255,0.03)' }}>
                {p.popular && <div className="bg-gold py-1 text-center text-[10px] font-bold uppercase tracking-wider text-ink">Most Popular</div>}
                <div className="flex items-center gap-3 p-4 pt-5">
                  {p.discount && <span className="absolute left-0 top-0 rounded-br-xl px-2 py-0.5 text-[11px] font-bold text-white" style={{ background: '#ef4444' }}>{p.discount}</span>}
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${sel ? 'border-gold' : 'border-muted'}`}>{sel && <span className="h-2.5 w-2.5 rounded-full bg-gold" />}</span>
                  <div className="flex-1">
                    <div className="font-bold uppercase text-white">{p.name}</div>
                    <div className="text-sm text-muted">{p.price}</div>
                  </div>
                  <div className="relative flex items-center rounded-lg px-3 py-1.5" style={{ background: sel ? '#fff' : '#b6b0c0', color: '#1a1626' }}>
                    <span className="absolute -left-1 h-2.5 w-2.5 rounded-full" style={{ background: '#141319' }} />
                    <span className="mr-0.5 text-sm font-semibold">€</span>
                    <span className="text-3xl font-extrabold leading-none">{m ? m[1] : '0'}</span>
                    <span className="ml-0.5 flex flex-col text-[10px] font-bold leading-tight"><span>{m ? m[2] : ''}</span><span className="text-gray-500">day</span></span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-[13px] font-semibold text-white"><span style={{ color: '#22c55e' }}>🛡️</span> 30-day money-back guarantee</div>
        <div className="mt-4">{GET('w-full py-4 text-base')}</div>
        <div className="mt-3 flex justify-center"><span className="rounded-full border px-3 py-1.5 text-xs font-semibold" style={{ borderColor: '#227e64', color: '#227e64' }}>🛡️ Pay safe & secure</span></div>
        <PaymentLogos />
        <p className="mt-3 text-center text-[11px] leading-relaxed text-muted">
          By completing your purchase you agree to automatic renewal of the subscription. First month for {selected.price}, then €39.99 every month. Cancel anytime in the mobile application or by emailing support@spiriohub.com. See Terms of Use.
        </p>

        {step.moneyBackTitle && (
          <Card className="mt-6 text-center">
            <div className="text-2xl">🛡️</div>
            <div className="mt-1 text-lg font-bold text-white">{step.moneyBackTitle}</div>
            {step.moneyBackBody && <p className="mt-2 text-[13px] leading-snug text-white/80">{step.moneyBackBody}</p>}
            {step.moneyBackLinkText && <p className="mt-3 text-[12px] text-muted">{step.moneyBackLinkPrefix}<a href={step.moneyBackLinkUrl} target="_blank" rel="noreferrer" className="text-gold underline">{step.moneyBackLinkText}<span className="sr-only"> (opens in a new tab)</span></a></p>}
          </Card>
        )}

        <Card className="mt-4">
          <div className="text-sm font-bold text-white">🔒 Your information is safe</div>
          <p className="mt-1 text-[12px] text-muted">We won’t sell or rent your personal contact information for any marketing purposes whatsoever.</p>
          <div className="mt-3 text-sm font-bold text-white">💳 Secure checkout</div>
          <p className="mt-1 text-[12px] text-muted">All information is encrypted and transmitted without risk using a Secure Socket Layer protocol.</p>
        </Card>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60" onClick={() => setShowModal(false)}>
          <div onClick={(e) => e.stopPropagation()} className="max-h-[92vh] w-full max-w-[460px] overflow-y-auto rounded-t-3xl p-5 pb-8" style={{ background: '#1b1a22', animation: 'sheetUp 0.3s ease-out' }}>
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/20" />
            <h3 className="text-center text-lg font-bold text-white">🎊 Additional discount</h3>

            <div className="mt-4 overflow-hidden rounded-xl">
              <div className="py-2 text-center text-[13px] font-extrabold uppercase tracking-wide text-white" style={{ background: '#f0453e' }}>Discount reserved for {mmssModal}</div>
              <div className="flex items-center justify-between gap-3 p-3" style={{ background: 'linear-gradient(160deg, #45295f, #2c1d42)' }}>
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl" style={{ background: '#4a3a6e' }}>🌟</span>
                  <span className="text-[13px] font-bold leading-tight text-white">Your personal High-Vibration<br />Growth Plan</span>
                </div>
                <span className="shrink-0 text-[12px] text-white/70">Full access</span>
              </div>
            </div>

            <div className="my-5 h-px bg-white/10" />

            <p className="text-center text-[15px] font-bold leading-snug text-white">We added <span style={{ color: '#3ad29f' }}>FREE</span> personalised modules to speed up your <span style={{ color: '#f0453e' }}>Vibrations Growth</span>:</p>

            <div className="mt-4 rounded-xl p-4" style={{ background: 'linear-gradient(160deg, #45295f, #2c1d42)' }}>
              {BONUSES.map((b) => (
                <div key={b.name} className="flex items-center justify-between py-1.5 text-[14px]">
                  <span className="text-white">{b.name}</span>
                  <span className="shrink-0"><span className="text-white/40 line-through">{b.old}</span> <span className="font-bold" style={{ color: '#3ad29f' }}>€0</span></span>
                </div>
              ))}
            </div>

            <button onClick={buy} className="mt-5 w-full rounded-2xl bg-[#227e64] py-4 text-base font-bold text-white transition-all hover:brightness-110 active:scale-[0.99]">CONTINUE</button>
          </div>
        </div>
      )}
    </div>
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

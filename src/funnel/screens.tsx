import { useEffect, useState } from 'react'
import type { Step, Answers, Option, Plan } from './types'

/* ------------------------------ Progress bar ------------------------------ */
export function ProgressBar({
  current,
  total,
  onBack,
}: {
  current: number
  total: number
  onBack: () => void
}) {
  const pct = Math.min(100, Math.round((current / total) * 100))
  return (
    <div className="flex items-center gap-3 px-1 pb-5 pt-3">
      <button
        onClick={onBack}
        aria-label="Back"
        className="text-muted hover:text-white transition-colors text-xl leading-none w-6"
      >
        ‹
      </button>
      <div className="flex-1 h-1.5 rounded-full bg-cardborder overflow-hidden">
        <div
          className="h-full rounded-full bg-gold transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-muted tabular-nums w-10 text-right">{pct}%</span>
    </div>
  )
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

// Hero image shown on info / summary screens.
function Hero({ src, fallbackEmoji }: { src?: string; fallbackEmoji?: string }) {
  if (src) {
    return (
      <img
        src={src}
        alt=""
        loading="lazy"
        className="mx-auto mb-5 max-h-56 w-full max-w-xs rounded-2xl object-cover"
      />
    )
  }
  if (fallbackEmoji) return <div className="mb-2 text-center text-6xl">{fallbackEmoji}</div>
  return null
}

// Two-tone title: white base + gold accent.
function RichTitle({ title, accent }: { title: string; accent?: string }) {
  return (
    <h1 className="text-[1.7rem] leading-tight font-semibold text-white text-center">
      {title}
      {accent && <span className="text-gold">{accent}</span>}
    </h1>
  )
}

function Disclaimer({ text }: { text: string }) {
  const parts = text.split(/(Terms of Use|Privacy Policy|Cookie Policy)/g)
  return (
    <p className="text-[11px] leading-relaxed text-muted mt-2">
      {parts.map((p, i) =>
        /Terms of Use|Privacy Policy|Cookie Policy/.test(p) ? (
          <u key={i}>{p}</u>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </p>
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
      {option.image && (
        <img src={option.image} alt="" loading="lazy" className={`w-full ${aspect} object-cover`} />
      )}
      <div className="flex items-center justify-between px-4 py-3 font-medium text-white" style={{ backgroundColor: option.color }}>
        <span>{option.label}</span>
        <span aria-hidden className="text-lg leading-none text-white/90">›</span>
      </div>
    </button>
  )
}

// Gender select — photo cards + 1-minute-quiz + disclaimer.
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
      return <InputView step={step} onAnswer={onAnswer} onNext={onNext} />

    case 'info': {
      const callout = step.callout ? <p className="mt-3 text-sm font-semibold text-gold">{step.callout}</p> : null
      if (step.fullBleed && step.image) {
        return (
          <>
            <div
              className="fixed inset-0 -z-10 bg-cover bg-center"
              style={{ backgroundImage: `linear-gradient(to bottom, rgba(20,19,25,0.92) 0%, rgba(20,19,25,0.7) 24%, rgba(20,19,25,0.2) 46%, rgba(20,19,25,0.2) 60%, rgba(20,19,25,0.88) 100%), url(${step.image})` }}
            />
            <div className="flex min-h-[78vh] flex-col animate-fadeUp">
              <div className="text-center" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.7)' }}>
                <Title>{step.title}</Title>
                {step.body && <Subtitle>{step.body}</Subtitle>}
                {callout}
              </div>
              <div className="mt-auto pt-10">
                <PrimaryButton onClick={onNext}>{step.cta ?? 'Continue'}</PrimaryButton>
              </div>
            </div>
          </>
        )
      }
      return (
        <Stack center>
          <Hero src={step.image} fallbackEmoji={step.emoji} />
          <Title>{step.title}</Title>
          {step.body && <Subtitle>{step.body}</Subtitle>}
          {callout}
          <div className="mt-8">
            <PrimaryButton onClick={onNext}>{step.cta ?? 'Continue'}</PrimaryButton>
          </div>
        </Stack>
      )
    }

    case 'summary':
      return (
        <Stack center>
          <Hero src={step.image} fallbackEmoji="🔮" />
          <Title>{step.title}</Title>
          {step.body && <Subtitle>{step.body}</Subtitle>}
          <div className="mt-8">
            <PrimaryButton onClick={onNext}>{step.cta ?? 'Continue'}</PrimaryButton>
          </div>
        </Stack>
      )

    case 'loader':
      return <LoaderView step={step} onNext={onNext} />

    case 'paywall':
      return <PaywallView step={step} onAnswer={onAnswer} onNext={onNext} />

    case 'upsell':
      return (
        <Stack center>
          <Hero src={step.image} fallbackEmoji="🎁" />
          <Title>{step.title}</Title>
          {step.body && <Subtitle>{step.body}</Subtitle>}
          <div className="text-center text-gold text-2xl font-bold mt-4">{step.price}</div>
          <div className="mt-8 space-y-3">
            <PrimaryButton onClick={() => { onAnswer(step.id, 'accept'); onNext() }}>{step.accept}</PrimaryButton>
            <button onClick={() => { onAnswer(step.id, 'decline'); onNext() }} className="w-full text-muted text-sm py-2 hover:text-white">
              {step.decline}
            </button>
          </div>
        </Stack>
      )

    case 'success':
      return (
        <Stack center>
          <div className="text-6xl text-center mb-2">✅</div>
          <Title>{step.title}</Title>
          {step.body && <Subtitle>{step.body}</Subtitle>}
          <div className="mt-8">
            <PrimaryButton onClick={onNext}>{step.cta ?? 'Finish'}</PrimaryButton>
          </div>
        </Stack>
      )
  }
}

/* ------------------------------- Sub-views -------------------------------- */
function Stack({ children, center }: { children: React.ReactNode; center?: boolean }) {
  return (
    <div className={`flex flex-col ${center ? 'justify-center min-h-[60vh]' : ''} animate-fadeUp`}>{children}</div>
  )
}

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
  const toggle = (v: string) => {
    let next: string[]
    if (selected.includes(v)) next = selected.filter((x) => x !== v)
    else if (step.max && selected.length >= step.max) next = [...selected.slice(1), v]
    else next = [...selected, v]
    onAnswer(key, next)
  }
  return (
    <Stack>
      {step.image ? <Hero src={step.image} /> : null}
      <Title>{step.title}</Title>
      {step.subtitle && <Subtitle>{step.subtitle}</Subtitle>}
      <div className="grid grid-cols-1 gap-3 mt-6">
        {step.options.map((o) => (
          <OptionCard key={o.value} option={o} selected={selected.includes(o.value)} onClick={() => toggle(o.value)} />
        ))}
      </div>
      <div className="mt-6">
        <PrimaryButton disabled={selected.length === 0} onClick={onNext}>
          Continue
        </PrimaryButton>
      </div>
    </Stack>
  )
}

function InputView({
  step,
  onAnswer,
  onNext,
}: {
  step: Extract<Step, { type: 'input' }>
  onAnswer: (key: string, value: string) => void
  onNext: () => void
}) {
  const [value, setValue] = useState('')
  const valid =
    step.field === 'email' ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) : value.trim().length > 0
  const submit = () => {
    if (!valid) return
    onAnswer(step.saveAs, value.trim())
    onNext()
  }
  return (
    <Stack center>
      {step.image ? <Hero src={step.image} /> : null}
      <Title>{step.title}</Title>
      {step.subtitle && <Subtitle>{step.subtitle}</Subtitle>}
      <input
        autoFocus
        type={step.field === 'email' ? 'email' : 'text'}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        placeholder={step.placeholder}
        className="mt-6 w-full rounded-2xl border border-cardborder bg-card px-4 py-4 text-white placeholder:text-muted outline-none focus:border-gold"
      />
      <div className="mt-6">
        <PrimaryButton disabled={!valid} onClick={submit}>
          {step.cta ?? 'Continue'}
        </PrimaryButton>
      </div>
    </Stack>
  )
}

function LoaderView({ step, onNext }: { step: Extract<Step, { type: 'loader' }>; onNext: () => void }) {
  const [pct, setPct] = useState(0)
  useEffect(() => {
    const dur = step.duration ?? 3000
    const start = performance.now()
    let raf = 0
    const tick = (t: number) => {
      const p = Math.min(100, Math.round(((t - start) / dur) * 100))
      setPct(p)
      if (p < 100) raf = requestAnimationFrame(tick)
      else setTimeout(onNext, 350)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [step.duration, onNext])
  return (
    <Stack center>
      <div className="text-6xl text-center mb-4 animate-pulse">🌌</div>
      <Title>{step.title}</Title>
      <div className="mt-8 mx-auto w-full max-w-xs h-2 rounded-full bg-cardborder overflow-hidden">
        <div className="h-full bg-gold transition-all" style={{ width: `${pct}%` }} />
      </div>
      <div className="text-center text-muted text-sm mt-3 tabular-nums">{pct}%</div>
    </Stack>
  )
}

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
      <Title>{step.title}</Title>
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
              <div className={`mt-1 w-4 h-4 rounded-full border ${plan === p.id ? 'bg-gold border-gold' : 'border-muted'} ml-auto`} />
            </div>
          </button>
        ))}
      </div>
      <div className="mt-6">
        <PrimaryButton onClick={() => { onAnswer('plan', plan); onNext() }}>{step.cta ?? 'Continue'}</PrimaryButton>
      </div>
      <p className="text-[11px] text-muted text-center mt-3 leading-relaxed">
        By continuing you agree that the subscription auto-renews unless cancelled at least 24h before the end of the period.
      </p>
    </Stack>
  )
}

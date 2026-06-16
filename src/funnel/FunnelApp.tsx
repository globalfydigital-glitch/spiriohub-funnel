import { useEffect, useMemo, useRef, useState } from 'react'
import { STEPS, LIGHT_STEPS } from './steps'
import { QUESTION_TYPES, type Answers } from './types'
import { StepView } from './screens'
import { Dashboard } from './Dashboard'
import { track } from './analytics'

const isQuestion = (t: string) => (QUESTION_TYPES as readonly string[]).includes(t)

// Optional dev shortcut: open ?step=paywall (or ?step=12) to jump to a screen.
function initialIndex() {
  if (typeof window === 'undefined') return 0
  const p = new URLSearchParams(window.location.search).get('step')
  if (!p) return 0
  const byId = STEPS.findIndex((s) => s.id === p)
  if (byId >= 0) return byId
  const n = parseInt(p, 10)
  return Number.isFinite(n) && n >= 0 && n < STEPS.length ? n : 0
}

// Preview/testing + ad-traffic convenience: seed answers from the URL
// (?gender=&age=&goal=&name=, also accepts the original's gen_type/attract).
function initialAnswers(): Answers {
  if (typeof window === 'undefined') return {}
  const p = new URLSearchParams(window.location.search)
  const a: Answers = {}
  const gender = p.get('gender') || p.get('gen_type')
  if (gender) a.gender = gender
  const age = p.get('age')
  if (age) a.age = age
  const goalRaw = p.get('goal') || p.get('attract')
  if (goalRaw) a.goal = goalRaw.toLowerCase().replace(/\s+/g, '-')
  const name = p.get('name')
  if (name) a.name = name
  return a
}

export function FunnelApp() {
  // Internal analytics dashboard at ?dashboard — kept out of the funnel flow / hooks.
  if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('dashboard')) {
    return <Dashboard />
  }
  return <Funnel />
}

function Funnel() {
  const [index, setIndex] = useState(initialIndex)
  const [answers, setAnswers] = useState<Answers>(initialAnswers)
  // Synced synchronously so onNext reads the just-set answer without a stale closure.
  const answersRef = useRef<Answers>(answers)
  const [leaving, setLeaving] = useState(false)

  const step = STEPS[index]

  // Funnel-flow analytics: log each screen view.
  useEffect(() => {
    track('view', step.id, index, null, answersRef.current)
  }, [index, step.id])

  // Original counts 19 question screens (matches the live funnel's "x/19"):
  // age + 12 scale + name + goal + familiar + leave-past + time + feel-year. Gender & email excluded.
  const { totalQuestions, currentQuestion } = useMemo(() => {
    const counted = (s: (typeof STEPS)[number]) => isQuestion(s.type) && s.type !== 'gender' && s.id !== 'email'
    const total = STEPS.filter(counted).length
    const current = STEPS.slice(0, index + 1).filter(counted).length
    return { totalQuestions: total, currentQuestion: current }
  }, [index])

  const onAnswer = (key: string, value: string | string[]) => {
    answersRef.current = { ...answersRef.current, [key]: value }
    setAnswers((a) => ({ ...a, [key]: value }))
    // plan + upsell choices have no saveAs on their step → log them here.
    if (key === 'plan' || value === 'accept' || value === 'decline') {
      track('answer', step.id, index, String(value), answersRef.current)
    }
  }

  // "Blink" transition: fade the current screen out to just the background, then switch + fade the new one in.
  const go = (change: () => void) => {
    if (leaving) return
    setLeaving(true)
    setTimeout(() => {
      change()
      setLeaving(false)
    }, 200)
  }

  const onNext = () => {
    // Log the step's final answer (skip name/email = PII). Multi-select arrays joined with '|'.
    const sa = (step as { saveAs?: string }).saveAs
    if (sa && sa !== 'name' && sa !== 'email') {
      const v = answersRef.current[sa]
      if (v != null && v !== '') track('answer', step.id, index, Array.isArray(v) ? v.join('|') : String(v), answersRef.current)
    }
    go(() => setIndex((i) => (i < STEPS.length - 1 ? i + 1 : 0)))
  }
  const onBack = () => go(() => setIndex((i) => Math.max(0, i - 1)))

  const isFirst = index === 0
  // Progress bar/counter: on every counted question (name included), hidden only on email.
  const showProgress = ['single', 'scale', 'multi', 'input'].includes(step.type) && step.id !== 'email'
  // Back arrow hidden where the original hides it.
  const NO_BACK_IDS = new Set(['name', 'plan-ready', 'email'])
  const showBack = !isFirst && step.type !== 'loader' && step.type !== 'success' && !NO_BACK_IDS.has(step.id)
  const pct = Math.min(100, Math.round((currentQuestion / totalQuestions) * 100))

  // The selling page renders its own sticky timer header.
  const hideHeader = step.type === 'paywall'

  // Light "checkout" theme on the late-funnel screens (acclimates the lead to the Salduu checkout look).
  const light = LIGHT_STEPS.has(step.id)

  return (
    <div className="min-h-screen w-full flex flex-col overflow-x-hidden" style={light ? { background: '#F5F5F5' } : undefined}>
      {/* Full-width header */}
      {!hideHeader && (
      <header className="w-full px-5 sm:px-8 pt-4">
        <div className="flex items-center justify-between pb-2.5">
          <div className="flex items-center gap-3">
            {showBack && (
              <button onClick={onBack} aria-label="Back" className="text-xl leading-none text-white hover:opacity-70" style={light ? { color: '#1c1a26' } : undefined}>
                ←
              </button>
            )}
            <span className="font-serif text-xl tracking-wide text-white" style={light ? { color: '#1c1a26' } : undefined}>
              Spirio
              <span className="ml-2 align-middle font-sans text-xs font-normal tracking-[0.2em] text-muted" style={light ? { color: '#8a8694' } : undefined}>| QUIZ</span>
            </span>
          </div>
          {isFirst ? (
            <span className="flex items-center gap-1.5 text-sm">
              <span className="text-gold">★</span>
              <span className="text-white/90">4.6</span>
              <span className="text-muted">/ 5</span>
            </span>
          ) : showProgress ? (
            <span className="text-sm tabular-nums text-muted">
              {currentQuestion}/{totalQuestions}
            </span>
          ) : null}
        </div>
        {showProgress && (
          <div className="h-[2px] w-full overflow-hidden rounded-full bg-cardborder">
            <div className="h-full rounded-full bg-gold transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
        )}
      </header>
      )}

      {/* Centered content column */}
      <div className="mx-auto flex w-full max-w-[460px] flex-1 flex-col px-5 pb-10 pt-2">
        <div key={step.id} className={`flex flex-1 flex-col justify-center ${leaving ? 'opacity-0 transition-opacity duration-200 ease-in' : 'animate-[stepIn_0.3s_ease-out]'}`}>
          <StepView step={step} answers={answers} onAnswer={onAnswer} onNext={onNext} />
        </div>
      </div>
    </div>
  )
}

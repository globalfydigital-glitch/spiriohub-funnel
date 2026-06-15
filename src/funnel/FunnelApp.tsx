import { useMemo, useState } from 'react'
import { STEPS } from './steps'
import { QUESTION_TYPES, type Answers } from './types'
import { StepView } from './screens'

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

export function FunnelApp() {
  const [index, setIndex] = useState(initialIndex)
  const [answers, setAnswers] = useState<Answers>({})

  const step = STEPS[index]

  // Original counts 19 question screens (matches the live funnel's "x/19"):
  // age + 12 scale + name + goal + familiar + leave-past + time + feel-year. Gender & email excluded.
  const { totalQuestions, currentQuestion } = useMemo(() => {
    const counted = (s: (typeof STEPS)[number]) => isQuestion(s.type) && s.type !== 'gender' && s.id !== 'email'
    const total = STEPS.filter(counted).length
    const current = STEPS.slice(0, index + 1).filter(counted).length
    return { totalQuestions: total, currentQuestion: current }
  }, [index])

  const onAnswer = (key: string, value: string | string[]) =>
    setAnswers((a) => ({ ...a, [key]: value }))

  const onNext = () => setIndex((i) => (i < STEPS.length - 1 ? i + 1 : 0))
  const onBack = () => setIndex((i) => Math.max(0, i - 1))

  const isFirst = index === 0
  // Progress bar/counter: on every counted question (name included), hidden only on email.
  const showProgress = ['single', 'scale', 'multi', 'input'].includes(step.type) && step.id !== 'email'
  // Back arrow hidden where the original hides it.
  const NO_BACK_IDS = new Set(['name', 'plan-ready', 'email'])
  const showBack = !isFirst && step.type !== 'loader' && step.type !== 'success' && !NO_BACK_IDS.has(step.id)
  const pct = Math.min(100, Math.round((currentQuestion / totalQuestions) * 100))

  // The selling page renders its own sticky timer header.
  const hideHeader = step.type === 'paywall'

  return (
    <div className="min-h-screen w-full flex flex-col">
      {/* Full-width header */}
      {!hideHeader && (
      <header className="w-full px-5 sm:px-8 pt-4">
        <div className="flex items-center justify-between pb-2.5">
          <div className="flex items-center gap-3">
            {showBack && (
              <button onClick={onBack} aria-label="Back" className="text-xl leading-none text-white hover:opacity-70">
                ←
              </button>
            )}
            <span className="font-serif text-xl tracking-wide text-white">
              Spirio
              <span className="ml-2 align-middle font-sans text-xs font-normal tracking-[0.2em] text-muted">| QUIZ</span>
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
        <div className="flex flex-1 flex-col justify-center">
          <StepView key={step.id} step={step} answers={answers} onAnswer={onAnswer} onNext={onNext} />
        </div>
      </div>
    </div>
  )
}

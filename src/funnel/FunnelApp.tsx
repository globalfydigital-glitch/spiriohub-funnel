import { useMemo, useState } from 'react'
import { STEPS } from './steps'
import { QUESTION_TYPES, type Answers } from './types'
import { ProgressBar, StepView } from './screens'

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

  const { totalQuestions, currentQuestion } = useMemo(() => {
    const total = STEPS.filter((s) => isQuestion(s.type)).length
    const current = STEPS.slice(0, index + 1).filter((s) => isQuestion(s.type)).length
    return { totalQuestions: total, currentQuestion: current }
  }, [index])

  const onAnswer = (key: string, value: string | string[]) =>
    setAnswers((a) => ({ ...a, [key]: value }))

  const onNext = () => setIndex((i) => (i < STEPS.length - 1 ? i + 1 : 0))
  const onBack = () => setIndex((i) => Math.max(0, i - 1))

  const showProgress = step.type !== 'loader' && step.type !== 'success' && step.type !== 'gender'

  return (
    <div className="min-h-screen w-full flex flex-col">
      {/* Full-width header: logo left, rating right */}
      <header className="w-full flex items-center justify-between px-5 sm:px-8 pt-4 pb-2">
        <span className="font-serif text-xl tracking-wide text-white">
          Spirio
          <span className="ml-2 align-middle font-sans text-xs font-normal tracking-[0.2em] text-muted">| QUIZ</span>
        </span>
        <span className="flex items-center gap-1.5 text-sm">
          <span className="text-emerald-400">★</span>
          <span className="text-white/90">4,6</span>
          <span className="text-muted">/ 5</span>
        </span>
      </header>

      {/* Centered content column */}
      <div className="mx-auto flex w-full max-w-[460px] flex-1 flex-col px-5 pb-10">
        {showProgress && (
          <ProgressBar current={currentQuestion} total={totalQuestions} onBack={onBack} />
        )}
        <div className="flex flex-1 flex-col justify-center">
          <StepView key={step.id} step={step} answers={answers} onAnswer={onAnswer} onNext={onNext} />
        </div>
      </div>
    </div>
  )
}

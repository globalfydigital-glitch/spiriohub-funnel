import { useMemo, useState } from 'react'
import { STEPS, BRAND, MEDIA } from './steps'
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

  const showProgress = step.type !== 'loader' && step.type !== 'success'

  return (
    <div className="min-h-screen w-full flex flex-col items-center">
      {/* Atmospheric cosmic background (temporary placeholder image) */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat opacity-30"
        style={{ backgroundImage: `url(${MEDIA.bg})` }}
      />
      <div className="fixed inset-0 -z-10 bg-ink/60" />
      <div className="w-full max-w-[460px] flex flex-col px-5 pb-10 min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-center pt-4 pb-1">
          <span className="text-sm font-semibold tracking-wide text-white/80">{BRAND}</span>
        </div>

        {showProgress && (
          <ProgressBar current={currentQuestion} total={totalQuestions} onBack={onBack} />
        )}

        {/* Step */}
        <div className="flex-1 flex flex-col justify-center">
          <StepView key={step.id} step={step} answers={answers} onAnswer={onAnswer} onNext={onNext} />
        </div>
      </div>
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { STEPS } from './steps'
import { QUESTION_TYPES } from './types'
import { analyticsEnabled, fetchEvents, type FunnelEvent } from './analytics'

const isQuestion = (t: string) => (QUESTION_TYPES as readonly string[]).includes(t)
const labelFor = (s: (typeof STEPS)[number]) => {
  const t = 'title' in s && s.title ? s.title.replace(/\{\{.*?\}\}/g, '').replace(/\s+/g, ' ').trim() : ''
  return t ? (t.length > 46 ? t.slice(0, 44) + '…' : t) : s.id
}
const PAYWALL_IDX = STEPS.findIndex((s) => s.id === 'paywall')

type SessionAgg = {
  gender: string | null
  age: string | null
  goal: string | null
  viewed: Set<string>
  maxIdx: number
  answers: Map<string, string>
}

function aggregate(events: FunnelEvent[]) {
  const sessions = new Map<string, SessionAgg>()
  for (const e of events) {
    let s = sessions.get(e.session_id)
    if (!s) {
      s = { gender: null, age: null, goal: null, viewed: new Set(), maxIdx: -1, answers: new Map() }
      sessions.set(e.session_id, s)
    }
    if (e.gender) s.gender = e.gender
    if (e.age) s.age = e.age
    if (e.goal) s.goal = e.goal
    if (e.type === 'view') {
      s.viewed.add(e.step_id)
      if (e.step_index > s.maxIdx) s.maxIdx = e.step_index
    } else if (e.type === 'answer' && e.value != null) {
      s.answers.set(e.step_id, e.value) // last answer wins (handles multi-select toggles)
    }
  }
  const all = [...sessions.values()]
  const total = all.length || 1
  const startCount = STEPS[0] ? all.filter((s) => s.viewed.has(STEPS[0].id)).length || total : total

  const flow = STEPS.map((st, i) => {
    const count = all.filter((s) => s.viewed.has(st.id)).length
    return { id: st.id, index: i, label: labelFor(st), type: st.type, count }
  })

  const answersByStep: Record<string, { value: string; count: number }[]> = {}
  for (const st of STEPS) {
    if (!isQuestion(st.type) && st.id !== 'paywall') continue
    const counts = new Map<string, number>()
    for (const s of all) {
      const v = s.answers.get(st.id)
      if (v == null) continue
      for (const part of v.split('|')) {
        const k = part.trim()
        if (k) counts.set(k, (counts.get(k) ?? 0) + 1)
      }
    }
    if (counts.size) {
      answersByStep[st.id] = [...counts.entries()].map(([value, count]) => ({ value, count })).sort((a, b) => b.count - a.count)
    }
  }

  const seg = (key: 'gender' | 'age' | 'goal') => {
    const m = new Map<string, number>()
    for (const s of all) {
      const v = s[key]
      if (v) m.set(v, (m.get(v) ?? 0) + 1)
    }
    return [...m.entries()].map(([value, count]) => ({ value, count })).sort((a, b) => b.count - a.count)
  }
  const reachedPaywall = all.filter((s) => s.maxIdx >= PAYWALL_IDX).length

  return {
    total: all.length,
    startCount,
    flow,
    answersByStep,
    segments: { gender: seg('gender'), age: seg('age'), goal: seg('goal') },
    reachedPaywall,
    plan: answersByStep['paywall'] ?? [],
  }
}

// Synthetic data so the dashboard is viewable before Supabase is connected.
function mockEvents(): FunnelEvent[] {
  const out: FunnelEvent[] = []
  const genders = ['female', 'female', 'male']
  const ages = ['18-34', '35-49', '50-64', '65+']
  const goals = ['love', 'abundance', 'success', 'joy', 'confidence', 'dream-life']
  const N = 220
  for (let i = 0; i < N; i++) {
    const sid = `mock_${i}`
    const gender = genders[i % genders.length]
    const age = ages[i % ages.length]
    const goal = goals[i % goals.length]
    // each session drops off somewhere along the funnel (more reach early, fewer late)
    const reach = Math.max(1, Math.floor(STEPS.length * (0.25 + 0.75 * Math.pow((i % 50) / 50, 0.6))))
    const day = i % 30
    const created = new Date(Date.now() - day * 864e5).toISOString()
    for (let idx = 0; idx < reach && idx < STEPS.length; idx++) {
      const st = STEPS[idx]
      out.push({ session_id: sid, step_id: st.id, step_index: idx, type: 'view', value: null, gender, age, goal, created_at: created })
      if (st.id === 'goal') out.push({ session_id: sid, step_id: 'goal', step_index: idx, type: 'answer', value: goal, gender, age, goal, created_at: created })
      if (st.id === 'gender') out.push({ session_id: sid, step_id: 'gender', step_index: idx, type: 'answer', value: gender, gender, age, goal, created_at: created })
      if (st.id === 'age') out.push({ session_id: sid, step_id: 'age', step_index: idx, type: 'answer', value: age, gender, age, goal, created_at: created })
      if (st.id === 'paywall') out.push({ session_id: sid, step_id: 'paywall', step_index: idx, type: 'answer', value: ['m1', 'm3', 'm6'][i % 3], gender, age, goal, created_at: created })
    }
  }
  return out
}

const PALETTE = ['#f5c451', '#22c55e', '#a855f7', '#38bdf8', '#ef4444', '#f59e0b', '#ec4899', '#14b8a6']

function Bars({ items, total, color }: { items: { value: string; count: number }[]; total: number; color?: (i: number) => string }) {
  const max = Math.max(1, ...items.map((i) => i.count))
  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <div key={it.value} className="flex items-center gap-3">
          <div className="w-28 shrink-0 truncate text-right text-[12px] text-white/60" title={it.value}>{it.value}</div>
          <div className="h-5 flex-1 overflow-hidden rounded bg-white/[0.05]">
            <div className="flex h-full items-center justify-end rounded pr-2 text-[10px] font-bold text-black/80" style={{ width: `${(it.count / max) * 100}%`, minWidth: 22, background: color ? color(i) : '#f5c451' }}>{it.count}</div>
          </div>
          <div className="w-10 shrink-0 text-[11px] tabular-nums text-white/45">{Math.round((it.count / total) * 100)}%</div>
        </div>
      ))}
    </div>
  )
}

export function Dashboard() {
  const [range, setRange] = useState<'7d' | '30d' | 'all'>('30d')
  const [events, setEvents] = useState<FunnelEvent[] | null>(null)
  const [sel, setSel] = useState<string | null>('goal')

  useEffect(() => {
    if (!analyticsEnabled) return
    let live = true
    setEvents(null)
    const since = range === 'all' ? undefined : new Date(Date.now() - (range === '7d' ? 7 : 30) * 864e5).toISOString()
    fetchEvents(since).then((e) => live && setEvents(e))
    return () => {
      live = false
    }
  }, [range])

  const data = analyticsEnabled ? events ?? [] : mockEvents()
  const loading = analyticsEnabled && events === null
  const agg = useMemo(() => aggregate(data), [data])
  const start = agg.startCount

  const card = 'rounded-2xl border border-white/10 bg-white/[0.03] p-5'

  return (
    <div className="min-h-screen w-full px-4 py-6 text-white sm:px-8" style={{ background: '#0f0e13' }}>
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-serif text-2xl tracking-wide">Spirio <span className="text-white/40">· Funnel analytics</span></h1>
            <p className="mt-0.5 text-[13px] text-white/50">{agg.total} sessions · {agg.reachedPaywall} reached the offer · {Math.round((agg.reachedPaywall / (agg.total || 1)) * 100)}% completion</p>
          </div>
          <div className="flex gap-1 rounded-full border border-white/10 p-1">
            {(['7d', '30d', 'all'] as const).map((r) => (
              <button key={r} onClick={() => setRange(r)} className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${range === r ? 'bg-gold text-black' : 'text-white/60 hover:text-white'}`}>{r === 'all' ? 'All' : `Last ${r}`}</button>
            ))}
          </div>
        </div>

        {!analyticsEnabled && (
          <div className="mb-5 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-[13px] text-amber-200">
            Demo data — Supabase not connected. Enable Lovable Cloud + create the <code className="rounded bg-black/30 px-1">funnel_events</code> table and this fills with real data.
          </div>
        )}
        {loading && <div className="mb-5 text-sm text-white/50">Loading…</div>}

        <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          {/* Funnel flow */}
          <div className={card}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-white/70">Funnel flow — where leads drop off</h2>
            </div>
            <div className="space-y-1">
              {agg.flow.map((f, i) => {
                const pct = start ? (f.count / start) * 100 : 0
                const prev = i > 0 ? agg.flow[i - 1].count : f.count
                const drop = prev ? Math.round(((prev - f.count) / prev) * 100) : 0
                const q = isQuestion(f.type) || f.id === 'paywall'
                const active = sel === f.id
                return (
                  <button
                    key={f.id}
                    onClick={() => q && setSel(f.id)}
                    className={`flex w-full items-center gap-2 rounded-lg px-2 py-1 text-left ${q ? 'cursor-pointer hover:bg-white/[0.04]' : 'cursor-default'} ${active ? 'bg-white/[0.06] ring-1 ring-gold/40' : ''}`}
                  >
                    <span className="w-6 shrink-0 text-right text-[10px] tabular-nums text-white/30">{i + 1}</span>
                    <span className="w-40 shrink-0 truncate text-[12px] text-white/80" title={f.label}>{f.label}{q && <span className="text-gold"> ›</span>}</span>
                    <span className="relative h-4 flex-1 overflow-hidden rounded bg-white/[0.04]">
                      <span className="absolute inset-y-0 left-0 rounded" style={{ width: `${pct}%`, background: `linear-gradient(90deg,#1f9d6b,#22c55e)` }} />
                    </span>
                    <span className="w-12 shrink-0 text-right text-[11px] tabular-nums text-white">{f.count}</span>
                    <span className="w-10 shrink-0 text-right text-[10px] tabular-nums text-white/40">{Math.round(pct)}%</span>
                    <span className={`w-10 shrink-0 text-right text-[10px] tabular-nums ${drop > 0 ? 'text-red-400' : 'text-white/20'}`}>{drop > 0 ? `-${drop}%` : '—'}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Right column: answer drill-down + segments */}
          <div className="space-y-5">
            <div className={card}>
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-white/70">Answers · {sel ?? '—'}</h2>
              {sel && agg.answersByStep[sel] ? (
                <Bars items={agg.answersByStep[sel]} total={agg.answersByStep[sel].reduce((a, b) => a + b.count, 0)} />
              ) : (
                <p className="text-[13px] text-white/40">Click a step marked with “›” in the funnel to see what leads answer.</p>
              )}
            </div>

            <div className={card}>
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-white/70">Segments</h2>
              <div className="space-y-4">
                <div>
                  <div className="mb-1 text-[11px] text-white/40">Gender</div>
                  <Bars items={agg.segments.gender} total={agg.total} color={(i) => ['#ec4899', '#38bdf8'][i] ?? '#a855f7'} />
                </div>
                <div>
                  <div className="mb-1 text-[11px] text-white/40">Age</div>
                  <Bars items={agg.segments.age} total={agg.total} color={(i) => PALETTE[i % PALETTE.length]} />
                </div>
                <div>
                  <div className="mb-1 text-[11px] text-white/40">Goal</div>
                  <Bars items={agg.segments.goal} total={agg.total} color={(i) => PALETTE[i % PALETTE.length]} />
                </div>
                {agg.plan.length > 0 && (
                  <div>
                    <div className="mb-1 text-[11px] text-white/40">Plan selected</div>
                    <Bars items={agg.plan} total={agg.reachedPaywall || agg.total} color={() => '#22c55e'} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

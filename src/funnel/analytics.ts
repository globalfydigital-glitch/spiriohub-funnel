import type { Answers } from './types'

// Supabase REST (PostgREST) tracking — no SDK, works in both repos.
// Lovable Cloud injects VITE_SUPABASE_URL + an anon/publishable key. When absent
// (e.g. the standalone Vite preview) everything no-ops and the dashboard shows demo data.
const ENV = ((import.meta as unknown as { env?: Record<string, string> }).env) ?? {}
const SUPABASE_URL = ENV.VITE_SUPABASE_URL
const SUPABASE_KEY =
  ENV.VITE_SUPABASE_ANON_KEY || ENV.VITE_SUPABASE_PUBLISHABLE_KEY || ENV.VITE_SUPABASE_KEY

export const analyticsEnabled = !!(SUPABASE_URL && SUPABASE_KEY)
const TABLE = 'funnel_events'

export type EventType = 'view' | 'answer'

export type FunnelEvent = {
  session_id: string
  step_id: string
  step_index: number
  type: EventType
  value: string | null
  gender: string | null
  age: string | null
  goal: string | null
  created_at: string
}

function firstStr(v: unknown): string | null {
  if (Array.isArray(v)) return (v[0] as string) ?? null
  return typeof v === 'string' && v ? v : null
}

export function sessionId(): string {
  if (typeof window === 'undefined') return 'ssr'
  try {
    let id = localStorage.getItem('spirio_sid')
    if (!id) {
      id = crypto?.randomUUID?.() ?? `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
      localStorage.setItem('spirio_sid', id)
    }
    return id
  } catch {
    return 's_anon'
  }
}

const headers = () => ({
  apikey: SUPABASE_KEY as string,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
})

// Fire-and-forget event insert. Skips PII (name/email values are never sent — only the view).
export function track(type: EventType, stepId: string, stepIndex: number, value: string | null, answers: Answers): void {
  if (!analyticsEnabled || typeof window === 'undefined') return
  const body = {
    session_id: sessionId(),
    step_id: stepId,
    step_index: stepIndex,
    type,
    value,
    gender: firstStr(answers.gender),
    age: firstStr(answers.age),
    goal: firstStr(answers.goal),
  }
  fetch(`${SUPABASE_URL}/rest/v1/${TABLE}`, {
    method: 'POST',
    headers: { ...headers(), Prefer: 'return=minimal' },
    body: JSON.stringify(body),
    keepalive: true,
  }).catch(() => {})
}

export async function fetchEvents(sinceISO?: string): Promise<FunnelEvent[]> {
  if (!analyticsEnabled) return []
  const cols = 'session_id,step_id,step_index,type,value,gender,age,goal,created_at'
  let url = `${SUPABASE_URL}/rest/v1/${TABLE}?select=${cols}&order=created_at.asc&limit=200000`
  if (sinceISO) url += `&created_at=gte.${encodeURIComponent(sinceISO)}`
  try {
    const r = await fetch(url, { headers: headers() })
    if (!r.ok) return []
    return (await r.json()) as FunnelEvent[]
  } catch {
    return []
  }
}

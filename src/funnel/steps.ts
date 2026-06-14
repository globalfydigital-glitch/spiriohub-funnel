import type { Step, Option } from './types'

// Brand — change this to your own brand name.
export const BRAND = 'Spiriohub'

// Reused answer scale for the mindset statements.
const SCALE: Option[] = [
  { value: 'always', label: 'Always' },
  { value: 'often', label: 'Often' },
  { value: 'rarely', label: 'Rarely' },
  { value: 'never', label: 'Never' },
]

// ---------------------------------------------------------------------------
// FULL FUNNEL — faithful to signup.spiriohub.com (birth-of-the-flow: energy_b)
// Edit any title / option / price here. Images are placeholders (emoji + gradient).
// ---------------------------------------------------------------------------
export const STEPS: Step[] = [
  // 1 — Gender (first screen)
  {
    id: 'gender',
    type: 'gender',
    title: 'Become a high-vibration person & manifest your dreams into reality',
    saveAs: 'gender',
    options: [
      { value: 'male', label: 'Male', emoji: '♂️' },
      { value: 'female', label: 'Female', emoji: '♀️' },
    ],
  },

  // 2 — Age
  {
    id: 'age',
    type: 'single',
    title: "What's your age?",
    saveAs: 'age',
    options: [
      { value: '18-34', label: '18–34' },
      { value: '35-49', label: '35–49' },
      { value: '50-64', label: '50–64' },
      { value: '65+', label: '65+' },
    ],
  },

  // 3 — Transition / social proof
  {
    id: 't-signals',
    type: 'info',
    emoji: '✨',
    title: 'What we attract is a reflection of the signals we send with our mind and spirit',
    body: 'Over 500,000 people already use ' + BRAND + ' to raise their vibration.',
    cta: 'Continue',
  },

  // 4–15 — Mindset battery (12 statements, same scale)
  { id: 'm1', type: 'scale', title: 'I ___ have enough energy to get everything done', subtitle: 'Select the word that best fits you', options: SCALE },
  { id: 'm2', type: 'scale', title: 'I ___ expect to succeed when I start doing something', subtitle: 'Select the word that best fits you', options: SCALE },
  { id: 'm3', type: 'scale', title: 'I ___ feel guilt or worry in excess about past situations', subtitle: 'Select the word that best fits you', options: SCALE },
  { id: 'm4', type: 'scale', title: 'I ___ find myself angry and irritated by small reasons at times', subtitle: 'Select the word that best fits you', options: SCALE },
  { id: 'm5', type: 'scale', title: 'I ___ catch myself replaying negative situations in my mind', subtitle: 'Select the word that best fits you', options: SCALE },

  // transition teaser
  { id: 't-coping', type: 'info', emoji: '🧠', title: 'Expecting the worst is a coping mechanism', body: "It's normal — and it's something a daily practice can gently rewire.", cta: 'I understand' },

  { id: 'm6', type: 'scale', title: 'I ___ assume people’s intentions toward me are negative', subtitle: 'Select the word that best fits you', options: SCALE },
  { id: 'm7', type: 'scale', title: 'I ___ expect the worst outcome before giving things a chance', subtitle: 'Select the word that best fits you', options: SCALE },
  { id: 'm8', type: 'scale', title: 'I ___ criticize myself more than I encourage myself', subtitle: 'Select the word that best fits you', options: SCALE },
  { id: 'm9', type: 'scale', title: 'I ___ feel overwhelmed by emotions I can’t explain', subtitle: 'Select the word that best fits you', options: SCALE },
  { id: 'm10', type: 'scale', title: 'I ___ doubt my abilities, even in situations where I am very competent', subtitle: 'Select the word that best fits you', options: SCALE },

  // transition teaser
  { id: 't-self', type: 'info', emoji: '🪞', title: 'Self-conscious people tend to overthink everything', body: 'You are not alone — and awareness is the first step to change.', cta: 'Continue' },

  { id: 'm11', type: 'scale', title: 'I ___ feel uncomfortable being the center of attention', subtitle: 'Select the word that best fits you', options: SCALE },
  { id: 'm12', type: 'scale', title: 'I ___ avoid trying new things because I fear failure or judgment', subtitle: 'Select the word that best fits you', options: SCALE },

  // 16 — Name
  {
    id: 'name',
    type: 'input',
    field: 'name',
    saveAs: 'name',
    title: "What's your name?",
    subtitle: "We'll use it to personalize your plan.",
    placeholder: 'Your name',
    cta: 'Continue',
  },

  // 17 — Presentation
  {
    id: 'really-wish',
    type: 'info',
    emoji: '🌙',
    title: 'Before we move on, ask yourself…',
    body: 'What do you really wish for at this moment?',
    cta: "I'm ready",
  },

  // 18 — Goal (this is the one that personalizes the plan)
  {
    id: 'goal',
    type: 'multi',
    saveAs: 'goal',
    title: 'In 2026, I want to manifest',
    subtitle: 'You can select multiple goals',
    max: 3,
    options: [
      { value: 'love', label: 'Love', emoji: '❤️' },
      { value: 'abundance', label: 'Abundance', emoji: '💰' },
      { value: 'success', label: 'Success', emoji: '🏆' },
      { value: 'joy', label: 'Joy', emoji: '😊' },
      { value: 'confidence', label: 'Confidence', emoji: '🔥' },
      { value: 'dream-life', label: 'Dream life', emoji: '🌟' },
    ],
  },

  // 19 — Teaser
  { id: 't-mind', type: 'info', emoji: '🌀', title: 'Mind creates vibrations', body: 'Your thoughts set the frequency you broadcast to the world.', cta: 'Continue' },

  // 20 — Summary
  {
    id: 'summary',
    type: 'summary',
    title: 'Your vibration is low',
    body: "Based on your answers, your current frequency is holding you back — but it can be raised with a short daily practice.",
    cta: 'Show me how',
  },

  // 21 — Familiarity
  {
    id: 'familiar',
    type: 'single',
    saveAs: 'familiar',
    title: 'Are you familiar with manifestation techniques?',
    options: [
      { value: 'no', label: 'No, not really' },
      { value: 'yes', label: 'Yes, a bit' },
    ],
  },

  // 22 — Teaser
  { id: 't-magic', type: 'info', emoji: '🪄', title: "Manifestation isn't magic", body: "It's a daily practice that retrains your mind to align with what you want.", cta: 'Continue' },

  // 23 — Leave in the past
  {
    id: 'leave-past',
    type: 'multi',
    saveAs: 'leave_past',
    title: 'What do you want to leave in the past?',
    subtitle: 'Select up to 2',
    max: 2,
    options: [
      { value: 'financial-anxiety', label: 'Financial anxiety' },
      { value: 'stress', label: 'Running on stress' },
      { value: 'lonely', label: 'Feeling lonely' },
      { value: 'autopilot', label: 'Living on autopilot' },
      { value: 'other', label: 'Other' },
    ],
  },

  // 24 — Time per day
  {
    id: 'time',
    type: 'single',
    saveAs: 'time',
    title: 'How much time a day can you dedicate to yourself?',
    options: [
      { value: '5-10', label: '5–10 min' },
      { value: '10-15', label: '10–15 min' },
      { value: '15-20', label: '15–20 min' },
      { value: '20+', label: '20+ min' },
    ],
  },

  // 25 — Teaser
  { id: 't-not-alone', type: 'info', emoji: '🤝', title: "You're not manifesting alone", body: 'Join a community of half a million people on the same journey.', cta: 'Continue' },

  // 26 — Feel in a year
  {
    id: 'feel-year',
    type: 'multi',
    saveAs: 'feel_year',
    title: 'What do you want to feel like in a year from now?',
    subtitle: 'Select up to 2',
    max: 2,
    options: [
      { value: 'alive', label: 'Alive and excited' },
      { value: 'proud', label: 'Proud of myself' },
      { value: 'happy', label: 'Truly happy inside' },
      { value: 'other', label: 'Other' },
    ],
  },

  // 27 — Loader
  { id: 'loader', type: 'loader', title: 'Creating your High-Vibration Plan…', duration: 3500 },

  // 28 — Email
  {
    id: 'email',
    type: 'input',
    field: 'email',
    saveAs: 'email',
    title: 'Enter your email to get your Personal Plan',
    subtitle: 'We respect your privacy. Your data is safe with us.',
    placeholder: 'you@email.com',
    cta: 'Get my plan',
  },

  // 29 — Plan ready
  {
    id: 'plan-ready',
    type: 'summary',
    title: 'Your High-Vibration Growth Plan is ready!',
    body: 'A 4-week daily practice tailored to your goals, designed to raise your frequency and help you manifest.',
    cta: 'See my plan',
  },

  // 30 — Paywall
  {
    id: 'paywall',
    type: 'paywall',
    title: 'Your study plan is ready',
    subtitle: 'People using the plan for 4 weeks achieve twice as many results as for 1 week.',
    cta: 'Get my plan',
    plans: [
      { id: 'week', name: '1-Week Plan', price: '$9.99', perDay: '$1.43 / day', old: '$19.99' },
      { id: 'month', name: '4-Week Plan', price: '$19.99', perDay: '$0.71 / day', old: '$39.99', popular: true },
      { id: 'quarter', name: '12-Week Plan', price: '$49.99', perDay: '$0.59 / day', old: '$89.99' },
    ],
  },

  // 31 — Upsell 1
  {
    id: 'upsell-coach',
    type: 'upsell',
    title: 'Add a Personal Spiritual Coach to your plan',
    body: 'Get 1-on-1 guidance to accelerate your transformation.',
    price: '$19.99',
    accept: 'Yes, add it',
    decline: 'No, thanks',
  },

  // 32 — Upsell 2
  {
    id: 'upsell-bundle',
    type: 'upsell',
    title: 'Add the 3-in-1 pack and accelerate your progress',
    body: 'Sound Vitality Playbook + 108 Meaningful Questions + Silence Your Inner Critic.',
    price: '$19.99',
    accept: 'Add to my plan',
    decline: 'Skip for now',
  },

  // 33 — Success
  {
    id: 'success',
    type: 'success',
    title: 'Welcome to ' + BRAND + ' 🎉',
    body: 'Your account is ready. Open the app to access your personalized High-Vibration Plan.',
    cta: 'Go to the App',
  },
]

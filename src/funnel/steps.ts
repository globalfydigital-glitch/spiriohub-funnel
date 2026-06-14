import type { Step, Option } from './types'

// Brand — change this to your own brand name.
export const BRAND = 'Spiriohub'

// ---------------------------------------------------------------------------
// TEMPORARY placeholder images (hot-linked from the original funnel CDN).
// ⚠️ REPLACE these with your own assets before going live.
// ---------------------------------------------------------------------------
export const MEDIA = {
  bg: 'https://signup.spiriohub.com/static/media/energy-background-2.681673176640ecc39d62.webp',
  meditationBg: 'https://stage.signup.spiriohub.com/static/media/meditation-background.c3008d63de4b768bfea8.webp',
  male: 'https://cf-cdn.spiriohub.com/uploads/e7a68bfc-f13f-4e59-9bc2-b7748668a9b1-02b10a37-6383-417f-9d14-c47a9dee08a7-william-9fda23ae78701ebf00ed.webp',
  female: 'https://cf-cdn.spiriohub.com/uploads/6473c5c9-ce85-4e3a-91de-8cad98a53780-1987fcfa-0cf9-4a5f-b08e-b7b8ff1e867b-emma-5dd81664ffcf32d8bafe.webp',
  ageA: 'https://cf-cdn.spiriohub.com/uploads/0c67319e-a2ae-4135-a6ec-cdf903ca050c-daniel-c0f9663861712e0b7834.webp',
  ageB: 'https://cf-cdn.spiriohub.com/uploads/3755170b-2734-4290-a0d3-46190c165cfa-matthew-06e2af98dc789b82c8cc.webp',
  ageC: 'https://cf-cdn.spiriohub.com/uploads/0b2f84df-e337-496b-a981-a669475fec41-henry-9de63d0ab802edbd7797.webp',
  ageD: 'https://cf-cdn.spiriohub.com/uploads/3a1881c2-8965-483b-b9ab-c0018b6445c9-benjamin-658755a49bf5733989ea.webp',
  frequency: 'https://cf-cdn.spiriohub.com/uploads/3b2c2c2d-6e08-4ee2-804a-d77654a8993e-frequency-emotions.webp',
  summary: 'https://cf-cdn.spiriohub.com/uploads/77c78e00-2fc7-447f-93f9-a5ed5bbb0193-nathan-2-ed11d1db408414acf39e.webp',
  university: 'https://cf-cdn.spiriohub.com/uploads/3e9599d1-7a7b-4684-94b6-389eeeb51203-ucla-logo-1ddcfc1e1138bc576eb3.webp',
  usersMap: 'https://cf-cdn.spiriohub.com/uploads/b0dee114-a3fe-4fcb-92c7-f714c620c064-users-map-97eca703cf70d0a22820-1.webp',
  email: 'https://cf-cdn.spiriohub.com/uploads/88a15470-ea2a-4fd1-88f4-50ffd9fa9e2f-joined-us-men-1-2f286515b716b92ed422.webp',
  aiCompanion: 'https://cf-cdn.spiriohub.com/uploads/e0164756-9978-419a-a5fb-2cf1d6bba10d-image-136.png',
  bundle: 'https://cf-cdn.spiriohub.com/uploads/7a3b0d77-959a-4827-9194-c79c4bb21df9-image-136.png',
}

// Exact answer-button colors from the original funnel.
const GREEN = '#227E64'
const BROWN = '#59382A'
const NEUTRAL = '#241f30'

const SCALE: Option[] = [
  { value: 'always', label: 'Always', color: GREEN },
  { value: 'often', label: 'Often', color: BROWN },
  { value: 'rarely', label: 'Rarely', color: GREEN },
  { value: 'never', label: 'Never', color: GREEN },
]
const SCALE_SUB = 'Select the word that best fits you'

// ---------------------------------------------------------------------------
// FULL FUNNEL — 1:1 with the default path of signup.spiriohub.com (39 screens).
// Edit titles / options / prices / images here.
// ---------------------------------------------------------------------------
export const STEPS: Step[] = [
  // 1
  {
    id: 'gender', type: 'gender', saveAs: 'gender',
    title: 'Become a high-vibration person ',
    accent: '& manifest your dreams into reality',
    subtitle: 'Please pick the option to start',
    disclaimer: 'By clicking "Male" or "Female", you agree to our Terms of Use, Privacy Policy and Cookie Policy',
    options: [
      { value: 'male', label: 'male', image: MEDIA.male, color: BROWN },
      { value: 'female', label: 'female', image: MEDIA.female, color: GREEN },
    ],
  },
  // 2
  {
    id: 'age', type: 'single', saveAs: 'age',
    title: "What's your age?", subtitle: 'We only use it for personalization',
    options: [
      { value: '18-34', label: '18-34', image: MEDIA.ageA, color: GREEN },
      { value: '35-49', label: '35-49', image: MEDIA.ageB, color: GREEN },
      { value: '50-64', label: '50-64', image: MEDIA.ageC, color: GREEN },
      { value: '65+', label: '65+', image: MEDIA.ageD, color: GREEN },
    ],
  },
  // 3
  { id: 'signals', type: 'info', image: MEDIA.bg, fullBleed: true, title: 'What we attract is a reflection of the signals we send with our mind and spirit', cta: 'Continue' },
  // 4-10 (mindset, batch 1)
  { id: 'm-energy', type: 'scale', title: 'I _ have enough energy to get everything done', subtitle: SCALE_SUB, options: SCALE },
  { id: 'm-succeed', type: 'scale', title: 'I _ expect to succeed when I start doing something', subtitle: SCALE_SUB, options: SCALE },
  { id: 'm-guilt', type: 'scale', title: 'I _ feel guilt or worry in excess about past situations', subtitle: SCALE_SUB, options: SCALE },
  { id: 'm-angry', type: 'scale', title: 'I _ find myself angry and irritated by small reason at times', subtitle: SCALE_SUB, options: SCALE },
  { id: 'm-replay', type: 'scale', title: 'I _ catch myself replaying negative situations in my mind', subtitle: SCALE_SUB, options: SCALE },
  { id: 'm-intentions', type: 'scale', title: 'I _ assume people’s intentions toward me are negative', subtitle: SCALE_SUB, options: SCALE },
  { id: 'm-worst', type: 'scale', title: 'I _ expect the worst outcome before giving things a chance', subtitle: SCALE_SUB, options: SCALE },
  // 11
  { id: 'coping', type: 'info', image: MEDIA.bg, fullBleed: true, title: 'Expecting the worst is a coping mechanism', cta: 'Continue' },
  // 12-16 (mindset, batch 2)
  { id: 'm-criticize', type: 'scale', title: 'I _ criticize myself more than I encourage myself', subtitle: SCALE_SUB, options: SCALE },
  { id: 'm-overwhelmed', type: 'scale', title: 'I _ feel overwhelmed by emotions I can’t explain', subtitle: SCALE_SUB, options: SCALE },
  { id: 'm-doubt', type: 'scale', title: 'I _ doubt my abilities, even in situations where I am very competent', subtitle: SCALE_SUB, options: SCALE },
  { id: 'm-attention', type: 'scale', title: 'I _ feel uncomfortable being the center of attention', subtitle: SCALE_SUB, options: SCALE },
  { id: 'm-avoid', type: 'scale', title: 'I _ avoid trying new things because I fear failure or judgment', subtitle: SCALE_SUB, options: SCALE },
  // 17
  { id: 'self-conscious', type: 'info', image: MEDIA.bg, fullBleed: true, title: 'Self-conscious people tend to overthink everything', cta: 'Continue' },
  // 18
  { id: 'name', type: 'input', field: 'name', saveAs: 'name', title: "What’s your name?", placeholder: 'Your name', cta: 'Continue' },
  // 19
  { id: 'really-wish', type: 'info', image: MEDIA.meditationBg, fullBleed: true, title: 'Before we move on, I want you to ask yourself…', body: 'What do you really wish for at this moment?', cta: "I'm ready" },
  // 20
  {
    id: 'goal', type: 'multi', saveAs: 'goal', max: 3,
    title: 'In 2026, I want to manifest', subtitle: 'You can select multiple goals',
    options: [
      { value: 'love', label: 'Love', emoji: '❤️', color: GREEN },
      { value: 'abundance', label: 'Abundance', emoji: '💸', color: BROWN },
      { value: 'success', label: 'Success', emoji: '🌟', color: GREEN },
      { value: 'joy', label: 'Joy', emoji: '😊', color: GREEN },
      { value: 'confidence', label: 'Confidence', emoji: '💪', color: NEUTRAL },
      { value: 'dream-life', label: 'Dream life', emoji: '🤔', color: NEUTRAL },
    ],
  },
  // 21
  { id: 'frequency', type: 'info', image: MEDIA.frequency, title: 'Mind creates vibrations', body: 'The difference between them shapes what we attract into our lives', cta: 'Continue' },
  // 22
  { id: 'summary', type: 'summary', image: MEDIA.summary, title: 'Your vibration is low', cta: 'Continue' },
  // 23
  {
    id: 'familiar', type: 'single', saveAs: 'familiar',
    title: 'Are you familiar with manifestation techniques?', subtitle: 'Select the most relevant one',
    options: [
      { value: 'no', label: 'No, not really', color: GREEN },
      { value: 'yes', label: 'Yes, a bit', color: BROWN },
    ],
  },
  // 24
  { id: 'university', type: 'info', image: MEDIA.university, title: 'Manifestation isn’t magic', body: "It's a mindset shift aligned with action.", cta: 'Continue' },
  // 25
  {
    id: 'leave-past', type: 'multi', saveAs: 'leave_past', max: 2,
    title: 'What do you want to leave in the past?', subtitle: 'Select up to 2',
    options: [
      { value: 'financial-anxiety', label: 'Financial anxiety', color: GREEN },
      { value: 'stress', label: 'Running on stress', color: BROWN },
      { value: 'lonely', label: 'Feeling lonely', color: GREEN },
      { value: 'autopilot', label: 'Living on autopilot', color: GREEN },
      { value: 'other', label: 'Other', color: NEUTRAL },
    ],
  },
  // 26
  {
    id: 'time', type: 'single', saveAs: 'time',
    title: 'How much time a day can you dedicate to yourself?', subtitle: 'Select the most relevant one',
    options: [
      { value: '5-10', label: '5-10 min', color: GREEN },
      { value: '10-15', label: '10-15 min', color: GREEN },
      { value: '15-20', label: '15-20 min', color: GREEN },
      { value: '20+', label: '20+ min', color: GREEN },
    ],
  },
  // 27
  { id: 'not-alone', type: 'info', image: MEDIA.usersMap, title: "You're not manifesting alone.", cta: 'Continue' },
  // 28
  {
    id: 'feel-year', type: 'multi', saveAs: 'feel_year', max: 2,
    title: 'What do you want to feel like in a year from now?', subtitle: 'Select up to 2',
    options: [
      { value: 'alive', label: 'Alive and excited', color: GREEN },
      { value: 'proud', label: 'Proud of myself', color: BROWN },
      { value: 'happy', label: 'Truly happy inside', color: GREEN },
      { value: 'other', label: 'Other', color: NEUTRAL },
    ],
  },
  // 29
  { id: 'event', type: 'info', emoji: '💞', title: 'The last plan you’ll ever need to attract love into your life', cta: 'Continue' },
  // 30
  { id: 'creating-plan', type: 'loader', title: 'Creating your High-Vibration Plan to Attract Love into Your Life', duration: 3500 },
  // 31
  { id: 'email', type: 'input', field: 'email', saveAs: 'email', image: MEDIA.email, title: 'Enter your email to get your Personal Plan', placeholder: 'you@email.com', cta: 'Continue' },
  // 32
  { id: 'consent', type: 'info', image: MEDIA.bg, fullBleed: true, title: 'Receive high‑vibration growth tips & product updates?', cta: 'Continue' },
  // 33
  { id: 'plan-ready', type: 'summary', title: 'Your High‑Vibration Growth Plan is ready!', cta: 'Continue' },
  // 34
  { id: 'scratch', type: 'info', emoji: '🎟️', title: 'Tap & Save on Your Vibration Raise!', body: 'Positivity is the key to making progress! Get your gift from us 🎁', cta: 'Reveal my gift' },
  // 35
  {
    id: 'paywall', type: 'paywall',
    title: 'Your study plan is ready',
    subtitle: 'People using the plan for 4 weeks achieve twice as many results as for 1 week.',
    cta: 'Get my plan',
    plans: [
      { id: 'week', name: '1-Week Plan', price: '$9.99', perDay: '$1.43 / day', old: '$19.99' },
      { id: 'month', name: '4-Week Plan', price: '$19.99', perDay: '$0.71 / day', old: '$39.99', popular: true },
      { id: 'quarter', name: '12-Week Plan', price: '$49.99', perDay: '$0.59 / day', old: '$89.99' },
    ],
  },
  // 36
  { id: 'create-account', type: 'summary', title: 'Create account', body: 'This email will be your account login. Edit if needed.', cta: 'Create account' },
  // 37
  { id: 'upsell-coach', type: 'upsell', image: MEDIA.aiCompanion, title: 'Add Personal Spiritual Coach to your High-Vibration Plan', body: 'A wise AI companion who walks this path with you — ask anything, anytime', price: '$19.99', accept: 'Yes, add it', decline: 'No, thanks' },
  // 38
  { id: 'upsell-bundle', type: 'upsell', image: MEDIA.bundle, title: 'Add 3-in-1 pack and accelerate your progress', body: 'A complete emotional healing bundle to quiet your mind, support your nervous system, and reconnect with yourself', price: '$19.99', accept: 'Add to my plan', decline: 'Skip for now' },
  // 39
  { id: 'success', type: 'success', title: 'Welcome to ' + BRAND + ' 🎉', body: 'Your account is ready. Open the app to access your personalized High-Vibration Plan.', cta: 'Go to the App' },
]

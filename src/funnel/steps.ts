import type { Step, Option } from './types'

// Brand — change this to your own brand name.
export const BRAND = 'Spirio'

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
  ageAf: 'https://cf-cdn.spiriohub.com/uploads/dc781c73-853a-4916-b903-6ee7678f79ab-olivia-46b50597e2bf88fd9b15.webp',
  ageBf: 'https://cf-cdn.spiriohub.com/uploads/f6281621-fefc-48a3-b168-1b1ca6c1749c-isabella-2d2b783f4f0c570b6a5c.webp',
  ageCf: 'https://cf-cdn.spiriohub.com/uploads/6b9adf03-b856-4191-a0e0-0e1f9eb92e27-ava-e2a49013661c248668e4.webp',
  ageDf: 'https://cf-cdn.spiriohub.com/uploads/c77a13bc-ff36-44de-b1d3-a8be18da9021-charlotte-41bdf51a441579138d1c.webp',
  frequency: 'https://cf-cdn.spiriohub.com/uploads/3b2c2c2d-6e08-4ee2-804a-d77654a8993e-frequency-emotions.webp',
  summary: 'https://cf-cdn.spiriohub.com/uploads/77c78e00-2fc7-447f-93f9-a5ed5bbb0193-nathan-2-ed11d1db408414acf39e.webp',
  university: 'https://cf-cdn.spiriohub.com/uploads/3e9599d1-7a7b-4684-94b6-389eeeb51203-ucla-logo-1ddcfc1e1138bc576eb3.webp',
  harvard: 'https://cf-cdn.spiriohub.com/uploads/a6012bf6-6118-4c01-b9d5-92a74501e2ee-harvard-logo-a15818be4cf4eb25fde1.webp',
  usersMap: 'https://cf-cdn.spiriohub.com/uploads/b0dee114-a3fe-4fcb-92c7-f714c620c064-users-map-97eca703cf70d0a22820-1.webp',
  email: 'https://cf-cdn.spiriohub.com/uploads/88a15470-ea2a-4fd1-88f4-50ffd9fa9e2f-joined-us-men-1-2f286515b716b92ed422.webp',
  aiCompanion: 'https://cf-cdn.spiriohub.com/uploads/e0164756-9978-419a-a5fb-2cf1d6bba10d-image-136.png',
  bundle: 'https://cf-cdn.spiriohub.com/uploads/e39a3a60-f3fe-4074-b27c-bf31417218b5-v3.webp',
}

// Exact answer-button colors from the original funnel.
const GREEN = '#227E64'
const BROWN = '#59382A'
const NEUTRAL = '#241f30'

// Original renders the scale answers lowercase.
const SCALE: Option[] = [
  { value: 'always', label: 'always', color: GREEN },
  { value: 'often', label: 'often', color: BROWN },
  { value: 'rarely', label: 'rarely', color: GREEN },
  { value: 'never', label: 'never', color: GREEN },
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
    disclaimer: 'By clicking "Male" or "Female" you agree with the Terms of Use and Service, Privacy Policy and Cookie Policy',
    options: [
      { value: 'male', label: 'Male', image: MEDIA.male, color: BROWN },
      { value: 'female', label: 'Female', image: MEDIA.female, color: GREEN },
    ],
  },
  // 2
  {
    id: 'age', type: 'single', saveAs: 'age',
    title: "What's your age?", subtitle: 'We only use it for personalization',
    options: [
      { value: '18-34', label: '18-34', image: MEDIA.ageA, imageFemale: MEDIA.ageAf, color: GREEN },
      { value: '35-49', label: '35-49', image: MEDIA.ageB, imageFemale: MEDIA.ageBf, color: GREEN },
      { value: '50-64', label: '50-64', image: MEDIA.ageC, imageFemale: MEDIA.ageCf, color: GREEN },
      { value: '65plus', label: '65+', image: MEDIA.ageD, imageFemale: MEDIA.ageDf, color: GREEN },
    ],
  },
  // 3
  { id: 'signals', type: 'info', image: MEDIA.bg, fullBleed: true, waveform: true, title: 'What we attract is a reflection of the signals we send with our mind and spirit', body: 'We would like you to complete some statements for us to understand the vibration of your signal. Next we will help you tune it', callout: 'Be honest to get most accurate result', cta: 'Continue' },
  // 4-10 (mindset, batch 1)
  { id: 'm-energy', type: 'scale', title: 'I _ have enough energy to get everything done', subtitle: SCALE_SUB, options: SCALE },
  { id: 'm-succeed', type: 'scale', title: 'I _ expect to succeed when I start doing something', subtitle: SCALE_SUB, options: SCALE },
  { id: 'm-guilt', type: 'scale', title: 'I _ feel guilt or worry in excess about past situations', subtitle: SCALE_SUB, options: SCALE },
  { id: 'm-angry', type: 'scale', title: 'I _ find myself angry and irritated by small reason at times', subtitle: SCALE_SUB, options: SCALE },
  { id: 'm-replay', type: 'scale', title: 'I _ catch myself replaying negative situations in my mind', subtitle: SCALE_SUB, options: SCALE },
  { id: 'm-intentions', type: 'scale', title: 'I _ assume people’s intentions toward me are negative', subtitle: SCALE_SUB, options: SCALE },
  { id: 'm-worst', type: 'scale', title: 'I _ expect the worst outcome before giving things a chance', subtitle: SCALE_SUB, options: SCALE },
  // 11
  { id: 'coping', type: 'info', image: MEDIA.bg, fullBleed: true, waveform: true, title: 'Expecting the worst is a coping mechanism', body: 'Our mind is trying to protect us. It imagines negative outcome to mitigate the stress of possible failure', callout: 'The problem is, the more we focus on a failure, the more likely we will attract it ⚡️', cta: 'Continue' },
  // 12-16 (mindset, batch 2)
  { id: 'm-criticize', type: 'scale', title: 'I _ criticize myself more than I encourage myself', subtitle: SCALE_SUB, options: SCALE },
  { id: 'm-overwhelmed', type: 'scale', title: 'I _ feel overwhelmed by emotions I can’t explain', subtitle: SCALE_SUB, options: SCALE },
  { id: 'm-doubt', type: 'scale', title: 'I _ doubt my abilities, even in situations where I am very competent', subtitle: SCALE_SUB, options: SCALE },
  { id: 'm-attention', type: 'scale', title: 'I _ feel uncomfortable being the center of attention', subtitle: SCALE_SUB, options: SCALE },
  { id: 'm-avoid', type: 'scale', title: 'I _ avoid trying new things because I fear failure or judgment', subtitle: SCALE_SUB, options: SCALE },
  // 17
  { id: 'self-conscious', type: 'info', image: MEDIA.bg, fullBleed: true, waveform: true, title: 'Self-conscious people tend to overthink everything', body: 'Smart people often spot imperfections in their own decisions, making them hesitate instead of taking the steps that matter', callout: 'We will help set yourself free from doubts and move towards your dream life', cta: 'Continue' },
  // 18
  { id: 'name', type: 'input', field: 'name', saveAs: 'name', title: "What’s your name?", placeholder: 'Your name', cta: 'Continue', skip: 'Skip' },
  // 19
  { id: 'really-wish', type: 'info', image: MEDIA.meditationBg, fullBleed: true, waveform: true, sequential: true, title: 'Before we move on, I want you to ask yourself…', callout: '{{name}}, what do you really wish for at this moment?', cta: 'Continue' },
  // 20
  {
    id: 'goal', type: 'multi', saveAs: 'goal',
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
  {
    id: 'frequency', type: 'info', image: MEDIA.frequency, card: true,
    goldWords: ['High vibrations', 'low vibrations'],
    title: 'Mind creates vibrations',
    subtitle: 'The difference between them shapes what we attract into our lives',
    scale: [
      { label: 'Enlightenment', value: '700+' },
      { label: 'Peace', value: '600' },
      { label: 'Joy', value: '540' },
      { label: 'Love', value: '500' },
      { label: 'Reason', value: '400' },
      { label: 'Acceptance', value: '350' },
      { label: 'Willingness', value: '310' },
      { label: 'Neutrality', value: '250' },
      { label: 'Courage', value: '200' },
      { label: 'Pride', value: '175' },
      { label: 'Anger', value: '150' },
      { label: 'Desire', value: '125' },
      { label: 'Fear', value: '100' },
      { label: 'Grief', value: '75' },
      { label: 'Apathy', value: '50' },
      { label: 'Guilt', value: '30' },
      { label: 'Shame', value: '20' },
    ],
    callout: 'High vibrations bring energy, harmony, and joy, while low vibrations can lead to feelings of fatigue, sadness, or stress.',
    cta: 'Continue',
  },
  // analyzing — circular loader before the result reveal
  { id: 'analyzing', type: 'ringloader', image: MEDIA.bg, title: 'Analyzing your answers…', duration: 3800 },
  // 22 — result reveal
  {
    id: 'summary', type: 'summary', image: MEDIA.summary, goalFrom: 'goal',
    title: 'Your vibration is low', titleAccent: 'low',
    gaugeValue: 20, gaugeTarget: 'Normal - 325Hz', gaugeYou: 'You -20',
    alertTitle: 'SCARCITY MODE',
    alertDescription: "Right now your energy is stuck in fear, stress and overthinking — blocking love, money and the flow you're trying to call in.",
    rows: [
      { icon: 'brain', title: 'Current pattern', description: 'Fear, negative loops' },
      { icon: 'cycle', title: 'How it shows up', description: 'Same cycles in money, work, relationships' },
      { icon: 'target', title: 'What you want', description: '{{goal}}' },
      { icon: 'trending', title: 'Your path out', description: 'Raising vibration' },
    ],
    cta: 'Continue',
  },
  // 23
  {
    id: 'familiar', type: 'single', saveAs: 'familiar', hideProgress: true,
    title: 'Are you familiar with manifestation techniques?', subtitle: 'Select the most relevant one',
    options: [
      { value: 'no', label: 'No, not really', emoji: '❌', color: GREEN },
      { value: 'yes', label: 'Yes, a bit', emoji: '✅', color: BROWN },
    ],
  },
  // 24
  {
    id: 'university', type: 'info',
    title: 'Manifestation isn’t magic', titleGold: 'Manifestation',
    subtitle: "It's a mindset shift aligned with action.",
    infoCards: [
      { image: MEDIA.university, text: 'University of California study suggests that visualization improves neural connectivity and reduces anxiety', gold: ['University of California'], glow: '#2563eb' },
      { image: MEDIA.harvard, text: 'Harvard Medical School research shows that spiritual habits can boost happiness, reduce health issues, and bring peace in life', gold: ['Harvard Medical School'], glow: '#a51c30' },
    ],
    cta: 'Continue',
  },
  // 25
  {
    id: 'leave-past', type: 'multi', saveAs: 'leave_past', hasOther: true,
    title: 'What do you want to leave in the past?', subtitle: 'Select up to 2',
    options: [
      { value: 'financial-anxiety', label: 'Financial anxiety', emoji: '💳', color: GREEN },
      { value: 'stress', label: 'Running on stress', emoji: '🤯', color: BROWN },
      { value: 'lonely', label: 'Feeling lonely', emoji: '😢', color: GREEN },
      { value: 'autopilot', label: 'Living on autopilot', emoji: '😵‍💫', color: GREEN },
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
  { id: 'not-alone', type: 'info', image: MEDIA.usersMap, title: "You're not manifesting alone.", callout: 'Join millions of people creating their dream lives together.', goldWords: ['creating their dream lives together.'], cta: 'Continue' },
  // 28
  {
    id: 'feel-year', type: 'multi', saveAs: 'feel_year', hasOther: true,
    title: 'What do you want to feel like in a year from now?', subtitle: 'Select up to 2',
    options: [
      { value: 'alive', label: 'Alive and excited', emoji: '🤩', color: GREEN },
      { value: 'proud', label: 'Proud of myself', emoji: '🥹', color: BROWN },
      { value: 'happy', label: 'Truly happy inside', emoji: '😌', color: GREEN },
      { value: 'other', label: 'Other', color: NEUTRAL },
    ],
  },
  // 29 — event chart (goal-aware)
  {
    id: 'event', type: 'eventchart', goalFrom: 'goal', defaultGoal: 'love',
    title: 'The last plan you’ll ever need to attract {goal} into your life',
    subtitle: 'We predict that you’ll attract {goal} by {date}',
    milestones: ['Get rid of your blockers', 'Raise your frequency', 'Attract {goal} in your life'],
    footnote: '*For illustration purposes only. Individual results may vary.',
    cta: 'Continue',
  },
  // 30 — multi-stage loader
  {
    id: 'creating-plan', type: 'loader', duration: 12000,
    title: 'Creating your High-Vibration Plan to Attract Love into Your Life',
    titleGold: 'High-Vibration Plan',
    stages: [
      {
        label: 'Goals',
        modal: { question: "Do you often prioritize others' needs over your own?", prompt: 'To move forward, specify', no: 'No', yes: 'Yes' },
        testimonial: { rating: 4.5, title: 'Life changing', name: 'Jennifer A.', quote: 'I asked Spirio to help clarify my life goals, and it truly delivered. Now, I have a clearer sense of direction and feel more focused and confident about the high-vibration path ahead.' },
      },
      {
        label: 'Profile',
        modal: { question: 'Do you often worry about money and the future?', prompt: 'To move forward, specify', no: 'No', yes: 'Yes' },
        testimonial: { rating: 5, title: 'Absolutely brilliant', name: 'Susan K.', quote: "I often felt unseen and undervalued, like my presence didn't matter. But Spirio helped me regain confidence and reconnect with my inner strength. Now, I feel truly self-assured." },
      },
      {
        label: 'Vibrations quality',
        modal: { question: 'Do you ever feel like life is just passing by?', prompt: 'To move forward, specify', no: 'No', yes: 'Yes' },
        testimonial: { rating: 5, title: 'Sense of freedom', name: 'Alex M.', quote: "I used to feel caught in a cycle of constant worry, find it difficult to make ends meet, and be unsure how to move forward. But after just a few sessions, I feel a sense of freedom and stability in my life that I hadn't experienced before." },
      },
      {
        label: 'Personal plan',
        testimonial: { rating: 5, title: '2nd chance', name: 'Oliver L.', quote: 'The past year has been tough for my wife and me. We were thinking about getting a divorce. But thanks to Spirio, we harmonized our relationship & became a high-vibration couple.' },
      },
    ],
  },
  // 31
  {
    id: 'email', type: 'input', field: 'email', saveAs: 'email', image: MEDIA.email,
    title: 'Enter your email to get your Personal Plan', titleGold: 'Personal Plan',
    placeholder: 'Your email', cta: 'Continue',
    caption: '1.2 million men have', captionAccent: ' joined us!',
    tip: "We respect your privacy and are committed to protecting your personal data. We'll email you a copy of your results for convenient access.",
    error: "Hmm... something's wrong, try another email.",
  },
  // 32 — subscribe / consent
  { id: 'consent', type: 'info', image: MEDIA.bg, fullBleed: true, waveform: true, title: 'Receive high-vibration growth tips & product updates?', titleGold: 'high-vibration growth tips', cta: "YES, I'M IN!", decline: 'I know everything about raising vibrations' },
  // 33 — plan chart
  {
    id: 'plan-ready', type: 'plan-chart', goalFrom: 'name',
    title: '{{name}}, your High-Vibration Growth Plan is ready!',
    goldWords: ['High-Vibration Growth Plan'],
    weeks: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    goalLabel: 'Goal',
    disclaimer: '*For illustration purposes only. Individual results may vary.',
    cta: 'Continue',
  },
  // 34 — scratch card
  {
    id: 'scratch', type: 'scratch',
    title: 'Tap & Save on Your Vibration Raise!', goldWords: ['Tap & Save'],
    subtitle: 'Positivity is the key to making progress! Get your gift from us 🎁',
    instruction: 'Tap your discount',
    scratchValue: '54%', scratchValueLabel: 'off your personal plan',
    revealEmoji: '🥳', revealTitle: 'Woo hoo!', revealSubtitle: 'You won a discount',
    revealDiscount: '54% off', revealNote: '*This discount will be applied automatically',
    cta: 'Continue',
  },
  // 35 — selling page / paywall
  //  ⚠️ Plan tiers & prices below are PLACEHOLDERS — the original's real prices live in a
  //  SaaS-hosted i18n template and are NOT in the export. Money-back text IS the real copy.
  {
    id: 'paywall', type: 'paywall',
    title: 'Your High-Vibration Growth Plan is ready', titleGold: 'High-Vibration Growth Plan',
    subtitle: 'People who follow the plan for 4 weeks reach twice the results of those who stop after 1 week.',
    cta: 'Get my plan',
    plans: [
      { id: 'week', name: '1-Week Plan', price: '$9.99', perDay: '$1.43 / day', old: '$19.99' },
      { id: 'month', name: '4-Week Plan', price: '$19.99', perDay: '$0.71 / day', old: '$39.99', popular: true },
      { id: 'quarter', name: '12-Week Plan', price: '$49.99', perDay: '$0.59 / day', old: '$89.99' },
    ],
    moneyBackTitle: '30-days money-back guarantee',
    moneyBackBody: 'We believe that our plan will work for you and you will get noticeable results in just 4 weeks! We are even ready to return your money back if this plan is not for you!',
    moneyBackLinkPrefix: 'Find more about applicable limitations in our ',
    moneyBackLinkText: 'money-back policy',
    moneyBackLinkUrl: 'https://spiriohub.com/money-back',
  },
  // 36 — create account
  {
    id: 'create-account', type: 'signup',
    title: 'Create account', subtitle: 'This email will be your account login. Edit if needed.',
    tipTitle: 'Almost there!',
    tipBody: 'It’s important to complete the next steps to create your account and access your personal plan.',
    emailPlaceholder: 'Your email', emailError: "Hmm... something's wrong, try another email.",
    passwordPlaceholder: 'Create your password', passwordHelper: 'Must be 6 or more characters',
    cta: 'Create account', saveEmailAs: 'email', savePasswordAs: 'password',
  },
  // 37 — upsell: AI coach
  {
    id: 'upsell-coach', type: 'upsell', image: MEDIA.aiCompanion,
    title: 'Add Personal Spiritual Coach to your High-Vibration Plan', titleGold: 'Personal Spiritual Coach',
    body: 'A wise AI companion who walks this path with you — ask anything, anytime',
    price: '$49.99', oldPrice: '$99.98', badge: '🔥 Save 50%',
    accept: 'Add to my plan', decline: 'Skip',
    note: 'By clicking "Add to my plan" you agree to a one-time "$49.99" purchase. The payment is non-recurring and will be charged using the billing information you provided earlier.',
  },
  // 38 — upsell: 3-in-1 bundle
  {
    id: 'upsell-bundle', type: 'upsell', image: MEDIA.bundle,
    title: 'Add 3-in-1 pack and accelerate your progress', titleGold: 'accelerate your progress',
    body: 'A complete emotional healing bundle to quiet your mind, support your nervous system, and reconnect with yourself',
    price: '$39.99', oldPrice: '$119.94', badge: '🔥 Offer available only on this page',
    items: [
      { name: 'Silence Your Inner Critic', desc: '5 audio affirmation practices designed to quiet overthinking, soften self-criticism, and help you feel grounded again.', oldPrice: '$49.98', priceLabel: '$39.99' },
      { name: 'Never Alone Again', desc: 'A printable 28-day reflection workbook designed to help you move through loneliness, emotional distance, and self-disconnection.', oldPrice: '$39.99', priceLabel: 'Free', free: true },
      { name: 'Heal What Hurts', desc: '5 guided mantra practices inspired by ancient sound, to release emotional tension and support your nervous system.', oldPrice: '$39.99', priceLabel: 'Free', free: true },
    ],
    accept: 'Add to my plan', decline: 'Skip',
    note: 'By clicking "Add to my plan" you agree to a one-time "$39.99" purchase. The payment is non-recurring and will be charged using the billing information you provided earlier.',
  },
  // 39 — activation / success
  {
    id: 'success', type: 'success',
    title: 'Activate your account!',
    freeCourse: 'Log in to the app today and get the Deep Sleep course for FREE.', goldWords: ['FREE'],
    steps: [
      'Tap the button below to download the app, or access the web version at spiriohub.com',
      'Open the app and tap Login.',
      'Log in using your email and password.',
    ],
    cta: 'Download App',
    webLinkLabel: 'Access web version', webLinkUrl: 'https://spiriohub.com/sign-in',
    loginLinkText: 'spiriohub.com',
    supportText: "If you have any questions or issues, please contact our support team at support@spiriohub.com. We're always here to help.",
    supportEmail: 'support@spiriohub.com',
    progressChips: ['Create account', 'Welcome offer', 'Log in'],
    supportTag: '24/7 support',
  },
]

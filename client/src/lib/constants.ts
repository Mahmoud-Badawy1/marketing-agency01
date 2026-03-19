export const FEATURE_FLAGS = {
  enableStats: true,
  enableWhyUs: true,
  enableDemo: true,
  enablePortfolio: true,
  enableCourses: true,
  enableWorkshops: true,
  enablePricing: true,
  enableInstructor: true,
  enableTestimonials: true,
  enableContact: true,
  enableMentorship: true,
  enableAgencyRecruitment: true,
};

export const SITE_CONFIG = {
  name: "nav.brand_ar",
  tagline: "nav.brand_en",
  description: "footer.tagline",
  whatsapp: "+201000000000",
  social: {
    facebook: "#",
    instagram: "#",
    youtube: "#",
    tiktok: "#",
    linkedin: "#",
  },
};

export const NAV_ITEMS = [
  { label: "nav.home", href: "#hero" },
  { label: "why.badge", href: "#why" },
  { label: "programs.badge", href: "#programs" },
  { label: "nav.pricing", href: "#pricing" },
  { label: "nav.instructor", href: "#instructor" },
  { label: "nav.contact", href: "#contact" },
];

export const STATS = [
  { value: "500+", label: "stats.trainees", color: "bg-accent" },
  { value: "10M+", label: "stats.campaigns", color: "bg-primary" },
  { value: "3x", label: "stats.roi", color: "bg-chart-3" },
];

export const WHY_CARDS = [
  {
    title: "why.cards.problem.title",
    description: "why.cards.problem.description",
    type: "problem" as const,
  },
  {
    title: "why.cards.solution.title",
    description: "why.cards.solution.description",
    type: "solution" as const,
  },
  {
    title: "why.cards.result.title",
    description: "why.cards.result.description",
    type: "result" as const,
  },
];

export const PROGRAMS = [
  {
    level: "programs.card1.level",
    title: "programs.card1.title",
    subtitle: "programs.card1.subtitle",
    description: "programs.card1.description",
    age: "programs.card1.age",
    color: "from-blue-400 to-blue-600",
  },
  {
    level: "programs.card2.level",
    title: "programs.card2.title",
    subtitle: "programs.card2.subtitle",
    description: "programs.card2.description",
    age: "programs.card2.age",
    color: "from-indigo-400 to-indigo-600",
  },
  {
    level: "programs.card3.level",
    title: "programs.card3.title",
    subtitle: "programs.card3.subtitle",
    description: "programs.card3.description",
    age: "programs.card3.age",
    color: "from-purple-400 to-purple-600",
  },
];

export const PRICING_PLANS = [
  {
    name: "pricing.plan1.name",
    subtitle: "pricing.plan1.subtitle",
    price: "5000",
    currency: "pricing.egp",
    period: "",
    features: [
      "pricing.plan1.features.0",
      "pricing.plan1.features.1",
      "pricing.plan1.features.2",
      "pricing.plan1.features.3",
      "pricing.plan1.features.4",
    ],
    popular: false,
  },
  {
    name: "pricing.plan2.name",
    subtitle: "pricing.plan2.subtitle",
    price: "15000",
    currency: "pricing.egp",
    period: "",
    features: [
      "pricing.plan2.features.0",
      "pricing.plan2.features.1",
      "pricing.plan2.features.2",
      "pricing.plan2.features.3",
      "pricing.plan2.features.4",
      "pricing.plan2.features.5",
      "pricing.plan2.features.6",
    ],
    popular: true,
  },
];

export const SKILLS_GRID = [
  {
    title: "skills.campaigns",
    color: "bg-blue-500 dark:bg-blue-600",
  },
  {
    title: "skills.seo",
    color: "bg-indigo-500 dark:bg-indigo-600",
  },
  {
    title: "skills.copywriting",
    color: "bg-purple-500 dark:bg-purple-600",
  },
];

export const SUBJECTS = [
  { title: "subjects.fb_insta", grade: "subjects.fb_insta_level" },
  { title: "subjects.google", grade: "subjects.google_level" },
  { title: "subjects.content", grade: "subjects.content_level" },
  { title: "subjects.email", grade: "subjects.email_level" },
];


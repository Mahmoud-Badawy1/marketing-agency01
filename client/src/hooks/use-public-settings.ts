import { useQuery } from "@tanstack/react-query";

interface PlanData {
  id: string;
  name: string;
  subtitle: string;
  price: string;
  period: string;
  features: string[];
  popular: boolean;
  discountPercent?: number;
  discountLabel?: string;
}

interface HeroSlide {
  title: string | { ar?: string; en?: string };
  highlight: string | { ar?: string; en?: string };
  subtitle: string | { ar?: string; en?: string };
  mediaType?: "video" | "gif" | "image";
  mediaUrl?: string;
}

interface StatData {
  value: string;
  label: string;
  color: string;
}

interface WhyCard {
  title: string | { ar?: string; en?: string };
  description: string | { ar?: string; en?: string };
  type: "problem" | "solution" | "result";
}

interface ProgramData {
  level: string | { ar?: string; en?: string };
  title: string | { ar?: string; en?: string };
  subtitle: string | { ar?: string; en?: string };
  description: string | { ar?: string; en?: string };
  age: string | { ar?: string; en?: string };
  color: string;
}

interface FaqData {
  q: string;
  a: string;
}

interface InstructorData {
  name: string | { ar?: string; en?: string };
  title: string | { ar?: string; en?: string };
  bio: string | { ar?: string; en?: string };
  quote: string | { ar?: string; en?: string };
  badge: string | { ar?: string; en?: string };
  image?: string;
  achievements: { label: string | { ar?: string; en?: string }; color: string }[];
}

interface SkillData {
  title: string;
  color: string;
}

interface UpcomingEvent {
  badge: string;
  title: string;
  description: string;
  date: string;
  backgroundType: "gradient" | "image";
  backgroundImage?: string;
  backgroundGradient?: string;
  visible: boolean;
}

interface GalleryCard {
  badge: string;
  badgeColor: string;
  title: string;
  description: string;
  imageKey: string;
  image?: string;
}

interface SkillCard {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  imageKey: string;
  image?: string;
}

interface SubjectData {
  title: string;
  grade: string;
}

interface EmpowerSection {
  subtitle: string;
  title: string;
  titleHighlight: string;
  description: string;
  ctaText: string;
  stats: {
    value: string;
    label: string;
    icon: string;
    iconColor: string;
  }[];
}

export interface PublicSettings {
  plans?: PlanData[];
  images?: {
    mascot?: string;
    instructor?: string;
    gallery1?: string;
    gallery2?: string;
    gallery3?: string;
    gallery4?: string;
    upcoming_event_bg?: string;
  };
  contact?: {
    whatsapp?: string;
    instapay?: string;
  };
  social?: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
    tiktok?: string;
  };
  hero_slides?: HeroSlide[];
  stats?: StatData[];
  why_cards?: WhyCard[];
  programs?: ProgramData[];
  faqs?: FaqData[];
  instructor?: InstructorData;
  skills?: SkillData[];
  site_config?: {
    name_ar?: string;
    name_en?: string;
    tagline_ar?: string;
    tagline_en?: string;
    description_ar?: string;
    description_en?: string;
  };
  decoration?: {
    enabled?: boolean;
  };
  upcoming_event?: UpcomingEvent;
  gallery_cards?: GalleryCard[];
  skills_cards?: SkillCard[];
  subjects?: SubjectData[];
  empower_section?: EmpowerSection;
}

function isValidImageUrl(url: unknown): url is string {
  return typeof url === "string" && url.length > 0 && (url.startsWith("/uploads/") || url.startsWith("http"));
}

function sanitizeImages(images: any): PublicSettings["images"] {
  if (!images || typeof images !== "object") return undefined;
  const result: PublicSettings["images"] = {};
  for (const key of ["mascot", "instructor", "gallery1", "gallery2", "gallery3", "gallery4", "upcoming_event_bg"] as const) {
    if (isValidImageUrl(images[key])) {
      result[key] = images[key];
    }
  }
  return Object.keys(result).length > 0 ? result : undefined;
}

export function usePublicSettings() {
  return useQuery<PublicSettings>({
    queryKey: ["/api/settings"],
    staleTime: 60000,
    select: (data) => ({
      ...data,
      images: sanitizeImages(data?.images),
    }),
  });
}

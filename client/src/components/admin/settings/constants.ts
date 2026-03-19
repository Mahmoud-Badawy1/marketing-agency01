import { fallbackImages } from "@/lib/fallbackImages";
import { SiFacebook, SiInstagram, SiYoutube, SiTiktok } from "react-icons/si";

export interface PlanData {
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

export const DEFAULT_PLANS: PlanData[] = [
  {
    id: "monthly",
    name: "الباقة الشهرية",
    subtitle: "مرنة ومناسبة",
    price: "350",
    period: "/ شهر",
    features: [
      "حصص تفاعلية أسبوعية مباشرة",
      "متابعة دورية للمستوى",
      "الوصول لمنصة التعلم",
      "تقارير أداء شهرية",
    ],
    popular: false,
  },
  {
    id: "genius",
    name: "باقة النخبة (إدارة متكاملة)",
    subtitle: "3 أشهر - القيمة الأفضل",
    price: "900",
    period: "/ 3 أشهر",
    features: [
      "كل مميزات الباقة الشهرية",
      "شهادة معتمدة",
      "دخول المسابقات والبطولات",
      "أدوات تعليمية مجانية",
      "خصم 15% على السعر الأصلي",
    ],
    popular: true,
  },
];

export interface ImageData {
  mascot?: string;
  instructor?: string;
  gallery1?: string;
  gallery2?: string;
  gallery3?: string;
  gallery4?: string;
  upcoming_event_bg?: string;
}

export const IMAGE_LABELS: Record<string, string> = {
  mascot: "صورة الشخصية / اللوجو",
  instructor: "صورة المدرس",
  gallery1: "صورة المعرض 1",
  gallery2: "صورة المعرض 2",
  gallery3: "صورة المعرض 3 (بطاقة المهارات)",
  gallery4: "صورة المعرض 4 (بطاقة المهارات)",
  upcoming_event_bg: "خلفية الفعالية القادمة",
};

export const IMAGE_FALLBACKS: Record<string, string> = {
  mascot: fallbackImages.mascot,
  instructor: fallbackImages.instructor,
  gallery1: fallbackImages.gallery1,
  gallery2: fallbackImages.gallery2,
  gallery3: fallbackImages.gallery3,
  gallery4: fallbackImages.gallery4,
  upcoming_event_bg: fallbackImages.gallery1,
};

export interface SocialData {
  facebook?: string;
  instagram?: string;
  youtube?: string;
  tiktok?: string;
}

export const SOCIAL_FIELDS: { key: keyof SocialData; label: string; icon: typeof SiFacebook; placeholder: string }[] = [
  { key: "facebook", label: "فيسبوك", icon: SiFacebook, placeholder: "https://facebook.com/..." },
  { key: "instagram", label: "انستجرام", icon: SiInstagram, placeholder: "https://instagram.com/..." },
  { key: "youtube", label: "يوتيوب", icon: SiYoutube, placeholder: "https://youtube.com/..." },
  { key: "tiktok", label: "تيك توك", icon: SiTiktok, placeholder: "https://tiktok.com/..." },
];

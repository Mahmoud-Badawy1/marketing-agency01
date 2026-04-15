import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, ArrowLeft, HelpCircle } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/atoms/Button";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { usePublicSettings } from "@/hooks/use-public-settings";
import { useLanguage } from "@/hooks/use-language";
import { FAQAccordion } from "@/components/molecules/FAQAccordion";

const getDefaultFaqs = (t: any) => [
  {
    q: t({
      ar: "ما هي خدمات ماركتير برو الأساسية؟",
      en: "What are Marketer Pro's core services?",
    }),
    a: t({
      ar: "ماركتير برو هي وكالة نمو رقمي B2B متكاملة. نقدم خدمات إدارة الحملات الإعلانية المدفوعة (Performance Marketing)، تحسين محركات البحث SEO، استراتيجيات المحتوى، وتطوير العلامات التجارية لشركات الـ B2B والشركات الناشئة لزيادة المبيعات والعائد على الاستثمار.",
      en: "Marketer Pro is a full-stack B2B digital growth agency. We provide performance marketing, SEO, content strategies, and brand development for B2B companies and startups to increase sales and ROI.",
    }),
  },
  {
    q: t({
      ar: "هل تعملون مع الشركات الناشئة في مراحلها الأولى؟",
      en: "Do you work with early-stage startups?",
    }),
    a: t({
      ar: "نعم! لدينا خطط وباقات مخصصة تناسب الشركات الناشئة (Startups) والمؤسسين، حيث نقوم بدور فريق التسويق المتكامل لنحقق أقصى نمو بأفضل استغلال للميزانية.",
      en: "Yes! We have custom plans tailored for startups and founders, where we act as your full-stack marketing team to achieve maximum growth with optimal budget allocation.",
    }),
  },
  {
    q: t({
      ar: "ما هي المدة المتوقعة لرؤية النتائج؟",
      en: "What is the expected timeframe to see results?",
    }),
    a: t({
      ar: "تختلف المدة حسب أهداف الحملة. حملات الأداء المباشر (Performance Ads) تبدأ في جلب نتائج خلال الأيام الأولى من الإطلاق، بينما استراتيجيات الـ SEO والبناء العضوي تتطلب من 3-6 أشهر لرؤية نتائج ملموسة ومستدامة.",
      en: "Performance Ads start generating results within the first few days of launch, while SEO and organic strategies require 3-6 months to see tangible and sustainable results.",
    }),
  },
  {
    q: t({
      ar: "ما هو الحد الأدنى لبدء العمل معكم؟",
      en: "What is the minimum budget to start working with you?",
    }),
    a: t({
      ar: "نوفر باقات تسعير شفافة تبدأ من 5000 ج.م شهرياً للباقة التأسيسية التي تشمل إدارة حسابات إعلانية واستشارات، وتصل إلى الباقات الشاملة والمتقدمة التي تبدأ من 15000 ج.م شهرياً.",
      en: "Pricing plans starting from 5,000 EGP/month for the foundational package (includes ad account management and consulting), and up to 15,000+ EGP for comprehensive advanced packages.",
    }),
  },
  {
    q: t({
      ar: "هل تقدمون جلسات استشارية مجانية؟",
      en: "Do you offer free consultation sessions?",
    }),
    a: t({
      ar: "بالتأكيد! نوفر جلسة استراتيجية مجانية لمؤسسي الشركات لتحليل أداء نشاطك التجاري، واستكشاف فرص النمو، واقتراح أفضل الحلول التسويقية لتوسيع أعمالك.",
      en: "Absolutely! We provide a free strategy session for company founders to analyze business performance, explore growth opportunities, and propose the best marketing solutions to scale your business.",
    }),
  },
  {
    q: t({
      ar: "ما المنصات التي تديرون الإعلانات عليها؟",
      en: "Which platforms do you manage ads on?",
    }),
    a: t({
      ar: "ندير الحملات على جميع منصات جلب العملاء الرئيسية: Meta (فيسبوك وانستجرام)، Google Ads، TikTok، LinkedIn لشريحة الـ B2B، وSnapchat.",
      en: "We manage campaigns across all major platforms: Meta (Facebook/Instagram), Google Ads, TikTok, LinkedIn (for B2B), and Snapchat.",
    }),
  },
  {
    q: t({
      ar: "كيف يمكننا بدء العمل معكم؟",
      en: "How can we start working with you?",
    }),
    a: t({
      ar: "الأمر بسيط، يمكنك حجز مكالمة استراتيجية مجانية من خلال الموقع، وسيقوم مدير النمو والتسويق بالتواصل معك لدراسة احتياجات شركتك.",
      en: "Book a free strategy call through our website, and our Growth & Marketing Manager will contact you to study your company's needs.",
    }),
  },
  {
    q: t({
      ar: "هل توجد تقارير دورية لمتابعة الأداء؟",
      en: "Are there periodic performance reports?",
    }),
    a: t({
      ar: "نعم، نقدم تقارير أسبوعية وشهرية مفصلة نوضح فيها مؤشرات الأداء الرئيسية (KPIs) والعائد على النفقات الإعلانية (ROAS).",
      en: "Yes, we provide detailed weekly and monthly reports outlining KPIs, ROAS, and optimization steps for the upcoming period.",
    }),
  },
];

export default function FAQ() {
  const { t, language } = useLanguage();
  const { data: settings } = usePublicSettings();
  const fallbackFaqs = getDefaultFaqs(t);
  const faqs = (Array.isArray(settings?.faqs) && settings.faqs.length > 0)
    ? (settings.faqs as { q: string; a: string }[])
    : fallbackFaqs;

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Helmet>
        <title>
          {t({ ar: "الأسئلة الشائعة | ماركتير برو", en: "FAQ | Marketer Pro" })}
        </title>
        <meta
          name="description"
          content={t({
            ar: "إجابات لأكثر الأسئلة شيوعاً حول خدمات ماركتير برو للتسويق الرقمي.",
            en: "Answers to the most frequently asked questions about Marketer Pro's digital marketing services.",
          })}
        />
        <script type="application/ld+json">
          {JSON.stringify(faqStructuredData)}
        </script>
      </Helmet>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Link href="/">
            <Button variant="ghost" data-testid="button-back-home">
              {language === "en" ? (
                <ArrowLeft className="mr-2 h-4 w-4" />
              ) : (
                <ArrowRight className="ml-2 h-4 w-4" />
              )}
              {t({ ar: "العودة للرئيسية", en: "Back to Home" })}
            </Button>
          </Link>
        </motion.div>
        <motion.div
          className="text-center mb-12"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div
            variants={fadeInUp}
            className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center"
          >
            <HelpCircle className="h-8 w-8 text-accent" />
          </motion.div>
          <motion.h1
            variants={fadeInUp}
            className="text-3xl sm:text-4xl font-extrabold text-foreground"
            data-testid="text-faq-title"
          >
            {t({ ar: "الأسئلة الشائعة", en: "Frequently Asked Questions" })}
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            className="mt-3 text-muted-foreground text-lg"
          >
            {t({
              ar: "إجابات لأكثر الأسئلة شيوعاً حول خدمات ماركتير برو",
              en: "Answers to the most frequently asked questions about Marketer Pro's services",
            })}
          </motion.p>
        </motion.div>
        <FAQAccordion faqs={faqs} />
      </div>
    </div>
  );
}

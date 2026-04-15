import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight, FileText } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/atoms/Button";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { useLanguage } from "@/hooks/use-language";
import { useQuery } from "@tanstack/react-query";
import { LegalSectionsList } from "@/components/molecules/LegalSectionsList";

const getSections = (t: any, settings: any) => [
  {
    title: t({ ar: "القبول بالشروط", en: "Acceptance of Terms" }),
    content: t({
      ar: "باستخدامك لموقع ماركتير برو وطلبك لأي من خدماتنا التسويقية أو الاستشارية، فإنك توافق على الالتزام بهذه الشروط والأحكام.",
      en: "By using the Marketer Pro website and requesting any of our marketing or consulting services, you agree to be bound by these terms and conditions.",
    }),
  },
  {
    title: t({ ar: "وصف الخدمة", en: "Service Description" }),
    content: t({
      ar: "تقدم ماركتير برو خدمات وحلول في مجال التسويق الرقمي تشمل ولا تقتصر على: الاستشارات، إدارة الحملات الإعلانية، تحسين محركات البحث، الميديا باينج، وتطوير الخطط التسويقية.",
      en: "Marketer Pro offers digital marketing services and solutions including but not limited to: consultations, ad campaign management, SEO, media buying, and marketing plan development.",
    }),
  },
  {
    title: t({ ar: "التعاقد والاشتراك", en: "Contracting and Subscription" }),
    content: t({
      ar: "يتم طلب الخدمات والموافقة عليها عبر منصاتنا المعتمدة. يجب تقديم معلومات صحيحة ودقيقة عن النشاط التجاري.",
      en: "Services are requested and approved through our authorized platforms. You must provide complete and accurate information about your business.",
    }),
  },
  {
    title: t({ ar: "الرسوم والدفع", en: "Fees and Payment" }),
    content: t({
      ar: "تُدفع تكلفة الخدمات والتسويق وفقاً للباقة المختارة أو العرض المالي المقدم سلفاً للعميل.",
      en: "The cost of services and marketing is paid according to the selected package or the financial offer provided in advance to the client.",
    }),
  },
  {
    title: t({
      ar: "سياسة الاسترداد وإلغاء التعاقد",
      en: "Refund Policy and Contract Cancellation",
    }),
    content: t({
      ar: `تخضع سياسات الاسترداد لشروط كل عقد على حدة. يمكنك إلغاء الطلب خلال ${settings?.cancelDeadlineHours || 48} ساعة من تاريخ الشراء.`,
      en: `Refund policies are subject to the terms of each individual contract. You can cancel your order within ${settings?.cancelDeadlineHours || 48} hours of purchase.`,
    }),
  },
  {
    title: t({ ar: "مسؤولية العميل", en: "Client Responsibility" }),
    content: t({
      ar: "يلتزم العميل بتقديم كل المعلومات والصلاحيات المطلوبة والتعاون مع فريق ماركتير برو في الأوقات المتفق عليها.",
      en: "The client is obligated to provide all required information and permissions and cooperate with the Marketer Pro team at the agreed times.",
    }),
  },
  {
    title: t({ ar: "الملكية الفكرية", en: "Intellectual Property" }),
    content: t({
      ar: "جميع الاستراتيجيات والمواد الاستشارية المقدمة من خلال ماركتير برو هي ملكية فكرية لها.",
      en: "All strategies and consulting materials provided by Marketer Pro are its intellectual property.",
    }),
  },
  {
    title: t({ ar: "إخلاء المسؤولية", en: "Disclaimer" }),
    content: t({
      ar: "نسعى لتقديم أفضل الخطط التسويقية، إلا أننا لا نضمن نتائج رقمية حتمية أو أرباح مضمونة.",
      en: "We strive to provide the best marketing plans, but we do not guarantee inevitable digital results or guaranteed profits.",
    }),
  },
  {
    title: t({ ar: "تعديل الشروط", en: "Amendment of Terms" }),
    content: t({
      ar: "يحق لنا تعديل هذه الشروط والأحكام في أي وقت. استمرارك في استخدام الخدمة بعد التعديل يعني موافقتك على الشروط المحدثة.",
      en: "We reserve the right to amend these terms at any time. Your continued use of the service after the amendment implies your acceptance of the updated terms.",
    }),
  },
];

export default function Terms() {
  const { t, language } = useLanguage();
  const { data: settingsData } = useQuery({
    queryKey: ["/api/settings"],
    queryFn: async () => {
      const res = await fetch("/api/settings");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });
  const bookingPolicies = settingsData?.booking_policies || {
    cancelDeadlineHours: 48,
    editDeadlineHours: 24,
  };
  const sections = getSections(t, bookingPolicies);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Helmet>
        <title>
          {t({
            ar: "الشروط والأحكام | ماركتير برو",
            en: "Terms and Conditions | Marketer Pro",
          })}
        </title>
        <meta
          name="description"
          content={t({
            ar: "الشروط والأحكام لاستخدام خدمات ووكالة ماركتير برو للتسويق الرقمي",
            en: "Terms and conditions for using Marketer Pro digital marketing agency services",
          })}
        />
        <link rel="canonical" href="https://marketerpro.example.com/terms" />
        <meta name="robots" content="index, follow" />
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
            <FileText className="h-8 w-8 text-accent" />
          </motion.div>
          <motion.h1
            variants={fadeInUp}
            className="text-3xl sm:text-4xl font-extrabold text-foreground"
            data-testid="text-terms-title"
          >
            {t({ ar: "الشروط والأحكام", en: "Terms and Conditions" })}
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            className="mt-3 text-muted-foreground text-lg"
          >
            {t({
              ar: "شروط وأحكام استخدام خدمات وكالة ماركتير برو",
              en: "Terms and conditions for using Marketer Pro agency services",
            })}
          </motion.p>
          <motion.p
            variants={fadeInUp}
            className="mt-2 text-muted-foreground text-sm"
          >
            {t({ ar: "آخر تحديث: مارس 2026", en: "Last Updated: March 2026" })}
          </motion.p>
        </motion.div>
        <LegalSectionsList sections={sections} testIdPrefix="terms" />
      </div>
    </div>
  );
}

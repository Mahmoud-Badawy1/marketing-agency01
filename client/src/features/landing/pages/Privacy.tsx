import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight, Shield } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/atoms/Button";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { useLanguage } from "@/hooks/use-language";
import { LegalSectionsList } from "@/components/molecules/LegalSectionsList";

const getSections = (t: any) => [
  {
    title: t({ ar: "جمع المعلومات", en: "Information Collection" }),
    content: t({
      ar: "نقوم بجمع المعلومات التي تقدمها لنا مباشرة عند التسجيل أو التواصل معنا، مثل الاسم، رقم الهاتف، اسم الشركة، نوع الخدمة المطلوبة. نستخدم هذه المعلومات فقط للتواصل معك بخصوص خدماتنا.",
      en: "We collect information you provide directly to us when registering or contacting us, such as your name, phone number, company name, and the required service type. We use this information solely to communicate with you regarding our services.",
    }),
  },
  {
    title: t({ ar: "استخدام المعلومات", en: "Use of Information" }),
    content: t({
      ar: "نستخدم المعلومات المجمعة للأغراض التالية: التواصل معك بخصوص الاستشارات وتقديم الخدمات التسويقية، تحسين خدماتنا، إرسال تحديثات وعروض (بموافقتك).",
      en: "We use the collected information for: communicating with you regarding consulting and marketing services, improving our services, and sending updates and offers (with your consent).",
    }),
  },
  {
    title: t({ ar: "حماية المعلومات", en: "Information Protection" }),
    content: t({
      ar: "نتخذ إجراءات أمنية مناسبة لحماية معلوماتك الشخصية. نحن لا نبيع أو نشارك معلوماتك الشخصية مع أطراف ثالثة لأغراض تسويقية.",
      en: "We implement appropriate security measures to protect your personal information. We do not sell or share your personal information with third parties for marketing purposes.",
    }),
  },
  {
    title: t({ ar: "ملفات تعريف الارتباط (Cookies)", en: "Cookies" }),
    content: t({
      ar: "قد نستخدم ملفات تعريف الارتباط وتقنيات مشابهة لتحسين تجربتك على موقعنا.",
      en: "We may use cookies and similar technologies to enhance your experience on our website.",
    }),
  },
  {
    title: t({ ar: "حقوق المستخدم", en: "User Rights" }),
    content: t({
      ar: "لديك الحق في الوصول إلى معلوماتك الشخصية، طلب تصحيح أو حذف معلوماتك، وسحب موافقتك على معالجة بياناتك في أي وقت.",
      en: "You have the right to access your personal information, request correction or deletion, and withdraw your consent to process your data at any time.",
    }),
  },
  {
    title: t({
      ar: "خصوصية بيانات عملائك التجاريين",
      en: "Privacy of Your Business Clients' Data",
    }),
    content: t({
      ar: "نحن ملتزمون التزاماً كاملاً بحماية خصوصية بياناتك وبيانات عملائك. لا نقوم باستخدام أو مشاركة بيانات عملائك لأي غرض خارج نطاق تقديم الخدمة المتفق عليها.",
      en: "We are fully committed to protecting the privacy of your data and your clients' data. We do not use or share your clients' data for any purpose outside the scope of providing the agreed-upon service.",
    }),
  },
  {
    title: t({ ar: "التحديثات على السياسة", en: "Policy Updates" }),
    content: t({
      ar: "قد نقوم بتحديث سياسة الخصوصية من وقت لآخر. سنقوم بإبلاغك بأي تغييرات جوهرية.",
      en: "We may update our privacy policy from time to time. We will notify you of any material changes.",
    }),
  },
  {
    title: t({ ar: "التواصل معنا", en: "Contact Us" }),
    content: t({
      ar: "إذا كان لديك أي أسئلة حول سياسة الخصوصية، يرجى التواصل معنا عبر واتساب أو من خلال نموذج التواصل في الموقع.",
      en: "If you have any questions about our privacy policy, please contact us via WhatsApp or through the contact form on our website.",
    }),
  },
];

export default function Privacy() {
  const { t, language } = useLanguage();
  const sections = getSections(t);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Helmet>
        <title>
          {t({
            ar: "سياسة الخصوصية | ماركتير برو",
            en: "Privacy Policy | Marketer Pro",
          })}
        </title>
        <meta
          name="description"
          content={t({
            ar: "سياسة الخصوصية لوكالة ماركتير برو - كيف نحمي بياناتك",
            en: "Privacy Policy for Marketer Pro Agency - How we protect your data",
          })}
        />
        <link rel="canonical" href="https://marketerpro.example.com/privacy" />
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
            <Shield className="h-8 w-8 text-accent" />
          </motion.div>
          <motion.h1
            variants={fadeInUp}
            className="text-3xl sm:text-4xl font-extrabold text-foreground"
            data-testid="text-privacy-title"
          >
            {t({ ar: "سياسة الخصوصية", en: "Privacy Policy" })}
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            className="mt-3 text-muted-foreground text-lg"
          >
            {t({
              ar: "نحن نحترم خصوصيتك ونلتزم بحماية معلوماتك الشخصية",
              en: "We respect your privacy and are committed to protecting your personal information",
            })}
          </motion.p>
          <motion.p
            variants={fadeInUp}
            className="mt-2 text-muted-foreground text-sm"
          >
            {t({
              ar: "آخر تحديث: فبراير 2026",
              en: "Last Updated: February 2026",
            })}
          </motion.p>
        </motion.div>
        <LegalSectionsList sections={sections} testIdPrefix="privacy" />
      </div>
    </div>
  );
}

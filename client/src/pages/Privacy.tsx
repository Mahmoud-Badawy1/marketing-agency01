import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight, Shield } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { useLanguage } from "@/hooks/use-language";

const getSections = (t: any) => [
  {
    title: t({ ar: "جمع المعلومات", en: "Information Collection" }),
    content: t({
      ar: "نقوم بجمع المعلومات التي تقدمها لنا مباشرة عند التسجيل أو التواصل معنا، مثل الاسم، رقم الهاتف، اسم الشركة، نوع الخدمة المطلوبة. نستخدم هذه المعلومات فقط للتواصل معك بخصوص خدماتنا التسويقية والاستشارية.",
      en: "We collect information you provide directly to us when registering or contacting us, such as your name, phone number, company name, and the required service type. We use this information solely to communicate with you regarding our marketing and consulting services."
    }),
  },
  {
    title: t({ ar: "استخدام المعلومات", en: "Use of Information" }),
    content: t({
      ar: "نستخدم المعلومات المجمعة للأغراض التالية: التواصل معك بخصوص الاستشارات وتقديم الخدمات التسويقية، تحسين خدماتنا وتطوير الحملات، إرسال تحديثات وعروض حول خدماتنا (بموافقتك).",
      en: "We use the collected information for the following purposes: communicating with you regarding consulting and providing marketing services, improving our services and developing campaigns, and sending updates and offers about our services (with your consent)."
    }),
  },
  {
    title: t({ ar: "حماية المعلومات", en: "Information Protection" }),
    content: t({
      ar: "نتخذ إجراءات أمنية مناسبة لحماية معلوماتك الشخصية من الوصول غير المصرح به أو التغيير أو الإفصاح أو الإتلاف. نحن لا نبيع أو نشارك معلوماتك الشخصية مع أطراف ثالثة لأغراض تسويقية.",
      en: "We implement appropriate security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. We do not sell or share your personal information with third parties for marketing purposes."
    }),
  },
  {
    title: t({ ar: "ملفات تعريف الارتباط (Cookies)", en: "Cookies" }),
    content: t({
      ar: "قد نستخدم ملفات تعريف الارتباط وتقنيات مشابهة لتحسين تجربتك على موقعنا. يمكنك التحكم في إعدادات ملفات تعريف الارتباط من خلال متصفحك.",
      en: "We may use cookies and similar technologies to enhance your experience on our website. You can control your cookie settings through your browser."
    }),
  },
  {
    title: t({ ar: "حقوق المستخدم", en: "User Rights" }),
    content: t({
      ar: "لديك الحق في: الوصول إلى معلوماتك الشخصية التي نحتفظ بها، طلب تصحيح أو حذف معلوماتك، سحب موافقتك على معالجة بياناتك في أي وقت، تقديم شكوى إلى الجهات المختصة بحماية البيانات.",
      en: "You have the right to: access your personal information we hold, request correction or deletion of your information, withdraw your consent to process your data at any time, and lodge a complaint with the competent data protection authorities."
    }),
  },
  {
    title: t({ ar: "خصوصية بيانات عملائك التجاريين", en: "Privacy of Your Business Clients' Data" }),
    content: t({
      ar: "نحن ملتزمون التزاماً كاملاً بحماية خصوصية بياناتك وبيانات عملائك وقواعد بيانات الشركات التي نتعامل معها. لا نقوم باستخدام أو استغلال أو بمشاركة بيانات عملائك لأي غرض خارج نطاق تقديم الخدمة المتفق عليها.",
      en: "We are fully committed to protecting the privacy of your data, your clients' data, and the databases of the companies we work with. We do not use, exploit, or share your clients' data for any purpose outside the scope of providing the agreed-upon service."
    }),
  },
  {
    title: t({ ar: "التحديثات على السياسة", en: "Policy Updates" }),
    content: t({
      ar: "قد نقوم بتحديث سياسة الخصوصية من وقت لآخر. سنقوم بإبلاغك بأي تغييرات جوهرية عبر البريد الإلكتروني أو إشعار على موقعنا.",
      en: "We may update our privacy policy from time to time. We will notify you of any material changes via email or a notice on our website."
    }),
  },
  {
    title: t({ ar: "التواصل معنا", en: "Contact Us" }),
    content: t({
      ar: "إذا كان لديك أي أسئلة حول سياسة الخصوصية أو كيفية تعاملنا مع معلوماتك الشخصية، يرجى التواصل معنا عبر واتساب أو من خلال نموذج التواصل في الموقع.",
      en: "If you have any questions about our privacy policy or how we handle your personal information, please contact us via WhatsApp or through the contact form on our website."
    }),
  },
];

export default function Privacy() {
  const { t, language } = useLanguage();
  const currentSections = getSections(t);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Helmet>
        <title>{t({ ar: "سياسة الخصوصية | ماركتير برو - Marketer Pro", en: "Privacy Policy | Marketer Pro" })}</title>
        <meta name="description" content={t({ ar: "سياسة الخصوصية لوكالة ماركتير برو - كيف نحمي بياناتك ومعلومات نشاطك التجاري", en: "Privacy Policy for Marketer Pro Agency - How we protect your data and business information" })} />
        <meta property="og:title" content={t({ ar: "سياسة الخصوصية | ماركتير برو", en: "Privacy Policy | Marketer Pro" })} />
        <meta property="og:description" content={t({ ar: "تعرف على كيفية حماية ماركتير برو لبياناتك ونشاطك التجاري", en: "Learn how Marketer Pro protects your data and business information" })} />
        <link rel="canonical" href="https://marketerpro.example.com/privacy" />
        <meta name="robots" content="index, follow" />
      </Helmet>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <Link href="/">
            <Button variant="ghost" data-testid="button-back-home">
              {language === "en" ? <ArrowLeft className="mr-2 h-4 w-4" /> : <ArrowRight className="ml-2 h-4 w-4" />}
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
          <motion.div variants={fadeInUp} className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
            <Shield className="h-8 w-8 text-accent" />
          </motion.div>
          <motion.h1 variants={fadeInUp} className="text-3xl sm:text-4xl font-extrabold text-foreground" data-testid="text-privacy-title">
            {t({ ar: "سياسة الخصوصية", en: "Privacy Policy" })}
          </motion.h1>
          <motion.p variants={fadeInUp} className="mt-3 text-muted-foreground text-lg">
            {t({ ar: "نحن نحترم خصوصيتك ونلتزم بحماية معلوماتك الشخصية", en: "We respect your privacy and are committed to protecting your personal information" })}
          </motion.p>
          <motion.p variants={fadeInUp} className="mt-2 text-muted-foreground text-sm">
            {t({ ar: "آخر تحديث: فبراير 2026", en: "Last Updated: February 2026" })}
          </motion.p>
        </motion.div>

        <motion.div
          className="space-y-4"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {currentSections.map((section, i) => (
            <motion.div key={i} variants={fadeInUp} custom={i}>
              <Card className="p-6 border border-card-border" data-testid={`card-privacy-${i}`}>
                <h3 className="text-lg font-bold text-foreground mb-2">{section.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{section.content}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

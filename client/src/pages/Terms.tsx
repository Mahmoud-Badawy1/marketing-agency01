import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight, FileText } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { useLanguage } from "@/hooks/use-language";

const getSections = (t: any) => [
  {
    title: t({ ar: "القبول بالشروط", en: "Acceptance of Terms" }),
    content: t({
      ar: "باستخدامك لموقع ماركتير برو وطلبك لأي من خدماتنا التسويقية أو الاستشارية، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي من هذه الشروط، يرجى عدم استخدام خدماتنا.",
      en: "By using the Marketer Pro website and requesting any of our marketing or consulting services, you agree to be bound by these terms and conditions. If you do not agree to any of these terms, please do not use our services."
    }),
  },
  {
    title: t({ ar: "وصف الخدمة", en: "Service Description" }),
    content: t({
      ar: "تقدم ماركتير برو خدمات وحلول في مجال التسويق الرقمي تشمل ولا تقتصر على: الاستشارات، إدارة الحملات الإعلانية، تحسين محركات البحث، الميديا باينج، وتطوير الخطط التسويقية.",
      en: "Marketer Pro offers digital marketing services and solutions including but not limited to: consultations, ad campaign management, SEO, media buying, and marketing plan development."
    }),
  },
  {
    title: t({ ar: "التعاقد والاشتراك", en: "Contracting and Subscription" }),
    content: t({
      ar: "يتم طلب الخدمات والموافقة عليها عبر منصاتنا المعتمدة. يجب تقديم معلومات صحيحة ودقيقة عن النشاط التجاري لضمان تقديم الخدمة بأفضل صورة ممكنة.",
      en: "Services are requested and approved through our authorized platforms. You must provide complete and accurate information about your business to ensure we provide the service in the best possible way."
    }),
  },
  {
    title: t({ ar: "الرسوم والدفع", en: "Fees and Payment" }),
    content: t({
      ar: "تُدفع تكلفة الخدمات والتسويق وفقاً للباقة المختارة أو العرض المالي المقدم سلفاً للعميل. تخضع الميزانيات الإعلانية الخاصة بالمنصات (فيسبوك، جوجل.. الخ) لإدارة العميل ومسؤوليته، ما لم يُتفق على خلاف ذلك.",
      en: "The cost of services and marketing is paid according to the selected package or the financial offer provided in advance to the client. Advertising budgets for platforms (Facebook, Google, etc.) are the client's responsibility and management, unless agreed otherwise."
    }),
  },
  {
    title: t({ ar: "سياسة الاسترداد وإلغاء التعاقد", en: "Refund Policy and Contract Cancellation" }),
    content: t({
      ar: "تخضع سياسات الاسترداد لشروط كل عقد على حدة. للمشتركين في الخدمات الاستشارية والرقمية المباعة أونلاين عبر الموقع تخضع الشروط لضمان الرضا (إذا تم ذكره صراحة) وإلا فالقاعدة الأساسية تعتمد على بنود التعاقد المبرم.",
      en: "Refund policies are subject to the terms of each individual contract. For consulting services and digital products sold online, our satisfaction guarantee applies (if explicitly stated), otherwise, the general rule depends on the signed contract terms."
    }),
  },
  {
    title: t({ ar: "مسؤولية العميل", en: "Client Responsibility" }),
    content: t({
      ar: "يلتزم العميل بتقديم كل المعلومات والصلاحيات المطلوبة والتعاون مع فريق ماركتير برو في الأوقات المتفق عليها لتمكيننا من التنفيذ الأمثل للخدمات.",
      en: "The client is obligated to provide all required information and permissions and cooperate with the Marketer Pro team at the agreed times to enable us to optimally execute the services."
    }),
  },
  {
    title: t({ ar: "الملكية الفكرية", en: "Intellectual Property" }),
    content: t({
      ar: "جميع الاستراتيجيات والمواد الاستشارية المقدمة من خلال ماركتير برو هي ملكية فكرية لها وتُقدم للاستخدام الحصري للعميل المشتري لها ولا يجوز له بيعها لمنافسين آخرين.",
      en: "All strategies and consulting materials provided by Marketer Pro are its intellectual property and are provided for the exclusive use of the purchasing client, and they may not be sold or shared with competitors."
    }),
  },
  {
    title: t({ ar: "إخلاء المسؤولية", en: "Disclaimer" }),
    content: t({
      ar: "نسعى لتقديم أفضل الخطط التسويقية وتحقيق أعلى العوائد الممكنة بالاعتماد على دراسات دقيقة، إلا أننا لا نضمن نتائج رقمية حتمية أو أرباح مضمونة، حيث تخضع الأسواق لتغيرات خارج سيطرة فرق التسويق.",
      en: "We strive to provide the best marketing plans and achieve the highest possible returns based on careful studies, but we do not guarantee inevitable digital results or guaranteed profits, as markets are subject to changes beyond the control of marketing teams."
    }),
  },
  {
    title: t({ ar: "تعديل الشروط", en: "Amendment of Terms" }),
    content: t({
      ar: "يحق لنا تعديل هذه الشروط والأحكام في أي وقت. سيتم إبلاغ المشتركين بأي تغييرات جوهرية قبل تطبيقها. استمرارك في استخدام الخدمة بعد التعديل يعني موافقتك على الشروط المحدثة.",
      en: "We reserve the right to amend these terms and conditions at any time. Clients will be notified of any material changes before they are applied. Your continued use of the service after the amendment implies your acceptance of the updated terms."
    }),
  },
];

export default function Terms() {
  const { t, language } = useLanguage();
  const currentSections = getSections(t);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Helmet>
        <title>{t({ ar: "الشروط والأحكام | ماركتير برو - Marketer Pro", en: "Terms and Conditions | Marketer Pro" })}</title>
        <meta name="description" content={t({ ar: "الشروط والأحكام لاستخدام خدمات ووكالة ماركتير برو للتسويق الرقمي", en: "Terms and conditions for using Marketer Pro digital marketing agency services" })} />
        <meta property="og:title" content={t({ ar: "الشروط والأحكام | ماركتير برو", en: "Terms and Conditions | Marketer Pro" })} />
        <meta property="og:description" content={t({ ar: "شروط وأحكام استخدام خدمات ماركتير برو", en: "Terms and conditions of using Marketer Pro services" })} />
        <link rel="canonical" href="https://marketerpro.example.com/terms" />
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
            <FileText className="h-8 w-8 text-accent" />
          </motion.div>
          <motion.h1 variants={fadeInUp} className="text-3xl sm:text-4xl font-extrabold text-foreground" data-testid="text-terms-title">
            {t({ ar: "الشروط والأحكام", en: "Terms and Conditions" })}
          </motion.h1>
          <motion.p variants={fadeInUp} className="mt-3 text-muted-foreground text-lg">
            {t({ ar: "شروط وأحكام استخدام خدمات وكالة ماركتير برو", en: "Terms and conditions for using Marketer Pro agency services" })}
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
              <Card className="p-6 border border-card-border" data-testid={`card-terms-${i}`}>
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

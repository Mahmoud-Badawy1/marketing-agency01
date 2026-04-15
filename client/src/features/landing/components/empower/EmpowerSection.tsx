import { motion } from "framer-motion";
import { Button } from "@/components/atoms/Button";
import { ArrowLeft } from "lucide-react";
import { fadeInRight, staggerContainer, viewportConfig } from "@/lib/animations";
import { usePublicSettings } from "@/hooks/use-public-settings";
import { useLanguage } from "@/hooks/use-language";
import { EmpowerStats } from "./EmpowerStats";

const defaultEmpowerSection = {
  subtitle: { ar: "نحن هنا لنجاحك", en: "We are here for your success" },
  title: { ar: "مكّن علامتك التجارية لتنمو بشكل", en: "Empower your brand to grow" },
  titleHighlight: { ar: "أسرع وأقوى", en: "faster & stronger" },
  description: { ar: "نحن نساعدك في بناء حضور رقمي استثنائي، الوصول إلى جمهورك المستهدف، وتحقيق أرباح مضاعفة. مع ماركتير برو، مستقبلك أفضل", en: "We help you build an exceptional digital presence, reach your target audience, and double your profits. With Marketer Pro, your future is brighter" },
  ctaText: { ar: "ابدأ حملتك اليوم", en: "Start Your Campaign Today" },
  stats: [
    { value: "50M+", label: { ar: "وصول للحملات الإعلانية", en: "Ad Campaign Reach" }, iconType: "check", iconColor: "text-emerald-400" },
    { value: "20+", label: { ar: "دولة نخدم عملاءها", en: "Countries Served" }, iconType: "globe", iconColor: "text-accent" },
  ],
};

export default function EmpowerSection() {
  const { data: settings } = usePublicSettings();
  const { t } = useLanguage();
  const es = settings?.empower_section || defaultEmpowerSection;

  return (
    <section className="py-16 sm:py-20 relative bg-primary dark:bg-primary text-primary-foreground overflow-hidden" data-testid="section-empower">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div className="space-y-6" initial="hidden" whileInView="visible" viewport={viewportConfig} variants={staggerContainer}>
            <motion.p variants={fadeInRight} className="text-primary-foreground/70 font-semibold text-sm">{t(es.subtitle)}</motion.p>
            <motion.h2 variants={fadeInRight} className="text-3xl sm:text-4xl font-extrabold leading-tight" data-testid="text-empower-title">
              {t(es.title)}{" "}<span className="text-accent">{t(es.titleHighlight)}</span>
            </motion.h2>
            <motion.p variants={fadeInRight} className="text-primary-foreground/80 text-lg leading-relaxed">{t(es.description)}</motion.p>
            <motion.div variants={fadeInRight}>
              <Button size="lg" className="bg-accent text-accent-foreground border-accent-border" onClick={() => document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" })} data-testid="button-empower-cta">
                {t(es.ctaText)}<ArrowLeft className="mx-2 h-5 w-5 rtl:rotate-0 rotate-180" />
              </Button>
            </motion.div>
          </motion.div>
          <EmpowerStats stats={es.stats} />
        </div>
      </div>
    </section>
  );
}

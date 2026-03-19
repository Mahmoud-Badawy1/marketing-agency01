import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, CheckCircle, Globe } from "lucide-react";
import { fadeInUp, fadeInRight, fadeInLeft, scaleIn, staggerContainer, viewportConfig } from "@/lib/animations";
import { usePublicSettings } from "@/hooks/use-public-settings";
import { useLanguage } from "@/hooks/use-language";

export default function EmpowerSection() {
  const { data: settings } = usePublicSettings();
  const { t } = useLanguage();

  // Default empower section data
  const defaultEmpowerSection = {
    subtitle: { ar: "نحن هنا لنجاحك", en: "We are here for your success" },
    title: { ar: "مكّن علامتك التجارية لتنمو بشكل", en: "Empower your brand to grow" },
    titleHighlight: { ar: "أسرع وأقوى", en: "faster & stronger" },
    description: { 
      ar: "نحن نساعدك في بناء حضور رقمي استثنائي، الوصول إلى جمهورك المستهدف، وتحقيق أرباح مضاعفة. مع ماركتير برو، مستقبلك أفضل",
      en: "We help you build an exceptional digital presence, reach your target audience, and double your profits. With Marketer Pro, your future is brighter"
    },
    ctaText: { ar: "ابدأ حملتك اليوم", en: "Start Your Campaign Today" },
    stats: [
      {
        value: "50M+",
        label: { ar: "وصول للحملات الإعلانية", en: "Ad Campaign Reach" },
        iconType: "check",
        iconColor: "text-emerald-400",
      },
      {
        value: "20+",
        label: { ar: "دولة نخدم عملاءها", en: "Countries Served" },
        iconType: "globe",
        iconColor: "text-accent",
      },
    ],
  };

  const empowerSection = settings?.empower_section || defaultEmpowerSection;

  return (
    <section className="py-16 sm:py-20 relative bg-primary dark:bg-primary text-primary-foreground overflow-hidden" data-testid="section-empower">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            className="space-y-6"
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
            variants={staggerContainer}
          >
            <motion.p variants={fadeInRight} className="text-primary-foreground/70 font-semibold text-sm">
              {t(empowerSection.subtitle)}
            </motion.p>
            <motion.h2
              variants={fadeInRight}
              className="text-3xl sm:text-4xl font-extrabold leading-tight"
              data-testid="text-empower-title"
            >
              {t(empowerSection.title)}{" "}
              <span className="text-accent">{t(empowerSection.titleHighlight)}</span>
            </motion.h2>
            <motion.p variants={fadeInRight} className="text-primary-foreground/80 text-lg leading-relaxed">
              {t(empowerSection.description)}
            </motion.p>
            <motion.div variants={fadeInRight}>
              <Button
                size="lg"
                className="bg-accent text-accent-foreground border-accent-border"
                onClick={() => document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" })}
                data-testid="button-empower-cta"
              >
                {t(empowerSection.ctaText)}
                <ArrowLeft className="mx-2 h-5 w-5 rtl:rotate-0 rotate-180" />
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 gap-4"
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
            variants={staggerContainer}
          >
            {empowerSection.stats.map((stat, idx) => {
              const iconTypeFromData = (stat as any).iconType || (stat as any).icon;
              const isCheckIcon = iconTypeFromData === "check";
              const bgColor = isCheckIcon ? "bg-emerald-500/20" : "bg-accent/20";
              const animClass = isCheckIcon ? "animate-pulse" : "animate-spin-15";
              const Icon = isCheckIcon ? CheckCircle : Globe;
              
              return (
                <motion.div key={idx} variants={scaleIn} custom={idx}>
                  <Card className="p-6 bg-white/10 border-white/10 backdrop-blur-sm text-center hover-elevate" data-testid={`card-stat-${idx}`}>
                    <div className={`w-10 h-10 mx-auto mb-3 rounded-full ${bgColor} flex items-center justify-center ${animClass}`}>
                      <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                    </div>
                    <p className="text-3xl font-extrabold text-white">{stat.value}</p>
                    <p className="text-xs text-white/70 mt-1">{t(stat.label)}</p>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

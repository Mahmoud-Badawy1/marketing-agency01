import { motion } from "framer-motion";
import { SERVICES } from "@/lib/constants";
import { fadeInUp, staggerContainer, viewportConfig } from "@/lib/animations";
import { usePublicSettings } from "@/hooks/use-public-settings";
import { useLanguage } from "@/hooks/use-language";
import { SkillsGrid } from "./SkillsGrid";
import { SkillCards } from "./SkillCards";

export default function SkillsSection() {
  const { data: settings } = usePublicSettings();
  const { t } = useLanguage();
  const servicesData = settings?.services || settings?.subjects || SERVICES;

  return (
    <section className="py-20 bg-card dark:bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div className="text-center mb-10" initial="hidden" whileInView="visible" viewport={viewportConfig} variants={staggerContainer}>
          <motion.p variants={fadeInUp} className="text-accent font-semibold text-sm mb-2">{t("skills_section.focus")}</motion.p>
          <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-extrabold text-foreground" data-testid="text-future-title">
            {t("skills_section.impact")}
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-accent to-blue-600">{t("skills_section.digital")}</span>{" "}
            {t("skills_section.marketing")}
          </motion.h2>
        </motion.div>
        <SkillsGrid servicesData={servicesData} />
        <SkillCards />
      </div>
    </section>
  );
}

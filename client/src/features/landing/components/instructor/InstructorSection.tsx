import { motion } from "framer-motion";
import { Award } from "lucide-react";
import { fadeInUp, staggerContainer, viewportConfig } from "@/lib/animations";
import { usePublicSettings } from "@/hooks/use-public-settings";
import { useLanguage } from "@/hooks/use-language";
import instructorFallback from "@assets/instructor.png";
import { InstructorBio } from "./InstructorBio";
import { InstructorImageCard } from "./InstructorImageCard";

export default function InstructorSection() {
  const { data: settings } = usePublicSettings();
  const { t } = useLanguage();
  const d = settings?.instructor;

  // Settings from the CMS can be bilingual { ar, en } objects — extract just the string
  const resolveStr = (val: any, fallback: string): string => {
    if (!val) return fallback;
    if (typeof val === "string") return val;
    if (typeof val === "object") return val.ar || val.en || fallback;
    return fallback;
  };

  const instructorSrc = resolveStr(d?.image, settings?.images?.instructor || instructorFallback);
  const instructorName = resolveStr(d?.name, "instructor.default_name");
  const instructorTitle = resolveStr(d?.title, "instructor.default_title");
  const instructorBio = resolveStr(d?.bio, "instructor.default_bio");
  const instructorQuote = resolveStr(d?.quote, "instructor.default_quote");
  const instructorBadge = resolveStr(d?.badge, "instructor.default_badge");


  return (
    <section id="instructor" className="py-24 bg-muted/30 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-transparent via-background to-card/50 pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 -translate-x-1/2 pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div className="text-center mb-16" initial="hidden" whileInView="visible" viewport={viewportConfig} variants={staggerContainer}>
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-6 border border-primary/20 backdrop-blur-sm">
            <Award className="w-4 h-4" />{t("instructor.expertise")}
          </motion.div>
          <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground" data-testid="text-instructor-title">
            {t("instructor.work_with")}<span className="text-transparent bg-clip-text bg-gradient-to-l from-primary to-blue-400">{t("instructor.top_experts")}</span>
          </motion.h2>
        </motion.div>
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <InstructorBio instructorName={instructorName} instructorTitle={instructorTitle} instructorBio={instructorBio} instructorQuote={instructorQuote} dynamicAchievements={d?.achievements} />
          <InstructorImageCard instructorSrc={instructorSrc} instructorName={instructorName} instructorTitle={instructorTitle} instructorBadge={instructorBadge} />
        </div>
      </div>
    </section>
  );
}

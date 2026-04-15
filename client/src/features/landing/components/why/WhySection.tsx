import { motion } from "framer-motion";
import { CheckCircle2, Sparkles } from "lucide-react";
import { AlertTriangle, TrendingUp } from "lucide-react";
import { WHY_CARDS } from "@/lib/constants";
import { fadeInUp, staggerContainer, viewportConfig } from "@/lib/animations";
import { usePublicSettings } from "@/hooks/use-public-settings";
import { useLanguage } from "@/hooks/use-language";

const iconMap = { problem: AlertTriangle, solution: Sparkles, result: TrendingUp };

export default function WhySection() {
  const { data: settings } = usePublicSettings();
  const { t } = useLanguage();
  const dynamicCards = settings?.why_cards;
  const displayCards = dynamicCards?.length
    ? dynamicCards.map((c: any) => ({ title: { ar: c.title, en: c.title }, description: { ar: c.description, en: c.description }, type: c.type }))
    : WHY_CARDS;

  return (
    <section id="why" className="py-24 bg-background relative overflow-hidden">
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none -translate-x-1/2" />
      <div className="absolute bottom-0 right-0 w-[30rem] h-[30rem] bg-accent/10 rounded-full blur-[120px] pointer-events-none translate-x-1/4 translate-y-1/4" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div className="text-center mb-16 sm:mb-20" initial="hidden" whileInView="visible" viewport={viewportConfig} variants={staggerContainer}>
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent font-medium text-sm mb-6 backdrop-blur-sm">
            <Sparkles className="w-4 h-4" /><span>{t("why.badge")}</span>
          </motion.div>
          <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight leading-[1.25] pb-1 max-w-3xl mx-auto">
            {t("why.title_main")}<span className="ms-2 inline-block text-transparent bg-clip-text bg-gradient-to-r from-accent to-blue-500 h-[55px] mt-2">{t("why.title_highlight")}</span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="mt-6 text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">{t("why.description")}</motion.p>
        </motion.div>
        <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr" initial="hidden" whileInView="visible" viewport={viewportConfig} variants={staggerContainer}>
          {displayCards.map((card: any, i: number) => {
            const Icon = iconMap[card.type as keyof typeof iconMap] || CheckCircle2;
            const colSpan = (displayCards.length === 3 && i === 0) ? "md:col-span-2 lg:col-span-1" : "";
            const isHighlight = i === 1;
            return (
              <motion.div key={i} variants={fadeInUp} custom={i} className={`group relative flex flex-col p-[1px] rounded-[2rem] overflow-hidden ${colSpan}`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${isHighlight ? "from-accent to-blue-600 opacity-20 group-hover:opacity-100" : "from-border via-transparent to-border opacity-50 group-hover:opacity-100 group-hover:from-accent/50 group-hover:to-blue-600/50"} transition-opacity duration-500`} />
                <div className="relative h-full bg-card/40 backdrop-blur-2xl p-8 sm:p-10 rounded-[2rem] flex flex-col border border-white/5 z-10 transition-transform duration-500 group-hover:scale-[0.99] shadow-xl hover:shadow-2xl">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 shadow-inner transition-transform duration-500 group-hover:-translate-y-1 ${isHighlight ? "bg-gradient-to-br from-accent to-blue-600 text-white shadow-accent/20" : "bg-muted-foreground/10 text-foreground border border-border/50"}`}>
                    <Icon className="h-6 w-6" strokeWidth={isHighlight ? 2 : 1.5} />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-4 tracking-tight group-hover:text-accent transition-colors duration-300">{t(card.title)}</h3>
                  <p className="text-muted-foreground leading-relaxed flex-grow text-[15px] sm:text-base">{t(card.description)}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

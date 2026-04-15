import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/atoms/Button";
import { ArrowLeft, CheckCircle } from "lucide-react";

export function HeroContent({ slide, t, current, onPricing, onDemo }: any) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div key={current} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm font-semibold border border-white/20">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />{t("hero.reg_open")}
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-white mb-0">
          {t(slide.title)}<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-l from-accent to-blue-400">{t(slide.highlight)}</span>
        </h1>
        <p className="text-lg text-white/80 max-w-xl">{t(slide.subtitle)}</p>
        <div className="flex flex-wrap gap-4 pt-4">
          <Button onClick={onPricing} size="lg" className="bg-accent text-accent-foreground">{t("hero.book_consultation")}<ArrowLeft className="mx-2 h-5 w-5 rtl:rotate-0 rotate-180" /></Button>
          <Button onClick={onDemo} variant="outline" size="lg" className="bg-white/10 text-white backdrop-blur-sm border-white/30">{t("hero.explore_services")}</Button>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/70">
          {[t("hero.marketing_consulting"), t("hero.professional_courses"), t("hero.brand_building")].map((txt) => (
            <span key={txt} className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-emerald-400" />{txt}</span>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { fadeInUp, staggerContainer, viewportConfig } from "@/lib/animations";
import { useLanguage } from "@/hooks/use-language";
import { useDemoCalculator } from "./useDemoCalculator";
import { DemoControls } from "./DemoControls";
import { DemoResults } from "./DemoResults";

export default function DemoSection() {
  const { t } = useLanguage();
  const { adBudget, setAdBudget, customerValue, setCustomerValue, animatedResults, gradientDir } = useDemoCalculator();
  const scrollToPricing = () => document.querySelector("#pricing")?.scrollIntoView({ behavior: "smooth" });

  return (
    <section id="demo" className="py-24 relative overflow-hidden bg-muted/20">
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/3 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div className="text-center mb-16" initial="hidden" whileInView="visible" viewport={viewportConfig} variants={staggerContainer}>
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-semibold mb-4 border border-accent/20">
            <TrendingUp className="w-4 h-4" />{t("demo.badge")}
          </motion.div>
          <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight" data-testid="text-demo-title">
            {t("demo.title_main")}<span className="text-transparent bg-clip-text bg-gradient-to-l from-accent to-blue-600">{t("demo.title_highlight")}</span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="mt-4 text-muted-foreground max-w-2xl mx-auto text-lg">{t("demo.description")}</motion.p>
        </motion.div>
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <motion.div className="lg:col-span-5 space-y-8" initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={viewportConfig} transition={{ duration: 0.6 }}>
            <DemoControls adBudget={adBudget} setAdBudget={setAdBudget} customerValue={customerValue} setCustomerValue={setCustomerValue} gradientDir={gradientDir} />
          </motion.div>
          <DemoResults animatedResults={animatedResults} onScrollToPricing={scrollToPricing} />
        </div>
      </div>
    </section>
  );
}

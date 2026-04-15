import { Card } from "@/components/ui/card";
import { Button } from "@/components/atoms/Button";
import { Users, Target, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { viewportConfig } from "@/lib/animations";
import { motion } from "framer-motion";

interface DemoResultsProps {
  animatedResults: { leads: number; sales: number; revenue: number; roi: number };
  onScrollToPricing: () => void;
}

export function DemoResults({ animatedResults, onScrollToPricing }: DemoResultsProps) {
  const { t } = useLanguage();
  return (
    <motion.div className="lg:col-span-7" initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={viewportConfig} transition={{ duration: 0.6, delay: 0.2 }}>
      <div className="grid grid-cols-2 gap-4 sm:gap-6">
        <Card className="col-span-2 p-6 sm:p-8 bg-gradient-to-br from-[#0A1628] to-[#122A4F] text-white border-none shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-accent/30 transition-colors duration-500" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-start">
              <p className="text-white/70 text-sm font-medium mb-1">{t("demo.roi_label")}</p>
              <div className="flex items-baseline justify-center gap-1" dir="ltr">
                <span className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-accent to-blue-300 tracking-tighter">
                  {animatedResults.roi > 0 ? "+" : ""}{animatedResults.roi}
                </span>
                <span className="text-3xl font-bold text-accent">%</span>
              </div>
            </div>
            <div className="text-center md:text-end md:border-s border-white/10 md:ps-6 hidden md:block">
              <p className="text-white/70 text-sm font-medium mb-1">{t("demo.revenue_label")}</p>
              <p className="text-3xl font-bold text-white font-mono" dir="ltr">{animatedResults.revenue.toLocaleString()} <span className="text-lg text-white/50">{t("pricing.egp")}</span></p>
            </div>
          </div>
        </Card>
        <Card className="col-span-2 p-6 bg-card border-border shadow-sm md:hidden text-center">
          <p className="text-muted-foreground text-sm font-medium mb-2">{t("demo.revenue_label")}</p>
          <p className="text-3xl font-bold text-foreground font-mono" dir="ltr">{animatedResults.revenue.toLocaleString()} <span className="text-lg text-muted-foreground">{t("pricing.egp")}</span></p>
        </Card>
        <Card className="col-span-1 p-6 bg-card border-border shadow-sm hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4"><Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /></div>
          <p className="text-muted-foreground text-sm font-medium mb-1">{t("demo.leads_label")}</p>
          <p className="text-2xl sm:text-3xl font-bold text-foreground font-mono" dir="ltr">{animatedResults.leads.toLocaleString()}</p>
        </Card>
        <Card className="col-span-1 p-6 bg-card border-border shadow-sm hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4"><Target className="w-5 h-5 text-blue-600 dark:text-blue-400" /></div>
          <p className="text-muted-foreground text-sm font-medium mb-1">{t("demo.sales_label")}</p>
          <p className="text-2xl sm:text-3xl font-bold text-foreground font-mono" dir="ltr">{animatedResults.sales.toLocaleString()}</p>
        </Card>
        <div className="col-span-2 flex justify-center mt-4">
          <Button size="lg" onClick={onScrollToPricing} className="bg-accent text-accent-foreground hover:bg-accent/90 px-8 py-6 rounded-full text-base font-bold shadow-lg hover:shadow-xl hover:shadow-accent/20 transition-all hover:-translate-y-1 w-full sm:w-auto">
            {t("demo.cta")}<ArrowLeft className="mr-2 h-5 w-5 rtl:scale-x-[-1]" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

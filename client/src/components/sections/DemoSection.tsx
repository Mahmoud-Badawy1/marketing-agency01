import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { TrendingUp, Users, Target, ArrowLeft } from "lucide-react";
import { fadeInUp, staggerContainer, viewportConfig } from "@/lib/animations";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";

export default function DemoSection() {
  const { t, language } = useLanguage();
  const [adBudget, setAdBudget] = useState(15000);
  const [customerValue, setCustomerValue] = useState(2000);
  const [animatedResults, setAnimatedResults] = useState({
    leads: 0,
    sales: 0,
    revenue: 0,
    roi: 0,
  });

  // Business Logic Simulation
  const assumedCPL = 150; 
  const conversionRate = 0.10;

  const targetLeads = Math.floor(adBudget / assumedCPL);
  const targetSales = Math.floor(targetLeads * conversionRate);
  const targetRevenue = targetSales * customerValue;
  const targetRoi = adBudget > 0 ? Math.floor(((targetRevenue - adBudget) / adBudget) * 100) : 0;

  useEffect(() => {
    const duration = 500; 
    const steps = 20;
    const stepTime = duration / steps;
    let currentStep = 0;
    
    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      
      setAnimatedResults({
        leads: Math.floor(animatedResults.leads + (targetLeads - animatedResults.leads) * progress),
        sales: Math.floor(animatedResults.sales + (targetSales - animatedResults.sales) * progress),
        revenue: Math.floor(animatedResults.revenue + (targetRevenue - animatedResults.revenue) * progress),
        roi: Math.floor(animatedResults.roi + (targetRoi - animatedResults.roi) * progress),
      });

      if (currentStep >= steps) {
        clearInterval(interval);
        setAnimatedResults({
          leads: targetLeads,
          sales: targetSales,
          revenue: targetRevenue,
          roi: targetRoi,
        });
      }
    }, stepTime);

    return () => clearInterval(interval);
  }, [adBudget, customerValue, targetLeads, targetSales, targetRevenue, targetRoi]);

  const scrollToPricing = () => {
    document.querySelector("#pricing")?.scrollIntoView({ behavior: "smooth" });
  };

  const isRtl = language === "ar";
  const gradientDir = isRtl ? "to left" : "to right";

  return (
    <section id="demo" className="py-24 relative overflow-hidden bg-muted/20">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/3 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-semibold mb-4 border border-accent/20">
            <TrendingUp className="w-4 h-4" />
            {t("demo.badge")}
          </motion.div>
          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight"
            data-testid="text-demo-title"
          >
            {t("demo.title_main")}
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-accent to-blue-600">
              {t("demo.title_highlight")}
            </span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="mt-4 text-muted-foreground max-w-2xl mx-auto text-lg">
            {t("demo.description")}
          </motion.p>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Controls Panel */}
          <motion.div 
            className="lg:col-span-5 space-y-8"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={viewportConfig}
            transition={{ duration: 0.6 }}
          >
            <Card className="p-6 sm:p-8 border border-border shadow-xl bg-card/60 backdrop-blur-md relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0 dark:from-white/5 dark:to-transparent pointer-events-none" />
              
              <div className="space-y-8 relative z-10">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Target className="w-4 h-4 text-accent" />
                      {t("demo.budget_label")}
                    </label>
                    <span className="text-lg font-bold text-accent font-mono" dir="ltr">
                      {adBudget.toLocaleString()} {t("pricing.egp")}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5000"
                    max="100000"
                    step="1000"
                    value={adBudget}
                    onChange={(e) => setAdBudget(Number(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-accent"
                    style={{
                      background: `linear-gradient(${gradientDir}, hsl(var(--accent)) ${(adBudget - 5000) / (100000 - 5000) * 100}%, hsl(var(--muted)) ${(adBudget - 5000) / (100000 - 5000) * 100}%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground font-mono">
                    <span>5,000 {t("pricing.egp")}</span>
                    <span>100,000 {t("pricing.egp")}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary" />
                      {t("demo.aov_label")}
                    </label>
                    <span className="text-lg font-bold text-primary font-mono" dir="ltr">
                      {customerValue.toLocaleString()} {t("pricing.egp")}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="20000"
                    step="500"
                    value={customerValue}
                    onChange={(e) => setCustomerValue(Number(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                    style={{
                      background: `linear-gradient(${gradientDir}, hsl(var(--primary)) ${(customerValue - 500) / (20000 - 500) * 100}%, hsl(var(--muted)) ${(customerValue - 500) / (20000 - 500) * 100}%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground font-mono">
                    <span>500 {t("pricing.egp")}</span>
                    <span>20,000 {t("pricing.egp")}</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-border mt-6">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t("demo.note")}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Results Dashboard */}
          <motion.div 
            className="lg:col-span-7"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={viewportConfig}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              {/* ROI Card - Featured */}
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
                    <p className="text-3xl font-bold text-white font-mono" dir="ltr">
                      {animatedResults.revenue.toLocaleString()} <span className="text-lg text-white/50">{t("pricing.egp")}</span>
                    </p>
                  </div>
                </div>
              </Card>

              {/* Mobile Revenue Card */}
              <Card className="col-span-2 p-6 bg-card border-border shadow-sm md:hidden text-center">
                <p className="text-muted-foreground text-sm font-medium mb-2">{t("demo.revenue_label")}</p>
                <p className="text-3xl font-bold text-foreground font-mono" dir="ltr">
                  {animatedResults.revenue.toLocaleString()} <span className="text-lg text-muted-foreground">{t("pricing.egp")}</span>
                </p>
              </Card>

              {/* Leads Card */}
              <Card className="col-span-1 p-6 bg-card border-border shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4">
                  <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="text-muted-foreground text-sm font-medium mb-1">{t("demo.leads_label")}</p>
                <p className="text-2xl sm:text-3xl font-bold text-foreground font-mono" dir="ltr">
                  {animatedResults.leads.toLocaleString()}
                </p>
              </Card>

              {/* Sales Card */}
              <Card className="col-span-1 p-6 bg-card border-border shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                  <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-muted-foreground text-sm font-medium mb-1">{t("demo.sales_label")}</p>
                <p className="text-2xl sm:text-3xl font-bold text-foreground font-mono" dir="ltr">
                  {animatedResults.sales.toLocaleString()}
                </p>
              </Card>
              
              <div className="col-span-2 flex justify-center mt-4">
                <Button 
                  size="lg" 
                  onClick={scrollToPricing}
                  className="bg-accent text-accent-foreground hover:bg-accent/90 px-8 py-6 rounded-full text-base font-bold shadow-lg hover:shadow-xl hover:shadow-accent/20 transition-all hover:-translate-y-1 w-full sm:w-auto"
                >
                  {t("demo.cta")}
                  <ArrowLeft className="mr-2 h-5 w-5 rtl:scale-x-[-1]" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

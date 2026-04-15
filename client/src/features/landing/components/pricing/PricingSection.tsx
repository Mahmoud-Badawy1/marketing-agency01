import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { PRICING_PLANS } from "@/lib/constants";
import { fadeInUp, staggerContainer, viewportConfig } from "@/lib/animations";
import { useLanguage } from "@/hooks/use-language";
import { PricingCard } from "@/features/landing/components/PricingCard";

export default function PricingSection() {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();
  const { data: publicSettings } = useQuery<Record<string, any>>({
    queryKey: ["/api/settings"],
  });

  const displayPlans =
    (publicSettings?.plans?.length ?? 0 > 0)
      ? publicSettings!.plans.map((p: any, idx: number) => ({
          ...p,
          id:
            p.id ||
            (idx === 0 ? "monthly" : idx === 1 ? "genius" : `plan-${idx}`),
          currency: "pricing.egp",
        }))
      : PRICING_PLANS.map((p, i) => ({
          ...p,
          id: i === 0 ? "monthly" : "genius",
          discountPercent: 0,
          discountLabel: "",
          currency: "pricing.egp",
        }));

  const gridCols =
    displayPlans.length === 1
      ? "max-w-md mx-auto"
      : displayPlans.length === 2
        ? "grid md:grid-cols-2 gap-8 max-w-3xl mx-auto"
        : "grid md:grid-cols-3 gap-6 max-w-5xl mx-auto";

  return (
    <section id="pricing" className="py-20 bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-14"
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          variants={staggerContainer}
        >
          <motion.p
            variants={fadeInUp}
            className="text-accent font-semibold text-sm mb-2"
          >
            {t("pricing.service_packages")}
          </motion.p>
          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl font-extrabold"
          >
            {t("pricing.choose_package")}
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-accent to-blue-600">
              {t("pricing.for_business")}
            </span>
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="mt-4 text-muted-foreground max-w-xl mx-auto text-lg"
          >
            {t("pricing.smart_investment")}
          </motion.p>
        </motion.div>
        <motion.div
          className={gridCols}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          variants={staggerContainer}
        >
          {displayPlans.map((plan: any, i: number) => (
            <PricingCard
              key={plan.id || i}
              plan={plan}
              t={t}
              onSelect={() => setLocation(`/checkout/${plan.id}`)}
              index={i}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

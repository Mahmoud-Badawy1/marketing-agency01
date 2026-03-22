import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { PRICING_PLANS } from "@/lib/constants";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowLeft, Crown, Percent } from "lucide-react";
import { fadeInUp, staggerContainer, viewportConfig } from "@/lib/animations";
import { useLanguage } from "@/hooks/use-language";

interface DynamicPlan {
  id: string;
  name: string;
  subtitle: string;
  price: string;
  period: string;
  features: string[];
  popular: boolean;
  discountPercent?: number;
  discountLabel?: string;
}

export default function PricingSection() {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();

  const { data: publicSettings } = useQuery<Record<string, any>>({
    queryKey: ["/api/settings"],
  });

  const dynamicPlans: DynamicPlan[] | null =
    publicSettings?.plans && Array.isArray(publicSettings.plans) && publicSettings.plans.length > 0
      ? publicSettings.plans
      : null;

  const displayPlans = dynamicPlans
    ? dynamicPlans.map((p, idx) => ({
        ...p,
        id: p.id || (idx === 0 ? "monthly" : idx === 1 ? "genius" : `plan-${idx}`),
        currency: "pricing.egp",
      }))
    : PRICING_PLANS.map((p, i) => ({ ...p, id: i === 0 ? "monthly" : "genius", discountPercent: 0, discountLabel: "" }));

  const gridCols =
    displayPlans.length === 1
      ? "max-w-md mx-auto"
      : displayPlans.length === 2
        ? "grid md:grid-cols-2 gap-8 max-w-3xl mx-auto"
        : "grid md:grid-cols-3 gap-6 max-w-5xl mx-auto";

  return (
    <section id="pricing" className="py-20 bg-card dark:bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-14"
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          variants={staggerContainer}
        >
          <motion.p variants={fadeInUp} className="text-accent font-semibold text-sm mb-2">{t("pricing.service_packages")}</motion.p>
          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl font-extrabold text-foreground"
            data-testid="text-pricing-title"
          >
            {t("pricing.choose_package")}
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-accent to-blue-600">
              {t("pricing.for_business")}
            </span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="mt-4 text-muted-foreground max-w-xl mx-auto text-lg">
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
          {displayPlans.map((plan, i) => (
            <motion.div
              key={plan.id || i}
              variants={fadeInUp}
              custom={i}
              className="hover:-translate-y-2 transition-transform duration-300"
            >
              <Card
                className={`relative p-8 border h-full ${
                  plan.popular
                    ? "border-accent shadow-lg shadow-accent/10"
                    : "border-card-border"
                } hover-elevate`}
                data-testid={`card-pricing-${i}`}
              >
                {plan.popular && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2"
                  >
                    <Badge className="bg-accent text-accent-foreground px-4">
                      <Crown className="mx-1 h-3 w-3" />
                      {t("pricing.most_popular")}
                    </Badge>
                  </div>
                )}

                <div className="text-center mb-6 pt-2">
                  <h3 className="text-xl font-bold text-foreground">{t(plan.name)}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{t(plan.subtitle)}</p>
                  {(plan.discountPercent ?? 0) > 0 && (
                    <div
                      className="mt-2"
                    >
                      <Badge className="bg-red-500 text-white px-3 py-1">
                        <Percent className="mx-1 h-3 w-3" />
                        {t("pricing.discount")} {plan.discountPercent}%
                        {t(plan.discountLabel) && ` - ${t(plan.discountLabel)}`}
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="text-center mb-8">
                  {(plan.discountPercent ?? 0) > 0 && (
                    <div className="mb-1">
                      <span className="text-lg text-muted-foreground line-through">{plan.price} {t(plan.currency)}</span>
                    </div>
                  )}
                  <div className="flex items-baseline justify-center gap-1">
                    <span
                      className={`text-5xl font-extrabold ${(plan.discountPercent ?? 0) > 0 ? "text-red-600 dark:text-red-400" : "text-foreground"}`}
                    >
                      {(plan.discountPercent ?? 0) > 0
                        ? Math.round(parseInt(plan.price) * (1 - (plan.discountPercent ?? 0) / 100))
                        : plan.price}
                    </span>
                    <span className="text-lg text-muted-foreground">{t(plan.currency)}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{t(plan.period)}</span>
                </div>

                <ul className="space-y-3 mb-8">
                  <div>
                    {plan.features.map((feature, j) => (
                      <li
                        key={j}
                        className="flex items-start gap-3"
                      >
                        <Check className={`h-5 w-5 flex-shrink-0 mt-0.5 ${plan.popular ? "text-accent" : "text-emerald-500"}`} />
                        <span className="text-sm text-foreground">{t(feature)}</span>
                      </li>
                    ))}
                  </div>
                </ul>

                <Button
                  className={`w-full ${
                    plan.popular
                      ? "bg-accent text-accent-foreground border-accent-border"
                      : ""
                  }`}
                  variant={plan.popular ? "default" : "outline"}
                  size="lg"
                  onClick={() => setLocation(`/checkout/${plan.id}`)}
                  data-testid={`button-pricing-${i}`}
                >
                  {plan.popular ? t("pricing.subscribe_now") : t("pricing.start_now")}
                  <ArrowLeft className="mx-2 h-4 w-4 rtl:rotate-0 rotate-180" />
                </Button>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

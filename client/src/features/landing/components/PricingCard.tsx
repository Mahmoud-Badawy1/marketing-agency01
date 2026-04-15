import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/atoms/Button";
import { Badge } from "@/components/atoms/Badge";
import { Check, ArrowLeft, Crown, Percent } from "lucide-react";

export function PricingCard({ plan, t, onSelect, index }: any) {
  const discountedPrice = (plan.discountPercent ?? 0) > 0 
    ? Math.round(parseInt(plan.price) * (1 - (plan.discountPercent ?? 0) / 100)) 
    : plan.price;

  return (
    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="hover:-translate-y-2 transition-transform duration-300">
      <Card className={`relative p-8 border h-full ${plan.popular ? "border-accent shadow-lg shadow-accent/10" : "border-card-border"}`}>
        {plan.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2"><Badge className="bg-accent text-accent-foreground px-4"><Crown className="mx-1 h-3 w-3" />{t("pricing.most_popular")}</Badge></div>}
        <div className="text-center mb-6 pt-2">
          <h3 className="text-xl font-bold">{t(plan.name)}</h3>
          <p className="text-sm text-muted-foreground mt-1">{t(plan.subtitle)}</p>
          {(plan.discountPercent ?? 0) > 0 && <Badge className="mt-2 bg-red-500 text-white"><Percent className="mx-1 h-3 w-3" />{t("pricing.discount")} {plan.discountPercent}%</Badge>}
        </div>
        <div className="text-center mb-8">
          {(plan.discountPercent ?? 0) > 0 && <div className="text-lg text-muted-foreground line-through">{plan.price} {t(plan.currency)}</div>}
          <div className="flex items-baseline justify-center gap-1"><span className={`text-5xl font-extrabold ${plan.discountPercent > 0 ? "text-red-600" : "text-foreground"}`}>{discountedPrice}</span><span className="text-lg text-muted-foreground">{t(plan.currency)}</span></div>
          <span className="text-sm text-muted-foreground">{t(plan.period)}</span>
        </div>
        <ul className="space-y-3 mb-8">{plan.features.map((f: string, j: number) => <li key={j} className="flex items-start gap-3"><Check className={`h-5 w-5 shrink-0 mt-0.5 ${plan.popular ? "text-accent" : "text-emerald-500"}`} /><span className="text-sm">{t(f)}</span></li>)}</ul>
        <Button className={`w-full ${plan.popular ? "bg-accent" : ""}`} variant={plan.popular ? "default" : "outline"} size="lg" onClick={onSelect}>{plan.popular ? t("pricing.subscribe_now") : t("pricing.start_now")}<ArrowLeft className="mx-2 h-4 w-4 rtl:rotate-0 rotate-180" /></Button>
      </Card>
    </motion.div>
  );
}

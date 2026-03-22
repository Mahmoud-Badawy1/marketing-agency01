import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";

interface PlanSummaryProps {
  plan: {
    name: string;
    price: number;
    period: string;
    perChild: boolean;
    discountPercent: number;
    discountLabel: string;
  };
  planKey: string;
  projectsCount: number;
  totalAmount: number;
  totalAfterDiscount: number;
  discountedPrice: number;
  hasDiscount: boolean;
  couponApplied: {
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
  } | null;
}

export default function PlanSummary({
  plan,
  planKey,
  projectsCount,
  totalAmount,
  totalAfterDiscount,
  discountedPrice,
  hasDiscount,
  couponApplied
}: PlanSummaryProps) {
  const { t, language } = useLanguage();

  return (
    <Card className="p-5 border border-accent/30 bg-accent/5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {planKey === "genius" && <Star className="h-5 w-5 text-accent fill-accent" />}
            <h3 className="font-bold text-lg text-foreground" data-testid="text-plan-name">{t(plan.name)}</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            {t(plan.period)} {plan.perChild && projectsCount > 1 && t({ ar: `× ${projectsCount} خدمات`, en: `× ${projectsCount} Services` })}
          </p>
          {hasDiscount && (
            <p className="text-xs font-semibold text-red-600 dark:text-red-400 mt-1">
              🎉 {t({ ar: `خصم ${plan.discountPercent}%`, en: `${plan.discountPercent}% Discount` })}{plan.discountLabel && ` - ${plan.discountLabel}`}
            </p>
          )}
          {couponApplied && (
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
              🎫 {t({ 
                ar: `كوبون ${couponApplied.code}: خصم ${couponApplied.discountType === 'percentage' ? `${couponApplied.discountValue}%` : `${couponApplied.discountValue} ج.م`}`, 
                en: `Coupon ${couponApplied.code}: ${couponApplied.discountType === 'percentage' ? `${couponApplied.discountValue}%` : `${couponApplied.discountValue} EGP`} off` 
              })}
            </p>
          )}
        </div>
        <div className={`text-${language === "en" ? "right" : "left"}`}>
          {(hasDiscount || couponApplied) && (
            <div className="mb-0.5">
              <span className="text-sm text-muted-foreground line-through">{totalAmount} {t({ ar: "ج.م", en: "EGP" })}</span>
            </div>
          )}
          <span className={`text-3xl font-extrabold ${(hasDiscount || couponApplied) ? "text-red-600 dark:text-red-400" : "text-foreground"}`} data-testid="text-plan-price">{totalAfterDiscount}</span>
          <span className={`text-muted-foreground ${language === "en" ? "ml-1" : "mr-1"}`}>{t({ ar: "ج.م", en: "EGP" })}</span>
          {projectsCount > 1 && plan.perChild && (
            <p className="text-xs text-muted-foreground">{discountedPrice} × {projectsCount} {t({ ar: "خدمات", en: "Services" })}</p>
          )}
        </div>
      </div>
    </Card>
  );
}

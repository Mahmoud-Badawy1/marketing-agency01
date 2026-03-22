import { Tag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/hooks/use-language";

interface CouponSectionProps {
  couponCode: string;
  couponApplied: {
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    description?: string;
  } | null;
  couponError: string;
  couponLoading: boolean;
  totalAfterPlanDiscount: number;
  totalAfterDiscountCalculated: number;
  couponDiscountAmount: number;
  onCodeChange: (code: string) => void;
  onApply: () => void;
  onRemove: () => void;
}

export default function CouponSection({
  couponCode,
  couponApplied,
  couponError,
  couponLoading,
  totalAfterPlanDiscount,
  totalAfterDiscountCalculated,
  couponDiscountAmount,
  onCodeChange,
  onApply,
  onRemove
}: CouponSectionProps) {
  const { t, language } = useLanguage();

  return (
    <div className="border-t border-border pt-5">
      <div className="flex items-center gap-2 mb-3">
        <Tag className="h-5 w-5 text-primary" />
        <h3 className="font-bold text-foreground">{t({ ar: "كود الخصم", en: "Promo Code" })}</h3>
      </div>
      {couponApplied ? (
        <div className="p-3 rounded-md bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div>
              <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                ✅ {t({ ar: `كوبون ${couponApplied.code} مطبق`, en: `Coupon ${couponApplied.code} Applied` })}
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-0.5">
                {t({ ar: `خصم ${couponApplied.discountType === 'percentage' ? `${couponApplied.discountValue}%` : `${couponApplied.discountValue} ج.م`}`, en: `Discount ${couponApplied.discountType === 'percentage' ? `${couponApplied.discountValue}%` : `${couponApplied.discountValue} EGP`}` })}
                {couponApplied.description && ` - ${couponApplied.description}`}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="text-destructive hover:text-destructive"
              data-testid="button-remove-coupon"
            >
              <X className={`h-4 w-4 ${language === "ar" ? "ml-1" : "mr-1"}`} />
              {t({ ar: "إزالة", en: "Remove" })}
            </Button>
          </div>
          {couponDiscountAmount > 0 && (
            <div className="mt-2 pt-2 border-t border-emerald-200 dark:border-emerald-800 text-sm">
              <span className="text-muted-foreground line-through">{totalAfterPlanDiscount} {t({ ar: "ج.م", en: "EGP" })}</span>
              <span className="mx-2">→</span>
              <strong className="text-emerald-700 dark:text-emerald-400">{totalAfterDiscountCalculated} {t({ ar: "ج.م", en: "EGP" })}</strong>
              <span className={`text-emerald-600 dark:text-emerald-500 ${language === "ar" ? "mr-2" : "ml-2"}`}>({t({ ar: `وفّرت ${couponDiscountAmount} ج.م`, en: `Saved ${couponDiscountAmount} EGP` })})</span>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={couponCode}
              onChange={(e) => onCodeChange(e.target.value)}
              placeholder={t({ ar: "أدخل كود الخصم", en: "Enter Promo Code" })}
              dir="ltr"
              className="flex-1"
              data-testid="input-coupon-code"
            />
            <Button
              type="button"
              variant="outline"
              onClick={onApply}
              disabled={!couponCode.trim() || couponLoading}
              data-testid="button-apply-coupon"
            >
              {couponLoading ? t({ ar: "جاري التحقق...", en: "Validating..." }) : t({ ar: "تطبيق", en: "Apply" })}
            </Button>
          </div>
          {couponError && (
            <p className="text-xs text-destructive" data-testid="text-coupon-error">{couponError}</p>
          )}
        </div>
      )}
    </div>
  );
}

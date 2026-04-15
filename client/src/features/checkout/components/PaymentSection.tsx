import { Smartphone, Shield, Copy, CheckCircle2, Upload } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { useLanguage } from "@/hooks/use-language";

interface PaymentSectionProps {
  totalAfterDiscount: number;
  hasDiscount: boolean;
  discountPercent: number;
  discountLabel: string;
  totalAmount: number;
  discountedPrice: number;
  projectsCount: number;
  perChild: boolean;
  instapayAccount: string;
  copied: boolean;
  onCopy: () => void;
  onNext: () => void;
}

export default function PaymentSection({
  totalAfterDiscount,
  hasDiscount,
  discountPercent,
  discountLabel,
  totalAmount,
  discountedPrice,
  projectsCount,
  perChild,
  instapayAccount,
  copied,
  onCopy,
  onNext
}: PaymentSectionProps) {
  const { t, language } = useLanguage();

  return (
    <div className="space-y-4">
      <div className="bg-muted/50 rounded-md p-5 border border-border">
        <p className="text-sm text-muted-foreground mb-2">{t({ ar: "المبلغ المطلوب", en: "Amount Due" })}</p>
        <p className="text-3xl font-extrabold text-foreground" data-testid="text-payment-amount">
          {totalAfterDiscount} <span className="text-lg font-normal text-muted-foreground">{t({ ar: "ج.م", en: "EGP" })}</span>
        </p>
        {hasDiscount && (
          <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-semibold">
            {t({ ar: `خصم ${discountPercent}%`, en: `${discountPercent}% Discount` })}{discountLabel && ` - ${discountLabel}`}
            {" "}<span className="text-muted-foreground line-through font-normal">{totalAmount} {t({ ar: "ج.م", en: "EGP" })}</span>
          </p>
        )}
        {projectsCount > 1 && perChild && (
          <p className="text-xs text-muted-foreground mt-1">{discountedPrice} × {projectsCount} {t({ ar: "مشاريع", en: "Projects" })}</p>
        )}
      </div>

      <div className="bg-muted/50 rounded-md p-5 border border-border">
        <p className="text-sm text-muted-foreground mb-2">{t({ ar: "حوّل إلى هذا الحساب عبر انستا باي", en: "Transfer to this account via InstaPay" })}</p>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xl font-bold text-foreground tracking-wider" dir="ltr" data-testid="text-instapay-account">{instapayAccount}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={onCopy}
            data-testid="button-copy-account"
          >
            {copied ? <CheckCircle2 className={`h-4 w-4 text-emerald-500 ${language === "en" ? "mr-1" : "ml-1"}`} /> : <Copy className={`h-4 w-4 ${language === "en" ? "mr-1" : "ml-1"}`} />}
            {copied ? t({ ar: "تم النسخ", en: "Copied" }) : t({ ar: "نسخ", en: "Copy" })}
          </Button>
        </div>
      </div>

      <div className="bg-accent/5 border border-accent/20 rounded-md p-4">
        <h4 className="font-bold text-sm text-foreground mb-2 flex items-center gap-2">
          <Shield className="h-4 w-4 text-accent" />
          {t({ ar: "خطوات الدفع", en: "Payment Steps" })}
        </h4>
        <ol className="space-y-2 text-sm text-muted-foreground">
          {[
            t({ ar: "افتح تطبيق البنك أو المحفظة الإلكترونية", en: "Open your bank or e-wallet app" }),
            t({ ar: "\"اختر تحويل عبر انستا باي أو المحفظة\"", en: "Select 'Transfer via InstaPay or Wallet'" }),
            t({ ar: `أدخل الرقم: ${instapayAccount}`, en: `Enter number: ${instapayAccount}` }),
            t({ ar: `أدخل المبلغ: ${totalAfterDiscount} ج.م`, en: `Enter amount: ${totalAfterDiscount} EGP` }),
            t({ ar: "أكمل التحويل واحفظ صورة التأكيد", en: "Complete transfer and save receipt image" }),
          ].map((text, i) => (
            <li key={i} className="flex gap-2 items-center">
              <span className="bg-accent text-accent-foreground w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0">{i + 1}</span>
              {text}
            </li>
          ))}
        </ol>
      </div>

      <Button
        size="lg"
        className="w-full bg-accent text-accent-foreground border-accent-border"
        onClick={onNext}
        data-testid="button-go-upload"
      >
        {t({ ar: "تم التحويل - رفع الإيصال", en: "Transfer Done - Upload Receipt" })}
        <Upload className={`h-4 w-4 ${language === "ar" ? "mr-2" : "ml-2"}`} />
      </Button>
    </div>
  );
}

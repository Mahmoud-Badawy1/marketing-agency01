import { Card } from "@/components/ui/card";
import PaymentSection from "@/features/checkout/components/PaymentSection";

export function CheckoutPaymentStep({ c, plan, finalTotal, totalAmount, discountedPrice }: any) {
  const INSTAPAY_ACCOUNT = c.publicSettings?.contact?.instapay || "201553145631";

  const copyAccount = () => {
    navigator.clipboard.writeText(INSTAPAY_ACCOUNT);
    c.setCopied(true);
    c.toast({ title: c.t({ ar: "تم النسخ", en: "Copied" }) });
    setTimeout(() => c.setCopied(false), 2000);
  };

  return (
    <Card className="p-6 border border-card-border">
      <PaymentSection
        totalAfterDiscount={finalTotal}
        hasDiscount={plan.discountPercent > 0}
        discountPercent={plan.discountPercent}
        discountLabel={plan.discountLabel}
        totalAmount={totalAmount}
        discountedPrice={discountedPrice}
        projectsCount={c.projects.length}
        perChild={plan.perChild}
        instapayAccount={INSTAPAY_ACCOUNT}
        copied={c.copied}
        onCopy={copyAccount}
        onNext={() => c.setStep("upload")}
      />
    </Card>
  );
}

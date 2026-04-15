import { CreditCard } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/atoms/Button";
import { Label } from "@/components/atoms/Label";
import { Input } from "@/components/atoms/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ProjectDetails from "@/features/checkout/components/ProjectDetails";
import CouponSection from "@/features/checkout/components/CouponSection";
import { SERVICES } from "@/config/constants";

export function CheckoutFormStep({ c, plan, totalAfterPlanDiscount, finalTotal, couponDiscount }: any) {
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!c.clientName || !c.phone) return;
    c.createOrderMutation.mutate(finalTotal);
  };

  return (
    <Card className="p-6 border border-card-border">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><CreditCard className="h-5 w-5 text-primary" /></div>
        <div>
          <h2 className="text-xl font-bold text-foreground">{c.t({ ar: "بيانات الاشتراك", en: "Subscription Details" })}</h2>
          <p className="text-sm text-muted-foreground">{c.t({ ar: "أدخل بياناتك لإتمام الاشتراك", en: "Enter your details" })}</p>
        </div>
      </div>
      <form onSubmit={handleFormSubmit} className="space-y-5">
        <div className="space-y-4">
          <div><Label>{c.t({ ar: "الاسم بالكامل", en: "Full Name" })}</Label><Input value={c.clientName} onChange={(e) => c.setClientName(e.target.value)} required /></div>
          <div><Label>{c.t({ ar: "رقم الهاتف", en: "Phone" })}</Label><Input type="tel" value={c.phone} onChange={(e) => c.setPhone(e.target.value)} required dir="ltr" /></div>
          <div><Label>{c.t({ ar: "البريد الإلكتروني", en: "Email" })}</Label><Input type="email" value={c.email} onChange={(e) => c.setEmail(e.target.value)} required dir="ltr" /></div>
          <div><Label>{c.t({ ar: "المسمى الوظيفي", en: "Title" })}</Label><Input value={c.companyName} onChange={(e) => c.setCompanyName(e.target.value)} /></div>
          <div><Label>{c.t({ ar: "نوع الخدمة", en: "Service" })}</Label>
            <Select value={c.serviceInterest} onValueChange={c.setServiceInterest}>
              <SelectTrigger dir={c.language === "ar" ? "rtl" : "ltr"}><SelectValue placeholder={c.t({ ar: "اختر الخدمة", en: "Select Service" })} /></SelectTrigger>
              <SelectContent dir={c.language === "ar" ? "rtl" : "ltr"}>{(c.publicSettings?.services?.length > 0 ? c.publicSettings.services : SERVICES).map((s: any, idx: number) => (
                <SelectItem key={idx} value={s.title.en || s.title.ar}>{c.language === "ar" ? s.title.ar : s.title.en}</SelectItem>
              ))}</SelectContent>
            </Select>
          </div>
        </div>
        <ProjectDetails projects={c.projects} perChild={plan.perChild} price={plan.price} discountedPrice={plan.discountedPrice} hasDiscount={plan.discountPercent > 0} totalAfterPlanDiscount={totalAfterPlanDiscount} onAdd={() => c.setProjects([...c.projects, { name: "", budget: "" }])} onRemove={(i: number) => c.setProjects(c.projects.filter((_: any, idx: number) => idx !== i))} onUpdate={(i: number, f: string, v: string) => { const u = [...c.projects]; u[i] = { ...u[i], [f]: v }; c.setProjects(u); }} />
        <CouponSection couponCode={c.couponCode} couponApplied={c.couponApplied} couponError={c.couponError} couponLoading={c.couponLoading} totalAfterPlanDiscount={totalAfterPlanDiscount} totalAfterDiscountCalculated={finalTotal} couponDiscountAmount={couponDiscount} onCodeChange={(code: string) => { c.setCouponCode(code.toUpperCase()); c.setCouponError(""); }} onApply={() => c.handleApplyCoupon(c.planKey)} onRemove={() => { c.setCouponApplied(null); c.setCouponCode(""); }} />
        <Button type="submit" size="lg" className="w-full mt-2" disabled={c.createOrderMutation.isPending}>{c.createOrderMutation.isPending ? c.t({ ar: "جاري الإرسال...", en: "Submitting..." }) : c.t({ ar: "التالي - تفاصيل الدفع", en: "Next - Payment Details" })}</Button>
      </form>
    </Card>
  );
}

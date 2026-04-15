import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import {
  ArrowRight,
  ArrowLeft,
  Shield,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/atoms/Button";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import PlanSummary from "@/features/checkout/components/PlanSummary";
import StepIndicator from "@/features/checkout/components/StepIndicator";
import { useCheckoutState } from "../hooks/useCheckoutState";
import { CheckoutFormStep } from "./sections/CheckoutFormStep";
import { CheckoutPaymentStep } from "./sections/CheckoutPaymentStep";
import { CheckoutUploadStep } from "./sections/CheckoutUploadStep";
import { CheckoutSuccessStep } from "./sections/CheckoutSuccessStep";

const getDefaultPlans = (t: any) => ({
  monthly: {
    name: t({ ar: "إدارة الحملات الإعلانية", en: "Ad Campaigns Management" }),
    price: 15000,
    period: t({ ar: "شهرياً", en: "Monthly" }),
    perChild: false,
    discountPercent: 0,
    discountLabel: "",
  },
  genius: {
    name: t({ ar: "باقة التسويق المتكامل", en: "Full Marketing Package" }),
    price: 35000,
    period: t({ ar: "شهرياً", en: "Monthly" }),
    perChild: false,
    discountPercent: 0,
    discountLabel: "",
  },
});

export default function CheckoutPage() {
  const c = useCheckoutState();
  const DEFAULT_PLANS = getDefaultPlans(c.t);

  const PLANS = (() => {
    if (c.publicSettings?.plans && c.publicSettings.plans.length > 0) {
      const dynamic: any = {};
      c.publicSettings.plans.forEach((p: any, i: number) => {
        const id = p.id || (i === 0 ? "monthly" : i === 1 ? "genius" : `plan-${i}`);
        dynamic[id] = {
          name: p.name,
          price: parseInt(p.price) || 0,
          period: p.period,
          perChild: !!p.perChild,
          discountPercent: p.discountPercent || 0,
          discountLabel: p.discountLabel || "",
        };
      });
      return { ...DEFAULT_PLANS, ...dynamic };
    }
    return DEFAULT_PLANS;
  })();

  const plan = PLANS[c.planKey] || PLANS.monthly || Object.values(PLANS)[0];
  const totalAmount = plan.perChild
    ? plan.price * c.projects.length
    : plan.price;
  const discountedPrice =
    plan.discountPercent > 0
      ? Math.round(plan.price * (1 - plan.discountPercent / 100))
      : plan.price;
  const totalAfterPlanDiscount = plan.perChild
    ? discountedPrice * c.projects.length
    : discountedPrice;
  let couponDiscount = 0;
  if (c.couponApplied) {
    couponDiscount =
      c.couponApplied.discountType === "percentage"
        ? Math.round(
            totalAfterPlanDiscount * (c.couponApplied.discountValue / 100),
          )
        : c.couponApplied.discountValue *
          (plan.perChild ? c.projects.length : 1);
    couponDiscount = Math.min(couponDiscount, totalAfterPlanDiscount);
  }
  const finalTotal = totalAfterPlanDiscount - couponDiscount;

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Helmet>
        <title>
          {c.t({
            ar: "اشتراك الآن | ماركتير برو",
            en: "Subscribe Now | Marketer Pro",
          })}
        </title>
      </Helmet>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Link href="/">
            <Button variant="ghost">
              {c.language === "en" ? (
                <ArrowLeft className="mr-2 h-4 w-4" />
              ) : (
                <ArrowRight className="ml-2 h-4 w-4" />
              )}
              {c.t({ ar: "العودة للرئيسية", en: "Back to Home" })}
            </Button>
          </Link>
        </motion.div>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          dir={c.language === "ar" ? "rtl" : "ltr"}
        >
          <motion.div variants={fadeInUp} className="mb-6">
            <PlanSummary
              plan={plan}
              planKey={c.planKey}
              projectsCount={c.projects.length}
              totalAmount={totalAmount}
              totalAfterDiscount={finalTotal}
              discountedPrice={discountedPrice}
              hasDiscount={plan.discountPercent > 0}
              couponApplied={c.couponApplied}
            />
          </motion.div>
          <motion.div variants={fadeInUp}>
            <StepIndicator
              steps={["form", "payment", "upload", "success"]}
              currentStep={c.step}
            />
          </motion.div>
          <AnimatePresence mode="wait">
            {c.step === "form" && (
              <CheckoutFormStep
                c={c}
                plan={plan}
                totalAfterPlanDiscount={totalAfterPlanDiscount}
                finalTotal={finalTotal}
                couponDiscount={couponDiscount}
              />
            )}
            {c.step === "payment" && (
              <CheckoutPaymentStep
                c={c}
                plan={plan}
                finalTotal={finalTotal}
                totalAmount={totalAmount}
                discountedPrice={discountedPrice}
              />
            )}
            {c.step === "upload" && <CheckoutUploadStep c={c} />}
            {c.step === "success" && <CheckoutSuccessStep c={c} plan={plan} />}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

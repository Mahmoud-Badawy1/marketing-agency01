import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useRoute, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight, ArrowLeft, CreditCard, Shield, Clock, CheckCircle2 } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { usePublicSettings } from "@/hooks/use-public-settings";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";

// Sub-components
import PlanSummary from "@/components/checkout/PlanSummary";
import StepIndicator from "@/components/checkout/StepIndicator";
import ProjectDetails from "@/components/checkout/ProjectDetails";
import CouponSection from "@/components/checkout/CouponSection";
import PaymentSection from "@/components/checkout/PaymentSection";
import UploadSection from "@/components/checkout/UploadSection";
import SuccessSection from "@/components/checkout/SuccessSection";

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

const DEFAULT_INSTAPAY_ACCOUNT = "201553145631";

type Step = "form" | "payment" | "upload" | "success";

interface ProjectEntry { name: string; budget: string; }

export default function Checkout() {
  const { t, language } = useLanguage();
  const [, params] = useRoute("/checkout/:plan");
  const [, setLocation] = useLocation();
  const { data: publicSettings } = usePublicSettings();
  const planKey = params?.plan || "monthly";

  const DEFAULT_PLANS = getDefaultPlans(t);

  const PLANS = (() => {
    if (publicSettings?.plans && publicSettings.plans.length > 0) {
      const dynamicPlans: Record<string, { 
        name: string | { ar?: string; en?: string }; 
        price: number; 
        period: string | { ar?: string; en?: string }; 
        perChild: boolean; 
        discountPercent: number; 
        discountLabel: string | { ar?: string; en?: string } 
      }> = {};
      for (const p of publicSettings.plans) {
        const id = p.id || `plan-${Math.random().toString(36).substring(2, 9)}`;
        dynamicPlans[id] = {
          name: p.name,
          price: parseInt(p.price) || 0,
          period: p.period,
          perChild: !!p.perChild,
          discountPercent: p.discountPercent || 0,
          discountLabel: p.discountLabel || "",
        };
      }
      return { ...DEFAULT_PLANS, ...dynamicPlans };
    }
    return DEFAULT_PLANS;
  })();

  // @ts-ignore
  const plan = PLANS[planKey] || PLANS.monthly || Object.values(PLANS)[0];
  const INSTAPAY_ACCOUNT = publicSettings?.contact?.instapay || DEFAULT_INSTAPAY_ACCOUNT;
  const whatsappNumber = publicSettings?.contact?.whatsapp || "201553145631";

  const [step, setStep] = useState<Step>("form");
  const [orderId, setOrderId] = useState("");
  const [copied, setCopied] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const [clientName, setClientName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [serviceInterest, setServiceInterest] = useState("");
  const [projects, setProjects] = useState<ProjectEntry[]>([{ name: "", budget: "" }]);

  const [couponCode, setCouponCode] = useState("");

  // Auto-populate from user profile
  useEffect(() => {
    if (user) {
      if (!clientName) setClientName(user.name || "");
      if (!phone) setPhone(user.phone || "");
      if (!email) setEmail(user.email || "");
    }
  }, [user]);
  const [couponApplied, setCouponApplied] = useState<{
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    description?: string;
  } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const totalAmount = plan.perChild ? plan.price * projects.length : plan.price;
  const hasDiscount = plan.discountPercent > 0;
  const discountedPrice = hasDiscount ? Math.round(plan.price * (1 - plan.discountPercent / 100)) : plan.price;
  const totalAfterPlanDiscount = plan.perChild ? discountedPrice * projects.length : discountedPrice;

  let couponDiscountAmount = 0;
  if (couponApplied) {
    if (couponApplied.discountType === 'percentage') {
      couponDiscountAmount = Math.round(totalAfterPlanDiscount * (couponApplied.discountValue / 100));
    } else {
      couponDiscountAmount = couponApplied.discountValue * (plan.perChild ? projects.length : 1);
    }
    couponDiscountAmount = Math.min(couponDiscountAmount, totalAfterPlanDiscount);
  }
  const totalAfterDiscount = totalAfterPlanDiscount - couponDiscountAmount;

  const addProject = () => {
    setProjects([...projects, { name: "", budget: "" }]);
  };

  const removeProject = (index: number) => {
    if (projects.length <= 1) return;
    setProjects(projects.filter((_, i) => i !== index));
  };

  const updateProject = (index: number, field: keyof ProjectEntry, value: string) => {
    const updated = [...projects];
    updated[index] = { ...updated[index], [field]: value };
    setProjects(updated);
  };

  const createOrderMutation = useMutation({
    mutationFn: async () => {
      const servicesData = projects.map(p => ({ name: p.name, description: `Budget: ${p.budget}` }));
      const res = await apiRequest("POST", "/api/orders", {
        clientName,
        phone,
        email,
        projectName: projects[0].name,
        monthlyBudget: parseInt(projects[0].budget) || 0,
        companyName: companyName || undefined,
        serviceInterest: serviceInterest || undefined,
        plan: planKey,
        amount: totalAfterDiscount,
        services: servicesData,
        couponCode: couponApplied?.code || undefined,
      });
      return res.json();
    },
    onSuccess: (data) => {
      setOrderId(data._id || data.id);
      setStep("payment");
    },
    onError: () => {
      toast({ title: t({ ar: "خطأ", en: "Error" }), description: t({ ar: "حدث خطأ، يرجى المحاولة مرة أخرى", en: "An error occurred, please try again" }), variant: "destructive" });
    },
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !phone) {
      toast({ title: t({ ar: "تنبيه", en: "Notice" }), description: t({ ar: "يرجى ملء بيانات العميل/الشركة", en: "Please fill in the client/company details" }), variant: "destructive" });
      return;
    }
    for (let i = 0; i < projects.length; i++) {
      if (!projects[i].name) {
        toast({ title: t({ ar: "تنبيه", en: "Notice" }), description: t({ ar: `يرجى ملء اسم المشروع/الشركة ${i + 1}`, en: `Please fill in project/company name ${i + 1}` }), variant: "destructive" });
        return;
      }
      const budget = parseInt(projects[i].budget);
      if (isNaN(budget) || budget < 1) {
        toast({ title: t({ ar: "تنبيه", en: "Notice" }), description: t({ ar: `حجم الميزانية غير صحيح (للمشروع ${i + 1})`, en: `Invalid budget size (for project ${i + 1})` }), variant: "destructive" });
        return;
      }
    }
    createOrderMutation.mutate();
  };

  const copyAccount = () => {
    navigator.clipboard.writeText(INSTAPAY_ACCOUNT);
    setCopied(true);
    toast({ title: t({ ar: "تم النسخ", en: "Copied" }), description: t({ ar: "تم نسخ رقم الحساب بنجاح", en: "Account number copied successfully" }) });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: t({ ar: "خطأ", en: "Error" }), description: t({ ar: "حجم الصورة يجب أن يكون أقل من 10 ميجابايت", en: "Image size must be less than 10MB" }), variant: "destructive" });
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleUploadSubmit = async () => {
    if (!imageFile || !orderId) return;
    setUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("transferImage", imageFile);
      const res = await fetch(`/api/orders/${orderId}/upload`, {
        method: "POST",
        body: formDataUpload,
      });
      if (!res.ok) throw new Error();
      setStep("success");
    } catch {
      toast({ title: t({ ar: "خطأ", en: "Error" }), description: t({ ar: "حدث خطأ في رفع الصورة، يرجى المحاولة مرة أخرى", en: "An error occurred while uploading. Please try again." }), variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const projectNames = projects.map(p => p.name).join(t({ ar: " و ", en: " and " }));
  const whatsappMessage = encodeURIComponent(
    t({
      ar: `مرحباً، أنا ${clientName}\nتم طلب ${t(plan.name)}${projects.length > 1 ? ` لـ ${projects.length} شركات/مشاريع` : ` للشركة: ${projectNames}`}\nالمبلغ: ${totalAfterDiscount} ج.م${hasDiscount ? ` (بعد خصم ${plan.discountPercent}%)` : ""}${couponApplied ? ` (كوبون: ${couponApplied.code})` : ""}\nرقم الطلب: ${orderId}\nأرجو تأكيد الطلب والتواصل للبدء.`,
      en: `Hello, I'm ${clientName}\nI requested ${t(plan.name)}${projects.length > 1 ? ` for ${projects.length} companies/projects` : ` for: ${projectNames}`}\nAmount: ${totalAfterDiscount} EGP${hasDiscount ? ` (After ${plan.discountPercent}% discount)` : ""}${couponApplied ? ` (Coupon: ${couponApplied.code})` : ""}\nOrder ID: ${orderId}\nPlease confirm the order.`
    })
  );

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponError("");
    setCouponLoading(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode.trim(),
          planId: planKey,
          phone: phone || undefined,
          childrenCount: projects.length,
        }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setCouponApplied({
          code: data.code,
          discountType: data.discountType,
          discountValue: data.discountValue,
          description: data.description,
        });
        setCouponError("");
        toast({ title: t({ ar: "تم تطبيق الكوبون", en: "Coupon Applied" }), description: data.description || t({ ar: `خصم ${data.discountType === 'percentage' ? `${data.discountValue}%` : `${data.discountValue} ج.م`}`, en: `Discount ${data.discountType === 'percentage' ? `${data.discountValue}%` : `${data.discountValue} EGP`}` }) });
      } else {
        setCouponError(data.message || t({ ar: "كود الخصم غير صالح", en: "Invalid discount code" }));
        setCouponApplied(null);
      }
    } catch {
      setCouponError(t({ ar: "خطأ في التحقق من كود الخصم", en: "Error validating coupon code" }));
      setCouponApplied(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponApplied(null);
    setCouponCode("");
    setCouponError("");
  };

  const whatsappUrl = `https://wa.me/${whatsappNumber.replace("+", "")}?text=${whatsappMessage}`;
  const STEPS: Step[] = ["form", "payment", "upload", "success"];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Helmet>
        <title>{t({ ar: "اشتراك الآن | ماركتير برو - Marketer Pro", en: "Subscribe Now | Marketer Pro" })}</title>
        <meta name="description" content={t({ ar: `اطلب ${t(plan.name)} - ${plan.price}${" ج.م"} / ${t(plan.period)}. ابدأ رحلة نمو أعمالك مع ماركتير برو`, en: `Request ${t(plan.name)} - ${plan.price} EGP / ${t(plan.period)}. Start your business growth journey with Marketer Pro` })} />
        <meta property="og:title" content={t({ ar: "اشترك الآن | ماركتير برو", en: "Subscribe Now | Marketer Pro" })} />
        <meta property="og:description" content={t({ ar: "سجل بياناتك للحصول على خدمات استشارية وتسويقية متقدمة - استشارة مبدئية مجانية", en: "Register your details to get advanced consulting and marketing services - Free initial consultation" })} />
        <link rel="canonical" href={`https://marketerpro.example.com/checkout/${planKey}`} />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <Link href="/">
            <Button variant="ghost" data-testid="button-back-home">
              {language === "en" ? <ArrowLeft className="mr-2 h-4 w-4" /> : <ArrowRight className="ml-2 h-4 w-4" />}
              {t({ ar: "العودة للرئيسية", en: "Back to Home" })}
            </Button>
          </Link>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={staggerContainer} dir={language === "ar" ? "rtl" : "ltr"}>
          <motion.div variants={fadeInUp} className="mb-6">
            <PlanSummary
              plan={plan}
              planKey={planKey}
              projectsCount={projects.length}
              totalAmount={totalAmount}
              totalAfterDiscount={totalAfterDiscount}
              discountedPrice={discountedPrice}
              hasDiscount={hasDiscount}
              couponApplied={couponApplied}
            />
          </motion.div>

          <motion.div variants={fadeInUp}>
            <StepIndicator steps={STEPS} currentStep={step} />
          </motion.div>

          <AnimatePresence mode="wait">
            {step === "form" && (
              <motion.div key="form" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <Card className="p-6 border border-card-border">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground">{t({ ar: "بيانات الاشتراك", en: "Subscription Details" })}</h2>
                      <p className="text-sm text-muted-foreground">{t({ ar: "أدخل بياناتك لإتمام الاشتراك", en: "Enter your details to complete subscription" })}</p>
                    </div>
                  </div>
                  <form onSubmit={handleFormSubmit} className="space-y-5">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="clientName">{t({ ar: "الاسم بالكامل", en: "Full Name" })}</Label>
                        <Input
                          id="clientName"
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          placeholder={t({ ar: "الاسم الثلاثي", en: "Full name" })}
                          data-testid="input-parent-name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">{t({ ar: "رقم الهاتف (واتساب)", en: "Phone Number (WhatsApp)" })}</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="01xxxxxxxxx"
                          dir="ltr"
                          data-testid="input-phone"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">{t({ ar: "البريد الإلكتروني", en: "Email Address" })}</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your@email.com"
                          dir="ltr"
                          data-testid="input-email"
                        />
                      </div>
                      <div>
                        <Label htmlFor="companyName">{t({ ar: "المنصب / المسمى الوظيفي", en: "Title / Position" })}</Label>
                        <Input
                          id="companyName"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder={t({ ar: "مثال: مؤسس، مدير تسويق", en: "e.g. Founder, Marketing Manager" })}
                          data-testid="input-company-name"
                        />
                      </div>
                      <div>
                        <Label>{t({ ar: "نوع الخدمة المفضلة", en: "Preferred Service Type" })}</Label>
                        <Select value={serviceInterest} onValueChange={setServiceInterest}>
                          <SelectTrigger data-testid="select-service-type" dir={language === "ar" ? "rtl" : "ltr"}>
                            <SelectValue placeholder={t({ ar: "اختر نوع الخدمة", en: "Select Service Type" })} />
                          </SelectTrigger>
                          <SelectContent dir={language === "ar" ? "rtl" : "ltr"}>
                            {publicSettings?.services && publicSettings.services.length > 0 ? (
                              publicSettings.services.map((s: any, idx: number) => (
                                <SelectItem key={idx} value={s.title.en || s.title.ar}>
                                  {language === "ar" ? s.title.ar : s.title.en}
                                </SelectItem>
                              ))
                            ) : (
                              <>
                                <SelectItem value="consultation">{t({ ar: "تدريب واستشارات", en: "Training and Consulting" })}</SelectItem>
                                <SelectItem value="ads">{t({ ar: "إدارة إعلانات المتجر", en: "Store Ads Management" })}</SelectItem>
                                <SelectItem value="strategy">{t({ ar: "خدمات تسويقية متكاملة", en: "Full Marketing Services" })}</SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <ProjectDetails
                      projects={projects}
                      perChild={plan.perChild}
                      price={plan.price}
                      discountedPrice={discountedPrice}
                      hasDiscount={hasDiscount}
                      totalAfterPlanDiscount={totalAfterPlanDiscount}
                      onAdd={addProject}
                      onRemove={removeProject}
                      onUpdate={updateProject}
                    />

                    <CouponSection
                      couponCode={couponCode}
                      couponApplied={couponApplied}
                      couponError={couponError}
                      couponLoading={couponLoading}
                      totalAfterPlanDiscount={totalAfterPlanDiscount}
                      totalAfterDiscountCalculated={totalAfterDiscount}
                      couponDiscountAmount={couponDiscountAmount}
                      onCodeChange={(code) => { setCouponCode(code.toUpperCase()); setCouponError(""); }}
                      onApply={handleApplyCoupon}
                      onRemove={handleRemoveCoupon}
                    />

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-accent text-accent-foreground border-accent-border mt-2"
                      disabled={createOrderMutation.isPending}
                      data-testid="button-submit-form"
                    >
                      {createOrderMutation.isPending ? t({ ar: "جاري الإرسال...", en: "Submitting..." }) : t({ ar: "التالي - تفاصيل الدفع", en: "Next - Payment Details" })}
                    </Button>
                  </form>
                </Card>
              </motion.div>
            )}

            {step === "payment" && (
              <motion.div key="payment" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <Card className="p-6 border border-card-border">
                  <PaymentSection
                    totalAfterDiscount={totalAfterDiscount}
                    hasDiscount={hasDiscount}
                    discountPercent={plan.discountPercent}
                    discountLabel={plan.discountLabel}
                    totalAmount={totalAmount}
                    discountedPrice={discountedPrice}
                    projectsCount={projects.length}
                    perChild={plan.perChild}
                    instapayAccount={INSTAPAY_ACCOUNT}
                    copied={copied}
                    onCopy={copyAccount}
                    onNext={() => setStep("upload")}
                  />
                </Card>
              </motion.div>
            )}

            {step === "upload" && (
              <motion.div key="upload" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <Card className="p-6 border border-card-border">
                  <UploadSection
                    imagePreview={imagePreview}
                    uploading={uploading}
                    fileInputRef={fileInputRef}
                    onFileSelect={handleFileSelect}
                    onSubmit={handleUploadSubmit}
                    onRemove={() => {
                      setImagePreview(null);
                      setImageFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                  />
                </Card>
              </motion.div>
            )}

            {step === "success" && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <SuccessSection
                  clientName={clientName}
                  projectNames={projectNames}
                  planName={plan.name}
                  orderId={orderId}
                  whatsappUrl={whatsappUrl}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div variants={fadeInUp} className="mt-6 flex items-center justify-center gap-4 flex-wrap">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>{t({ ar: "عمليات آمنة", en: "Secure Processes" })}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{t({ ar: "استجابة سريعة", en: "Fast Response" })}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <CheckCircle2 className="h-4 w-4" />
            <span>{t({ ar: "حماية بيانات كاملة", en: "Full Data Protection" })}</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

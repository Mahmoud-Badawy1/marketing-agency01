import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useRoute, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight, ArrowLeft, Upload, CheckCircle2, Copy, Smartphone, Shield, Clock, CreditCard, ImagePlus, X, Star, Plus, Trash2, Users, Tag } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
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

const DEFAULT_INSTAPAY_ACCOUNT = "201007673634";

type Step = "form" | "payment" | "upload" | "success";

interface ChildEntry { name: string; age: string; }

export default function Checkout() {
  const { t, language } = useLanguage();
  const [, params] = useRoute("/checkout/:plan");
  const [, setLocation] = useLocation();
  const { data: publicSettings } = usePublicSettings();
  const planKey = params?.plan || "monthly";

  const DEFAULT_PLANS = getDefaultPlans(t);

  // Build plans from dynamic settings or fallback
  const PLANS = (() => {
    if (publicSettings?.plans && publicSettings.plans.length > 0) {
      const dynamicPlans: Record<string, { name: string; price: number; period: string; perChild: boolean; discountPercent: number; discountLabel: string }> = {};
      for (const p of publicSettings.plans) {
        dynamicPlans[p.id] = {
          name: p.name,
          price: parseInt(p.price) || 0,
          period: p.period,
          perChild: true, // Assuming this is boolean from some logic
          discountPercent: p.discountPercent || 0,
          discountLabel: p.discountLabel || "",
        };
      }
      return { ...DEFAULT_PLANS, ...dynamicPlans };
    }
    return DEFAULT_PLANS;
  })();

  const plan = PLANS[planKey] || PLANS.monthly || Object.values(PLANS)[0];
  const INSTAPAY_ACCOUNT = publicSettings?.contact?.instapay || DEFAULT_INSTAPAY_ACCOUNT;
  const whatsappNumber = publicSettings?.contact?.whatsapp || "201007673634";

  const [step, setStep] = useState<Step>("form");
  const [orderId, setOrderId] = useState("");
  const [copied, setCopied] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const [parentName, setParentName] = useState("");
  const [phone, setPhone] = useState("");
  const [nationality, setNationality] = useState("");
  const [schoolType, setSchoolType] = useState("");
  const [children, setChildren] = useState<ChildEntry[]>([{ name: "", age: "" }]);

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState<{
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    description?: string;
  } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const totalAmount = plan.perChild ? plan.price * children.length : plan.price;
  const hasDiscount = plan.discountPercent > 0;
  const discountedPrice = hasDiscount ? Math.round(plan.price * (1 - plan.discountPercent / 100)) : plan.price;
  const totalAfterPlanDiscount = plan.perChild ? discountedPrice * children.length : discountedPrice;

  // Calculate coupon discount on top of plan discount
  let couponDiscountAmount = 0;
  if (couponApplied) {
    if (couponApplied.discountType === 'percentage') {
      couponDiscountAmount = Math.round(totalAfterPlanDiscount * (couponApplied.discountValue / 100));
    } else {
      couponDiscountAmount = couponApplied.discountValue * (plan.perChild ? children.length : 1);
    }
    couponDiscountAmount = Math.min(couponDiscountAmount, totalAfterPlanDiscount);
  }
  const totalAfterDiscount = totalAfterPlanDiscount - couponDiscountAmount;

  const addChild = () => {
    setChildren([...children, { name: "", age: "" }]);
  };

  const removeChild = (index: number) => {
    if (children.length <= 1) return;
    setChildren(children.filter((_, i) => i !== index));
  };

  const updateChild = (index: number, field: keyof ChildEntry, value: string) => {
    const updated = [...children];
    updated[index] = { ...updated[index], [field]: value };
    setChildren(updated);
  };

  const createOrderMutation = useMutation({
    mutationFn: async () => {
      const childrenData = children.map(c => ({ name: c.name, age: parseInt(c.age) }));
      const res = await apiRequest("POST", "/api/orders", {
        parentName,
        phone,
        childName: children[0].name,
        childAge: parseInt(children[0].age) || 0,
        nationality: nationality || undefined,
        schoolType: schoolType || undefined,
        plan: planKey,
        amount: totalAfterDiscount,
        children: childrenData,
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
    if (!parentName || !phone) {
      toast({ title: t({ ar: "تنبيه", en: "Notice" }), description: t({ ar: "يرجى ملء بيانات العميل/الشركة", en: "Please fill in the client/company details" }), variant: "destructive" });
      return;
    }
    for (let i = 0; i < children.length; i++) {
      if (!children[i].name) {
        toast({ title: t({ ar: "تنبيه", en: "Notice" }), description: t({ ar: `يرجى ملء اسم المشروع/الشركة ${i + 1}`, en: `Please fill in project/company name ${i + 1}` }), variant: "destructive" });
        return;
      }
      const age = parseInt(children[i].age);
      if (isNaN(age) || age < 1) {
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

  const childrenNames = children.map(c => c.name).join(t({ ar: " و ", en: " and " }));
  const whatsappMessage = encodeURIComponent(
    t({
      ar: `مرحباً، أنا ${parentName}\nتم طلب ${plan.name}${children.length > 1 ? ` لـ ${children.length} شركات/مشاريع` : ` للشركة: ${childrenNames}`}\nالمبلغ: ${totalAfterDiscount} ج.م${hasDiscount ? ` (بعد خصم ${plan.discountPercent}%)` : ""}${couponApplied ? ` (كوبون: ${couponApplied.code})` : ""}\nرقم الطلب: ${orderId}\nأرجو تأكيد الطلب والتواصل للبدء.`,
      en: `Hello, I'm ${parentName}\nI requested ${plan.name}${children.length > 1 ? ` for ${children.length} companies/projects` : ` for: ${childrenNames}`}\nAmount: ${totalAfterDiscount} EGP${hasDiscount ? ` (After ${plan.discountPercent}% discount)` : ""}${couponApplied ? ` (Coupon: ${couponApplied.code})` : ""}\nOrder ID: ${orderId}\nPlease confirm the order.`
    })
  );

  // Coupon validation handler
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
          childrenCount: children.length,
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
  const currentStepIndex = STEPS.indexOf(step);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Helmet>
        <title>{t({ ar: "اشتراك الآن | ماركتير برو - Marketer Pro", en: "Subscribe Now | Marketer Pro" })}</title>
        <meta name="description" content={t({ ar: `اطلب ${plan.name} - ${plan.price}${" ج.م"} / ${plan.period}. ابدأ رحلة نمو أعمالك مع ماركتير برو`, en: `Request ${plan.name} - ${plan.price} EGP / ${plan.period}. Start your business growth journey with Marketer Pro` })} />
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
            <Card className="p-5 border border-accent/30 bg-accent/5">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {planKey === "genius" && <Star className="h-5 w-5 text-accent fill-accent" />}
                    <h3 className="font-bold text-lg text-foreground" data-testid="text-plan-name">{plan.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {plan.period} {plan.perChild && children.length > 1 && t({ ar: `× ${children.length} خدمات`, en: `× ${children.length} Services` })}
                  </p>
                  {hasDiscount && (
                    <p className="text-xs font-semibold text-red-600 dark:text-red-400 mt-1">
                      🎉 {t({ ar: `خصم ${plan.discountPercent}%`, en: `${plan.discountPercent}% Discount` })}{plan.discountLabel && ` - ${plan.discountLabel}`}
                    </p>
                  )}
                  {couponApplied && (
                    <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                      🎫 {t({ ar: `كوبون ${couponApplied.code}: خصم ${couponApplied.discountType === 'percentage' ? `${couponApplied.discountValue}%` : `${couponApplied.discountValue} ج.م`}`, en: `Coupon ${couponApplied.code}: ${couponApplied.discountType === 'percentage' ? `${couponApplied.discountValue}%` : `${couponApplied.discountValue} EGP`} off` })}
                    </p>
                  )}
                </div>
                <div className={`text-${language === "en" ? "right" : "left"}`}>
                  {hasDiscount && (
                    <div className="mb-0.5">
                      <span className="text-sm text-muted-foreground line-through">{totalAmount} {t({ ar: "ج.م", en: "EGP" })}</span>
                    </div>
                  )}
                  <span className={`text-3xl font-extrabold ${hasDiscount ? "text-red-600 dark:text-red-400" : "text-foreground"}`} data-testid="text-plan-price">{totalAfterDiscount}</span>
                  <span className={`text-muted-foreground ${language === "en" ? "ml-1" : "mr-1"}`}>{t({ ar: "ج.م", en: "EGP" })}</span>
                  {children.length > 1 && plan.perChild && (
                    <p className="text-xs text-muted-foreground">{discountedPrice} × {children.length} {t({ ar: "خدمات", en: "Services" })}</p>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={fadeInUp} className="flex items-center gap-2 mb-8">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors ${
                    step === s
                      ? "bg-accent text-accent-foreground"
                      : currentStepIndex > i
                        ? "bg-emerald-500 text-white"
                        : "bg-muted text-muted-foreground"
                  }`}
                  data-testid={`step-indicator-${i}`}
                >
                  {currentStepIndex > i ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                </div>
                {i < 3 && <div className={`h-0.5 flex-1 rounded transition-colors ${currentStepIndex > i ? "bg-emerald-500" : "bg-muted"}`} />}
              </div>
            ))}
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
                        <Label htmlFor="parentName">{t({ ar: "الاسم بالكامل", en: "Full Name" })}</Label>
                        <Input
                          id="parentName"
                          value={parentName}
                          onChange={(e) => setParentName(e.target.value)}
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
                        <Label htmlFor="nationality">{t({ ar: "المنصب / المسمى الوظيفي", en: "Title / Position" })}</Label>
                        <Input
                          id="nationality"
                          value={nationality}
                          onChange={(e) => setNationality(e.target.value)}
                          placeholder={t({ ar: "مثال: مؤسس، مدير تسويق", en: "e.g. Founder, Marketing Manager" })}
                          data-testid="input-nationality"
                        />
                      </div>
                      <div>
                        <Label>{t({ ar: "نوع الخدمة المفضلة", en: "Preferred Service Type" })}</Label>
                        <Select value={schoolType} onValueChange={setSchoolType}>
                          <SelectTrigger data-testid="select-school-type" dir={language === "ar" ? "rtl" : "ltr"}>
                            <SelectValue placeholder={t({ ar: "اختر نوع الخدمة", en: "Select Service Type" })} />
                          </SelectTrigger>
                          <SelectContent dir={language === "ar" ? "rtl" : "ltr"}>
                            <SelectItem value="government">{t({ ar: "تدريب واستشارات", en: "Training and Consulting" })}</SelectItem>
                            <SelectItem value="private">{t({ ar: "إدارة إعلانات المتجر", en: "Store Ads Management" })}</SelectItem>
                            <SelectItem value="languages">{t({ ar: "خدمات تسويقية متكاملة", en: "Full Marketing Services" })}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="border-t border-border pt-5">
                      <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
                        <div className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-primary" />
                          <h3 className="font-bold text-foreground">{t({ ar: "تفاصيل العمل (الشركة/المشروع)", en: "Work Details (Company/Project)" })}</h3>
                        </div>
                        {plan.perChild && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addChild}
                            data-testid="button-add-child"
                          >
                            <Plus className={`h-4 w-4 ${language === "ar" ? "ml-1" : "mr-1"}`} />
                            {t({ ar: "إضافة مشروع آخر", en: "Add Another Project" })}
                          </Button>
                        )}
                      </div>

                      <div className="space-y-4">
                        {children.map((child, index) => (
                          <div
                            key={index}
                            className={`p-4 rounded-md border border-border ${children.length > 1 ? "bg-muted/30" : ""}`}
                            data-testid={`child-entry-${index}`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
                              <span className="text-sm font-bold text-foreground">
                                {t({ ar: `مشروع / شركة ${index + 1}`, en: `Project / Company ${index + 1}` })}
                              </span>
                              {children.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeChild(index)}
                                  data-testid={`button-remove-child-${index}`}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              )}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <Label>{t({ ar: "اسم الشركة / المشروع", en: "Company / Project Name" })}</Label>
                                <Input
                                  value={child.name}
                                  onChange={(e) => updateChild(index, "name", e.target.value)}
                                  placeholder={t({ ar: "ماركتير برو", en: "Marketer Pro" })}
                                  data-testid={`input-child-name-${index}`}
                                />
                              </div>
                              <div>
                                <Label>{t({ ar: "الميزانية الإعلانية التقريبية (شهرياً)", en: "Est. Monthly Ad Budget" })}</Label>
                                <Input
                                  type="number"
                                  min={1}
                                  max={100000000}
                                  value={child.age}
                                  onChange={(e) => updateChild(index, "age", e.target.value)}
                                  placeholder={t({ ar: "مثال: 50000", en: "e.g. 50000" })}
                                  dir="ltr"
                                  data-testid={`input-child-age-${index}`}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {children.length > 1 && plan.perChild && (
                        <div className="mt-3 p-3 rounded-md bg-accent/5 border border-accent/20 text-sm text-foreground">
                          {hasDiscount ? (
                            <>{t({ ar: "الإجمالي:", en: "Total:" })} <span className="line-through text-muted-foreground">{plan.price} {t({ ar: "ج.م", en: "EGP" })}</span> → {discountedPrice} {t({ ar: "ج.م", en: "EGP" })} × {children.length} {t({ ar: "مشاريع", en: "Projects" })} = <strong>{totalAfterPlanDiscount} {t({ ar: "ج.م", en: "EGP" })}</strong></>
                          ) : (
                            <>{t({ ar: "الإجمالي:", en: "Total:" })} {plan.price} {t({ ar: "ج.م", en: "EGP" })} × {children.length} {t({ ar: "مشاريع", en: "Projects" })} = <strong>{totalAfterPlanDiscount} {t({ ar: "ج.م", en: "EGP" })}</strong></>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Coupon Code Section */}
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
                              onClick={handleRemoveCoupon}
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
                              <strong className="text-emerald-700 dark:text-emerald-400">{totalAfterDiscount} {t({ ar: "ج.م", en: "EGP" })}</strong>
                              <span className={`text-emerald-600 dark:text-emerald-500 ${language === "ar" ? "mr-2" : "ml-2"}`}>({t({ ar: `وفّرت ${couponDiscountAmount} ج.م`, en: `Saved ${couponDiscountAmount} EGP` })})</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Input
                              value={couponCode}
                              onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(""); }}
                              placeholder={t({ ar: "أدخل كود الخصم", en: "Enter Promo Code" })}
                              dir="ltr"
                              className="flex-1"
                              data-testid="input-coupon-code"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handleApplyCoupon}
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
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <Smartphone className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground">{t({ ar: "الدفع عبر بانكي / انستا باي", en: "Payment via Bank / InstaPay" })}</h2>
                      <p className="text-sm text-muted-foreground">{t({ ar: "حوّل المبلغ ثم ارفع إيصال التحويل", en: "Transfer the amount, then upload the receipt" })}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-muted/50 rounded-md p-5 border border-border">
                      <p className="text-sm text-muted-foreground mb-2">{t({ ar: "المبلغ المطلوب", en: "Amount Due" })}</p>
                      <p className="text-3xl font-extrabold text-foreground" data-testid="text-payment-amount">
                        {totalAfterDiscount} <span className="text-lg font-normal text-muted-foreground">{t({ ar: "ج.م", en: "EGP" })}</span>
                      </p>
                      {hasDiscount && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-semibold">
                          {t({ ar: `خصم ${plan.discountPercent}%`, en: `${plan.discountPercent}% Discount` })}{plan.discountLabel && ` - ${plan.discountLabel}`}
                          {" "}<span className="text-muted-foreground line-through font-normal">{totalAmount} {t({ ar: "ج.م", en: "EGP" })}</span>
                        </p>
                      )}
                      {children.length > 1 && plan.perChild && (
                        <p className="text-xs text-muted-foreground mt-1">{discountedPrice} × {children.length} {t({ ar: "مشاريع", en: "Projects" })}</p>
                      )}
                    </div>

                    <div className="bg-muted/50 rounded-md p-5 border border-border">
                      <p className="text-sm text-muted-foreground mb-2">{t({ ar: "حوّل إلى هذا الحساب عبر انستا باي", en: "Transfer to this account via InstaPay" })}</p>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xl font-bold text-foreground tracking-wider" dir="ltr" data-testid="text-instapay-account">{INSTAPAY_ACCOUNT}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={copyAccount}
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
                          t({ ar: `أدخل الرقم: ${INSTAPAY_ACCOUNT}`, en: `Enter number: ${INSTAPAY_ACCOUNT}` }),
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
                      onClick={() => setStep("upload")}
                      data-testid="button-go-upload"
                    >
                      {t({ ar: "تم التحويل - رفع الإيصال", en: "Transfer Done - Upload Receipt" })}
                      <Upload className={`h-4 w-4 ${language === "ar" ? "mr-2" : "ml-2"}`} />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}

            {step === "upload" && (
              <motion.div key="upload" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <Card className="p-6 border border-card-border">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <ImagePlus className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground">{t({ ar: "إرفاق إيصال الدفع", en: "Attach Payment Receipt" })}</h2>
                      <p className="text-sm text-muted-foreground">{t({ ar: "ارفع سكرين شوت التحويل لتأكيد دفعك", en: "Upload transfer screenshot to confirm your payment" })}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      className="hidden"
                      onChange={handleFileSelect}
                      data-testid="input-file-upload"
                    />

                    {!imagePreview ? (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full border-2 border-dashed border-border rounded-md p-10 flex flex-col items-center gap-3 text-muted-foreground transition-colors hover:bg-muted/50"
                        data-testid="button-select-image"
                      >
                        <Upload className="h-10 w-10" />
                        <span className="text-sm font-medium">{t({ ar: "اضغط لاختيار صورة الإيصال", en: "Click to select receipt image" })}</span>
                        <span className="text-xs">JPG, PNG, WEBP - {t({ ar: "أقصى حجم 10 ميجابايت", en: "Max size 10MB" })}</span>
                      </button>
                    ) : (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Receipt"
                          className="w-full max-h-80 object-contain rounded-md border border-border"
                          data-testid="img-transfer-preview"
                        />
                        <Button
                          size="icon"
                          variant="destructive"
                          className={`absolute top-2 ${language === "ar" ? "left-2" : "right-2"}`}
                          onClick={() => {
                            setImagePreview(null);
                            setImageFile(null);
                            if (fileInputRef.current) fileInputRef.current.value = "";
                          }}
                          data-testid="button-remove-image"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}

                    <div className="bg-muted/50 rounded-md p-4 border border-border flex items-start gap-3">
                      <Clock className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-muted-foreground">
                        {t({ ar: "بعد إرفاق الإيصال، سيقوم فريقنا بمراجعة التحويل والتواصل معك لتأكيد الانطلاق وتحديد المواعيد.", en: "After attaching the receipt, our team will review the transfer and reach out to you to confirm boarding and scheduling." })}
                      </p>
                    </div>

                    <Button
                      size="lg"
                      className="w-full bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700"
                      onClick={handleUploadSubmit}
                      disabled={!imageFile || uploading}
                      data-testid="button-confirm-upload"
                    >
                      {uploading ? t({ ar: "جاري الرفع...", en: "Uploading..." }) : t({ ar: "تأكيد وإرسال", en: "Confirm & Submit" })}
                      <CheckCircle2 className={`h-4 w-4 ${language === "ar" ? "mr-2" : "ml-2"}`} />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}

            {step === "success" && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <Card className="p-8 border border-emerald-500/30 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                    className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/10 flex items-center justify-center"
                  >
                    <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                  </motion.div>

                  <h2 className="text-2xl font-extrabold text-foreground mb-2" data-testid="text-success-title">
                    {t({ ar: "تم تسجيل طلبك بنجاح!", en: "Your request has been successfully recorded!" })}
                  </h2>
                  <p className="text-muted-foreground mb-2">
                    {t({ ar: `شكراً لك ${parentName}`, en: `Thank you, ${parentName}` })}
                  </p>
                  <p className="text-sm text-muted-foreground mb-6">
                    {t({ ar: `سيتم مراجعة التحويل والتواصل معك قريباً للانطلاق في رحلة نمو ${childrenNames} عبر ${plan.name}`, en: `The transfer will be reviewed and we will contact you soon to begin the growth journey of ${childrenNames} with ${plan.name}` })}
                  </p>

                  <div className={`bg-muted/50 rounded-md p-4 border border-border mb-6 text-${language === "ar" ? "right" : "left"}`}>
                    <p className="text-xs text-muted-foreground mb-1">{t({ ar: "رقم الطلب", en: "Order ID" })}</p>
                    <p className="text-sm font-mono font-bold text-foreground" dir="ltr" data-testid="text-order-id">{orderId}</p>
                  </div>

                  <div className="space-y-3">
                    <Button
                      size="lg"
                      className="w-full bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700"
                      onClick={() => window.open(whatsappUrl, "_blank")}
                      data-testid="button-whatsapp-confirm"
                    >
                      <SiWhatsapp className={`h-5 w-5 ${language === "ar" ? "ml-2" : "mr-2"}`} />
                      {t({ ar: "تأكيد الطّلب عبر واتساب للحصول على استجابة أسرع", en: "Confirm order via WhatsApp for faster response" })}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      {t({ ar: "اضغط لإرسال رسالة تأكيد عبر واتساب ليتواصل معك فريقنا في أسرع وقت", en: "Click to send a WhatsApp confirmation message for our team to contact you instantly" })}
                    </p>
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full mt-4"
                      onClick={() => setLocation("/")}
                      data-testid="button-back-to-home"
                    >
                      {t({ ar: "العودة للصفحة الرئيسية", en: "Back to Home Page" })}
                    </Button>
                  </div>
                </Card>
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

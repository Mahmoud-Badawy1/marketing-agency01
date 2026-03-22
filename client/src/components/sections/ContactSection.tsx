import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, MessageCircle, Phone, CheckCircle } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { fadeInUp, fadeInRight, fadeInLeft, staggerContainer, viewportConfig } from "@/lib/animations";
import { useLanguage } from "@/hooks/use-language";
import { usePublicSettings } from "@/hooks/use-public-settings";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Info, Calendar as CalendarIcon, Clock, MessageSquare as MessageIcon } from "lucide-react";
import type { AvailabilitySlotType } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";

export default function ContactSection() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const { data: publicSettings } = usePublicSettings();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("consultation");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    company: "",
    service: "",
    message: "",
    scheduledDate: undefined as Date | undefined,
    scheduledSlotId: "",
  });

  // Auto-populate from user profile
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || user.name || "",
        phone: prev.phone || user.phone || "",
        email: prev.email || user.email || "",
      }));
    }
  }, [user]);

  const [submitted, setSubmitted] = useState(false);

  // Fetch slots for selected date
  const { data: slots = [], isLoading: isLoadingSlots } = useQuery<AvailabilitySlotType[]>({
    queryKey: ["/api/availability/active", formData.scheduledDate ? format(formData.scheduledDate, "yyyy-MM-dd") : null],
    queryFn: async () => {
      if (!formData.scheduledDate) return [];
      const res = await fetch(`/api/availability/active?date=${format(formData.scheduledDate, "yyyy-MM-dd")}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!formData.scheduledDate,
  });

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // If we have a slot, it's a Trial Booking. Otherwise, it's a Lead.
      const isTrial = !!data.scheduledSlotId;
      const endpoint = isTrial ? "/api/trial-bookings" : "/api/leads";
      
      const payload = isTrial 
        ? {
            clientName: data.name,
            phone: data.phone,
            email: data.email,
            companyName: data.company || "",
            serviceInterest: data.service || "consultation",
            message: data.message || "",
            scheduledSlotId: data.scheduledSlotId,
          }
        : {
            clientName: data.name,
            phone: data.phone,
            email: data.email,
            companyName: data.company || "",
            serviceInterest: data.service || "inquiry",
            message: data.message || "",
          };

      return apiRequest("POST", endpoint, payload);
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({
        title: t({ ar: "تم الإرسال بنجاح!", en: "Sent Successfully!" }),
        description: t({ 
          ar: formData.scheduledSlotId ? "تم حجز موعد الاستشارة، سنتواصل معك قريباً" : "شكراً لتواصلك معنا، سنرد على استفسارك قريباً", 
          en: formData.scheduledSlotId ? "Consultation booked, we will contact you shortly" : "Thank you for contacting us, we will reply to your inquiry shortly"
        }),
      });
    },
    onError: () => {
      toast({
        title: t({ ar: "حدث خطأ", en: "An Error Occurred" }),
        description: t({ ar: "يرجى المحاولة مرة أخرى أو التواصل عبر واتساب", en: "Please try again or contact via WhatsApp" }),
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.email) {
      toast({
        title: t({ ar: "بيانات ناقصة", en: "Missing Data" }),
        description: t({ ar: "يرجى إكمال الحقول المطلوبة", en: "Please fill in all required fields" }),
        variant: "destructive",
      });
      return;
    }

    // In consultation mode, we suggest picking a date, but allow it to be optional as per user request
    // However, the UI makes it clear that picking a date is for "Consultation"
    
    mutation.mutate(formData);
  };

  return (
    <section id="contact" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-14"
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          variants={staggerContainer}
        >
          <motion.p variants={fadeInUp} className="text-accent font-semibold text-sm mb-2">{t({ ar: "لنتحدث عن النمو", en: "Let's Talk Growth" })}</motion.p>
          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl font-extrabold text-foreground"
            data-testid="text-contact-title"
          >
            {t({ ar: "هل أنت مستعد لبناء ", en: "Are you ready to build " })}
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-accent to-blue-600">
              {t({ ar: "محرك نمو مبيعاتك؟", en: "your growth engine?" })}
            </span>
          </motion.h2>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8 max-w-5xl mx-auto">
          <motion.div
            className="lg:col-span-3"
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
            variants={fadeInRight}
          >
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <Card className="p-10 text-center border border-emerald-200 dark:border-emerald-900/30" data-testid="card-success">
                    <motion.div
                      className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/10 flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                    >
                      <CheckCircle className="h-8 w-8 text-emerald-500" />
                    </motion.div>
                    <motion.h3
                      className="text-2xl font-bold text-foreground mb-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      {t({ ar: "تم التسجيل بنجاح!", en: "Registered Successfully!" })}
                    </motion.h3>
                    <motion.p
                      className="text-muted-foreground mb-6"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      {t({ ar: "شكراً لك! سيتواصل معك خبير النمو لدينا خلال 24 ساعة لتحديد موعد الاستشارة المجانية", en: "Thank you! Our growth strategist will reach out within 24 hours to schedule your free strategy session" })}
                    </motion.p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSubmitted(false);
                        setFormData({ name: "", phone: "", email: "", company: "", service: "", message: "", scheduledDate: undefined, scheduledSlotId: "" });
                      }}
                      data-testid="button-register-another"
                    >
                      {t({ ar: "تسجيل طلب آخر", en: "Register Another Request" })}
                    </Button>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card className="p-6 sm:p-8 border border-card-border" data-testid="card-contact-form">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                      <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                        <MessageCircle className="h-5 w-5 text-accent" />
                        {activeTab === "consultation" 
                          ? t({ ar: "احجز استشارة مجانية", en: "Book a Free Consultation" })
                          : t({ ar: "إرسال استفسار / شكوى", en: "Send Inquiry / Message" })
                        }
                      </h3>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 text-[11px] gap-1.5 border-accent/20 hover:border-accent hover:bg-accent/5 transition-all duration-300 rounded-full"
                        onClick={() => {
                          const next = activeTab === "consultation" ? "lead" : "consultation";
                          setActiveTab(next);
                          if (next === "lead") {
                            setFormData(p => ({ ...p, scheduledSlotId: "", scheduledDate: undefined }));
                          }
                        }}
                      >
                        <CalendarIcon className="h-3.5 w-3.5 text-accent" />
                        <span className="text-muted-foreground">
                          {activeTab === "consultation" 
                            ? t({ ar: "التبديل للاستفسارات", en: "Switch to Inquiries" })
                            : t({ ar: "التبديل للاستشارات", en: "Switch to Consultations" })
                          }
                        </span>
                      </Button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid md:grid-cols-2 gap-5">
                          <div className="space-y-2">
                            <Label htmlFor="clientName">{t({ ar: "الاسم بالكامل", en: "Full Name" })}</Label>
                            <Input
                              id="clientName"
                              placeholder={t({ ar: "مثال: أحمد محمد", en: "e.g., Ahmed Mohamed" })}
                              value={formData.name}
                              onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                              required
                              data-testid="input-parent-name"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="phone">{t({ ar: "رقم الهاتف / واتساب", en: "Phone Number / WhatsApp" })}</Label>
                            <Input
                              id="phone"
                              type="tel"
                              placeholder="01xxxxxxxxx"
                              value={formData.phone}
                              onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                              required
                              dir="ltr"
                              data-testid="input-phone"
                            />
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-5">
                          <div className="space-y-2">
                            <Label htmlFor="email">{t({ ar: "البريد الإلكتروني", en: "Email Address" })}</Label>
                            <Input
                              id="email"
                              type="email"
                              placeholder="your@email.com"
                              value={formData.email}
                              onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                              required
                              dir="ltr"
                              data-testid="input-email"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="company">{t({ ar: "الشركة / المشروع (اختياري)", en: "Company / Project (Optional)" })}</Label>
                            <Input
                              id="company"
                              placeholder={t({ ar: "اسم شركتك أو مشروعك", en: "Your company or project name" })}
                              value={formData.company}
                              onChange={(e) => setFormData((p) => ({ ...p, company: e.target.value }))}
                              data-testid="input-company"
                            />
                          </div>
                        </div>

                        {activeTab === "consultation" && (
                          <div className="space-y-5 mt-0 animate-in fade-in slide-in-from-top-1">
                            <div className="space-y-2">
                              <Label>{t({ ar: "نوع الخدمة المطلوبة", en: "Required Service Type" })}</Label>
                              <Select
                                value={formData.service}
                                onValueChange={(v) => setFormData((p) => ({ ...p, service: v }))}
                              >
                                <SelectTrigger data-testid="select-service-type">
                                  <SelectValue placeholder={t({ ar: "اختر الخدمة", en: "Select Service" })} />
                                </SelectTrigger>
                                <SelectContent>
                                  {publicSettings?.services && publicSettings.services.length > 0 ? (
                                    publicSettings.services.map((s: any, idx: number) => (
                                      <SelectItem key={idx} value={s.title.en || s.title.ar}>
                                        {language === "ar" ? s.title.ar : s.title.en}
                                      </SelectItem>
                                    ))
                                  ) : (
                                    <>
                                      <SelectItem value="consultation">{t({ ar: "استشارة تسويقية", en: "Marketing Consultation" })}</SelectItem>
                                      <SelectItem value="branding">{t({ ar: "بناء الهوية التجارية", en: "Branding" })}</SelectItem>
                                      <SelectItem value="ads">{t({ ar: "إدارة الحملات الإعلانية", en: "Ads Management" })}</SelectItem>
                                      <SelectItem value="social_media">{t({ ar: "إدارة منصات التواصل", en: "Social Media Management" })}</SelectItem>
                                      <SelectItem value="seo">{t({ ar: "تحسين محركات البحث", en: "SEO" })}</SelectItem>
                                      <SelectItem value="strategy">{t({ ar: "تخطيط واستراتيجية", en: "Strategy & Planning" })}</SelectItem>
                                      <SelectItem value="other">{t({ ar: "أخرى", en: "Other" })}</SelectItem>
                                    </>
                                  )}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                              <div className="space-y-2">
                                <Label>{t({ ar: "تاريخ الاستشارة (اختياري)", en: "Consultation Date (Optional)" })}</Label>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant={"outline"}
                                      className={`w-full justify-start text-right font-normal ${!formData.scheduledDate && "text-muted-foreground"}`}
                                    >
                                      <CalendarIcon className="ml-2 h-4 w-4" />
                                      {formData.scheduledDate ? format(formData.scheduledDate, "PPP", { locale: ar }) : t({ ar: "اختر التاريخ", en: "Pick a date" })}
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                      mode="single"
                                      selected={formData.scheduledDate}
                                      onSelect={(date) => {
                                        setFormData(p => ({ ...p, scheduledDate: date, scheduledSlotId: "" }));
                                      }}
                                      disabled={(date) => {
                                        const today = new Date();
                                        today.setHours(0, 0, 0, 0);
                                        const thirtyDaysFromNow = new Date();
                                        thirtyDaysFromNow.setDate(today.getDate() + 30);
                                        return date < today || date > thirtyDaysFromNow;
                                      }}
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                              </div>

                              <div className="space-y-2">
                                <Label>{t({ ar: "وقت الاستشارة", en: "Consultation Time" })}</Label>
                                <Select
                                  value={formData.scheduledSlotId}
                                  onValueChange={(v) => setFormData(p => ({ ...p, scheduledSlotId: v }))}
                                  disabled={!formData.scheduledDate || isLoadingSlots}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder={
                                      !formData.scheduledDate 
                                        ? t({ ar: "اختر التاريخ أولاً", en: "Pick date first" })
                                        : isLoadingSlots 
                                          ? t({ ar: "جاري التحميل...", en: "Loading..." })
                                          : t({ ar: "اختر الوقت", en: "Select Time" })
                                    } />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {slots.length === 0 && formData.scheduledDate && !isLoadingSlots ? (
                                      <div className="p-2 text-xs text-center text-muted-foreground">
                                        {t({ ar: "لا توجد مواعيد متاحة هذا اليوم", en: "No available slots for this day" })}
                                      </div>
                                    ) : (
                                      slots.map((slot: any) => (
                                        <SelectItem key={slot._id} value={slot._id}>
                                          <div className="flex items-center gap-2">
                                            <Clock className="h-3 w-3" />
                                            <span>{slot.startTime} - {slot.endTime}</span>
                                          </div>
                                        </SelectItem>
                                      ))
                                    )}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label htmlFor="message">
                            {activeTab === "consultation" 
                              ? t({ ar: "تفاصيل الجلسة (اختياري)", en: "Session Details (Optional)" })
                              : t({ ar: "موضوع الاستفسار أو الشكوى", en: "Inquiry or Complaint Subject" })
                            }
                          </Label>
                          <Textarea
                            id="message"
                            placeholder={activeTab === "consultation"
                              ? t({ ar: "أخبرنا المزيد عن أهدافك أو ما تود مناقشته...", en: "Tell us more about your goals or what you'd like to discuss..." })
                              : t({ ar: "اكتب رسالتك هنا بالتفصيل وسنقوم بالرد عليك في أقرب وقت...", en: "Write your message here in detail and we will respond to you as soon as possible..." })
                            }
                            value={formData.message}
                            onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))}
                            className="resize-none"
                            rows={4}
                            data-testid="input-message"
                          />
                        </div>

                        <div>
                          <Button
                            type="submit"
                            className="w-full bg-accent text-accent-foreground border-accent-border"
                            size="lg"
                            disabled={mutation.isPending}
                            data-testid="button-submit-lead"
                          >
                            {mutation.isPending ? (
                              t({ ar: "جارٍ الإرسال...", en: "Sending..." })
                            ) : (
                              <>
                                <Send className="mx-2 h-4 w-4 rtl:rotate-180 rotate-0" />
                                {activeTab === "consultation" 
                                  ? t({ ar: "حجز الموعد الآن", en: "Book Appointment Now" })
                                  : t({ ar: "إرسال الرسالة", en: "Send Message" })
                                }
                              </>
                            )}
                          </Button>
                        </div>
                      </form>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div
            className="lg:col-span-2 space-y-4"
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInLeft} custom={0}>
              <Card className="p-6 border border-card-border" data-testid="card-whatsapp">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-12 h-12 rounded-md bg-emerald-500/10 flex items-center justify-center animate-pulse"
                  >
                    <SiWhatsapp className="h-6 w-6 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{t({ ar: "تواصل عبر واتساب", en: "Contact via WhatsApp" })}</h3>
                    <p className="text-sm text-muted-foreground">{t({ ar: "رد فوري على استفساراتك", en: "Instant reply to your inquiries" })}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open("https://wa.me/201553145631", "_blank")}
                  data-testid="button-whatsapp"
                >
                  <SiWhatsapp className="mx-2 h-4 w-4 text-emerald-500" />
                  {t({ ar: "ابدأ محادثة", en: "Start a Conversation" })}
                </Button>
              </Card>
            </motion.div>

            <motion.div variants={fadeInLeft} custom={1}>
              <Card className="p-6 border border-card-border" data-testid="card-phone">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-md bg-accent/10 flex items-center justify-center">
                    <Phone className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{t({ ar: "اتصل بنا", en: "Call Us" })}</h3>
                    <p className="text-sm text-muted-foreground">{t({ ar: "متاحون من 10 ص - 10 م", en: "Available 10 AM - 10 PM" })}</p>
                  </div>
                </div>
                <p className="text-lg font-bold text-foreground text-center" dir="ltr" data-testid="text-phone-number">
                  +201553145631
                </p>
              </Card>
            </motion.div>

            <motion.div variants={fadeInLeft} custom={2}>
              <Card className="p-6 border border-accent/20 bg-accent/5" data-testid="card-guarantee">
                <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
                  <div
                    className="animate-spin-4"
                  >
                    <CheckCircle className="h-5 w-5 text-accent" />
                  </div>
                  {t({ ar: "نتائج مبنية على الأرقام", en: "Data-Driven Results" })}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t({ ar: "نضمن لك شفافية تامة في إدارة ميزانيتك الإعلانية وتحقيق أفضل عائد على الاستثمار بدراسات حالة حقيقية وموثقة.", en: "We guarantee full transparency in managing your ad budget and achieving the best ROI with documented real case studies." })}
                </p>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

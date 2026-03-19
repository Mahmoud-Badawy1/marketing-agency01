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
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { fadeInUp, fadeInRight, fadeInLeft, staggerContainer, viewportConfig } from "@/lib/animations";
import { useLanguage } from "@/hooks/use-language";

export default function ContactSection() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    company: "",
    service: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest("POST", "/api/leads", {
        parentName: data.name,
        phone: data.phone,
        childAge: 0,
        schoolType: data.service || undefined,
        message: `${data.company ? `الشركة: ${data.company}\n` : ""}${data.message || ""}`,
        source: "website",
      });
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({
        title: t({ ar: "تم الإرسال بنجاح!", en: "Sent Successfully!" }),
        description: t({ ar: "سنتواصل معك قريباً إن شاء الله", en: "We will contact you shortly, God willing" }),
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
    if (!formData.name || !formData.phone) return;
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
                        setFormData({ name: "", phone: "", company: "", service: "", message: "" });
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
                    <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                      <MessageCircle className="h-5 w-5 text-accent" />
                      {t({ ar: "احجز استشارة مجانية", en: "Book a Free Consultation" })}
                    </h3>

                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="space-y-2">
                        <Label htmlFor="parentName">{t({ ar: "الاسم بالكامل", en: "Full Name" })}</Label>
                        <Input
                          id="parentName"
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

                      <div className="space-y-2">
                        <Label>{t({ ar: "نوع الخدمة المطلوبة", en: "Required Service Type" })}</Label>
                        <Select
                          value={formData.service}
                          onValueChange={(v) => setFormData((p) => ({ ...p, service: v }))}
                        >
                          <SelectTrigger data-testid="select-school-type">
                            <SelectValue placeholder={t({ ar: "اختر الخدمة", en: "Select Service" })} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="marketing">{t({ ar: "إدارة حملات تسويقية", en: "Marketing Campaigns Management" })}</SelectItem>
                            <SelectItem value="consultation">{t({ ar: "استشارة تسويقية", en: "Marketing Consultation" })}</SelectItem>
                            <SelectItem value="training">{t({ ar: "تدريب وكورسات", en: "Training and Courses" })}</SelectItem>
                            <SelectItem value="other">{t({ ar: "أخرى", en: "Other" })}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">{t({ ar: "تفاصيل إضافية (اختياري)", en: "Additional Details (Optional)" })}</Label>
                        <Textarea
                          id="message"
                          placeholder={t({ ar: "أخبرنا المزيد عن أهدافك أو استفسارك...", en: "Tell us more about your goals or inquiry..." })}
                          value={formData.message}
                          onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))}
                          className="resize-none"
                          rows={3}
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
                              {t({ ar: "سجّل الآن", en: "Register Now" })}
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
                  onClick={() => window.open("https://wa.me/201007673634", "_blank")}
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
                  +201007673634
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

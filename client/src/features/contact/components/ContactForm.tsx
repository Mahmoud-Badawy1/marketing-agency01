import { MessageCircle, Calendar as CalendarIcon, Clock, Send } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/atoms/Button";
import { Label } from "@/components/atoms/Label";
import { Input } from "@/components/atoms/Input";
import { Textarea } from "@/components/atoms/Textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { SERVICES } from "@/config/constants";

interface ContactFormProps {
  t: any;
  language: string;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  slots: any[];
  isLoadingSlots: boolean;
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
  publicSettings: any;
}

export function ContactForm({
  t, language, activeTab, setActiveTab,
  formData, setFormData, slots, isLoadingSlots,
  onSubmit, isPending, publicSettings
}: ContactFormProps) {
  return (
    <Card className="p-6 sm:p-8 border border-card-border">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-accent" />
          {activeTab === "consultation" ? t({ ar: "احجز استشارة مجانية", en: "Book a Free Consultation" }) : t({ ar: "إرسال استفسار / شكوى", en: "Send Inquiry / Message" })}
        </h3>
        <Button variant="outline" size="sm" className="h-8 px-3 text-[11px] gap-1.5 border-accent/20 hover:border-accent hover:bg-accent/5 transition-all duration-300 rounded-full" onClick={() => {
          const next = activeTab === "consultation" ? "lead" : "consultation";
          setActiveTab(next);
          if (next === "lead") setFormData((p: any) => ({ ...p, scheduledSlotId: "", scheduledDate: undefined }));
        }}>
          <CalendarIcon className="h-3.5 w-3.5 text-accent" />
          <span className="text-muted-foreground">{activeTab === "consultation" ? t({ ar: "التبديل للاستفسارات", en: "Switch to Inquiries" }) : t({ ar: "التبديل للاستشارات", en: "Switch to Consultations" })}</span>
        </Button>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="grid md:grid-cols-2 gap-5">
          <div className="space-y-2"><Label>{t({ ar: "الاسم بالكامل", en: "Full Name" })}</Label><Input placeholder={t({ ar: "مثال: أحمد محمد", en: "e.g., Ahmed Mohamed" })} value={formData.name} onChange={(e) => setFormData((p: any) => ({ ...p, name: e.target.value }))} required /></div>
          <div className="space-y-2"><Label>{t({ ar: "رقم الهاتف / واتساب", en: "Phone Number / WhatsApp" })}</Label><Input type="tel" placeholder="01xxxxxxxxx" value={formData.phone} onChange={(e) => setFormData((p: any) => ({ ...p, phone: e.target.value }))} required dir="ltr" /></div>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          <div className="space-y-2"><Label>{t({ ar: "البريد الإلكتروني", en: "Email Address" })}</Label><Input type="email" placeholder="your@email.com" value={formData.email} onChange={(e) => setFormData((p: any) => ({ ...p, email: e.target.value }))} required dir="ltr" /></div>
          <div className="space-y-2"><Label>{t({ ar: "الشركة / المشروع (اختياري)", en: "Company / Project (Optional)" })}</Label><Input placeholder={t({ ar: "اسم شركتك", en: "Your company name" })} value={formData.company} onChange={(e) => setFormData((p: any) => ({ ...p, company: e.target.value }))} /></div>
        </div>

        {activeTab === "consultation" && (
          <div className="space-y-5 mt-0 animate-in fade-in slide-in-from-top-1">
            <div className="space-y-2">
              <Label>{t({ ar: "نوع الخدمة المطلوبة", en: "Required Service Type" })}</Label>
              <Select value={formData.service} onValueChange={(v) => setFormData((p: any) => ({ ...p, service: v }))}>
                <SelectTrigger><SelectValue placeholder={t({ ar: "اختر الخدمة", en: "Select Service" })} /></SelectTrigger>
                <SelectContent>
                  {(publicSettings?.services?.length > 0 ? publicSettings.services : SERVICES).map((s: any, idx: number) => (
                    <SelectItem key={idx} value={s.title.en || s.title.ar}>{language === "ar" ? s.title.ar : s.title.en}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2"><Label>{t({ ar: "تاريخ الاستشارة", en: "Consultation Date" })}</Label>
                <Popover><PopoverTrigger asChild><Button variant={"outline"} className="w-full justify-start text-right font-normal">{formData.scheduledDate ? format(formData.scheduledDate, "PPP", { locale: ar }) : t({ ar: "اختر التاريخ", en: "Pick a date" })}</Button></PopoverTrigger>
                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={formData.scheduledDate} onSelect={(date) => setFormData((p: any) => ({ ...p, scheduledDate: date, scheduledSlotId: "" }))} disabled={(date) => date < new Date() || date > new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)} initialFocus /></PopoverContent></Popover>
              </div>
              <div className="space-y-2"><Label>{t({ ar: "وقت الاستشارة", en: "Consultation Time" })}</Label>
                <Select value={formData.scheduledSlotId} onValueChange={(v) => setFormData((p: any) => ({ ...p, scheduledSlotId: v }))} disabled={!formData.scheduledDate || isLoadingSlots}>
                  <SelectTrigger><SelectValue placeholder={!formData.scheduledDate ? t({ ar: "اختر التاريخ أولاً", en: "Pick date first" }) : isLoadingSlots ? "..." : t({ ar: "اختر الوقت", en: "Select Time" })} /></SelectTrigger>
                  <SelectContent>{slots.map((s: any) => <SelectItem key={s._id} value={s._id}>{s.startTime} - {s.endTime}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label>{activeTab === "consultation" ? t({ ar: "تفاصيل الجلسة (اختياري)", en: "Session Details (Optional)" }) : t({ ar: "موضوع الرسالة", en: "Message Subject" })}</Label>
          <Textarea placeholder={t({ ar: "اكتب رسالتك هنا...", en: "Write your message here..." })} value={formData.message} onChange={(e) => setFormData((p: any) => ({ ...p, message: e.target.value }))} rows={4} className="resize-none" />
        </div>
        <Button type="submit" className="w-full bg-accent text-accent-foreground border-accent-border" size="lg" disabled={isPending}>
          {isPending ? t({ ar: "جارٍ الإرسال...", en: "Sending..." }) : <><Send className="mx-2 h-4 w-4 rtl:rotate-180" /> {activeTab === "consultation" ? t({ ar: "حجز الموعد الآن", en: "Book Appointment Now" }) : t({ ar: "إرسال الرسالة", en: "Send Message" })}</>}
        </Button>
      </form>
    </Card>
  );
}

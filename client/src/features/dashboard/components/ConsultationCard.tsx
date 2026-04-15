import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { AlertCircle, Clock, Info, Edit2 } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { useLanguage } from "@/hooks/use-language";

interface ConsultationCardProps {
  trial: any;
  bookingPolicies: any;
  canEditOrCancel: (scheduledTime: any) => boolean;
  onView: (trial: any) => void;
  onReschedule: (trial: any) => void;
  onCancel: (trial: any) => void;
}

export function ConsultationCard({ trial, bookingPolicies, canEditOrCancel, onView, onReschedule, onCancel }: ConsultationCardProps) {
  const { t, language } = useLanguage();
  const locale = language === "ar" ? ar : enUS;
  const canAct = canEditOrCancel(trial.scheduledTime);
  const statusColor = trial.status === "scheduled" || trial.status === "confirmed" ? "bg-emerald-100 text-emerald-700" : trial.status === "cancelled" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700";
  const statusLabel = trial.status === "scheduled" || trial.status === "confirmed" ? t({ ar: "مؤكد", en: "Confirmed" }) : trial.status === "cancelled" ? t({ ar: "ملغى", en: "Cancelled" }) : t({ ar: "قيد الانتظار", en: "Pending" });

  return (
    <div className="p-4 border border-card-border rounded-lg bg-card group hover:border-primary/50 transition-colors">
      <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
        <div>
          <h3 className="font-bold text-lg">{t({ ar: "جلسة استشارية إستراتيجية", en: "Strategy Consulting Session" })}</h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1"><Clock className="w-3 h-3" /><span>{t({ ar: "تم الطلب في:", en: "Requested on:" })} {format(new Date(trial.createdAt), "PPP", { locale })}</span></div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold ${statusColor}`}>{statusLabel}</div>
      </div>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {trial.scheduledTime ? (
          <div className="p-3 bg-primary/5 rounded-md border border-primary/10"><p className="text-xs text-muted-foreground mb-1">{t({ ar: "موعد الجلسة المحجوز:", en: "Booked Session Time:" })}</p><p className="text-primary font-bold">{format(new Date(trial.scheduledTime), "PPPP p", { locale })}</p></div>
        ) : (
          <div className="p-3 bg-amber-50 rounded-md border border-amber-100"><p className="text-amber-800 text-sm font-medium">{t({ ar: "لم يتم تحديد موعد بعد", en: "No time scheduled yet" })}</p></div>
        )}
        <div className="flex gap-2 items-center justify-end">
          <Button variant="outline" size="sm" onClick={() => onView(trial)}><Info className="w-4 h-4 ml-2" />{t({ ar: "التفاصيل", en: "Details" })}</Button>
          {trial.status !== "cancelled" && canAct && <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary/5" onClick={() => onReschedule(trial)}><Edit2 className="w-4 h-4 ml-2" />{t({ ar: "تعديل", en: "Edit" })}</Button>}
        </div>
      </div>
      {trial.status !== "cancelled" && (
        <div className="mt-4 flex justify-end border-t border-card-border pt-4">
          {canAct ? (
            <Button size="sm" variant="ghost" className="h-8 text-xs text-destructive hover:bg-red-50" onClick={() => onCancel(trial)}>{t({ ar: "إلغاء الجلسة", en: "Cancel Consultation" })}</Button>
          ) : (
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground italic"><AlertCircle className="w-3 h-3" /><span>{t({ ar: `لا يمكن الإلغاء/التعديل قبل الموعد بـ ${bookingPolicies.cancelDeadlineHours || 48} ساعة`, en: `Changes not allowed within ${bookingPolicies.cancelDeadlineHours || 48}h of session` })}</span></div>
          )}
        </div>
      )}
    </div>
  );
}

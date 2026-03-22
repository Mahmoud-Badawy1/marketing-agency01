import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { Info, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";

interface ConsultationDetailsDialogProps {
  trial: any;
  open: boolean;
  onClose: () => void;
}

export default function ConsultationDetailsDialog({
  trial,
  open,
  onClose,
}: ConsultationDetailsDialogProps) {
  const { t, language } = useLanguage();
  const locale = language === "ar" ? ar : enUS;

  if (!trial) return null;

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent dir={language === "ar" ? "rtl" : "ltr"}>
        <DialogHeader>
          <DialogTitle>{t({ ar: "تفاصيل الجلسة الاستشارية", en: "Consultation Details" })}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">{t({ ar: "الموعد:", en: "Time:" })}</p>
              <p className="font-semibold">
                {trial.scheduledTime
                  ? format(new Date(trial.scheduledTime), "PPP p", { locale })
                  : t({ ar: "انتظار التحديد", en: "TBD" })}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">{t({ ar: "الحالة:", en: "Status:" })}</p>
              <p className="font-semibold">{trial.status}</p>
            </div>
          </div>

          {trial.meetingLink && (
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg">
              <p className="text-sm font-bold text-emerald-800 mb-2 flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                {t({ ar: "رابط دخول الاجتماع", en: "Meeting Access Link" })}
              </p>
              <p className="text-xs text-muted-foreground mb-3">
                {t({ ar: "يرجى الانضمام للموعد المحدد عبر الرابط التالي:", en: "Please join at the scheduled time using this link:" })}
              </p>
              <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700 h-10 text-white border-none">
                <a href={trial.meetingLink} target="_blank" rel="noopener noreferrer">
                  {t({ ar: "انضم للاجتماع الآن", en: "Join Meeting Now" })}
                </a>
              </Button>
            </div>
          )}

          {trial.adminNotes && (
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
              <p className="text-sm font-bold text-blue-800 mb-1 flex items-center gap-2">
                <Info className="w-4 h-4" />
                {t({ ar: "ملاحظات الاجتماع:", en: "Meeting Notes:" })}
              </p>
              <p className="text-sm text-blue-700 whitespace-pre-wrap">{trial.adminNotes}</p>
            </div>
          )}

          {trial.cancelReason && (
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg">
              <p className="text-sm font-bold text-amber-800 mb-1 flex items-center gap-2">
                <Info className="w-4 h-4" />
                {t({ ar: "سبب الإلغاء/التعديل:", en: "Cancellation/Reschedule Reason:" })}
              </p>
              <p className="text-sm text-amber-700 whitespace-pre-wrap">{trial.cancelReason}</p>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{t({ ar: "الخدمة المهتم بها:", en: "Service Interest:" })}</p>
            <p className="p-3 bg-muted rounded-md text-sm">{trial.serviceInterest || "-"}</p>
          </div>
        </div>
        <DialogFooter>
          <Button className="w-full" onClick={onClose}>
            {t({ ar: "إإغلاق", en: "Close" })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

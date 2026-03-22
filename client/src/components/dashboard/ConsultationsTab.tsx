import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { AlertCircle, Clock, Info, Edit2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import CancelDialog from "./CancelDialog";
import ConsultationDetailsDialog from "./ConsultationDetailsDialog";
import RescheduleDialog from "./RescheduleDialog";

interface ConsultationsTabProps {
  getAuthHeaders: () => { Authorization: string };
  bookingPolicies: any;
}

export default function ConsultationsTab({ getAuthHeaders, bookingPolicies }: ConsultationsTabProps) {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const locale = language === "ar" ? ar : enUS;

  const [cancelTrialObj, setCancelTrialObj] = useState<any>(null);
  const [viewTrialObj, setViewTrialObj] = useState<any>(null);
  const [rescheduleTrialObj, setRescheduleTrialObj] = useState<any>(null);

  const { data: trials = [], isLoading } = useQuery({
    queryKey: ["/api/user/trials"],
    queryFn: async () => {
      const res = await fetch("/api/user/trials", { headers: getAuthHeaders() });
      if (!res.ok) throw new Error("Failed to fetch trials");
      return res.json();
    },
  });

  const cancelTrialMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const res = await fetch(`/api/user/trials/${id}/cancel`, {
        method: "PUT",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) throw new Error("Failed to cancel trial");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/trials"] });
      setCancelTrialObj(null);
      toast({ title: t({ ar: "تم إلغاء الحجز بنجاح", en: "Consultation cancelled successfully" }) });
    },
    onError: () => {
      toast({ title: t({ ar: "خطأ", en: "Error" }), description: t({ ar: "فشل في إلغاء الحجز", en: "Failed to cancel consultation" }), variant: "destructive" });
    },
  });

  const updateTrialMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await fetch(`/api/user/trials/${id}`, {
        method: "PUT",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to update trial");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/trials"] });
      setRescheduleTrialObj(null);
      toast({ title: t({ ar: "تم تحديث الموعد بنجاح", en: "Meeting rescheduled successfully" }) });
    },
    onError: (error: Error) => {
      toast({ title: t({ ar: "خطأ", en: "Error" }), description: error.message, variant: "destructive" });
    },
  });

  const canEditOrCancelTrial = (scheduledTime: any) => {
    if (!scheduledTime) return true;
    const now = new Date();
    const startTime = new Date(scheduledTime);
    const diffHours = (startTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    return diffHours >= (bookingPolicies.cancelDeadlineHours || 48);
  };

  if (isLoading) return <div className="py-8 text-center">{t({ ar: "جاري تحميل المواعيد...", en: "Loading sessions..." })}</div>;

  return (
    <>
      {bookingPolicies.warningMessage && (
        <div className="mb-4 bg-amber-50 text-amber-800 p-3 rounded-lg border border-amber-200 flex items-start gap-2 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p>{bookingPolicies.warningMessage}</p>
        </div>
      )}
      <Card>
        <CardHeader>
          <CardTitle>{t({ ar: "الاستشارات والحجوزات", en: "Consultations & Bookings" })}</CardTitle>
          <CardDescription>{t({ ar: "مواعيد الجلسات الاستشارية", en: "Consultation session appointments" })}</CardDescription>
        </CardHeader>
        <CardContent>
          {trials.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">{t({ ar: "لا توجد حجوزات سابقة.", en: "No previous bookings." })}</p>
          ) : (
            <div className="space-y-4">
              {trials.map((trial: any) => (
                <div key={trial._id} className="p-4 border border-card-border rounded-lg bg-card group hover:border-primary/50 transition-colors">
                  <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
                    <div>
                      <h3 className="font-bold text-lg">{t({ ar: "جلسة استشارية إستراتيجية", en: "Strategy Consulting Session" })}</h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <Clock className="w-3 h-3" />
                        <span>{t({ ar: "تم الطلب في:", en: "Requested on:" })} {format(new Date(trial.createdAt), "PPP", { locale })}</span>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${trial.status === 'scheduled' || trial.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : trial.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                      {trial.status === 'scheduled' || trial.status === 'confirmed' ? t({ ar: "مؤكد", en: "Confirmed" }) :
                       trial.status === 'cancelled' ? t({ ar: "ملغى", en: "Cancelled" }) :
                       t({ ar: "قيد الانتظار", en: "Pending" })}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {trial.scheduledTime ? (
                      <div className="p-3 bg-primary/5 rounded-md border border-primary/10">
                        <p className="text-xs text-muted-foreground mb-1">{t({ ar: "موعد الجلسة المحجوز:", en: "Booked Session Time:" })}</p>
                        <p className="text-primary font-bold">{format(new Date(trial.scheduledTime), "PPPP p", { locale })}</p>
                      </div>
                    ) : (
                      <div className="p-3 bg-amber-50 rounded-md border border-amber-100">
                        <p className="text-amber-800 text-sm font-medium">{t({ ar: "لم يتم تحديد موعد بعد", en: "No time scheduled yet" })}</p>
                      </div>
                    )}

                    <div className="flex gap-2 items-center justify-end">
                      <Button variant="outline" size="sm" className="h-9" onClick={() => setViewTrialObj(trial)}>
                        <Info className="w-4 h-4 ml-2" />
                        {t({ ar: "التفاصيل", en: "Details" })}
                      </Button>

                      {trial.status !== 'cancelled' && canEditOrCancelTrial(trial.scheduledTime) && (
                        <Button variant="outline" size="sm" className="h-9 border-primary text-primary hover:bg-primary/5" onClick={() => {
                          setRescheduleTrialObj(trial);
                        }}>
                          <Edit2 className="w-4 h-4 ml-2" />
                          {t({ ar: "تعديل", en: "Edit" })}
                        </Button>
                      )}
                    </div>
                  </div>

                  {trial.status !== 'cancelled' && (
                    <div className="mt-4 flex justify-end border-t border-card-border pt-4">
                      {canEditOrCancelTrial(trial.scheduledTime) ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 text-xs text-destructive hover:bg-red-50"
                          onClick={() => setCancelTrialObj(trial)}
                        >
                          {t({ ar: "إلغاء الجلسة", en: "Cancel Consultation" })}
                        </Button>
                      ) : (
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground italic">
                          <AlertCircle className="w-3 h-3" />
                          <span>{t({
                            ar: `لا يمكن الإلغاء/التعديل قبل الموعد بـ ${bookingPolicies.cancelDeadlineHours || 48} ساعة`,
                            en: `Changes not allowed within ${bookingPolicies.cancelDeadlineHours || 48}h of session`
                          })}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CancelDialog
        open={!!cancelTrialObj}
        onOpenChange={(val) => !val && setCancelTrialObj(null)}
        title={t({ ar: "إلغاء الجلسة الاستشارية", en: "Cancel Consultation" })}
        description={t({ ar: "هل أنت متأكد من رغبتك في إلغاء هذا الجلسة؟ يرجى توضيح السبب.", en: "Are you sure you want to cancel this consultation? Please provide a reason." })}
        isPending={cancelTrialMutation.isPending}
        onConfirm={(reason) => cancelTrialMutation.mutate({ id: cancelTrialObj._id, reason })}
      />

      <ConsultationDetailsDialog
        trial={viewTrialObj}
        open={!!viewTrialObj}
        onClose={() => setViewTrialObj(null)}
      />

      <RescheduleDialog
        trial={rescheduleTrialObj}
        open={!!rescheduleTrialObj}
        onClose={() => setRescheduleTrialObj(null)}
        isPending={updateTrialMutation.isPending}
        onConfirm={(slotId, reason) => updateTrialMutation.mutate({ id: rescheduleTrialObj._id, data: { scheduledSlotId: slotId, cancelReason: reason } })}
      />
    </>
  );
}

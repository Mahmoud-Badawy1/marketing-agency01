import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import CancelDialog from "@/features/dashboard/components/CancelDialog";
import ConsultationDetailsDialog from "@/features/dashboard/components/ConsultationDetailsDialog";
import RescheduleDialog from "@/features/dashboard/components/RescheduleDialog";
import { ConsultationCard } from "./ConsultationCard";
import { useConsultations } from "../hooks/useConsultations";

interface ConsultationsTabProps {
  getAuthHeaders: () => { Authorization: string };
  bookingPolicies: any;
}

export default function ConsultationsTab({ getAuthHeaders, bookingPolicies }: ConsultationsTabProps) {
  const { t } = useLanguage();
  const { trials, isLoading, cancelTrialMutation, updateTrialMutation, canEditOrCancel } = useConsultations(getAuthHeaders, bookingPolicies);
  const [cancelTrialObj, setCancelTrialObj] = useState<any>(null);
  const [viewTrialObj, setViewTrialObj] = useState<any>(null);
  const [rescheduleTrialObj, setRescheduleTrialObj] = useState<any>(null);

  if (isLoading) return <div className="py-8 text-center">{t({ ar: "جاري تحميل المواعيد...", en: "Loading sessions..." })}</div>;

  return (
    <>
      {bookingPolicies.warningMessage && (
        <div className="mb-4 bg-amber-50 text-amber-800 p-3 rounded-lg border border-amber-200 flex items-start gap-2 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" /><p>{bookingPolicies.warningMessage}</p>
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
                <ConsultationCard key={trial._id} trial={trial} bookingPolicies={bookingPolicies} canEditOrCancel={canEditOrCancel} onView={setViewTrialObj} onReschedule={setRescheduleTrialObj} onCancel={setCancelTrialObj} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <CancelDialog open={!!cancelTrialObj} onOpenChange={(val) => !val && setCancelTrialObj(null)} title={t({ ar: "إلغاء الجلسة الاستشارية", en: "Cancel Consultation" })} description={t({ ar: "هل أنت متأكد من رغبتك في إلغاء هذا الجلسة؟", en: "Are you sure you want to cancel this consultation?" })} isPending={cancelTrialMutation.isPending} onConfirm={(reason) => cancelTrialMutation.mutate({ id: cancelTrialObj._id, reason })} />
      <ConsultationDetailsDialog trial={viewTrialObj} open={!!viewTrialObj} onClose={() => setViewTrialObj(null)} />
      <RescheduleDialog trial={rescheduleTrialObj} open={!!rescheduleTrialObj} onClose={() => setRescheduleTrialObj(null)} isPending={updateTrialMutation.isPending} onConfirm={(slotId, reason) => updateTrialMutation.mutate({ id: rescheduleTrialObj._id, data: { scheduledSlotId: slotId, cancelReason: reason } })} />
    </>
  );
}

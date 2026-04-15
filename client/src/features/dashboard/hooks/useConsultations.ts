import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";

export function useConsultations(getAuthHeaders: () => { Authorization: string }, bookingPolicies: any) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
      const res = await fetch(`/api/user/trials/${id}/cancel`, { method: "PUT", headers: { ...getAuthHeaders(), "Content-Type": "application/json" }, body: JSON.stringify({ reason }) });
      if (!res.ok) throw new Error("Failed to cancel trial");
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/user/trials"] }); toast({ title: t({ ar: "تم إلغاء الحجز بنجاح", en: "Consultation cancelled successfully" }) }); },
    onError: () => toast({ title: t({ ar: "خطأ", en: "Error" }), description: t({ ar: "فشل في إلغاء الحجز", en: "Failed to cancel consultation" }), variant: "destructive" }),
  });

  const updateTrialMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await fetch(`/api/user/trials/${id}`, { method: "PUT", headers: { ...getAuthHeaders(), "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) { const errData = await res.json(); throw new Error(errData.message || "Failed to update trial"); }
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/user/trials"] }); toast({ title: t({ ar: "تم تحديث الموعد بنجاح", en: "Meeting rescheduled successfully" }) }); },
    onError: (error: Error) => toast({ title: t({ ar: "خطأ", en: "Error" }), description: error.message, variant: "destructive" }),
  });

  const canEditOrCancel = (scheduledTime: any) => {
    if (!scheduledTime) return true;
    const diffHours = (new Date(scheduledTime).getTime() - Date.now()) / (1000 * 60 * 60);
    return diffHours >= (bookingPolicies.cancelDeadlineHours || 48);
  };

  return { trials, isLoading, cancelTrialMutation, updateTrialMutation, canEditOrCancel };
}

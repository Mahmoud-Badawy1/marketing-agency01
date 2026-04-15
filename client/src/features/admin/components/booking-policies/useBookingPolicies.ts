import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { adminFetch } from "@/lib/admin";
import { useToast } from "@/hooks/use-toast";

export function useBookingPolicies() {
  const { toast } = useToast();
  const [cancelHours, setCancelHours] = useState(48);
  const [editHours, setEditHours] = useState(24);
  const [warningMessage, setWarningMessage] = useState("يمكنك إلغاء الحجز أو التعديل عليه ضمن المهلة المحددة للسياسة.");

  const { data: settings = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/settings"],
    queryFn: async () => {
      const res = await adminFetch("/api/admin/settings");
      if (!res.ok) throw new Error("Failed to fetch settings");
      return res.json();
    },
  });

  useEffect(() => {
    if (!Array.isArray(settings)) return;
    const policy = settings.find((s: any) => s.key === "booking_policies")?.value;
    if (policy) {
      setCancelHours(policy.cancelDeadlineHours || 48);
      setEditHours(policy.editDeadlineHours || 24);
      setWarningMessage(policy.warningMessage || warningMessage);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  const mutation = useMutation({
    mutationFn: async (val: any) => {
      const res = await adminFetch("/api/admin/settings", { method: "PUT", body: JSON.stringify({ key: "booking_policies", value: val }) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({ title: "تم الحفظ بنجاح" });
    },
  });

  return { cancelHours, setCancelHours, editHours, setEditHours, warningMessage, setWarningMessage, isLoading, save: () => mutation.mutate({ cancelDeadlineHours: cancelHours, editDeadlineHours: editHours, warningMessage }), isPending: mutation.isPending };
}

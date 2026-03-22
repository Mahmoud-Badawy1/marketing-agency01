import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { adminFetch } from "@/lib/admin";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function BookingPoliciesTab() {
  const { toast } = useToast();
  
  const [cancelHours, setCancelHours] = useState<number>(48);
  const [editHours, setEditHours] = useState<number>(24);
  const [warningMessage, setWarningMessage] = useState<string>("يمكنك إلغاء الحجز أو التعديل عليه ضمن المهلة المحددة للسياسة. يرجى مراجعة الشروط والأحكام الخاصة بنا لمزيد من التفاصيل.");

  const { data: settings = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/settings"],
    queryFn: async () => {
      const res = await adminFetch("/api/admin/settings");
      if (!res.ok) throw new Error("Failed to fetch settings");
      return res.json();
    },
  });

  useEffect(() => {
    if (settings && settings.length > 0) {
      const policySetting = settings.find((s: any) => s.key === "booking_policies");
      if (policySetting && policySetting.value) {
        setCancelHours(policySetting.value.cancelDeadlineHours || 48);
        setEditHours(policySetting.value.editDeadlineHours || 24);
        setWarningMessage(policySetting.value.warningMessage || "يمكنك إلغاء الحجز أو التعديل عليه ضمن المهلة المحددة للسياسة. يرجى مراجعة الشروط والأحكام الخاصة بنا لمزيد من التفاصيل.");
      }
    }
  }, [settings]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (payload: { key: string; value: any }) => {
      const res = await adminFetch("/api/admin/settings", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update setting");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] }); // Invalid public caches too
      toast({ title: "تم حفظ سياسة الحجوزات بنجاح" });
    },
    onError: () => {
      toast({ title: "خطأ", description: "فشل في حفظ السياسة", variant: "destructive" });
    },
  });

  const handleSave = () => {
    updateSettingsMutation.mutate({
      key: "booking_policies",
      value: {
        cancelDeadlineHours: cancelHours,
        editDeadlineHours: editHours,
        warningMessage: warningMessage
      }
    });
  };

  if (isLoading) {
    return <div className="py-8 text-center text-muted-foreground">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-muted/30 p-4 rounded-lg border space-y-2">
        <h3 className="text-lg font-semibold text-primary">سياسة الإلغاء والتعديل</h3>
        <p className="text-sm text-muted-foreground">
          هنا يمكنك تحديد القواعد التي يتم على أساسها السماح للعميل بإلغاء اشتراكه أو تعديله من خلال لوحة التحكم الخاصة به.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="font-semibold text-base">مهلة الإلغاء (بالساعات)</Label>
          <p className="text-xs text-muted-foreground mb-2">عدد الساعات المسموح خلالها للعميل بإلغاء الطلب بعد الدفع/التأكيد.</p>
          <Input 
            type="number" 
            min="0"
            value={cancelHours}
            onChange={(e) => setCancelHours(Number(e.target.value))}
            className="max-w-[200px]"
          />
        </div>

        <div className="space-y-2">
          <Label className="font-semibold text-base">مهلة التعديل (بالساعات)</Label>
          <p className="text-xs text-muted-foreground mb-2">عدد الساعات المسموح خلالها للعميل بتعديل بيانات الطلب.</p>
          <Input 
            type="number" 
            min="0"
            value={editHours}
            onChange={(e) => setEditHours(Number(e.target.value))}
            className="max-w-[200px]"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="font-semibold text-base">رسالة التنبيه في صفحة العميل</Label>
        <p className="text-xs text-muted-foreground mb-2">هذه الرسالة ستظهر للعملاء في لوحة التحكم الخاصة بهم بجانب طلباتهم.</p>
        <Textarea 
          rows={4}
          value={warningMessage}
          onChange={(e) => setWarningMessage(e.target.value)}
        />
      </div>

      <div className="pt-4 border-t">
        <Button 
          onClick={handleSave} 
          disabled={updateSettingsMutation.isPending}
        >
          {updateSettingsMutation.isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
        </Button>
      </div>
    </div>
  );
}

import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Label } from "@/components/atoms/Label";
import { Textarea } from "@/components/atoms/Textarea";
import { useBookingPolicies } from "./useBookingPolicies";

export function BookingPoliciesTab() {
  const b = useBookingPolicies();

  if (b.isLoading) return <div className="py-8 text-center text-muted-foreground">جاري التحميل...</div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-muted/30 p-4 rounded-lg border space-y-2">
        <h3 className="text-lg font-semibold text-primary">سياسة الإلغاء والتعديل</h3>
        <p className="text-sm">تعديل القواعد التي يتم على أساسها السماح للعميل بإلغاء الحجز أو التعديل عليه.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="font-semibold text-base">مهلة الإلغاء (بالساعات)</Label>
          <Input type="number" min="0" value={b.cancelHours} onChange={(e) => b.setCancelHours(Number(e.target.value))} className="max-w-[200px]" />
        </div>
        <div className="space-y-2">
          <Label className="font-semibold text-base">مهلة التعديل (بالساعات)</Label>
          <Input type="number" min="0" value={b.editHours} onChange={(e) => b.setEditHours(Number(e.target.value))} className="max-w-[200px]" />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="font-semibold text-base">رسالة التنبيه في صفحة العميل</Label>
        <Textarea rows={4} value={b.warningMessage} onChange={(e) => b.setWarningMessage(e.target.value)} />
      </div>

      <div className="pt-4 border-t">
        <Button onClick={b.save} disabled={b.isPending}>{b.isPending ? "جاري الحفظ..." : "حفظ التغييرات"}</Button>
      </div>
    </div>
  );
}

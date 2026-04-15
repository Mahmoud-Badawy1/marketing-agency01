import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/atoms/Button";
import { Label } from "@/components/atoms/Label";
import { Input } from "@/components/atoms/Input";

export function OrderEditPlanDialog({ newPlan, setNewPlan, newAmount, setNewAmount, onConfirm, isPending, onCancel }: any) {
  return (
    <DialogContent dir="rtl">
      <DialogHeader><DialogTitle>ترقية / تعديل الباقة</DialogTitle></DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2"><Label>اسم الباقة الجديدة</Label><Input value={newPlan} onChange={e => setNewPlan(e.target.value)} /></div>
        <div className="space-y-2"><Label>المبلغ الجديد</Label><Input type="number" value={newAmount} onChange={e => setNewAmount(e.target.value === "" ? "" : Number(e.target.value))} /></div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onCancel}>تراجع</Button>
          <Button disabled={!newPlan.trim() || newAmount === "" || isPending} onClick={onConfirm}>حفظ التعديلات</Button>
        </DialogFooter>
      </div>
    </DialogContent>
  );
}

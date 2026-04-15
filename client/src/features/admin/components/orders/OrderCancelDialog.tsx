import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/atoms/Button";
import { Label } from "@/components/atoms/Label";
import { Textarea } from "@/components/atoms/Textarea";

export function OrderCancelDialog({ cancelReason, setCancelReason, onConfirm, isPending, onCancel }: any) {
  return (
    <DialogContent dir="rtl">
      <DialogHeader><DialogTitle>إلغاء الطلب</DialogTitle></DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label>سبب الإلغاء الشائع للعميل وللإدارة</Label>
          <Textarea value={cancelReason} onChange={e => setCancelReason(e.target.value)} placeholder="اذكر السبب..." rows={4} />
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onCancel}>تراجع</Button>
          <Button variant="destructive" disabled={!cancelReason.trim() || isPending} onClick={onConfirm}>تأكيد الإلغاء</Button>
        </DialogFooter>
      </div>
    </DialogContent>
  );
}

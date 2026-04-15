import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/atoms/Button";
import { Label } from "@/components/atoms/Label";
import { Textarea } from "@/components/atoms/Textarea";

export function TrialCancelDialog({ booking, cancelReason, setCancelReason, onConfirm, isPending, onCancel }: any) {
  return (
    <DialogContent className="max-w-md" dir="rtl">
      <DialogHeader><DialogTitle>إلغاء الاستشارة</DialogTitle></DialogHeader>
      <div className="space-y-4 py-4">
        <p className="text-sm text-muted-foreground">هل أنت متأكد من إلغاء هذه الاستشارة؟ سيتم تغيير حالتها إلى "ملغى".</p>
        <div className="space-y-2">
          <Label>سبب الإلغاء (اختياري)</Label>
          <Textarea placeholder="طلب العميل / عدم التفرغ..." value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} rows={3} />
        </div>
      </div>
      <DialogFooter className="gap-2">
        <Button variant="outline" onClick={onCancel}>تراجع</Button>
        <Button variant="destructive" disabled={isPending} onClick={onConfirm}>تأكيد الإلغاء</Button>
      </DialogFooter>
    </DialogContent>
  );
}

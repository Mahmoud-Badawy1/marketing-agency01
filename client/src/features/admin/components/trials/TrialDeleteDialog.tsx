import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/atoms/Button";

export function TrialDeleteDialog({ booking, onConfirm, isPending, onCancel }: any) {
  return (
    <DialogContent className="max-w-md" dir="rtl">
      <DialogHeader><DialogTitle>حذف الاستشارة بالكامل</DialogTitle></DialogHeader>
      <div className="py-4">
        <p className="text-sm text-destructive font-bold mb-2">تحذير: هذا الإجراء لا يمكن التراجع عنه.</p>
        <p className="text-sm text-muted-foreground">سيتم إزالة الاستشارة الخاصة بـ "{booking?.clientName}" نهائياً.</p>
      </div>
      <DialogFooter className="gap-2">
        <Button variant="outline" onClick={onCancel}>تراجع</Button>
        <Button variant="destructive" disabled={isPending} onClick={onConfirm}>تأكيد الحذف</Button>
      </DialogFooter>
    </DialogContent>
  );
}

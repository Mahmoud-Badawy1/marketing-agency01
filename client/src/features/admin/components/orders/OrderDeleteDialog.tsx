import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/atoms/Button";
import { AlertTriangle } from "lucide-react";

interface OrderDeleteDialogProps {
  isPending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function OrderDeleteDialog({ isPending, onCancel, onConfirm }: OrderDeleteDialogProps) {
  return (
    <DialogContent dir="rtl">
      <DialogHeader>
        <DialogTitle className="text-destructive flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" /> تأكيد الحذف النهائي
        </DialogTitle>
        <DialogDescription className="pt-4 text-base">
          هل أنت متأكد من حذف هذا الطلب نهائياً؟ هذا الإجراء لا يمكن التراجع عنه وسيتم مسح الطلب وكافة بياناته من قاعدة البيانات بشكل كامل.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter className="gap-2 sm:justify-start">
        <Button variant="destructive" onClick={onConfirm} disabled={isPending}>
          {isPending ? "جاري الحذف..." : "نعم، احذف الطلب"}
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={isPending}>
          إلغاء التراجع
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

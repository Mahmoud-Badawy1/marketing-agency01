import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Label } from "@/components/atoms/Label";
import { Textarea } from "@/components/atoms/Textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "lucide-react";

export function TrialEditDialog({ editingBooking, editForm, setEditForm, onUpdate, isPending, onCancel }: any) {
  return (
    <DialogContent className="max-w-md" dir="rtl">
      <DialogHeader><DialogTitle>تعديل بيانات الاستشارة</DialogTitle></DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label>حالة الاستشارة</Label>
          <Select value={editForm.status} onValueChange={(val) => setEditForm({ ...editForm, status: val })}>
            <SelectTrigger><SelectValue placeholder="اختر الحالة" /></SelectTrigger>
            <SelectContent dir="rtl">
              <SelectItem value="pending">قيد الانتظار</SelectItem>
              <SelectItem value="confirmed">مؤكد</SelectItem>
              <SelectItem value="scheduled">تمت الجدولة</SelectItem>
              <SelectItem value="cancelled">ملغى</SelectItem>
              <SelectItem value="rejected">مرفوض</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>موعد الاجتماع</Label>
          <div className="relative">
            <Input type="datetime-local" value={editForm.scheduledTime} onChange={(e) => setEditForm({ ...editForm, scheduledTime: e.target.value })} className="pr-10" />
            <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        <div className="space-y-2">
          <Label>رابط الاجتماع</Label>
          <Input placeholder="https://..." value={editForm.meetingLink} onChange={(e) => setEditForm({ ...editForm, meetingLink: e.target.value })} dir="ltr" />
        </div>
        <div className="space-y-2">
          <Label>ملاحظات إضافية (للمسؤول)</Label>
          <Textarea placeholder="أضف أي ملاحظات هنا..." value={editForm.adminNotes} onChange={(e) => setEditForm({ ...editForm, adminNotes: e.target.value })} rows={3} />
        </div>
      </div>
      <DialogFooter className="gap-2">
        <Button variant="outline" onClick={onCancel}>إلغاء</Button>
        <Button onClick={onUpdate} disabled={isPending}>{isPending ? "حفظ..." : "حفظ التعديلات"}</Button>
      </DialogFooter>
    </DialogContent>
  );
}

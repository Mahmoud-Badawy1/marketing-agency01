import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Label } from "@/components/atoms/Label";
import { Tag } from "lucide-react";
import { format } from "date-fns";
import type { AvailabilitySlotType } from "@shared/schema";

interface EditSlotDialogProps {
  editingSlot: AvailabilitySlotType | null;
  setEditingSlot: (slot: AvailabilitySlotType | null) => void;
  seriesAction: "item" | "series";
  setSeriesAction: (action: "item" | "series") => void;
  onUpdate: (payload: any) => void;
  isPending: boolean;
  initialStartTime: string | null;
}

export function EditSlotDialog({
  editingSlot,
  setEditingSlot,
  seriesAction,
  setSeriesAction,
  onUpdate,
  isPending,
  initialStartTime
}: EditSlotDialogProps) {
  if (!editingSlot) return null;

  return (
    <Dialog open={!!editingSlot} onOpenChange={(open) => !open && setEditingSlot(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>تعديل الموعد</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {!editingSlot.recurrenceId && (
            <div className="space-y-2">
              <Label>تاريخ الموعد</Label>
              <Input 
                type="date" 
                defaultValue={format(new Date(editingSlot.date), "yyyy-MM-dd")}
                onChange={(e) => setEditingSlot({...editingSlot, date: e.target.value})}
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Tag className="h-3 w-3" />
              المسمى أو الموظف (اختياري)
            </Label>
            <Input 
              defaultValue={editingSlot.label || ""}
              onChange={(e) => setEditingSlot({...editingSlot, label: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>وقت البداية</Label>
              <Input 
                type="time" 
                defaultValue={editingSlot.startTime}
                onChange={(e) => setEditingSlot({...editingSlot, startTime: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>وقت النهاية</Label>
              <Input 
                type="time" 
                defaultValue={editingSlot.endTime}
                onChange={(e) => setEditingSlot({...editingSlot, endTime: e.target.value})}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>السعة</Label>
            <Input 
              type="number" 
              min="1" 
              defaultValue={editingSlot.capacity}
              onChange={(e) => setEditingSlot({...editingSlot, capacity: parseInt(e.target.value)})}
            />
          </div>
          
          {editingSlot.recurrenceId && (
            <div className="bg-primary/5 p-3 rounded-md space-y-3 border border-primary/20 mt-4">
              <Label className="text-primary font-bold block mb-2">تسلسل التعديل</Label>
              <p className="text-xs text-muted-foreground mb-3">حدد نطاق الحفظ لهذه البيانات، هل تسري على هذا اليوم فقط أم نعممها؟</p>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="seriesAction" 
                    checked={seriesAction === "item"} 
                    onChange={() => setSeriesAction("item")}
                  />
                  <span className="text-sm">تطبيق وحفظ بشكل استثنائي (اليوم فقط)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="seriesAction" 
                    checked={seriesAction === "series"} 
                    onChange={() => setSeriesAction("series")}
                  />
                  <span className="text-sm">تطبيق إجباري على كل أيام هذه السلسلة</span>
                </label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              onClick={() => {
                const payload: any = {
                  startTime: editingSlot.startTime,
                  endTime: editingSlot.endTime,
                  capacity: editingSlot.capacity,
                  isActive: editingSlot.isActive,
                  label: editingSlot.label || ""
                };
                
                if (seriesAction === "item" || !editingSlot.recurrenceId) {
                  payload.date = editingSlot.date;
                }

                onUpdate({ 
                  id: editingSlot._id, 
                  data: payload,
                  isSeries: seriesAction === "series",
                  originalStartTime: initialStartTime || undefined
                });
              }}
              disabled={isPending}
            >
              {isPending ? "جاري الحفظ..." : "تأكيد واستمرار"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

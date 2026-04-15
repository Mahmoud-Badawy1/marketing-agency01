import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Label } from "@/components/atoms/Label";
import { Tag } from "lucide-react";
import { NewSlot } from "./calendar.types";

interface AddSlotDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  newSlot: NewSlot;
  setNewSlot: React.Dispatch<React.SetStateAction<NewSlot>>;
  onAdd: (e: React.FormEvent) => void;
  isPending: boolean;
}

export function AddSlotDialog({
  isOpen,
  onOpenChange,
  newSlot,
  setNewSlot,
  onAdd,
  isPending
}: AddSlotDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby="add-slot-description">
        <DialogHeader>
          <DialogTitle>إضافة موعد متاح</DialogTitle>
          <p id="add-slot-description" className="text-sm text-muted-foreground">
            حدد التاريخ والوقت والسعة لإضافة موعد فردي ومخصص.
          </p>
        </DialogHeader>
        <form onSubmit={onAdd} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>تاريخ الموعد</Label>
            <Input 
              type="date" 
              value={newSlot.date} 
              onChange={(e) => setNewSlot(p => ({ ...p, date: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Tag className="h-3 w-3" />
              الاسم / المسمى (اختياري)
            </Label>
            <Input 
              placeholder="سيظهر هذا الاسم لتسهيل الانتباه للمواعيد"
              value={newSlot.label} 
              onChange={(e) => setNewSlot(p => ({ ...p, label: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>وقت البداية</Label>
              <Input 
                type="time" 
                value={newSlot.startTime} 
                onChange={(e) => setNewSlot(p => ({ ...p, startTime: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>وقت النهاية</Label>
              <Input 
                type="time" 
                value={newSlot.endTime} 
                onChange={(e) => setNewSlot(p => ({ ...p, endTime: e.target.value }))}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>السعة (الحد الأقصى للمراجعين)</Label>
            <Input 
              type="number" 
              min="1" 
              value={newSlot.capacity} 
              onChange={(e) => setNewSlot(p => ({ ...p, capacity: parseInt(e.target.value) }))}
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "جاري الإضافة..." : "حفظ الموعد"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Label } from "@/components/atoms/Label";
import { Checkbox } from "@/components/atoms/Checkbox";
import { Tag } from "lucide-react";
import { BulkConfig, daysMap } from "./calendar.types";

interface BulkAddDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  config: BulkConfig;
  setConfig: React.Dispatch<React.SetStateAction<BulkConfig>>;
  onAdd: (e: React.FormEvent) => void;
  isPending: boolean;
}

export function BulkAddDialog({
  isOpen,
  onOpenChange,
  config,
  setConfig,
  onAdd,
  isPending
}: BulkAddDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>توليد مواعيد تلقائياً</DialogTitle>
        </DialogHeader>
        <form onSubmit={onAdd} className="space-y-6 py-4">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold border-b pb-2">نطاق التواريخ والأيام</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>من تاريخ</Label>
                <Input type="date" value={config.startDate} onChange={e => setConfig(p => ({ ...p, startDate: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label>إلى تاريخ</Label>
                <Input type="date" value={config.endDate} onChange={e => setConfig(p => ({ ...p, endDate: e.target.value }))} required />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>الأيام المشمولة في النطاق</Label>
              <div className="flex flex-wrap gap-3 p-3 bg-muted/20 rounded-lg border border-border/50">
                {daysMap.map(day => (
                  <label key={day.id} className="flex items-center gap-2 cursor-pointer text-sm">
                    <Checkbox 
                      checked={config.daysOfWeek.includes(day.id)}
                      onCheckedChange={(checked) => {
                        setConfig(p => ({
                          ...p,
                          daysOfWeek: checked 
                            ? [...p.daysOfWeek, day.id]
                            : p.daysOfWeek.filter(d => d !== day.id)
                        }))
                      }}
                    />
                    {day.label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold border-b pb-2">تفاصيل الموعد لكل يوم</h3>
            
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Tag className="h-3 w-3" />
                الاسم / المسمى (اختياري)
              </Label>
              <Input 
                placeholder="مثال: أستاذ أحمد، قسم المبيعات..."
                value={config.label} 
                onChange={e => setConfig(p => ({ ...p, label: e.target.value }))} 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>بداية العمل اليومي</Label>
                <Input type="time" value={config.startTime} onChange={e => setConfig(p => ({ ...p, startTime: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label>نهاية العمل اليومي</Label>
                <Input type="time" value={config.endTime} onChange={e => setConfig(p => ({ ...p, endTime: e.target.value }))} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>سعة الزوار لكل موعد</Label>
                <Input type="number" min="1" value={config.capacity} onChange={e => setConfig(p => ({ ...p, capacity: parseInt(e.target.value) }))} required />
              </div>
              <div className="space-y-2">
                <Label>مدة كل توقيت (بالدقائق)</Label>
                <Input type="number" min="5" step="5" value={config.duration} onChange={e => setConfig(p => ({ ...p, duration: parseInt(e.target.value) }))} required />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? "جاري التوليد..." : "توليد المواعيد"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

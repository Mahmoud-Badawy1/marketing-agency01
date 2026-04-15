import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Label } from "@/components/atoms/Label";
import { Checkbox } from "@/components/atoms/Checkbox";
import { BulkEditConfig } from "./calendar.types";

interface BulkEditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  config: BulkEditConfig;
  setConfig: React.Dispatch<React.SetStateAction<BulkEditConfig>>;
  onUpdate: () => void;
  isPending: boolean;
}

export function BulkEditDialog({
  isOpen,
  onOpenChange,
  selectedCount,
  config,
  setConfig,
  onUpdate,
  isPending
}: BulkEditDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>تعديل سريع متعدد ({selectedCount} مواعيد)</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-xs text-muted-foreground">أدخل فقط الحقول التي ترغب في تغييرها لجميع المواعيد المحددة دون المساس بأوقاتها وتواريخها.</p>
          
          <div className="space-y-2">
            <Label>المسمى الوظيفي أو التسمية</Label>
            <Input 
              placeholder="تغيير المسمى الدلالي (يترك فارغاً للنسيان)..."
              value={config.label || ""}
              onChange={(e) => setConfig(p => ({ ...p, label: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label>السعة (العدد المتاح لكل موعد)</Label>
            <Input 
              type="number" 
              min="1" 
              placeholder="تغيير السعة الاستيعابية..."
              value={config.capacity || ""}
              onChange={(e) => setConfig(p => ({ ...p, capacity: e.target.value ? parseInt(e.target.value) : undefined }))}
            />
          </div>

          <div className="flex items-center gap-2 mt-4">
            <Checkbox 
              id="bulk-active-toggle"
              checked={config.isActive === true}
              onCheckedChange={(checked) => {
                if (checked === true) setConfig(p => ({ ...p, isActive: true }));
                else setConfig(p => ({ ...p, isActive: undefined }));
              }}
            />
            <Label htmlFor="bulk-active-toggle" className="cursor-pointer">تفعيل جميع المواعيد المحددة (سحب الإيقاف المؤقت)</Label>
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => onOpenChange(false)}>إلغاء</Button>
            <Button 
              onClick={onUpdate}
              disabled={isPending}
            >
              {isPending ? "جاري التحديث..." : "تطبيق التعديلات السريعة"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

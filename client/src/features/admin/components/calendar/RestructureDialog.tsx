import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Label } from "@/components/atoms/Label";
import { CheckCircle2 } from "lucide-react";
import { RestructureConfig } from "./calendar.types";

interface RestructureDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  config: RestructureConfig;
  setConfig: React.Dispatch<React.SetStateAction<RestructureConfig>>;
  onRestructure: () => void;
  isPending: boolean;
}

export function RestructureDialog({
  isOpen,
  onOpenChange,
  config,
  setConfig,
  onRestructure,
  isPending
}: RestructureDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>إعادة هيكلة الأوقات (Smart Adjust)</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="bg-primary/5 p-4 rounded-lg border border-primary/20 text-xs space-y-2">
            <p className="font-bold text-primary flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              تعديل ذكي وآمن
            </p>
            <p className="text-muted-foreground leading-relaxed">
              هذه العملية ستقوم بتحديث المواعيد القائمة في الأيام المحددة لتناسب التقسيم الجديد (مثلاً تحويلها من 30 دقيقة إلى 45 دقيقة).
            </p>
            <p className="text-muted-foreground">
              النظام سيقوم بـ <strong>تحديث</strong> المواعيد الحالية بالترتيب، مما يحافظ على المسميات والحجوزات بقدر الإمكان. سيتم حذف المواعيد الزائدة فقط في نهاية اليوم.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>الدوام يبدأ في:</Label>
              <Input 
                type="time" 
                value={config.startTime}
                onChange={(e) => setConfig(p => ({ ...p, startTime: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>الدوام ينتهي في:</Label>
              <Input 
                type="time" 
                value={config.endTime}
                onChange={(e) => setConfig(p => ({ ...p, endTime: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>المدة الجديدة (بالدقائق)</Label>
              <Input 
                type="number" 
                min="5" 
                step="5"
                value={config.duration}
                onChange={(e) => setConfig(p => ({ ...p, duration: parseInt(e.target.value) || 45 }))}
              />
            </div>
            <div className="space-y-2">
              <Label>السعة لكل جلسة</Label>
              <Input 
                type="number" 
                min="1" 
                value={config.capacity}
                onChange={(e) => setConfig(p => ({ ...p, capacity: parseInt(e.target.value) || 1 }))}
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => onOpenChange(false)}>إلغاء الأمر</Button>
            <Button 
              variant="default"
              onClick={onRestructure}
              disabled={isPending}
            >
              {isPending ? "جاري المزامنة الذكية..." : "تأكيد التحديث الذكي"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

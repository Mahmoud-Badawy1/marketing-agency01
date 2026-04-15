import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Label } from "@/components/atoms/Label";
import { Switch } from "@/components/atoms/Switch";
import { BilingualInput } from "../settings/BilingualInput";
import {
  CouponFormData,
  EMPTY_FORM,
  generateCouponCode,
} from "./useCouponsData";
import type { CouponType } from "@shared/schema";

interface CouponFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingCoupon: CouponType | null;
  form: CouponFormData;
  setForm: React.Dispatch<React.SetStateAction<CouponFormData>>;
  availablePlans: { id: string; name: string }[];
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
}

export function CouponFormDialog({
  isOpen,
  onOpenChange,
  editingCoupon,
  form,
  setForm,
  availablePlans,
  onSubmit,
  isPending,
}: CouponFormDialogProps) {
  const togglePlan = (planId: string) => {
    setForm((prev) => ({
      ...prev,
      applicablePlans: prev.applicablePlans.includes(planId)
        ? prev.applicablePlans.filter((p) => p !== planId)
        : [...prev.applicablePlans, planId],
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingCoupon ? "تعديل الكوبون" : "إنشاء كوبون جديد"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label>كود الخصم</Label>
            <div className="flex gap-2">
              <Input
                value={form.code}
                onChange={(e) =>
                  setForm({ ...form, code: e.target.value.toUpperCase() })
                }
                placeholder="SUMMER25"
                dir="ltr"
                className="flex-1 font-mono"
                required
              />
              {!editingCoupon && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setForm({ ...form, code: generateCouponCode() })
                  }
                >
                  توليد
                </Button>
              )}
            </div>
          </div>
          <BilingualInput
            label="الوصف (اختياري)"
            value={form.description}
            onChange={(v) => setForm({ ...form, description: v })}
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-2 block">نوع الخصم</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={
                    form.discountType === "percentage" ? "default" : "outline"
                  }
                  className="flex-1"
                  onClick={() =>
                    setForm({ ...form, discountType: "percentage" })
                  }
                >
                  نسبة %
                </Button>
                <Button
                  type="button"
                  variant={
                    form.discountType === "fixed" ? "default" : "outline"
                  }
                  className="flex-1"
                  onClick={() => setForm({ ...form, discountType: "fixed" })}
                >
                  مبلغ ج.م
                </Button>
              </div>
            </div>
            <div>
              <Label>قيمة الخصم</Label>
              <Input
                type="number"
                step="0.1"
                value={form.discountValue}
                onChange={(e) =>
                  setForm({
                    ...form,
                    discountValue: parseFloat(e.target.value) || 0,
                  })
                }
                dir="ltr"
                required
              />
            </div>
          </div>
          <div>
            <Label>الباقات المستهدفة</Label>
            <div className="flex gap-2 flex-wrap">
              {availablePlans.map((plan) => (
                <Button
                  key={plan.id}
                  type="button"
                  variant={
                    form.applicablePlans.includes(plan.id)
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => togglePlan(plan.id)}
                >
                  {plan.name}
                </Button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>تاريخ البداية</Label>
              <Input
                type="datetime-local"
                value={form.startDate}
                onChange={(e) =>
                  setForm({ ...form, startDate: e.target.value })
                }
                dir="ltr"
              />
            </div>
            <div>
              <Label>تاريخ النهاية</Label>
              <Input
                type="datetime-local"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                dir="ltr"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>الحد الكلي</Label>
              <Input
                type="number"
                min={0}
                value={form.maxTotalUses}
                onChange={(e) =>
                  setForm({
                    ...form,
                    maxTotalUses: parseInt(e.target.value) || 0,
                  })
                }
                dir="ltr"
              />
            </div>
            <div>
              <Label>حد العميل</Label>
              <Input
                type="number"
                min={0}
                value={form.maxUsesPerCustomer}
                onChange={(e) =>
                  setForm({
                    ...form,
                    maxUsesPerCustomer: parseInt(e.target.value) || 0,
                  })
                }
                dir="ltr"
              />
            </div>
            <div>
              <Label>حد المشاريع</Label>
              <Input
                type="number"
                min={0}
                value={form.maxSeats}
                onChange={(e) =>
                  setForm({ ...form, maxSeats: parseInt(e.target.value) || 0 })
                }
                dir="ltr"
              />
            </div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-md border">
            <Label>مفعّل</Label>
            <Switch
              checked={form.isActive}
              onCheckedChange={(val) => setForm({ ...form, isActive: val })}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending
              ? "جارٍ الحفظ..."
              : editingCoupon
                ? "تحديث الكوبون"
                : "إنشاء الكوبون"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

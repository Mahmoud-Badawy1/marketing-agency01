import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { adminFetch } from "@/lib/admin";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Copy, Tag, Clock, Users, Ticket, TrendingUp, ChevronDown, ChevronUp } from "lucide-react";
import { BilingualInput } from "../settings/BilingualInput";
import type { CouponType } from "@shared/schema";
import { useSmartSearch } from "@/hooks/use-smart-search";
import { exportToExcel } from "@/hooks/use-excel-export";
import { AdminSearchBar } from "../AdminSearchBar";
import { ExportButton } from "../ExportButton";
import { formatDate } from "../utils/formatters";

interface CouponFormData {
  code: string;
  description: { ar: string, en: string };
  discountType: "percentage" | "fixed";
  discountValue: number;
  applicablePlans: string[];
  startDate: string;
  endDate: string;
  maxTotalUses: number;
  maxUsesPerCustomer: number;
  maxSeats: number;
  isActive: boolean;
}

const EMPTY_FORM: CouponFormData = {
  code: "",
  description: { ar: "", en: "" },
  discountType: "percentage",
  discountValue: 10,
  applicablePlans: [],
  startDate: "",
  endDate: "",
  maxTotalUses: 0,
  maxUsesPerCustomer: 0,
  maxSeats: 0,
  isActive: true,
};

function generateCouponCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function CouponsTab() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponType | null>(null);
  const [form, setForm] = useState<CouponFormData>(EMPTY_FORM);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: coupons = [], isLoading } = useQuery<CouponType[]>({
    queryKey: ["/api/admin/coupons"],
    queryFn: async () => {
      const res = await adminFetch("/api/admin/coupons");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  // Get dynamic plans from settings for plan targeting UI
  const { data: settings } = useQuery<Record<string, any>>({
    queryKey: ["/api/admin/settings"],
    queryFn: async () => {
      const res = await adminFetch("/api/admin/settings");
      if (!res.ok) return [];
      const arr = await res.json();
      return arr.reduce((acc: any, s: any) => { acc[s.key] = s.value; return acc; }, {});
    },
  });

  const availablePlans: { id: string; name: string }[] = settings?.plans?.map((p: any) => ({
    id: p.id,
    name: p.name,
  })) || [
    { id: "monthly", name: "الباقة الشهرية" },
    { id: "genius", name: "باقة النخبة (إدارة متكاملة)" },
  ];

  const createMutation = useMutation({
    mutationFn: async (data: CouponFormData) => {
      const res = await adminFetch("/api/admin/coupons", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          discountValue: Number(data.discountValue),
          maxTotalUses: Number(data.maxTotalUses),
          maxUsesPerCustomer: Number(data.maxUsesPerCustomer),
          maxSeats: Number(data.maxSeats),
          startDate: data.startDate || undefined,
          endDate: data.endDate || undefined,
          applicablePlans: data.applicablePlans.length > 0 ? data.applicablePlans : [],
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "خطأ في إنشاء الكوبون");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coupons"] });
      toast({ title: "تم إنشاء الكوبون بنجاح" });
      setDialogOpen(false);
      setForm(EMPTY_FORM);
    },
    onError: (err: Error) => {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CouponFormData> }) => {
      const res = await adminFetch(`/api/admin/coupons/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          ...data,
          discountValue: data.discountValue !== undefined ? Number(data.discountValue) : undefined,
          maxTotalUses: data.maxTotalUses !== undefined ? Number(data.maxTotalUses) : undefined,
          maxUsesPerCustomer: data.maxUsesPerCustomer !== undefined ? Number(data.maxUsesPerCustomer) : undefined,
          maxSeats: data.maxSeats !== undefined ? Number(data.maxSeats) : undefined,
          startDate: data.startDate || undefined,
          endDate: data.endDate || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "خطأ في تحديث الكوبون");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coupons"] });
      toast({ title: "تم تحديث الكوبون بنجاح" });
      setDialogOpen(false);
      setEditingCoupon(null);
      setForm(EMPTY_FORM);
    },
    onError: (err: Error) => {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await adminFetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("خطأ في حذف الكوبون");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coupons"] });
      toast({ title: "تم حذف الكوبون" });
    },
    onError: () => {
      toast({ title: "خطأ", description: "فشل حذف الكوبون", variant: "destructive" });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await adminFetch(`/api/admin/coupons/${id}`, {
        method: "PUT",
        body: JSON.stringify({ isActive }),
      });
      if (!res.ok) throw new Error();
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coupons"] });
    },
  });

  const openCreate = () => {
    setEditingCoupon(null);
    setForm({ ...EMPTY_FORM, code: generateCouponCode() });
    setDialogOpen(true);
  };

  const openEdit = (coupon: CouponType) => {
    setEditingCoupon(coupon);
    setForm({
      code: coupon.code,
      description: typeof coupon.description === 'string' ? { ar: coupon.description, en: coupon.description } : (coupon.description || { ar: "", en: "" }),
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      applicablePlans: coupon.applicablePlans || [],
      startDate: coupon.startDate ? new Date(coupon.startDate).toISOString().slice(0, 16) : "",
      endDate: coupon.endDate ? new Date(coupon.endDate).toISOString().slice(0, 16) : "",
      maxTotalUses: coupon.maxTotalUses,
      maxUsesPerCustomer: coupon.maxUsesPerCustomer,
      maxSeats: coupon.maxSeats,
      isActive: coupon.isActive,
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCoupon) {
      updateMutation.mutate({ id: editingCoupon._id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "تم نسخ الكود", description: code });
  };

  const togglePlan = (planId: string) => {
    setForm(prev => ({
      ...prev,
      applicablePlans: prev.applicablePlans.includes(planId)
        ? prev.applicablePlans.filter(p => p !== planId)
        : [...prev.applicablePlans, planId],
    }));
  };

  const getCouponStatus = (coupon: CouponType) => {
    if (!coupon.isActive) return { label: "غير مفعّل", variant: "secondary" as const };
    const now = new Date();
    if (coupon.endDate && new Date(coupon.endDate) < now) return { label: "منتهي", variant: "destructive" as const };
    if (coupon.startDate && new Date(coupon.startDate) > now) return { label: "لم يبدأ", variant: "outline" as const };
    if (coupon.maxTotalUses > 0 && coupon.currentUses >= coupon.maxTotalUses) return { label: "مستنفد", variant: "destructive" as const };
    return { label: "نشط", variant: "default" as const };
  };

  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredCoupons = useSmartSearch(coupons, ['code', 'description'], searchQuery);

  const handleExport = () => {
    exportToExcel(
      filteredCoupons,
      [
        { key: 'code', header: 'الكود' },
        { key: 'description', header: 'الوصف', formatter: (val: any) => typeof val === 'object' && val ? (val.ar || val.en) : val },
        { key: 'discountType', header: 'نوع الخصم', formatter: (val) => val === 'percentage' ? 'نسبة %' : 'مبلغ ثابت' },
        { key: 'discountValue', header: 'قيمة الخصم' },
        { key: 'currentUses', header: 'تم الاستخدام' },
        { key: 'maxTotalUses', header: 'الحد الأقصى للإستخدام' },
        { key: 'isActive', header: 'مفعّل', formatter: (val) => val ? 'نعم' : 'لا' },
        { key: 'startDate', header: 'تاريخ البداية', formatter: (val) => val ? formatDate(val as string) : 'غير محدد' },
        { key: 'endDate', header: 'تاريخ النهاية', formatter: (val) => val ? formatDate(val as string) : 'غير محدد' },
      ],
      `coupons_export_${new Date().toISOString().split('T')[0]}`
    );
  };

  if (isLoading) {
    return <p className="text-center text-muted-foreground py-8">جارٍ التحميل...</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex-1">
          <AdminSearchBar 
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="ابحث بكود الخصم أو الوصف..."
            resultCount={filteredCoupons.length}
            totalCount={coupons.length}
          />
        </div>
        <ExportButton onExport={handleExport} className="shrink-0" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Ticket className="h-5 w-5 text-primary" />
          <span className="text-sm text-muted-foreground">{coupons.length} كوبون</span>
        </div>
        <Button onClick={openCreate} data-testid="button-add-coupon">
          <Plus className="h-4 w-4 ml-1" />
          إنشاء كوبون جديد
        </Button>
      </div>

      {/* Empty state */}
      {coupons.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Tag className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="text-lg font-medium">لا توجد كوبونات خصم</p>
          <p className="text-sm">أنشئ كوبون جديد لتقديم خصومات لعملائك</p>
        </div>
      )}

      {/* Coupons list */}
      <div className="space-y-3">
        {filteredCoupons.map((coupon) => {
          const status = getCouponStatus(coupon);
          const isExpanded = expandedId === coupon._id;

          return (
            <div
              key={coupon._id}
              className="border rounded-lg p-4 bg-card"
              data-testid={`coupon-${coupon.code}`}
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <code className="text-lg font-bold font-mono tracking-wider text-foreground">{coupon.code}</code>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyCode(coupon.code)}>
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </div>
                  {coupon.description && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {typeof (coupon.description as any) === 'string' ? coupon.description : ((coupon.description as any)?.ar || (coupon.description as any)?.en)}
                    </p>
                  )}
                  <div className="flex items-center gap-4 flex-wrap text-sm">
                    <span className="font-medium text-primary">
                      {coupon.discountType === "percentage"
                        ? `خصم ${coupon.discountValue}%`
                        : `خصم ${coupon.discountValue} ج.م`}
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <TrendingUp className="h-3.5 w-3.5" />
                      {coupon.currentUses}{coupon.maxTotalUses > 0 ? `/${coupon.maxTotalUses}` : ""} استخدام
                    </span>
                    {coupon.endDate && (
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        حتى {new Date(coupon.endDate).toLocaleDateString("ar-EG")}
                      </span>
                    )}
                    {coupon.applicablePlans.length > 0 && (
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Tag className="h-3.5 w-3.5" />
                        {coupon.applicablePlans.length} باقات
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={coupon.isActive}
                    onCheckedChange={(val) => toggleActiveMutation.mutate({ id: coupon._id, isActive: val })}
                    data-testid={`switch-active-${coupon.code}`}
                  />
                  <Button variant="ghost" size="icon" onClick={() => openEdit(coupon)} data-testid={`button-edit-${coupon.code}`}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" data-testid={`button-delete-${coupon.code}`}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>حذف الكوبون {coupon.code}؟</AlertDialogTitle>
                        <AlertDialogDescription>هذا الإجراء لا يمكن التراجع عنه.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteMutation.mutate(coupon._id)}>حذف</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              {/* Expandable usage log */}
              {coupon.usageLog.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border">
                  <button
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : coupon._id)}
                  >
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    سجل الاستخدام ({coupon.usageLog.length})
                  </button>
                  {isExpanded && (
                    <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
                      {coupon.usageLog.map((log, i) => (
                        <div key={i} className="text-xs flex items-center gap-3 p-2 rounded bg-muted/50">
                          <span className="font-mono">{log.phone || "—"}</span>
                          <span className="text-muted-foreground">
                            {log.seatsUsed} {log.seatsUsed === 1 ? "طفل" : "أطفال"}
                          </span>
                          <span className="text-muted-foreground mr-auto">
                            {log.usedAt ? new Date(log.usedAt).toLocaleString("ar-EG") : "—"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {filteredCoupons.length === 0 && coupons.length > 0 && (
          <div className="text-center py-12 text-muted-foreground border rounded-lg bg-card">
            <p className="text-lg font-medium">لا يوجد نتائج للبحث العالي</p>
          </div>
        )}
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setEditingCoupon(null); setForm(EMPTY_FORM); } }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCoupon ? "تعديل الكوبون" : "إنشاء كوبون جديد"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Code */}
            <div>
              <Label>كود الخصم</Label>
              <div className="flex gap-2">
                <Input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="مثال: SUMMER25"
                  dir="ltr"
                  className="flex-1 font-mono"
                  required
                  data-testid="input-coupon-form-code"
                />
                {!editingCoupon && (
                  <Button type="button" variant="outline" onClick={() => setForm({ ...form, code: generateCouponCode() })}>
                    توليد
                  </Button>
                )}
              </div>
            </div>

            {/* Description */}
            <BilingualInput 
              label="الوصف (اختياري)" 
              value={form.description} 
              onChange={(v) => setForm({ ...form, description: v })} 
            />

            {/* Discount type & value */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-2 block">نوع الخصم</Label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className={`flex-1 py-2 px-3 rounded-md border text-sm font-medium transition-colors ${
                      form.discountType === "percentage"
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-border hover:bg-muted"
                    }`}
                    onClick={() => setForm({ ...form, discountType: "percentage" })}
                    data-testid="button-type-percentage"
                  >
                    نسبة مئوية %
                  </button>
                  <button
                    type="button"
                    className={`flex-1 py-2 px-3 rounded-md border text-sm font-medium transition-colors ${
                      form.discountType === "fixed"
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-border hover:bg-muted"
                    }`}
                    onClick={() => setForm({ ...form, discountType: "fixed" })}
                    data-testid="button-type-fixed"
                  >
                    مبلغ ثابت ج.م
                  </button>
                </div>
              </div>
              <div>
                <Label>قيمة الخصم</Label>
                <Input
                  type="number"
                  min={0.1}
                  max={form.discountType === "percentage" ? 100 : 10000}
                  step="0.1"
                  value={form.discountValue}
                  onChange={(e) => setForm({ ...form, discountValue: parseFloat(e.target.value) || 0 })}
                  dir="ltr"
                  required
                  data-testid="input-discount-value"
                />
              </div>
            </div>

            {/* Target plans */}
            <div>
              <Label>الباقات المستهدفة</Label>
              <p className="text-xs text-muted-foreground mb-2">اترك فارغاً لتطبيق الكوبون على جميع الباقات</p>
              <div className="flex gap-2 flex-wrap">
                {availablePlans.map((plan) => (
                  <Button
                    key={plan.id}
                    type="button"
                    variant={form.applicablePlans.includes(plan.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => togglePlan(plan.id)}
                    data-testid={`button-plan-${plan.id}`}
                  >
                    {plan.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Date range */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>تاريخ البداية (اختياري)</Label>
                <Input
                  type="datetime-local"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  dir="ltr"
                  data-testid="input-start-date"
                />
              </div>
              <div>
                <Label>تاريخ النهاية (اختياري)</Label>
                <Input
                  type="datetime-local"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  dir="ltr"
                  data-testid="input-end-date"
                />
              </div>
            </div>

            {/* Usage limits */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>حد الاستخدام الكلي</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.maxTotalUses}
                  onChange={(e) => setForm({ ...form, maxTotalUses: parseInt(e.target.value) || 0 })}
                  dir="ltr"
                  data-testid="input-max-total"
                />
                <p className="text-xs text-muted-foreground mt-1">0 = بدون حد</p>
              </div>
              <div>
                <Label>حد الاستخدام لكل عميل</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.maxUsesPerCustomer}
                  onChange={(e) => setForm({ ...form, maxUsesPerCustomer: parseInt(e.target.value) || 0 })}
                  dir="ltr"
                  data-testid="input-max-per-customer"
                />
                <p className="text-xs text-muted-foreground mt-1">0 = بدون حد</p>
              </div>
              <div>
                <Label>حد عدد المشاريع/الحسابات</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.maxSeats}
                  onChange={(e) => setForm({ ...form, maxSeats: parseInt(e.target.value) || 0 })}
                  dir="ltr"
                  data-testid="input-max-seats"
                />
                <p className="text-xs text-muted-foreground mt-1">0 = بدون حد</p>
              </div>
            </div>

            {/* Active toggle */}
            <div className="flex items-center justify-between p-3 rounded-md border border-border">
              <Label className="cursor-pointer">مفعّل</Label>
              <Switch
                checked={form.isActive}
                onCheckedChange={(val) => setForm({ ...form, isActive: val })}
                data-testid="switch-form-active"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={createMutation.isPending || updateMutation.isPending}
              data-testid="button-save-coupon"
            >
              {(createMutation.isPending || updateMutation.isPending) ? "جارٍ الحفظ..." : (editingCoupon ? "تحديث الكوبون" : "إنشاء الكوبون")}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

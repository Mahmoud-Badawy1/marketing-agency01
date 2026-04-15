import { Ticket, Plus, Tag } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { AdminSearchBar } from "@/components/molecules/AdminSearchBar";
import { ExportButton } from "@/components/molecules/ExportButton";
import { useCouponsData, EMPTY_FORM } from "./useCouponsData";
import { CouponCard } from "./CouponCard";
import { CouponFormDialog } from "./CouponFormDialog";
import { exportToExcel } from "@/hooks/use-excel-export";
import { formatDate } from "../../utils/formatters";

export function CouponsTab() {
  const c = useCouponsData();

  const handleExport = () => {
    exportToExcel(c.filteredCoupons, [
      { key: 'code', header: 'الكود' },
      { key: 'description', header: 'الوصف', formatter: (val: any) => typeof val === 'object' && val ? (val.ar || val.en) : val },
      { key: 'discountType', header: 'نوع الخصم', formatter: (val) => val === 'percentage' ? 'نسبة %' : 'مبلغ ثابت' },
      { key: 'discountValue', header: 'قيمة الخصم' },
      { key: 'currentUses', header: 'تم الاستخدام' },
      { key: 'maxTotalUses', header: 'الحد الأقصى للإستخدام' },
      { key: 'isActive', header: 'مفعّل', formatter: (val) => val ? 'نعم' : 'لا' },
      { key: 'startDate', header: 'تاريخ البداية', formatter: (val) => val ? formatDate(val as string) : 'غير محدد' },
      { key: 'endDate', header: 'تاريخ النهاية', formatter: (val) => val ? formatDate(val as string) : 'غير محدد' },
    ], `coupons_export_${new Date().toISOString().split('T')[0]}`);
  };

  const openEdit = (coupon: any) => {
    c.setEditingCoupon(coupon);
    c.setForm({
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
    c.setDialogOpen(true);
  };

  if (c.isLoading) return <p className="text-center text-muted-foreground py-8">جارٍ التحميل...</p>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex-1"><AdminSearchBar value={c.searchQuery} onChange={c.setSearchQuery} placeholder="ابحث بكود الخصم أو الوصف..." resultCount={c.filteredCoupons.length} totalCount={c.coupons.length} /></div>
        <ExportButton onExport={handleExport} className="shrink-0" />
      </div>
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2"><Ticket className="h-5 w-5 text-primary" /><span className="text-sm text-muted-foreground">{c.coupons.length} كوبون</span></div>
        <Button onClick={() => { c.setEditingCoupon(null); c.setForm({ ...EMPTY_FORM, code: Math.random().toString(36).substring(7).toUpperCase() }); c.setDialogOpen(true); }}>
          <Plus className="h-4 w-4 ml-1" /> إنشاء كوبون جديد
        </Button>
      </div>

      {c.coupons.length === 0 && <div className="text-center py-12 text-muted-foreground"><Tag className="h-12 w-12 mx-auto mb-3 opacity-50" /><p className="text-lg font-medium">لا توجد كوبونات</p></div>}

      <div className="space-y-3">
        {c.filteredCoupons.map((coupon) => (
          <CouponCard 
            key={coupon._id} coupon={coupon} 
            isExpanded={c.expandedId === coupon._id} 
            onToggleExpand={() => c.setExpandedId(c.expandedId === coupon._id ? null : coupon._id)}
            onCopy={(code) => { navigator.clipboard.writeText(code); c.toast({ title: "تم النسخ", description: code }); }}
            onEdit={() => openEdit(coupon)}
            onDelete={() => c.deleteMutation.mutate(coupon._id)}
            onToggleActive={(val) => c.toggleActiveMutation.mutate({ id: coupon._id, isActive: val })}
          />
        ))}
      </div>

      <CouponFormDialog 
        isOpen={c.dialogOpen} onOpenChange={c.setDialogOpen} 
        editingCoupon={c.editingCoupon} form={c.form} 
        setForm={c.setForm} availablePlans={c.availablePlans}
        onSubmit={(e) => { e.preventDefault(); if (c.editingCoupon) c.updateMutation.mutate({ id: c.editingCoupon._id, data: c.form }); else c.createMutation.mutate(c.form); }}
        isPending={c.createMutation.isPending || c.updateMutation.isPending}
      />
    </div>
  );
}

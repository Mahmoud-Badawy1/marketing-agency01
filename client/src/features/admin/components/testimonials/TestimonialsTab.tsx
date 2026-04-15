import { Plus } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { AdminSearchBar } from "@/components/molecules/AdminSearchBar";
import { ExportButton } from "@/components/molecules/ExportButton";
import { useTestimonialsData } from "./useTestimonialsData";
import { TestimonialForm } from "./TestimonialForm";
import { TestimonialRow } from "./TestimonialRow";
import { exportToExcel } from "@/hooks/use-excel-export";

export function TestimonialsTab() {
  const d = useTestimonialsData();

  const handleExport = () => {
    exportToExcel(d.filteredTestimonials, [
      { key: 'name', header: 'الاسم', formatter: (val: any) => typeof val === 'object' && val ? (val.ar || val.en) : val },
      { key: 'role', header: 'الدور', formatter: (val: any) => typeof val === 'object' && val ? (val.ar || val.en) : val },
      { key: 'defaultText', header: 'النص', formatter: (val: any) => typeof val === 'object' && val ? (val.ar || val.en) : val },
      { key: 'isActive', header: 'مفعل', formatter: (val) => val ? 'نعم' : 'لا' },
    ], `testimonials_export_${new Date().toISOString().split('T')[0]}`);
  };

  const startEdit = (t: any) => {
    d.setFormData({
      name: typeof t.name === 'string' ? { ar: t.name, en: t.name } : t.name,
      role: typeof t.role === 'string' ? { ar: t.role, en: t.role } : (t.role || { ar: "", en: "" }),
      whatsappImage: t.whatsappImage || "",
      defaultText: typeof t.defaultText === 'string' ? { ar: t.defaultText, en: t.defaultText } : (t.defaultText || { ar: "", en: "" }),
      isActive: t.isActive !== false,
      order: t.order || 0,
    });
    d.setImagePreview(t.whatsappImage || "");
    d.setEditingId(t._id);
    d.setShowForm(true);
  };

  if (d.isLoading) return <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex-1"><AdminSearchBar value={d.searchQuery} onChange={d.setSearchQuery} placeholder="ابحث باسم العميل أو نص الرأي..." resultCount={d.filteredTestimonials.length} totalCount={d.testimonials.length} /></div>
        <ExportButton onExport={handleExport} className="shrink-0" />
      </div>

      <div className="flex items-center justify-between gap-2 flex-wrap">
        <p className="text-sm text-muted-foreground">إدارة آراء العملاء المعروضة على الموقع</p>
        <Button size="sm" onClick={() => { d.resetForm(); d.setShowForm(true); }}><Plus className="h-4 w-4 ml-1" /> إضافة رأي جديد</Button>
      </div>

      {d.showForm && <TestimonialForm t_data={d} resetForm={d.resetForm} />}

      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-sm" dir="rtl">
          <thead>
            <tr className="border-b bg-muted/50"><th className="text-right p-3 font-medium">الاسم</th><th className="text-right p-3 font-medium">الوصف</th><th className="text-right p-3 font-medium">الصورة</th><th className="text-right p-3 font-medium">الحالة</th><th className="text-right p-3 font-medium">إجراءات</th></tr>
          </thead>
          <tbody>
            {d.filteredTestimonials.map((t) => <TestimonialRow key={t._id} testimonial={t} onEdit={() => startEdit(t)} onDelete={() => { if (confirm("تأكيد الحذف؟")) d.deleteMutation.mutate(t._id); }} isDeleting={d.deleteMutation.isPending} />)}
          </tbody>
        </table>
      </div>
    </div>
  );
}

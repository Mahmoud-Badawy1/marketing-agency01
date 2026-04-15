import { AdminSearchBar } from "@/components/molecules/AdminSearchBar";
import { ExportButton } from "@/components/molecules/ExportButton";
import { useExpertApplications } from "./useExpertApplications";
import { ExpertApplicationRow } from "./ExpertApplicationRow";
import { exportToExcel } from "@/hooks/use-excel-export";
import { formatDate } from "../../utils/formatters";

export function ExpertApplicationsTab() {
  const d = useExpertApplications();

  const handleExport = () => {
    exportToExcel(d.filteredApplications, [
      { key: 'fullName', header: 'الاسم' }, { key: 'email', header: 'البريد' }, { key: 'phone', header: 'الهاتف' },
      { key: 'specialization', header: 'التخصص' }, { key: 'experienceYears', header: 'الخبرة' },
      { key: 'status', header: 'الحالة' }, { key: 'createdAt', header: 'التاريخ', formatter: (v) => formatDate(v as string) }
    ], `experts_export_${new Date().toISOString().split('T')[0]}`);
  };

  if (d.isLoading) return <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex-1 text-right"><AdminSearchBar value={d.searchQuery} onChange={d.setSearchQuery} resultCount={d.filteredApplications.length} totalCount={d.applications.length} /></div>
        <ExportButton onExport={handleExport} className="shrink-0" />
      </div>

      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-sm" dir="rtl">
          <thead>
            <tr className="border-b bg-muted/50 text-right"><th className="p-3 font-medium">الاسم</th><th className="p-3 font-medium">التواصل</th><th className="p-3 font-medium">التفاصيل</th><th className="p-3 font-medium">الخبرة</th><th className="p-3 font-medium">CV</th><th className="p-3 font-medium">الحالة</th><th className="p-3 font-medium">الملاحظات</th><th className="p-3 font-medium">التاريخ</th><th className="p-3 font-medium">إجراءات</th></tr>
          </thead>
          <tbody>
            {d.filteredApplications.map((app) => (
              <ExpertApplicationRow 
                key={app._id} app={app} editingNotes={d.editingNotes} notesText={d.notesText} setNotesText={d.setNotesText} 
                onEditNotes={(id: string, notes: string) => { d.setEditingNotes(id); d.setNotesText(notes || ""); }} 
                onSaveNotes={(id: string) => d.updateNotes.mutate({ id, notes: d.notesText })} 
                onCancelNotes={() => { d.setEditingNotes(null); d.setNotesText(""); }} 
                onStatusChange={(status: string) => d.updateStatus.mutate({ id: app._id, status })} 
                onDelete={() => { if(window.confirm("حذف؟")) d.deleteApplication.mutate(app._id); }} 
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

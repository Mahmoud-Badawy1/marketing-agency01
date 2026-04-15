import { useState } from "react";
import { useSmartSearch } from "@/hooks/use-smart-search";
import { exportToExcel } from "@/hooks/use-excel-export";
import { formatDate } from "@/features/admin/utils/formatters";
import { AdminSearchBar } from "@/components/molecules/AdminSearchBar";
import { ExportButton } from "@/components/molecules/ExportButton";
import { useExpertsData } from "./useExpertsData";
import { ExpertRow } from "./ExpertRow";

export function ExpertsTab() {
  const { applications, isLoading, updateStatus, updateNotes, deleteApplication, editingNotes, notesText, setNotesText, handleEditNotes, handleSaveNotes, handleCancelEdit } = useExpertsData();
  const [searchQuery, setSearchQuery] = useState("");
  const filteredApplications = useSmartSearch(applications, ["fullName", "email", "phone", "specialization", "motivation", "areasOfExpertise", "portfolioUrl", "linkedinUrl"], searchQuery);

  const handleExport = () => exportToExcel(filteredApplications, [
    { key: "fullName", header: "الاسم" }, { key: "email", header: "البريد" }, { key: "phone", header: "الهاتف" },
    { key: "motivation", header: "الدافع (نبذة)" }, { key: "cvUrl", header: "السيرة الذاتية" },
    { key: "portfolioUrl", header: "رابط الأعمال" }, { key: "linkedinUrl", header: "رابط لينكد إن" },
    { key: "areasOfExpertise", header: "مجالات الخبرة", formatter: (val) => Array.isArray(val) ? val.join(", ") : val },
    { key: "experienceYears", header: "سنوات الخبرة" }, { key: "status", header: "الحالة" },
    { key: "adminNotes", header: "ملاحظات" },
    { key: "createdAt", header: "تاريخ التقديم", formatter: (val) => formatDate(val as string) },
  ], `experts_export_${new Date().toISOString().split("T")[0]}`);

  if (isLoading) return <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex-1"><AdminSearchBar value={searchQuery} onChange={setSearchQuery} placeholder="ابحث بالاسم، الهاتف، البريد، النبذة، أو مجالات الخبرة..." resultCount={filteredApplications.length} totalCount={applications.length} /></div>
        <ExportButton onExport={handleExport} className="shrink-0" />
      </div>
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead><tr className="border-b"><th className="text-right p-3 font-medium">الاسم</th><th className="text-right p-3 font-medium">التواصل</th><th className="text-right p-3 font-medium">التفاصيل</th><th className="text-right p-3 font-medium">الخبرة</th><th className="text-right p-3 font-medium">CV</th><th className="text-right p-3 font-medium">الحالة</th><th className="text-right p-3 font-medium">الملاحظات</th><th className="text-right p-3 font-medium">التاريخ</th><th className="text-right p-3 font-medium">إجراءات</th></tr></thead>
          <tbody>
            {filteredApplications.map((app) => (
              <ExpertRow key={app._id} app={app} editingNotes={editingNotes} notesText={notesText} setNotesText={setNotesText} onEditNotes={handleEditNotes} onSaveNotes={handleSaveNotes} onCancelEdit={handleCancelEdit} onUpdateStatus={(id, status) => updateStatus.mutate({ id, status })} onDelete={(id) => deleteApplication.mutate(id)} isUpdatingNotes={updateNotes.isPending} isDeleting={deleteApplication.isPending} />
            ))}
            {filteredApplications.length === 0 && <tr><td colSpan={9} className="p-8 text-center text-muted-foreground">لا يوجد نتائج للبحث</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

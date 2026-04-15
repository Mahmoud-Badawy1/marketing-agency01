import { AdminSearchBar } from "@/components/molecules/AdminSearchBar";
import { ExportButton } from "@/components/molecules/ExportButton";
import { useLeadsData } from "./useLeadsData";
import { LeadRow } from "./LeadRow";
import { exportToExcel } from "@/hooks/use-excel-export";
import { formatDate, formatServices, formatServiceInterest } from "../../utils/formatters";
import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { LeadDeleteDialog } from "./LeadDeleteDialog";
import type { LeadType } from "@shared/schema";

export function LeadsTab() {
  const d = useLeadsData();
  const [deleteLeadObj, setDeleteLeadObj] = useState<LeadType | null>(null);

  const handleExport = () => {
    exportToExcel(d.filteredLeads, [
      { key: 'clientName', header: 'الاسم' }, { key: 'email', header: 'البريد' }, { key: 'phone', header: 'الهاتف' },
      { key: 'monthlyBudget', header: 'الميزانية' }, { key: 'companyName', header: 'الشركة' },
      { key: 'serviceInterest', header: 'الخدمة', formatter: (v) => formatServiceInterest(v as string) },
      { key: 'status', header: 'الحالة' }, { key: 'createdAt', header: 'التاريخ', formatter: (v) => formatDate(v as string) }
    ], `leads_export_${new Date().toISOString().split('T')[0]}`);
  };

  if (d.isLoading) return <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex-1 text-right"><AdminSearchBar value={d.searchQuery} onChange={d.setSearchQuery} placeholder="ابحث بالاسم، الهاتف، الشركة..." resultCount={d.filteredLeads.length} totalCount={d.leads.length} /></div>
        <ExportButton onExport={handleExport} className="shrink-0" />
      </div>

      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-sm" dir="rtl">
          <thead>
            <tr className="border-b bg-muted/50 text-right"><th className="p-3 font-medium">العميل</th><th className="p-3 font-medium">البريد</th><th className="p-3 font-medium">الهاتف</th><th className="p-3 font-medium">الميزانية</th><th className="p-3 font-medium">الشركة</th><th className="p-3 font-medium">الخدمة</th><th className="p-3 font-medium">الرسالة</th><th className="p-3 font-medium">الحالة</th><th className="p-3 font-medium">التاريخ</th><th className="p-3 font-medium">إجراءات</th></tr>
          </thead>
          <tbody>
            {d.filteredLeads.map((lead) => (
              <LeadRow 
                key={lead._id} 
                lead={lead} 
                onUpdateStatus={(s: string) => d.updateStatus.mutate({ id: lead._id, status: s })} 
                isUpdating={d.updateStatus.isPending} 
                onDelete={() => setDeleteLeadObj(lead)} 
              />
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!deleteLeadObj} onOpenChange={(v) => !v && setDeleteLeadObj(null)}>
        <LeadDeleteDialog 
          isPending={d.deleteLeadMutation.isPending} 
          onCancel={() => setDeleteLeadObj(null)} 
          onConfirm={() => {
            if (deleteLeadObj) {
              d.deleteLeadMutation.mutate(deleteLeadObj._id, {
                onSuccess: () => setDeleteLeadObj(null)
              });
            }
          }} 
        />
      </Dialog>
    </div>
  );
}

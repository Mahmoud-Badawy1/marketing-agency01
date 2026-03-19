import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { adminFetch } from "@/lib/admin";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { LeadStatusBadge } from "../StatusBadges";
import { formatDate, formatSchoolType } from "../utils/formatters";
import type { LeadType } from "@shared/schema";

export function LeadsTab() {
  const { toast } = useToast();
  const { data: leads = [], isLoading } = useQuery<LeadType[]>({
    queryKey: ["/api/admin/leads"],
    queryFn: async () => {
      const res = await adminFetch("/api/admin/leads");
      if (!res.ok) throw new Error("Failed to fetch leads");
      return res.json();
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await adminFetch(`/api/admin/leads/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/leads"] });
      toast({ title: "تم التحديث بنجاح" });
    },
    onError: () => {
      toast({ title: "خطأ", description: "فشل في تحديث الحالة", variant: "destructive" });
    },
  });

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground" data-testid="loading-leads">جاري التحميل...</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm" data-testid="table-leads">
        <thead>
          <tr className="border-b">
            <th className="text-right p-3 font-medium">اسم العميل</th>
            <th className="text-right p-3 font-medium">الهاتف</th>
            <th className="text-right p-3 font-medium">الشركة / العمر</th>
            <th className="text-right p-3 font-medium">الجنسية</th>
            <th className="text-right p-3 font-medium">نوع الخدمة</th>
            <th className="text-right p-3 font-medium">الرسالة</th>
            <th className="text-right p-3 font-medium">الحالة</th>
            <th className="text-right p-3 font-medium">التاريخ</th>
            <th className="text-right p-3 font-medium">إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead._id} className="border-b" data-testid={`row-lead-${lead._id}`}>
              <td className="p-3" data-testid={`text-lead-name-${lead._id}`}>{lead.parentName}</td>
              <td className="p-3" data-testid={`text-lead-phone-${lead._id}`}>{lead.phone}</td>
              <td className="p-3" data-testid={`text-lead-age-${lead._id}`}>{lead.childAge}</td>
              <td className="p-3">{lead.nationality || "-"}</td>
              <td className="p-3">{formatSchoolType(lead.schoolType)}</td>
              <td className="p-3 max-w-[200px] truncate" data-testid={`text-lead-message-${lead._id}`}>{lead.message || "-"}</td>
              <td className="p-3"><LeadStatusBadge status={lead.status} /></td>
              <td className="p-3 text-muted-foreground text-xs" data-testid={`text-lead-date-${lead._id}`}>{formatDate(lead.createdAt)}</td>
              <td className="p-3">
                <div className="flex gap-1 flex-wrap">
                  {lead.status !== "contacted" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStatus.mutate({ id: lead._id, status: "contacted" })}
                      disabled={updateStatus.isPending}
                      data-testid={`button-lead-contacted-${lead._id}`}
                    >
                      تم التواصل
                    </Button>
                  )}
                  {lead.status !== "converted" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStatus.mutate({ id: lead._id, status: "converted" })}
                      disabled={updateStatus.isPending}
                      data-testid={`button-lead-converted-${lead._id}`}
                    >
                      تم التحويل
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {leads.length === 0 && (
            <tr>
              <td colSpan={9} className="p-8 text-center text-muted-foreground" data-testid="text-no-leads">لا توجد رسائل</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

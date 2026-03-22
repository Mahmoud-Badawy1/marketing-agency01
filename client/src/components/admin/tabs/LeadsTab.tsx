import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { adminFetch } from "@/lib/admin";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { LeadStatusBadge } from "../StatusBadges";
import { formatDate, formatServiceInterest } from "../utils/formatters";
import type { LeadType } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Info, MessageSquare, User, Phone, Mail, Building2, Wallet, Settings } from "lucide-react";

export function LeadsTab() {
  const [selectedLead, setSelectedLead] = useState<LeadType | null>(null);
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
            <th className="text-right p-3 font-medium">البريد الإلكتروني</th>
            <th className="text-right p-3 font-medium">الهاتف</th>
            <th className="text-right p-3 font-medium">الميزانية</th>
            <th className="text-right p-3 font-medium">اسم الشركة</th>
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
              <td className="p-3" data-testid={`text-lead-name-${lead._id}`}>{lead.clientName}</td>
              <td className="p-3 text-xs">{lead.email}</td>
              <td className="p-3" data-testid={`text-lead-phone-${lead._id}`}>{lead.phone}</td>
              <td className="p-3" data-testid={`text-lead-age-${lead._id}`}>{lead.monthlyBudget}</td>
              <td className="p-3">{lead.companyName || "-"}</td>
              <td className="p-3">{formatServiceInterest(lead.serviceInterest)}</td>
              <td className="p-3 max-w-[200px] truncate" data-testid={`text-lead-message-${lead._id}`}>{lead.message || "-"}</td>
              <td className="p-3"><LeadStatusBadge status={lead.status} /></td>
              <td className="p-3 text-muted-foreground text-xs" data-testid={`text-lead-date-${lead._id}`}>{formatDate(lead.createdAt)}</td>
              <td className="p-3">
                  <div className="flex gap-1 flex-wrap">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedLead(lead)}
                        >
                          عرض
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl" dir="rtl">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Info className="h-5 w-5 text-accent" />
                            تفاصيل الرسالة
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6 py-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-muted/50 rounded-lg">
                              <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                <User className="h-3 w-3" /> الاسم
                              </div>
                              <div className="font-bold">{lead.clientName}</div>
                            </div>
                            <div className="p-3 bg-muted/50 rounded-lg">
                              <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                <Phone className="h-3 w-3" /> الهاتف
                              </div>
                              <div className="font-bold" dir="ltr">{lead.phone}</div>
                            </div>
                            <div className="p-3 bg-muted/50 rounded-lg">
                              <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                <Mail className="h-3 w-3" /> البريد
                              </div>
                              <div className="font-bold">{lead.email || "-"}</div>
                            </div>
                            <div className="p-3 bg-muted/50 rounded-lg">
                              <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                <Building2 className="h-3 w-3" /> الشركة
                              </div>
                              <div className="font-bold">{lead.companyName || "-"}</div>
                            </div>
                            <div className="p-3 bg-muted/50 rounded-lg">
                              <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                <Wallet className="h-3 w-3" /> الميزانية
                              </div>
                              <div className="font-bold">{lead.monthlyBudget}</div>
                            </div>
                            <div className="p-3 bg-muted/50 rounded-lg">
                              <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                <Settings className="h-3 w-3" /> الخدمة
                              </div>
                              <div className="font-bold">{formatServiceInterest(lead.serviceInterest)}</div>
                            </div>
                          </div>

                          <div className="p-4 bg-accent/5 border border-accent/10 rounded-lg">
                            <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                              <MessageSquare className="h-3 w-3 text-accent" /> الرسالة
                            </div>
                            <div className="text-sm leading-relaxed whitespace-pre-wrap">
                              {lead.message || "لا توجد رسالة إضافية"}
                            </div>
                          </div>

                          <div className="flex justify-between items-center text-xs text-muted-foreground">
                            <span>تم الإرسال في: {formatDate(lead.createdAt)}</span>
                            <LeadStatusBadge status={lead.status} />
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

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

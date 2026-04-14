import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { adminFetch } from "@/lib/admin";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Eye, FileText, Edit3, Save, X, Trash2 } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { formatDate } from "../utils/formatters";
import type { ExpertApplicationType } from "@shared/schema";
import { useSmartSearch } from "@/hooks/use-smart-search";
import { exportToExcel } from "@/hooks/use-excel-export";
import { AdminSearchBar } from "../AdminSearchBar";
import { ExportButton } from "../ExportButton";

function ExpertApplicationStatusBadge({ status }: { status: string | null | undefined }) {
  if (status === "new" || !status) {
    return <Badge className="bg-blue-500 text-white no-default-hover-elevate no-default-active-elevate">جديد</Badge>;
  }
  if (status === "reviewed") {
    return <Badge className="bg-yellow-500 text-white no-default-hover-elevate no-default-active-elevate">تم المراجعة</Badge>;
  }
  if (status === "interview") {
    return <Badge className="bg-indigo-500 text-white no-default-hover-elevate no-default-active-elevate">مقابلة</Badge>;
  }
  if (status === "accepted") {
    return <Badge className="bg-green-500 text-white no-default-hover-elevate no-default-active-elevate">مقبول</Badge>;
  }
  if (status === "rejected") {
    return <Badge className="bg-red-500 text-white no-default-hover-elevate no-default-active-elevate">مرفوض</Badge>;
  }
  return <Badge>{status}</Badge>;
}

export function ExpertApplicationsTab() {
  const { toast } = useToast();
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesText, setNotesText] = useState<string>("");

  const { data: applications = [], isLoading } = useQuery<ExpertApplicationType[]>({
    queryKey: ["/api/admin/expert-applications"],
    queryFn: async () => {
      const res = await adminFetch("/api/admin/expert-applications");
      if (!res.ok) throw new Error("Failed to fetch expert applications");
      return res.json();
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await adminFetch(`/api/admin/expert-applications/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/expert-applications"] });
      toast({ title: "تم تحديث الحالة بنجاح" });
    },
    onError: () => {
      toast({ title: "خطأ", description: "فشل في تحديث حالة الطلب", variant: "destructive" });
    },
  });

  const updateNotes = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      const res = await adminFetch(`/api/admin/expert-applications/${id}/notes`, {
        method: "PUT",
        body: JSON.stringify({ adminNotes: notes }),
      });
      if (!res.ok) throw new Error("Failed to update notes");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/expert-applications"] });
      setEditingNotes(null);
      setNotesText("");
      toast({ title: "تم تحديث الملاحظات بنجاح" });
    },
    onError: () => {
      toast({ title: "خطأ", description: "فشل في تحديث الملاحظات", variant: "destructive" });
    },
  });

  const deleteApplication = useMutation({
    mutationFn: async (id: string) => {
      const res = await adminFetch(`/api/admin/expert-applications/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete application");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/expert-applications"] });
      toast({ title: "تم حذف الطلب بنجاح" });
    },
    onError: () => {
      toast({ title: "خطأ", description: "فشل في حذف الطلب", variant: "destructive" });
    },
  });

  const handleEditNotes = (id: string, currentNotes: string | null) => {
    setEditingNotes(id);
    setNotesText(currentNotes || "");
  };

  const handleSaveNotes = (id: string) => {
    updateNotes.mutate({ id, notes: notesText });
  };

  const handleCancelEdit = () => {
    setEditingNotes(null);
    setNotesText("");
  };

  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredApplications = useSmartSearch(applications, ['fullName', 'email', 'phone', 'specialization', 'motivation', 'areasOfExpertise', 'portfolioUrl', 'linkedinUrl'], searchQuery);

  const handleExport = () => {
    exportToExcel(
      filteredApplications,
      [
        { key: 'fullName', header: 'الاسم' },
        { key: 'email', header: 'البريد' },
        { key: 'phone', header: 'الهاتف' },
        { key: 'motivation', header: 'الدافع (نبذة)' },
        { key: 'cvUrl', header: 'السيرة الذاتية' },
        { key: 'portfolioUrl', header: 'رابط الأعمال' },
        { key: 'linkedinUrl', header: 'رابط لينكد إن' },
        { key: 'areasOfExpertise', header: 'مجالات الخبرة', formatter: (val) => Array.isArray(val) ? val.join(', ') : val },
        { key: 'experienceYears', header: 'سنوات الخبرة' },
        { key: 'status', header: 'الحالة' },
        { key: 'adminNotes', header: 'ملاحظات' },
        { key: 'createdAt', header: 'تاريخ التقديم', formatter: (val) => formatDate(val as string) },
      ],
      `experts_export_${new Date().toISOString().split('T')[0]}`
    );
  };

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex-1">
          <AdminSearchBar 
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="ابحث بالاسم، الهاتف، البريد، النبذة، أو مجالات الخبرة..."
            resultCount={filteredApplications.length}
            totalCount={applications.length}
          />
        </div>
        <ExportButton onExport={handleExport} className="shrink-0" />
      </div>

      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-right p-3 font-medium">الاسم</th>
            <th className="text-right p-3 font-medium">التواصل</th>
            <th className="text-right p-3 font-medium">التفاصيل</th>
            <th className="text-right p-3 font-medium">الخبرة</th>
            <th className="text-right p-3 font-medium">CV</th>
            <th className="text-right p-3 font-medium">الحالة</th>
            <th className="text-right p-3 font-medium">الملاحظات</th>
            <th className="text-right p-3 font-medium">التاريخ</th>
            <th className="text-right p-3 font-medium">إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {filteredApplications.map((app) => (
            <tr key={app._id} className="border-b">
              <td className="p-3">
                <div className="font-medium">{app.fullName}</div>
                <div className="text-xs text-muted-foreground">{app.age} سنة - {app.city}</div>
              </td>
              <td className="p-3">
                <div className="space-y-1">
                  <div className="text-xs">{app.email}</div>
                  <div className="flex items-center gap-1">
                    <a
                      href={`https://wa.me/${app.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-green-600 hover:text-green-800 text-xs"
                    >
                      <SiWhatsapp className="h-3 w-3" />
                      {app.phone}
                    </a>
                  </div>
                </div>
              </td>
              <td className="p-3">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Eye className="h-3 w-3 ml-1" />
                      عرض
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>تفاصيل طلب {app.fullName}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 text-sm">
                      <div><strong>المؤهل:</strong> {app.education} - {app.specialization}</div>
                      <div><strong>سنوات الخبرة:</strong> {app.experienceYears} سنة</div>
                      <div><strong>الأوقات المتاحة:</strong> {app.availableHours}</div>
                      {app.marketingTools && (
                        <div><strong>المنصات التسويقية:</strong> {app.marketingTools}</div>
                      )}
                      <div><strong>خبرة سابقة وعملية:</strong> {app.hasAgencyExperience ? "نعم" : "لا"}</div>
                      {app.hasAgencyExperience && app.portfolioDetails && (
                        <div><strong>أبرز الإنجازات/الخبرات:</strong> {app.portfolioDetails}</div>
                      )}
                      {app.motivation && (
                        <div><strong>الدافع للانضمام:</strong><br />{app.motivation}</div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </td>
              <td className="p-3">
                <div className="text-xs">
                  <div>{app.experienceYears} سنة خبرة</div>
                  <div className={app.hasAgencyExperience ? "text-green-600" : "text-muted-foreground"}>
                    {app.hasAgencyExperience ? "✓ خبير" : "✗ مبتدئ"}
                  </div>
                </div>
              </td>
              <td className="p-3">
                {app.cvUrl ? (
                  <a
                    href={app.cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs"
                  >
                    <FileText className="h-3 w-3" />
                    عرض CV
                  </a>
                ) : (
                  <span className="text-muted-foreground text-xs">لا يوجد</span>
                )}
              </td>
              <td className="p-3">
                <ExpertApplicationStatusBadge status={app.status} />
              </td>
              <td className="p-3 min-w-[200px]">
                {editingNotes === app._id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={notesText}
                      onChange={(e) => setNotesText(e.target.value)}
                      rows={2}
                      placeholder="أضف ملاحظات..."
                      className="text-xs"
                    />
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        onClick={() => handleSaveNotes(app._id)}
                        disabled={updateNotes.isPending}
                      >
                        <Save className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEdit}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">
                      {app.adminNotes || "لا توجد ملاحظات"}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditNotes(app._id, app.adminNotes || null)}
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </td>
              <td className="p-3 text-muted-foreground text-xs">
                {formatDate(app.createdAt)}
              </td>
              <td className="p-3">
                <div className="space-y-2">
                  <Select onValueChange={(value) => updateStatus.mutate({ id: app._id, status: value })}>
                    <SelectTrigger className="w-28">
                      <SelectValue placeholder="تغيير الحالة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">جديد</SelectItem>
                      <SelectItem value="reviewed">تم المراجعة</SelectItem>
                      <SelectItem value="interview">مقابلة</SelectItem>
                      <SelectItem value="accepted">مقبول</SelectItem>
                      <SelectItem value="rejected">مرفوض</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      if (window.confirm("هل أنت متأكد من حذف هذا الطلب؟")) {
                        deleteApplication.mutate(app._id);
                      }
                    }}
                    disabled={deleteApplication.isPending}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
          {filteredApplications.length === 0 && (
            <tr>
              <td colSpan={9} className="p-8 text-center text-muted-foreground">
                لا يوجد نتائج للبحث العالي
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
    </div>
  );
}

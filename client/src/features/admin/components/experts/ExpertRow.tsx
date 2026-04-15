import { Button } from "@/components/atoms/Button";
import { Textarea } from "@/components/atoms/Textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Eye, FileText, Edit3, Save, X, Trash2 } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { formatDate } from "@/features/admin/utils/formatters";
import { ExpertStatusBadge } from "./ExpertStatusBadge";
import type { ExpertApplicationType } from "@shared/schema";

interface ExpertRowProps {
  app: ExpertApplicationType;
  editingNotes: string | null;
  notesText: string;
  setNotesText: (v: string) => void;
  onEditNotes: (id: string, notes: string | null) => void;
  onSaveNotes: (id: string) => void;
  onCancelEdit: () => void;
  onUpdateStatus: (id: string, status: string) => void;
  onDelete: (id: string) => void;
  isUpdatingNotes: boolean;
  isDeleting: boolean;
}

export function ExpertRow({ app, editingNotes, notesText, setNotesText, onEditNotes, onSaveNotes, onCancelEdit, onUpdateStatus, onDelete, isUpdatingNotes, isDeleting }: ExpertRowProps) {
  return (
    <tr className="border-b">
      <td className="p-3"><div className="font-medium">{app.fullName}</div><div className="text-xs text-muted-foreground">{app.age} سنة - {app.city}</div></td>
      <td className="p-3"><div className="text-xs">{app.email}</div><a href={`https://wa.me/${app.phone.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-green-600 hover:text-green-800 text-xs"><SiWhatsapp className="h-3 w-3" />{app.phone}</a></td>
      <td className="p-3">
        <Dialog><DialogTrigger asChild><Button size="sm" variant="outline"><Eye className="h-3 w-3 ml-1" />عرض</Button></DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto"><DialogHeader><DialogTitle>تفاصيل طلب {app.fullName}</DialogTitle></DialogHeader>
            <div className="space-y-3 text-sm">
              <div><strong>المؤهل:</strong> {app.education} - {app.specialization}</div>
              <div><strong>سنوات الخبرة:</strong> {app.experienceYears} سنة</div>
              <div><strong>الأوقات المتاحة:</strong> {app.availableHours}</div>
              {app.marketingTools && <div><strong>المنصات:</strong> {app.marketingTools}</div>}
              <div><strong>خبرة سابقة:</strong> {app.hasAgencyExperience ? "نعم" : "لا"}</div>
              {app.hasAgencyExperience && app.portfolioDetails && <div><strong>أبرز الإنجازات:</strong> {app.portfolioDetails}</div>}
              {app.motivation && <div><strong>الدافع للانضمام:</strong><br />{app.motivation}</div>}
            </div>
          </DialogContent>
        </Dialog>
      </td>
      <td className="p-3"><div className="text-xs"><div>{app.experienceYears} سنة خبرة</div><div className={app.hasAgencyExperience ? "text-green-600" : "text-muted-foreground"}>{app.hasAgencyExperience ? "✓ خبير" : "✗ مبتدئ"}</div></div></td>
      <td className="p-3">{app.cvUrl ? <a href={app.cvUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 text-xs"><FileText className="h-3 w-3" />عرض CV</a> : <span className="text-muted-foreground text-xs">لا يوجد</span>}</td>
      <td className="p-3"><ExpertStatusBadge status={app.status} /></td>
      <td className="p-3 min-w-[200px]">
        {editingNotes === app._id ? (
          <div className="space-y-2"><Textarea value={notesText} onChange={(e) => setNotesText(e.target.value)} rows={2} className="text-xs" /><div className="flex gap-1"><Button size="sm" onClick={() => onSaveNotes(app._id)} disabled={isUpdatingNotes}><Save className="h-3 w-3" /></Button><Button size="sm" variant="outline" onClick={onCancelEdit}><X className="h-3 w-3" /></Button></div></div>
        ) : (
          <div className="space-y-1"><div className="text-xs text-muted-foreground">{app.adminNotes || "لا توجد ملاحظات"}</div><Button size="sm" variant="ghost" onClick={() => onEditNotes(app._id, app.adminNotes || null)}><Edit3 className="h-3 w-3" /></Button></div>
        )}
      </td>
      <td className="p-3 text-muted-foreground text-xs">{formatDate(app.createdAt)}</td>
      <td className="p-3">
        <div className="space-y-2">
          <Select onValueChange={(v) => onUpdateStatus(app._id, v)}><SelectTrigger className="w-28"><SelectValue placeholder="تغيير الحالة" /></SelectTrigger><SelectContent><SelectItem value="new">جديد</SelectItem><SelectItem value="reviewed">تم المراجعة</SelectItem><SelectItem value="interview">مقابلة</SelectItem><SelectItem value="accepted">مقبول</SelectItem><SelectItem value="rejected">مرفوض</SelectItem></SelectContent></Select>
          <Button size="sm" variant="destructive" onClick={() => { if (window.confirm("هل أنت متأكد من حذف هذا الطلب؟")) onDelete(app._id); }} disabled={isDeleting}><Trash2 className="h-3 w-3" /></Button>
        </div>
      </td>
    </tr>
  );
}

import { Eye, FileText, Edit3, Save, X, Trash2 } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { Button } from "@/components/atoms/Button";
import { Badge } from "@/components/atoms/Badge";
import { Textarea } from "@/components/atoms/Textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { formatDate } from "../../utils/formatters";
import type { ExpertApplicationType } from "@shared/schema";
import { ExpertApplicationDetails } from "./ExpertApplicationDetails";

function StatusBadge({ status }: { status: string | null | undefined }) {
  const colors: any = { new: "bg-blue-500", reviewed: "bg-yellow-500", interview: "bg-indigo-500", accepted: "bg-green-500", rejected: "bg-red-500" };
  const labels: any = { new: "جديد", reviewed: "تم المراجعة", interview: "مقابلة", accepted: "مقبول", rejected: "مرفوض" };
  return <Badge className={`${colors[status || 'new']} text-white`}>{labels[status || 'new'] || status}</Badge>;
}

export function ExpertApplicationRow({ app, editingNotes, notesText, setNotesText, onEditNotes, onSaveNotes, onCancelNotes, onStatusChange, onDelete }: any) {
  return (
    <tr className="border-b">
      <td className="p-3"><div className="font-medium">{app.fullName}</div><div className="text-xs text-muted-foreground">{app.age} سنة - {app.city}</div></td>
      <td className="p-3">
        <div className="text-xs">{app.email}</div>
        <a href={`https://wa.me/${app.phone.replace(/\D/g, '')}`} target="_blank" className="flex items-center gap-1 text-green-600 text-xs"><SiWhatsapp className="h-3 w-3" />{app.phone}</a>
      </td>
      <td className="p-3">
        <Dialog>
          <DialogTrigger asChild><Button size="sm" variant="outline"><Eye className="h-3 w-3 ml-1" />عرض</Button></DialogTrigger>
          <DialogContent className="max-w-2xl overflow-y-auto"><ExpertApplicationDetails app={app} /></DialogContent>
        </Dialog>
      </td>
      <td className="p-3 text-xs"><div>{app.experienceYears} سنة</div><div className={app.hasAgencyExperience ? "text-green-600" : "text-muted-foreground"}>{app.hasAgencyExperience ? "✓ خبير" : "✗ مبتدئ"}</div></td>
      <td className="p-3">{app.cvUrl ? <a href={app.cvUrl} target="_blank" className="flex items-center gap-1 text-blue-600 text-xs"><FileText className="h-3 w-3" />CV</a> : "-"}</td>
      <td className="p-3"><StatusBadge status={app.status} /></td>
      <td className="p-3 min-w-[150px]">
        {editingNotes === app._id ? (
          <div className="space-y-1">
            <Textarea value={notesText} onChange={(e) => setNotesText(e.target.value)} rows={2} className="text-xs" />
            <div className="flex gap-1"><Button size="sm" onClick={() => onSaveNotes(app._id)}><Save className="h-3 w-3" /></Button><Button size="sm" variant="outline" onClick={onCancelNotes}><X className="h-3 w-3" /></Button></div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">{app.adminNotes || "-"}<Button size="sm" variant="ghost" onClick={() => onEditNotes(app._id, app.adminNotes)}><Edit3 className="h-3 w-3" /></Button></div>
        )}
      </td>
      <td className="p-3 text-xs">{formatDate(app.createdAt)}</td>
      <td className="p-3">
        <div className="flex flex-col gap-1 items-end">
          <Select onValueChange={(v) => onStatusChange(v)}><SelectTrigger className="w-24 h-8 text-[10px]"><SelectValue placeholder="حالة" /></SelectTrigger><SelectContent><SelectItem value="new">جديد</SelectItem><SelectItem value="reviewed">مراجعة</SelectItem><SelectItem value="interview">مقابلة</SelectItem><SelectItem value="accepted">قبول</SelectItem><SelectItem value="rejected">رفض</SelectItem></SelectContent></Select>
          <Button size="sm" variant="destructive" className="h-7 w-7 p-0" onClick={onDelete}><Trash2 className="h-3 w-3" /></Button>
        </div>
      </td>
    </tr>
  );
}

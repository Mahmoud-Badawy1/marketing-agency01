import { Button } from "@/components/atoms/Button";
import { LeadStatusBadge } from "@/components/molecules/StatusBadge";
import { formatDate, formatServiceInterest } from "../../utils/formatters";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import { LeadDetails } from "./LeadDetails";
import type { LeadType } from "@shared/schema";

export function LeadRow({ lead, onUpdateStatus, isUpdating, onDelete }: any) {
  return (
    <tr className="border-b">
      <td className="p-3 font-medium">{lead.clientName}</td>
      <td className="p-3 text-xs">{lead.email}</td>
      <td className="p-3">{lead.phone}</td>
      <td className="p-3">{lead.monthlyBudget}</td>
      <td className="p-3">{lead.companyName || "-"}</td>
      <td className="p-3">{formatServiceInterest(lead.serviceInterest)}</td>
      <td className="p-3 max-w-[150px] truncate">{lead.message || "-"}</td>
      <td className="p-3">
        <LeadStatusBadge status={lead.status} />
      </td>
      <td className="p-3 text-muted-foreground text-xs">
        {formatDate(lead.createdAt)}
      </td>
      <td className="p-3">
        <div className="flex gap-1 flex-wrap">
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" variant="ghost">
                عرض
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl" dir="rtl">
              <LeadDetails lead={lead} />
            </DialogContent>
          </Dialog>
          {lead.status !== "contacted" && lead.status !== "converted" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onUpdateStatus("contacted")}
              disabled={isUpdating}
            >
              تواصل
            </Button>
          )}
          {lead.status !== "converted" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onUpdateStatus("converted")}
              disabled={isUpdating}
            >
              تحويل
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive/80 hover:text-destructive hover:bg-destructive/10"
            onClick={onDelete}
            title="حذف نهائي (Delete)"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

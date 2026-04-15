import {
  Info,
  MessageSquare,
  User,
  Phone,
  Mail,
  Building2,
  Wallet,
  Settings,
} from "lucide-react";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LeadStatusBadge } from "@/components/molecules/StatusBadge";
import { formatDate, formatServiceInterest } from "../../utils/formatters";
import type { LeadType } from "@shared/schema";

interface LeadDetailsProps {
  lead: LeadType;
}

export function LeadDetails({ lead }: LeadDetailsProps) {
  return (
    <>
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
              <User className="h-3 w-3" />
              الاسم
            </div>
            <div className="font-bold">{lead.clientName}</div>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <Phone className="h-3 w-3" />
              الهاتف
            </div>
            <div className="font-bold" dir="ltr">
              {lead.phone}
            </div>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <Mail className="h-3 w-3" />
              البريد
            </div>
            <div className="font-bold">{lead.email || "-"}</div>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              الشركة
            </div>
            <div className="font-bold">{lead.companyName || "-"}</div>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <Wallet className="h-3 w-3" />
              الميزانية
            </div>
            <div className="font-bold">{lead.monthlyBudget}</div>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <Settings className="h-3 w-3" />
              الخدمة
            </div>
            <div className="font-bold">
              {formatServiceInterest(lead.serviceInterest)}
            </div>
          </div>
        </div>
        <div className="p-4 bg-accent/5 border border-accent/10 rounded-lg">
          <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <MessageSquare className="h-3 w-3 text-accent" />
            الرسالة
          </div>
          <div className="text-sm reading-relaxed whitespace-pre-wrap">
            {lead.message || "لا توجد رسالة"}
          </div>
        </div>
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <span>تم الإرسال في: {formatDate(lead.createdAt)}</span>
          <LeadStatusBadge status={lead.status} />
        </div>
      </div>
    </>
  );
}

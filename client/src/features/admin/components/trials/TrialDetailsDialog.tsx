import {
  Info,
  User,
  Phone,
  Mail,
  Building2,
  Settings,
  MessageSquare,
  XCircle,
} from "lucide-react";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { OrderStatusBadge } from "@/components/molecules/StatusBadge";
import { formatDate, formatServiceInterest } from "../../utils/formatters";
import type { TrialBookingType } from "@shared/schema";

interface TrialDetailsDialogProps {
  booking: TrialBookingType;
}

export function TrialDetailsDialog({ booking }: TrialDetailsDialogProps) {
  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Info className="h-5 w-5 text-accent" /> تفاصيل الاستشارة
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-6 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">
              <User className="h-3 w-3 inline ml-1" /> الاسم
            </div>
            <div className="font-bold">{booking.clientName}</div>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">
              <Phone className="h-3 w-3 inline ml-1" /> الهاتف
            </div>
            <div className="font-bold" dir="ltr">
              {booking.phone}
            </div>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">
              <Mail className="h-3 w-3 inline ml-1" /> البريد
            </div>
            <div className="font-bold">{booking.email || "-"}</div>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">
              <Building2 className="h-3 w-3 inline ml-1" /> الشركة
            </div>
            <div className="font-bold">{booking.companyName || "-"}</div>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg col-span-2">
            <div className="text-xs text-muted-foreground mb-1">
              <Settings className="h-3 w-3 inline ml-1" /> الخدمة
            </div>
            <div className="font-bold">
              {formatServiceInterest(booking.serviceInterest)}
            </div>
          </div>
        </div>
        {booking.message && (
          <div className="p-4 bg-accent/5 border border-accent/10 rounded-lg">
            <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
              <MessageSquare className="h-3 w-3 text-accent" /> رسالة العميل
            </div>
            <div className="text-sm leading-relaxed whitespace-pre-wrap">
              {booking.message}
            </div>
          </div>
        )}
        {(booking as any).cancelReason && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="text-xs text-destructive mb-2 font-bold flex items-center gap-1">
              <XCircle className="h-3 w-3" /> سبب الإلغاء
            </div>
            <div className="text-sm whitespace-pre-wrap">
              {(booking as any).cancelReason}
            </div>
          </div>
        )}
        <div className="flex justify-between items-center text-xs text-muted-foreground mt-4 pt-4 border-t border-border">
          <span>تاريخ الطلب: {formatDate(booking.createdAt)}</span>
          <OrderStatusBadge status={booking.status} />
        </div>
      </div>
    </>
  );
}

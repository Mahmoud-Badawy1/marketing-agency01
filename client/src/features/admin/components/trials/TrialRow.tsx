import {
  Edit2,
  ExternalLink,
  XCircle,
  Trash2,
  Info,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Badge } from "@/components/atoms/Badge";
import { OrderStatusBadge } from "@/components/molecules/StatusBadge";
import { formatDate, formatServiceInterest } from "../../utils/formatters";
import type { TrialBookingType } from "@shared/schema";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TrialDetailsDialog } from "./TrialDetailsDialog";

interface TrialRowProps {
  booking: TrialBookingType;
  onEdit: () => void;
  onCancel: () => void;
  onDelete: () => void;
}

export function TrialRow({
  booking,
  onEdit,
  onCancel,
  onDelete,
}: TrialRowProps) {
  return (
    <tr className="border-b hover:bg-muted/30 transition-colors">
      <td className="p-3 font-medium">{booking.clientName}</td>
      <td className="p-3 text-xs">{booking.email}</td>
      <td className="p-3">{booking.phone}</td>
      <td className="p-3">{booking.companyName || "-"}</td>
      <td className="p-3">{formatServiceInterest(booking.serviceInterest)}</td>
      <td className="p-3">
        <div className="flex flex-col gap-1 items-start">
          <OrderStatusBadge status={booking.status} />
          {(booking as any).cancelReason && booking.status !== "cancelled" && (
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0 bg-amber-50 text-amber-700 border-amber-200"
            >
              مُعاد جدولته
            </Badge>
          )}
        </div>
      </td>
      <td className="p-3">
        {booking.scheduledTime ? (
          <div className="flex flex-col">
            <span className="font-semibold text-accent">
              {formatDate(booking.scheduledTime)}
            </span>
            {booking.meetingLink && (
              <a
                href={booking.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1"
              >
                <ExternalLink className="h-3 w-3" /> رابط الاجتماع
              </a>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground text-xs italic">
            لم يحدد بعد
          </span>
        )}
      </td>
      <td className="p-3 text-muted-foreground text-xs">
        {formatDate(booking.createdAt)}
      </td>
      <td className="p-3">
        <div className="flex gap-1 flex-wrap">
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" variant="ghost" title="عرض التفاصيل">
                <Info className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl" dir="rtl">
              <TrialDetailsDialog booking={booking} />
            </DialogContent>
          </Dialog>

          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={onEdit}
            title="تعديل"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          {booking.status !== "cancelled" && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 w-8 p-0 text-amber-600"
              onClick={onCancel}
              title="إلغاء"
            >
              <XCircle className="h-4 w-4" />
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0 text-destructive"
            onClick={onDelete}
            title="حذف"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          {booking.adminNotes && (
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-blue-600"
              title={booking.adminNotes}
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}

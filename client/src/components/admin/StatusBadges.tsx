import { Badge } from "@/components/ui/badge";

export function LeadStatusBadge({ status }: { status: string | null | undefined }) {
  if (status === "new" || !status) {
    return <Badge data-testid="badge-status-new" className="bg-blue-500 text-white no-default-hover-elevate no-default-active-elevate">جديد</Badge>;
  }
  if (status === "contacted") {
    return <Badge data-testid="badge-status-contacted" className="bg-yellow-500 text-white no-default-hover-elevate no-default-active-elevate">تم التواصل</Badge>;
  }
  if (status === "converted") {
    return <Badge data-testid="badge-status-converted" className="bg-green-500 text-white no-default-hover-elevate no-default-active-elevate">تم التحويل</Badge>;
  }
  return <Badge data-testid="badge-status-unknown">{status}</Badge>;
}

export function OrderStatusBadge({ status }: { status: string | null | undefined }) {
  if (status === "pending" || !status) {
    return <Badge data-testid="badge-status-pending" className="bg-yellow-500 text-white no-default-hover-elevate no-default-active-elevate">قيد الانتظار</Badge>;
  }
  if (status === "confirmed") {
    return <Badge data-testid="badge-status-confirmed" className="bg-green-500 text-white no-default-hover-elevate no-default-active-elevate">مؤكد</Badge>;
  }
  if (status === "rejected" || status === "cancelled") {
    return <Badge data-testid={`badge-status-${status}`} className="bg-red-500 text-white no-default-hover-elevate no-default-active-elevate">
      {status === "rejected" ? "مرفوض" : "ملغى"}
    </Badge>;
  }
  return <Badge data-testid="badge-status-unknown">{status}</Badge>;
}

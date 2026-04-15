import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/atoms/Badge";
import { OrderStatusBadge } from "@/components/molecules/StatusBadge";
import { formatDate } from "../../utils/formatters";
import type { OrderType } from "@shared/schema";

interface OrderDetailsDialogProps {
  order: OrderType;
}

export function OrderDetailsDialog({ order }: OrderDetailsDialogProps) {
  return (
    <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0" dir="rtl">
      <DialogHeader className="p-6 pb-3 border-b shrink-0">
        <DialogTitle className="text-xl font-bold flex items-center gap-3">
          <span>تفاصيل الطلب</span>
          <OrderStatusBadge status={order.status} />
        </DialogTitle>
        <DialogDescription className="text-sm mt-1">
          <span className="font-semibold text-foreground">{order.clientName}</span>
          {" · "}
          <span dir="ltr" className="inline-block">{order.phone}</span>
          {" · "}
          <span>{order.email}</span>
        </DialogDescription>
      </DialogHeader>

      <div className="overflow-y-auto flex-1 p-6 space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/40 p-3 rounded-lg border">
            <p className="text-xs font-medium text-muted-foreground mb-1">الشركة / المسمى</p>
            <p className="font-semibold text-sm">{order.companyName || "غير محدد"}</p>
          </div>
          <div className="bg-muted/40 p-3 rounded-lg border">
            <p className="text-xs font-medium text-muted-foreground mb-1">خدمة الاهتمام</p>
            <p className="font-semibold text-sm">{order.serviceInterest || "غير محدد"}</p>
          </div>
          <div className="bg-muted/40 p-3 rounded-lg border">
            <p className="text-xs font-medium text-muted-foreground mb-1">الباقة المختارة</p>
            <Badge variant="secondary" className="text-sm">{order.plan === "monthly" ? "الباقة الشهرية" : order.plan}</Badge>
          </div>
          <div className="bg-muted/40 p-3 rounded-lg border">
            <p className="text-xs font-medium text-muted-foreground mb-1">المبلغ الإجمالي</p>
            <p className="font-semibold text-sm">{order.amount} ج.م</p>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <div className="bg-muted/50 px-4 py-2.5 border-b text-sm font-semibold">
            الخدمات / المشاريع المطلوبة ({order.services?.length || 0})
          </div>
          <div className="divide-y">
            {order.services && order.services.length > 0 ? (
              order.services.map((service: any, idx: number) => (
                <div key={idx} className="p-4 bg-card/50">
                  <p className="font-bold text-sm mb-0.5">المشروع {idx + 1}: {service.name}</p>
                  {service.description && (
                    <p className="text-sm text-muted-foreground">{service.description}</p>
                  )}
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-muted-foreground text-sm">لا يوجد مشاريع محددة</div>
            )}
          </div>
        </div>

        {order.couponCode && (
          <div className="bg-green-500/10 border border-green-500/20 p-3 rounded-lg">
            <p className="text-sm font-bold text-green-700 dark:text-green-400">كوبون مُطبَّق</p>
            <p className="text-sm text-muted-foreground mt-0.5">الكود: <strong dir="ltr">{order.couponCode}</strong></p>
          </div>
        )}

        {order.cancelReason && (
          <div className="bg-destructive/10 border border-destructive/20 p-3 rounded-lg">
            <p className="text-sm font-bold text-destructive">سبب الإلغاء</p>
            <p className="text-sm mt-0.5">{order.cancelReason}</p>
          </div>
        )}

        {order.transferImage && (
          <div className="border rounded-lg p-4">
            <p className="font-semibold text-sm mb-3">إيصال الدفع</p>
            <a href={order.transferImage} target="_blank" rel="noreferrer" className="block max-w-xs overflow-hidden rounded border hover:opacity-90 transition-opacity">
              <img src={order.transferImage} alt="Payment Transfer Proof" className="w-full h-auto object-cover" />
            </a>
          </div>
        )}

        <p className="text-xs text-muted-foreground">تم الإرسال: {formatDate(order.createdAt)}</p>
      </div>
    </DialogContent>
  );
}

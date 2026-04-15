import { Edit, XCircle, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { OrderStatusBadge } from "@/components/molecules/StatusBadge";
import {
  formatDate,
  formatServices,
  formatServiceInterest,
} from "../../utils/formatters";
import type { OrderType } from "@shared/schema";

export function OrderRow({ order, onUpdateStatus, onEditPlan, onCancel, onView, onDelete }: any) {
  return (
    <tr className="border-b">
      <td className="p-3">
        <div className="font-semibold">{order.clientName}</div>
        <div className="text-xs text-muted-foreground">
          {formatServices(order.services)}
        </div>
      </td>
      <td className="p-3" dir="ltr">
        {order.phone}
      </td>
      <td className="p-3">
        {formatServiceInterest(order.serviceInterest)}
        <div className="text-xs text-muted-foreground mt-1">{order.plan}</div>
      </td>
      <td className="p-3">{order.amount} ج.م</td>
      <td className="p-3 max-w-[200px] text-xs">
        {order.status === "cancelled" && order.cancelReason && (
          <div className="text-destructive font-semibold">
            بسبب: {order.cancelReason}
          </div>
        )}
      </td>
      <td className="p-3">
        <OrderStatusBadge status={order.status} />
      </td>
      <td className="p-3">
        {order.transferImage ? (
          <a href={order.transferImage} target="_blank">
            <img
              src={order.transferImage}
              alt="proof"
              className="w-10 h-10 object-cover rounded"
            />
          </a>
        ) : (
          "-"
        )}
      </td>
      <td className="p-3 text-muted-foreground text-xs">
        {formatDate(order.createdAt)}
      </td>
      <td className="p-3">
        <div className="flex gap-1 flex-wrap">
          {order.status !== "confirmed" && order.status !== "cancelled" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onUpdateStatus("confirmed")}
            >
              تأكيد
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={onView}
            title="عرض التفاصيل"
          >
            <Eye className="h-4 w-4" />
          </Button>

          {order.status !== "cancel" && (
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={onEditPlan}
                title="تعديل (Edit)"
              >
                <Edit className="h-4 w-4" />
              </Button>
              {order.status !== "cancelled" && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive"
                  onClick={onCancel}
                  title="إلغاء الطلب (Cancel)"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              )}
            </>
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

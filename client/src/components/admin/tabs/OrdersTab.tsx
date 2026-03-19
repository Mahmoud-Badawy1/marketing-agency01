import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { adminFetch } from "@/lib/admin";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon } from "lucide-react";
import { OrderStatusBadge } from "../StatusBadges";
import { formatDate, formatChildren, formatSchoolType } from "../utils/formatters";
import type { OrderType } from "@shared/schema";

export function OrdersTab() {
  const { toast } = useToast();
  const { data: orders = [], isLoading } = useQuery<OrderType[]>({
    queryKey: ["/api/admin/orders"],
    queryFn: async () => {
      const res = await adminFetch("/api/admin/orders");
      if (!res.ok) throw new Error("Failed to fetch orders");
      return res.json();
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await adminFetch(`/api/admin/orders/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({ title: "تم التحديث بنجاح" });
    },
    onError: () => {
      toast({ title: "خطأ", description: "فشل في تحديث الحالة", variant: "destructive" });
    },
  });

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground" data-testid="loading-orders">جاري التحميل...</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm" data-testid="table-orders">
        <thead>
          <tr className="border-b">
            <th className="text-right p-3 font-medium">اسم العميل</th>
            <th className="text-right p-3 font-medium">الهاتف</th>
            <th className="text-right p-3 font-medium">الجنسية</th>
            <th className="text-right p-3 font-medium">نوع الخدمة</th>
            <th className="text-right p-3 font-medium">الباقة / الخدمة</th>
            <th className="text-right p-3 font-medium">المبلغ</th>
            <th className="text-right p-3 font-medium">تفاصيل أخرى</th>
            <th className="text-right p-3 font-medium">الحالة</th>
            <th className="text-right p-3 font-medium">صورة التحويل</th>
            <th className="text-right p-3 font-medium">التاريخ</th>
            <th className="text-right p-3 font-medium">إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id} className="border-b" data-testid={`row-order-${order._id}`}>
              <td className="p-3" data-testid={`text-order-name-${order._id}`}>{order.parentName}</td>
              <td className="p-3" data-testid={`text-order-phone-${order._id}`}>{order.phone}</td>
              <td className="p-3">{order.nationality || "-"}</td>
              <td className="p-3">{formatSchoolType(order.schoolType)}</td>
              <td className="p-3" data-testid={`text-order-plan-${order._id}`}>{order.plan}</td>
              <td className="p-3" data-testid={`text-order-amount-${order._id}`}>{order.amount} ج.م</td>
              <td className="p-3 max-w-[200px]" data-testid={`text-order-children-${order._id}`}>
                {formatChildren(order.children)}
              </td>
              <td className="p-3"><OrderStatusBadge status={order.status} /></td>
              <td className="p-3">
                {order.transferImage ? (
                  <a href={order.transferImage} target="_blank" rel="noopener noreferrer" data-testid={`link-order-image-${order._id}`}>
                    <img
                      src={order.transferImage}
                      alt="صورة التحويل"
                      className="w-12 h-12 object-cover rounded-md cursor-pointer"
                    />
                  </a>
                ) : (
                  <span className="text-muted-foreground flex items-center gap-1">
                    <ImageIcon className="h-4 w-4" />
                    لا توجد
                  </span>
                )}
              </td>
              <td className="p-3 text-muted-foreground text-xs" data-testid={`text-order-date-${order._id}`}>{formatDate(order.createdAt)}</td>
              <td className="p-3">
                <div className="flex gap-1 flex-wrap">
                  {order.status !== "confirmed" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStatus.mutate({ id: order._id, status: "confirmed" })}
                      disabled={updateStatus.isPending}
                      data-testid={`button-order-confirmed-${order._id}`}
                    >
                      تأكيد
                    </Button>
                  )}
                  {order.status !== "rejected" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStatus.mutate({ id: order._id, status: "rejected" })}
                      disabled={updateStatus.isPending}
                      data-testid={`button-order-rejected-${order._id}`}
                    >
                      رفض
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {orders.length === 0 && (
            <tr>
              <td colSpan={11} className="p-8 text-center text-muted-foreground" data-testid="text-no-orders">لا توجد اشتراكات</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, differenceInHours } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { ShoppingBag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import CancelDialog from "./CancelDialog";

interface OrdersTabProps {
  getAuthHeaders: () => { Authorization: string };
  bookingPolicies: any;
}

export default function OrdersTab({ getAuthHeaders, bookingPolicies }: OrdersTabProps) {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const locale = language === "ar" ? ar : enUS;

  const [cancelOrderObj, setCancelOrderObj] = useState<any>(null);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["/api/user/orders"],
    queryFn: async () => {
      const res = await fetch("/api/user/orders", { headers: getAuthHeaders() });
      if (!res.ok) throw new Error("Failed to fetch orders");
      return res.json();
    },
  });

  const cancelOrderMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const res = await fetch(`/api/user/orders/${id}/cancel`, {
        method: "PUT",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) throw new Error("Failed to cancel order");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/orders"] });
      setCancelOrderObj(null);
      toast({ title: t({ ar: "تم إلغاء الطلب بنجاح", en: "Order cancelled successfully" }) });
    },
    onError: () => {
      toast({ title: t({ ar: "خطأ", en: "Error" }), description: t({ ar: "فشل في إلغاء الطلب", en: "Failed to cancel order" }), variant: "destructive" });
    },
  });

  if (isLoading) return <div className="py-8 text-center">{t({ ar: "جاري تحميل الطلبات...", en: "Loading orders..." })}</div>;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t({ ar: "الطلبات والمشتريات", en: "Orders & Purchases" })}</CardTitle>
          <CardDescription>{t({ ar: "سجل كامل لاشتراكاتك وحالة الدفع", en: "Full history of your subscriptions and payment status" })}</CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">{t({ ar: "لا توجد طلبات سابقة.", en: "No previous orders." })}</p>
          ) : (
            <div className="space-y-4">
              {orders.map((order: any) => {
                const hoursSinceOrder = differenceInHours(new Date(), new Date(order.createdAt));
                const canCancel = hoursSinceOrder < (bookingPolicies.cancelDeadlineHours || 48) && order.status !== "cancelled" && order.status !== "rejected";

                return (
                  <div key={order._id} className="p-4 border border-card-border rounded-lg bg-card group hover:border-accent/50 transition-colors">
                    <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
                      <div>
                        <h3 className="font-bold text-lg">{order.plan}</h3>
                        <p className="text-sm text-muted-foreground">{format(new Date(order.createdAt), "PPP", { locale })}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                          order.status === 'completed' || order.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                          order.status === 'cancelled' || order.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {order.status === 'completed' || order.status === 'confirmed' ? t({ ar: "مؤكد", en: "Confirmed" }) :
                           order.status === 'cancelled' ? t({ ar: "ملغى", en: "Cancelled" }) :
                           order.status === 'rejected' ? t({ ar: "مرفوض", en: "Rejected" }) :
                           t({ ar: "قيد المراجعة", en: "Pending" })}
                        </div>
                        {canCancel && (
                          <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => setCancelOrderObj(order)}>
                            {t({ ar: "إلغاء الطلب", en: "Cancel Order" })}
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="text-foreground font-semibold">
                      {t({ ar: "المبلغ الإجمالي:", en: "Total Amount:" })} {order.amount || order.originalAmount} {t({ ar: "ج.م", en: "EGP" })}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <CancelDialog
        open={!!cancelOrderObj}
        onOpenChange={(val) => !val && setCancelOrderObj(null)}
        title={t({ ar: "إلغاء الطلب", en: "Cancel Order" })}
        description={t({ ar: "هل أنت متأكد من رغبتك في إلغاء هذا الطلب؟ يرجى توضيح السبب.", en: "Are you sure you want to cancel this order? Please provide a reason." })}
        isPending={cancelOrderMutation.isPending}
        onConfirm={(reason) => cancelOrderMutation.mutate({ id: cancelOrderObj._id, reason })}
      />
    </>
  );
}

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { adminFetch } from "@/lib/admin";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, Edit, XCircle } from "lucide-react";
import { OrderStatusBadge } from "../StatusBadges";
import { formatDate, formatServices, formatServiceInterest } from "../utils/formatters";
import type { OrderType } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSmartSearch } from "@/hooks/use-smart-search";
import { exportToExcel } from "@/hooks/use-excel-export";
import { AdminSearchBar } from "../AdminSearchBar";
import { ExportButton } from "../ExportButton";

export function OrdersTab() {
  const { toast } = useToast();
  
  // Dialog States
  const [cancelOrderObj, setCancelOrderObj] = useState<OrderType | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  
  const [editPlanOrder, setEditPlanOrder] = useState<OrderType | null>(null);
  const [newPlan, setNewPlan] = useState("");
  const [newAmount, setNewAmount] = useState<number | "">("");

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

  const cancelOrderMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const res = await adminFetch(`/api/admin/orders/${id}/cancel`, {
        method: "PUT",
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) throw new Error("Failed to cancel order");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      setCancelOrderObj(null);
      setCancelReason("");
      toast({ title: "تم إلغاء الطلب بنجاح" });
    },
    onError: () => {
      toast({ title: "خطأ", description: "فشل في إلغاء الطلب", variant: "destructive" });
    },
  });

  const updatePlanMutation = useMutation({
    mutationFn: async ({ id, plan, amount }: { id: string; plan: string; amount: number }) => {
      const res = await adminFetch(`/api/admin/orders/${id}/plan`, {
        method: "PUT",
        body: JSON.stringify({ plan, amount }),
      });
      if (!res.ok) throw new Error("Failed to update plan");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      setEditPlanOrder(null);
      toast({ title: "تم التعديل بنجاح" });
    },
    onError: () => {
      toast({ title: "خطأ", description: "فشل في تعديل الباقة", variant: "destructive" });
    },
  });

  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredOrders = useSmartSearch(orders, ['clientName', 'email', 'phone', 'plan', 'couponCode'], searchQuery);

  const handleExport = () => {
    exportToExcel(
      filteredOrders,
      [
        { key: 'clientName', header: 'اسم العميل' },
        { key: 'email', header: 'البريد' },
        { key: 'phone', header: 'الهاتف' },
        { key: 'plan', header: 'نوع الخدمة', formatter: (val) => formatServiceInterest(val as string) },
        { key: 'services', header: 'الخدمات الإضافية', formatter: (val) => formatServices(val as string[]) },
        { key: 'amount', header: 'المبلغ' },
        { key: 'couponCode', header: 'كوبون الخصم' },
        { key: 'status', header: 'الحالة' },
        { key: 'createdAt', header: 'التاريخ', formatter: (val) => formatDate(val as string) },
      ],
      `orders_export_${new Date().toISOString().split('T')[0]}`
    );
  };

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground" data-testid="loading-orders">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-4 relative">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex-1">
          <AdminSearchBar 
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="ابحث بالاسم، الهاتف، البريد، الباقة، أو كوبون الخصم..."
            resultCount={filteredOrders.length}
            totalCount={orders.length}
          />
        </div>
        <ExportButton onExport={handleExport} className="shrink-0" />
      </div>
    
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-sm" data-testid="table-orders">
        <thead>
          <tr className="border-b">
            <th className="text-right p-3 font-medium">اسم العميل</th>
            <th className="text-right p-3 font-medium">الهاتف</th>
            <th className="text-right p-3 font-medium">الخدمة / الباقة</th>
            <th className="text-right p-3 font-medium">المبلغ</th>
            <th className="text-right p-3 font-medium">تعليمات / سبب الإلغاء</th>
            <th className="text-right p-3 font-medium">الحالة</th>
            <th className="text-right p-3 font-medium">التحويل</th>
            <th className="text-right p-3 font-medium">التاريخ</th>
            <th className="text-right p-3 font-medium">إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map((order) => (
            <tr key={order._id} className="border-b" data-testid={`row-order-${order._id}`}>
              <td className="p-3">
                <div className="font-semibold">{order.clientName}</div>
                <div className="text-xs text-muted-foreground">التفاصيل: {formatServices(order.services)}</div>
              </td>
              <td className="p-3" dir="ltr">{order.phone}</td>
              <td className="p-3">
                {formatServiceInterest(order.serviceInterest)}
                <div className="text-xs text-muted-foreground mt-1">{order.plan}</div>
              </td>
              <td className="p-3">{order.amount} ج.م</td>
              <td className="p-3 max-w-[200px] text-xs">
                {order.status === 'cancelled' && order.cancelReason && (
                 <div className="text-destructive font-semibold">سبب الإلغاء: {order.cancelReason}</div>
                )}
              </td>
              <td className="p-3"><OrderStatusBadge status={order.status} /></td>
              <td className="p-3">
                {order.transferImage ? (
                  <a href={order.transferImage} target="_blank" rel="noopener noreferrer">
                    <img src={order.transferImage} alt="التحويل" className="w-10 h-10 object-cover rounded-md" />
                  </a>
                ) : (
                  <span className="text-muted-foreground text-xs flex items-center gap-1">لا توجد</span>
                )}
              </td>
              <td className="p-3 text-muted-foreground text-xs">{formatDate(order.createdAt)}</td>
              <td className="p-3">
                <div className="flex gap-1 flex-wrap">
                  {order.status !== "confirmed" && order.status !== "cancelled" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8"
                      onClick={() => updateStatus.mutate({ id: order._id, status: "confirmed" })}
                      disabled={updateStatus.isPending || cancelOrderMutation.isPending || updatePlanMutation.isPending}
                    >
                      تأكيد
                    </Button>
                  )}
                  {order.status !== "rejected" && order.status !== "cancelled" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8"
                      onClick={() => updateStatus.mutate({ id: order._id, status: "rejected" })}
                      disabled={updateStatus.isPending || cancelOrderMutation.isPending || updatePlanMutation.isPending}
                    >
                      رفض
                    </Button>
                  )}
                  {order.status !== "cancelled" && (
                     <>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 px-2"
                        title="تعديل الباقة / المبلغ"
                        onClick={() => {
                          setEditPlanOrder(order);
                          setNewPlan(order.plan);
                          setNewAmount(order.amount);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                        title="إلغاء الطلب"
                        onClick={() => setCancelOrderObj(order)}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                     </>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {filteredOrders.length === 0 && (
            <tr>
              <td colSpan={9} className="p-8 text-center text-muted-foreground">
                لا يوجد نتائج للبحث العالي
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>

      {/* Cancel Dialog */}
      <Dialog open={!!cancelOrderObj} onOpenChange={(val) => !val && setCancelOrderObj(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إلغاء الطلب</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>سبب الإلغاء الشائع للعميل وللإدارة</Label>
              <Textarea 
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                placeholder="اذكر السبب..."
                rows={4}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCancelOrderObj(null)}>تراجع</Button>
              <Button 
                variant="destructive"
                disabled={!cancelReason.trim() || cancelOrderMutation.isPending}
                onClick={() => {
                  if (cancelOrderObj) {
                    cancelOrderMutation.mutate({ id: cancelOrderObj._id, reason: cancelReason });
                  }
                }}
              >
                تأكيد الإلغاء
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Edit Plan Dialog */}
      <Dialog open={!!editPlanOrder} onOpenChange={(val) => !val && setEditPlanOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ترقية / تعديل الباقة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>اسم الباقة الجديدة</Label>
              <Input 
                value={newPlan}
                onChange={e => setNewPlan(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>المبلغ الجديد</Label>
              <Input 
                type="number"
                value={newAmount}
                onChange={e => setNewAmount(e.target.value === "" ? "" : Number(e.target.value))}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditPlanOrder(null)}>تراجع</Button>
              <Button 
                disabled={!newPlan.trim() || newAmount === "" || updatePlanMutation.isPending}
                onClick={() => {
                  if (editPlanOrder && newAmount !== "") {
                    updatePlanMutation.mutate({ id: editPlanOrder._id, plan: newPlan, amount: newAmount as number });
                  }
                }}
              >
                حفظ التعديلات
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}

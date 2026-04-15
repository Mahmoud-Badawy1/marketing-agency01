import { AdminSearchBar } from "@/components/molecules/AdminSearchBar";
import { ExportButton } from "@/components/molecules/ExportButton";
import { useOrdersData } from "./useOrdersData";
import { OrderRow } from "./OrderRow";
import { exportToExcel } from "@/hooks/use-excel-export";
import { formatDate, formatServices, formatServiceInterest } from "../../utils/formatters";
import { Dialog } from "@/components/ui/dialog";
import { OrderCancelDialog } from "./OrderCancelDialog";
import { OrderEditPlanDialog } from "./OrderEditPlanDialog";
import { OrderDetailsDialog } from "./OrderDetailsDialog";
import { OrderDeleteDialog } from "./OrderDeleteDialog";
import { useState } from "react";
import type { OrderType } from "@shared/schema";

export function OrdersTab() {
  const d = useOrdersData();
  const [viewOrder, setViewOrder] = useState<OrderType | null>(null);
  const [deleteOrderObj, setDeleteOrderObj] = useState<OrderType | null>(null);

  const handleExport = () => {
    exportToExcel(d.filteredOrders, [
      { key: 'clientName', header: 'اسم العميل' }, { key: 'email', header: 'البريد' }, { key: 'phone', header: 'الهاتف' },
      { key: 'plan', header: 'الباقة', formatter: (v) => formatServiceInterest(v as string) },
      { key: 'amount', header: 'المبلغ' }, { key: 'status', header: 'الحالة' },
      { key: 'createdAt', header: 'التاريخ', formatter: (v) => formatDate(v as string) }
    ], `orders_export_${new Date().toISOString().split('T')[0]}`);
  };

  if (d.isLoading) return <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex-1 text-right"><AdminSearchBar value={d.searchQuery} onChange={d.setSearchQuery} placeholder="ابحث بالاسم، الهاتف، الباقة..." resultCount={d.filteredOrders.length} totalCount={d.orders.length} /></div>
        <ExportButton onExport={handleExport} className="shrink-0" />
      </div>

      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-sm" dir="rtl">
          <thead>
            <tr className="border-b bg-muted/50 text-right"><th className="p-3 font-medium">العميل</th><th className="p-3 font-medium">الهاتف</th><th className="p-3 font-medium">الباقة</th><th className="p-3 font-medium">المبلغ</th><th className="p-3 font-medium">ملاحظات</th><th className="p-3 font-medium">الحالة</th><th className="p-3 font-medium">التحويل</th><th className="p-3 font-medium">التاريخ</th><th className="p-3 font-medium">إجراءات</th></tr>
          </thead>
          <tbody>
            {d.filteredOrders.map((o) => (
              <OrderRow 
                key={o._id} order={o} 
                onUpdateStatus={(s: string) => d.updateStatus.mutate({ id: o._id, status: s })} 
                onEditPlan={() => { d.setEditPlanOrder(o); d.setNewPlan(o.plan); d.setNewAmount(o.amount); }} 
                onCancel={() => d.setCancelOrderObj(o)}
                onView={() => setViewOrder(o)}
                onDelete={() => setDeleteOrderObj(o)}
              />
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!d.cancelOrderObj} onOpenChange={(v) => !v && d.setCancelOrderObj(null)}>
        <OrderCancelDialog cancelReason={d.cancelReason} setCancelReason={d.setCancelReason} isPending={d.cancelOrderMutation.isPending} onCancel={() => d.setCancelOrderObj(null)} onConfirm={() => d.cancelOrderObj && d.cancelOrderMutation.mutate({ id: d.cancelOrderObj._id, reason: d.cancelReason })} />
      </Dialog>
      <Dialog open={!!d.editPlanOrder} onOpenChange={(v) => !v && d.setEditPlanOrder(null)}>
        <OrderEditPlanDialog newPlan={d.newPlan} setNewPlan={d.setNewPlan} newAmount={d.newAmount} setNewAmount={d.setNewAmount} isPending={d.updatePlanMutation.isPending} onCancel={() => d.setEditPlanOrder(null)} onConfirm={() => d.editPlanOrder && d.updatePlanMutation.mutate({ id: d.editPlanOrder._id, plan: d.newPlan, amount: d.newAmount as number })} />
      </Dialog>
      <Dialog open={!!viewOrder} onOpenChange={(v) => !v && setViewOrder(null)}>
        {viewOrder && <OrderDetailsDialog order={viewOrder} />}
      </Dialog>
      <Dialog open={!!deleteOrderObj} onOpenChange={(v) => !v && setDeleteOrderObj(null)}>
        <OrderDeleteDialog 
          isPending={d.deleteOrderMutation.isPending} 
          onCancel={() => setDeleteOrderObj(null)} 
          onConfirm={() => {
            if (deleteOrderObj) {
              d.deleteOrderMutation.mutate(deleteOrderObj._id, {
                onSuccess: () => setDeleteOrderObj(null)
              });
            }
          }} 
        />
      </Dialog>
    </div>
  );
}

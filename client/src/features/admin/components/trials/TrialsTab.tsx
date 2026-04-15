import { useState } from "react";
import { AdminSearchBar } from "@/components/molecules/AdminSearchBar";
import { ExportButton } from "@/components/molecules/ExportButton";
import { useTrialsData } from "./useTrialsData";
import { TrialRow } from "./TrialRow";
import { exportToExcel } from "@/hooks/use-excel-export";
import { formatDate, formatServiceInterest } from "../../utils/formatters";
import { Dialog } from "@/components/ui/dialog";
import { TrialEditDialog } from "./TrialEditDialog";
import { TrialCancelDialog } from "./TrialCancelDialog";
import { TrialDeleteDialog } from "./TrialDeleteDialog";

export function TrialsTab() {
  const t = useTrialsData();

  const handleExport = () => {
    exportToExcel(t.filteredBookings, [
      { key: 'clientName', header: 'اسم العميل' },
      { key: 'email', header: 'البريد' },
      { key: 'phone', header: 'الهاتف' },
      { key: 'companyName', header: 'الشركة' },
      { key: 'serviceInterest', header: 'الخدمة', formatter: (val) => formatServiceInterest(val as string) },
      { key: 'status', header: 'الحالة' },
      { key: 'scheduledTime', header: 'الموعد', formatter: (val) => val ? formatDate(val as string) : 'لم يحدد' },
      { key: 'createdAt', header: 'تاريخ الطلب', formatter: (val) => formatDate(val as string) },
    ], `trials_export_${new Date().toISOString().split('T')[0]}`);
  };

  const openEdit = (booking: any) => {
    t.setEditingBooking(booking);
    let time = "";
    if (booking.scheduledTime) {
      const d = new Date(booking.scheduledTime);
      const pad = (n: number) => n.toString().padStart(2, '0');
      time = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }
    t.setEditForm({ status: booking.status || "pending", meetingLink: booking.meetingLink || "", adminNotes: booking.adminNotes || "", scheduledTime: time, cancelReason: booking.cancelReason || "" });
  };

  if (t.isLoading) return <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex-1 text-right"><AdminSearchBar value={t.searchQuery} onChange={t.setSearchQuery} placeholder="ابحث بالاسم، الهاتف، البريد، أو الشركة..." resultCount={t.filteredBookings.length} totalCount={t.bookings.length} /></div>
        <ExportButton onExport={handleExport} className="shrink-0" />
      </div>

      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-sm" dir="rtl">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-right p-3 font-medium">اسم العميل</th><th className="text-right p-3 font-medium">البريد</th><th className="text-right p-3 font-medium">الهاتف</th><th className="text-right p-3 font-medium">الشركة</th><th className="text-right p-3 font-medium">الخدمة</th><th className="text-right p-3 font-medium">الحالة</th><th className="text-right p-3 font-medium">الموعد</th><th className="text-right p-3 font-medium">تاريخ الطلب</th><th className="text-right p-3 font-medium">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {t.filteredBookings.map((b) => <TrialRow key={b._id} booking={b} onEdit={() => openEdit(b)} onCancel={() => t.setCancelingBooking(b)} onDelete={() => t.setDeletingBooking(b)} />)}
          </tbody>
        </table>
      </div>

      <Dialog open={!!t.editingBooking} onOpenChange={(o) => !o && t.setEditingBooking(null)}>
        <TrialEditDialog editingBooking={t.editingBooking} editForm={t.editForm} setEditForm={t.setEditForm} isPending={t.updateBookingMutation.isPending} onCancel={() => t.setEditingBooking(null)} onUpdate={() => t.editingBooking && t.updateBookingMutation.mutate({ id: t.editingBooking._id, data: t.editForm })} />
      </Dialog>
      <Dialog open={!!t.cancelingBooking} onOpenChange={(o) => !o && t.setCancelingBooking(null)}>
        <TrialCancelDialog booking={t.cancelingBooking} cancelReason={t.cancelReason} setCancelReason={t.setCancelReason} isPending={t.cancelBookingMutation.isPending} onCancel={() => t.setCancelingBooking(null)} onConfirm={() => t.cancelingBooking && t.cancelBookingMutation.mutate({ id: t.cancelingBooking._id, reason: t.cancelReason })} />
      </Dialog>
      <Dialog open={!!t.deletingBooking} onOpenChange={(o) => !o && t.setDeletingBooking(null)}>
        <TrialDeleteDialog booking={t.deletingBooking} isPending={t.deleteBookingMutation.isPending} onCancel={() => t.setDeletingBooking(null)} onConfirm={() => t.deletingBooking && t.deleteBookingMutation.mutate(t.deletingBooking._id)} />
      </Dialog>
    </div>
  );
}

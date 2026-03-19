import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { adminFetch } from "@/lib/admin";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "../StatusBadges";
import { formatDate, formatChildren, formatSchoolType } from "../utils/formatters";
import type { TrialBookingType } from "@shared/schema";

export function TrialsTab() {
  const { toast } = useToast();
  const { data: bookings = [], isLoading } = useQuery<TrialBookingType[]>({
    queryKey: ["/api/admin/trial-bookings"],
    queryFn: async () => {
      const res = await adminFetch("/api/admin/trial-bookings");
      if (!res.ok) throw new Error("Failed to fetch bookings");
      return res.json();
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await adminFetch(`/api/admin/trial-bookings/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/trial-bookings"] });
      toast({ title: "تم التحديث بنجاح" });
    },
    onError: () => {
      toast({ title: "خطأ", description: "فشل في تحديث الحالة", variant: "destructive" });
    },
  });

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground" data-testid="loading-trials">جاري التحميل...</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm" data-testid="table-trials">
        <thead>
          <tr className="border-b">
            <th className="text-right p-3 font-medium">اسم العميل</th>
            <th className="text-right p-3 font-medium">الهاتف</th>
            <th className="text-right p-3 font-medium">الجنسية</th>
            <th className="text-right p-3 font-medium">نوع الخدمة</th>
            <th className="text-right p-3 font-medium">تفاصيل أخرى</th>
            <th className="text-right p-3 font-medium">الحالة</th>
            <th className="text-right p-3 font-medium">التاريخ</th>
            <th className="text-right p-3 font-medium">إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking._id} className="border-b" data-testid={`row-trial-${booking._id}`}>
              <td className="p-3" data-testid={`text-trial-name-${booking._id}`}>{booking.parentName}</td>
              <td className="p-3" data-testid={`text-trial-phone-${booking._id}`}>{booking.phone}</td>
              <td className="p-3">{booking.nationality || "-"}</td>
              <td className="p-3">{formatSchoolType(booking.schoolType)}</td>
              <td className="p-3 max-w-[200px]" data-testid={`text-trial-children-${booking._id}`}>
                {formatChildren(booking.children)}
              </td>
              <td className="p-3"><OrderStatusBadge status={booking.status} /></td>
              <td className="p-3 text-muted-foreground text-xs" data-testid={`text-trial-date-${booking._id}`}>{formatDate(booking.createdAt)}</td>
              <td className="p-3">
                <div className="flex gap-1 flex-wrap">
                  {booking.status !== "confirmed" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStatus.mutate({ id: booking._id, status: "confirmed" })}
                      disabled={updateStatus.isPending}
                      data-testid={`button-trial-confirmed-${booking._id}`}
                    >
                      تأكيد
                    </Button>
                  )}
                  {booking.status !== "rejected" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStatus.mutate({ id: booking._id, status: "rejected" })}
                      disabled={updateStatus.isPending}
                      data-testid={`button-trial-rejected-${booking._id}`}
                    >
                      رفض
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {bookings.length === 0 && (
            <tr>
              <td colSpan={8} className="p-8 text-center text-muted-foreground" data-testid="text-no-trials">لا توجد حجوزات</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

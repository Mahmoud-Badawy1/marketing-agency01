import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { adminFetch } from "@/lib/admin";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "../StatusBadges";
import { formatDate, formatServiceInterest } from "../utils/formatters";
import type { TrialBookingType } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Edit2, ExternalLink, Calendar, MessageSquare, XCircle, Trash2, Info, User, Phone, Mail, Building2, Settings } from "lucide-react";
import { DialogTrigger } from "@/components/ui/dialog";

export function TrialsTab() {
  const { toast } = useToast();
  const [editingBooking, setEditingBooking] = useState<TrialBookingType | null>(null);
  const [cancelingBooking, setCancelingBooking] = useState<TrialBookingType | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [deletingBooking, setDeletingBooking] = useState<TrialBookingType | null>(null);

  const [editForm, setEditForm] = useState({
    status: "",
    meetingLink: "",
    adminNotes: "",
    scheduledTime: "",
    cancelReason: "",
  });

  const { data: bookings = [], isLoading } = useQuery<TrialBookingType[]>({
    queryKey: ["/api/admin/trial-bookings"],
    queryFn: async () => {
      const res = await adminFetch("/api/admin/trial-bookings");
      if (!res.ok) throw new Error("Failed to fetch bookings");
      return res.json();
    },
  });

  const updateBookingMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await adminFetch(`/api/admin/trial-bookings/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update booking");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/trial-bookings"] });
      setEditingBooking(null);
      toast({ title: "تم التحديث بنجاح" });
    },
    onError: () => {
      toast({ title: "خطأ", description: "فشل في تحديث البيانات", variant: "destructive" });
    },
  });

  const cancelBookingMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const res = await adminFetch(`/api/admin/trial-bookings/${id}/cancel`, {
        method: "PUT",
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) throw new Error("Failed to cancel booking");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/trial-bookings"] });
      setCancelingBooking(null);
      setCancelReason("");
      toast({ title: "تم إلغاء الاستشارة بنجاح" });
    },
    onError: () => {
      toast({ title: "خطأ", description: "فشل في الإلغاء", variant: "destructive" });
    },
  });

  const deleteBookingMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await adminFetch(`/api/admin/trial-bookings/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete booking");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/trial-bookings"] });
      setDeletingBooking(null);
      toast({ title: "تم حذف الاستشارة بنجاح" });
    },
    onError: () => {
      toast({ title: "خطأ", description: "فشل في الحذف", variant: "destructive" });
    },
  });

  const handleEditClick = (booking: TrialBookingType) => {
    setEditingBooking(booking);
    
    // Format to local YYYY-MM-DDTHH:mm for datetime-local input
    let formattedTime = "";
    if (booking.scheduledTime) {
      const d = new Date(booking.scheduledTime);
      const pad = (n: number) => n.toString().padStart(2, '0');
      formattedTime = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }

    setEditForm({
      status: booking.status || "pending",
      meetingLink: booking.meetingLink || "",
      adminNotes: booking.adminNotes || "",
      scheduledTime: formattedTime,
      cancelReason: (booking as any).cancelReason || "",
    });
  };

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground" data-testid="loading-trials">جاري التحميل...</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm" data-testid="table-trials" dir="rtl">
        <thead>
          <tr className="border-b">
            <th className="text-right p-3 font-medium">اسم العميل</th>
            <th className="text-right p-3 font-medium">البريد الإلكتروني</th>
            <th className="text-right p-3 font-medium">الهاتف</th>
            <th className="text-right p-3 font-medium">اسم الشركة</th>
            <th className="text-right p-3 font-medium">نوع الخدمة</th>
            <th className="text-right p-3 font-medium">الحالة</th>
            <th className="text-right p-3 font-medium">الموعد</th>
            <th className="text-right p-3 font-medium">التقديم</th>
            <th className="text-right p-3 font-medium">إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking._id} className="border-b hover:bg-muted/30 transition-colors" data-testid={`row-trial-${booking._id}`}>
              <td className="p-3 font-medium" data-testid={`text-trial-name-${booking._id}`}>{booking.clientName}</td>
              <td className="p-3 text-xs" data-testid={`text-trial-email-${booking._id}`}>{booking.email}</td>
              <td className="p-3" data-testid={`text-trial-phone-${booking._id}`}>{booking.phone}</td>
              <td className="p-3">{booking.companyName || "-"}</td>
              <td className="p-3">{formatServiceInterest(booking.serviceInterest)}</td>
              <td className="p-3">
                <div className="flex flex-col gap-1 items-start">
                  <OrderStatusBadge status={booking.status} />
                  {(booking as any).cancelReason && booking.status !== 'cancelled' && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-amber-50 text-amber-700 border-amber-200">مُعاد جدولته</Badge>
                  )}
                </div>
              </td>
              <td className="p-3">
                {booking.scheduledTime ? (
                  <div className="flex flex-col">
                    <span className="font-semibold text-accent">{formatDate(booking.scheduledTime)}</span>
                    {booking.meetingLink && (
                      <a href={booking.meetingLink} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1">
                        <ExternalLink className="h-3 w-3" /> رابط الاجتماع
                      </a>
                    )}
                  </div>
                ) : (
                  <span className="text-muted-foreground text-xs italic">لم يحدد بعد</span>
                )}
              </td>
              <td className="p-3 text-muted-foreground text-xs" data-testid={`text-trial-date-${booking._id}`}>{formatDate(booking.createdAt)}</td>
              <td className="p-3">
                <div className="flex gap-1 flex-wrap">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="ghost" title="عرض التفاصيل">
                        <Info className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl" dir="rtl">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Info className="h-5 w-5 text-accent" />
                          تفاصيل الاستشارة
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-muted/50 rounded-lg">
                            <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                              <User className="h-3 w-3" /> الاسم
                            </div>
                            <div className="font-bold">{booking.clientName}</div>
                          </div>
                          <div className="p-3 bg-muted/50 rounded-lg">
                            <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                              <Phone className="h-3 w-3" /> الهاتف
                            </div>
                            <div className="font-bold" dir="ltr">{booking.phone}</div>
                          </div>
                          <div className="p-3 bg-muted/50 rounded-lg">
                            <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                              <Mail className="h-3 w-3" /> البريد
                            </div>
                            <div className="font-bold">{booking.email || "-"}</div>
                          </div>
                          <div className="p-3 bg-muted/50 rounded-lg">
                            <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                              <Building2 className="h-3 w-3" /> الشركة
                            </div>
                            <div className="font-bold">{booking.companyName || "-"}</div>
                          </div>
                          <div className="p-3 bg-muted/50 rounded-lg w-full col-span-2">
                            <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                              <Settings className="h-3 w-3" /> الخدمة المطلوبة
                            </div>
                            <div className="font-bold">{formatServiceInterest(booking.serviceInterest)}</div>
                          </div>
                        </div>

                        {booking.message && (
                          <div className="p-4 bg-accent/5 border border-accent/10 rounded-lg">
                            <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                              <MessageSquare className="h-3 w-3 text-accent" /> رسالة العميل عند الحجز
                            </div>
                            <div className="text-sm leading-relaxed whitespace-pre-wrap">
                              {booking.message}
                            </div>
                          </div>
                        )}

                        {(booking as any).cancelReason && (
                          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                            <div className="text-xs text-destructive mb-2 flex items-center gap-1 font-bold">
                              <XCircle className="h-3 w-3" /> سبب الإلغاء / إعادة الجدولة
                            </div>
                            <div className="text-sm leading-relaxed whitespace-pre-wrap">
                              {(booking as any).cancelReason}
                            </div>
                          </div>
                        )}

                        <div className="flex justify-between items-center text-xs text-muted-foreground mt-4 pt-4 border-t border-border">
                          <span>تاريخ الطلب: {formatDate(booking.createdAt)}</span>
                          <OrderStatusBadge status={booking.status} />
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => handleEditClick(booking)} title="تعديل">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  {booking.status !== 'cancelled' && (
                    <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-50" onClick={() => setCancelingBooking(booking)} title="إلغاء الاستشارة">
                      <XCircle className="h-4 w-4" />
                    </Button>
                  )}
                  <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setDeletingBooking(booking)} title="حذف بالكامل">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  {booking.adminNotes && (
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-blue-600" title={booking.adminNotes}>
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {bookings.length === 0 && (
            <tr>
              <td colSpan={9} className="p-8 text-center text-muted-foreground" data-testid="text-no-trials">لا توجد استشارات محجوزة</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Edit Dialog */}
      <Dialog open={!!editingBooking} onOpenChange={(open) => !open && setEditingBooking(null)}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>تعديل بيانات الاستشارة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>حالة الاستشارة</Label>
              <Select value={editForm.status} onValueChange={(val) => setEditForm({ ...editForm, status: val })}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الحالة" />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  <SelectItem value="pending">قيد الانتظار</SelectItem>
                  <SelectItem value="confirmed">مؤكد</SelectItem>
                  <SelectItem value="scheduled">تمت الجدولة</SelectItem>
                  <SelectItem value="cancelled">ملغى</SelectItem>
                  <SelectItem value="rejected">مرفوض</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>موعد الاجتماع</Label>
              <div className="relative">
                <Input
                  type="datetime-local"
                  value={editForm.scheduledTime}
                  onChange={(e) => setEditForm({ ...editForm, scheduledTime: e.target.value })}
                  className="pr-10"
                />
                <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>رابط الاجتماع (Zoom/Google Meet)</Label>
              <Input
                placeholder="https://..."
                value={editForm.meetingLink}
                onChange={(e) => setEditForm({ ...editForm, meetingLink: e.target.value })}
                dir="ltr"
              />
            </div>

            <div className="space-y-2">
              <Label>ملاحظات إضافية (للمسؤول)</Label>
              <Textarea
                placeholder="أضف أي ملاحظات هنا..."
                value={editForm.adminNotes}
                onChange={(e) => setEditForm({ ...editForm, adminNotes: e.target.value })}
                rows={3}
              />
            </div>
            {editingBooking && (editingBooking as any).cancelReason && (
              <div className="space-y-2">
                <Label className="text-amber-700 font-bold">سبب الإلغاء/التعديل (من العميل)</Label>
                <div className="p-3 bg-amber-50 border border-amber-100 rounded-md text-sm whitespace-pre-wrap italic text-amber-900">
                  {(editingBooking as any).cancelReason}
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditingBooking(null)}>إلغاء</Button>
            <Button
              onClick={() => {
                if (editingBooking) {
                  updateBookingMutation.mutate({
                    id: editingBooking._id,
                    data: {
                      status: editForm.status,
                      meetingLink: editForm.meetingLink,
                      adminNotes: editForm.adminNotes,
                      scheduledTime: editForm.scheduledTime || undefined,
                    }
                  });
                }
              }}
              disabled={updateBookingMutation.isPending}
            >
              حفظ التعديلات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={!!cancelingBooking} onOpenChange={(open) => !open && setCancelingBooking(null)}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>إلغاء الاستشارة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">هل أنت متأكد من إلغاء هذه الاستشارة؟ سيتم تغيير حالتها إلى "ملغى".</p>
            <div className="space-y-2">
              <Label>سبب الإلغاء (اختياري)</Label>
              <Textarea
                placeholder="مثال: بناءً على طلب العميل..."
                value={cancelReason}
                onChange={(e: any) => setCancelReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setCancelingBooking(null)}>تراجع</Button>
            <Button
              variant="destructive"
              disabled={cancelBookingMutation.isPending}
              onClick={() => {
                if (cancelingBooking) {
                  cancelBookingMutation.mutate({ id: (cancelingBooking as any)._id, reason: cancelReason });
                }
              }}
            >
              تأكيد الإلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deletingBooking} onOpenChange={(open) => !open && setDeletingBooking(null)}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>حذف الاستشارة بالكامل</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-destructive font-bold mb-2">تحذير: هذا الإجراء لا يمكن التراجع عنه.</p>
            <p className="text-sm text-muted-foreground">سيتم إزالة الاستشارة الخاصة بـ "{deletingBooking?.clientName}" نهائياً من قاعدة البيانات بدلاً من مجرد تغيير حالتها.</p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeletingBooking(null)}>تراجع</Button>
            <Button
              variant="destructive"
              disabled={deleteBookingMutation.isPending}
              onClick={() => {
                if (deletingBooking) {
                  deleteBookingMutation.mutate(deletingBooking._id);
                }
              }}
            >
              تأكيد الحذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

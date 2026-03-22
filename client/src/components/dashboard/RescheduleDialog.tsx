import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { Calendar as CalendarIcon, Clock, Info } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/hooks/use-language";
import type { AvailabilitySlotType } from "@shared/schema";

interface RescheduleDialogProps {
  trial: any;
  open: boolean;
  onClose: () => void;
  onConfirm: (slotId: string, reason: string) => void;
  isPending: boolean;
}

export default function RescheduleDialog({
  trial,
  open,
  onClose,
  onConfirm,
  isPending,
}: RescheduleDialogProps) {
  const { t, language } = useLanguage();
  const locale = language === "ar" ? ar : enUS;

  const [rescheduleDate, setRescheduleDate] = useState<Date | undefined>(undefined);
  const [rescheduleSlotId, setRescheduleSlotId] = useState("");
  const [rescheduleReason, setRescheduleReason] = useState("");

  useEffect(() => {
    if (open) {
      setRescheduleDate(undefined);
      setRescheduleSlotId("");
      setRescheduleReason("");
    }
  }, [open]);

  const { data: rescheduleSlots = [], isLoading: isLoadingRescheduleSlots } = useQuery<AvailabilitySlotType[]>({
    queryKey: ["/api/availability/active", rescheduleDate ? format(rescheduleDate, "yyyy-MM-dd") : null],
    queryFn: async () => {
      if (!rescheduleDate) return [];
      const res = await fetch(`/api/availability/active?date=${format(rescheduleDate, "yyyy-MM-dd")}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!rescheduleDate && open,
  });

  const handleConfirm = () => {
    if (rescheduleSlotId) {
      onConfirm(rescheduleSlotId, rescheduleReason);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent dir={language === "ar" ? "rtl" : "ltr"} className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t({ ar: "تعديل موعد الجلسة", en: "Reschedule Consultation" })}</DialogTitle>
          <DialogDescription>
            {t({
              ar: "يمكنك تغيير الموعد طالما ما زلت ضمن المهلة المحددة.",
              en: "You can change the time as long as you are within the allowed limit.",
            })}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>{t({ ar: "اختر التاريخ", en: "Pick a Date" })}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full justify-start text-right font-normal ${!rescheduleDate && "text-muted-foreground"}`}
                >
                  <CalendarIcon className="ml-2 h-4 w-4" />
                  {rescheduleDate ? format(rescheduleDate, "PPP", { locale }) : t({ ar: "اختر التاريخ", en: "Pick a date" })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={rescheduleDate}
                  onSelect={(date) => {
                    setRescheduleDate(date);
                    setRescheduleSlotId("");
                  }}
                  disabled={(date) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const thirtyDays = new Date();
                    thirtyDays.setDate(today.getDate() + 30);
                    return date < today || date > thirtyDays;
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>{t({ ar: "اختر الوقت", en: "Pick a Time" })}</Label>
            <Select
              value={rescheduleSlotId}
              onValueChange={(v) => setRescheduleSlotId(v)}
              disabled={!rescheduleDate || isLoadingRescheduleSlots}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    !rescheduleDate
                      ? t({ ar: "اختر التاريخ أولاً", en: "Pick date first" })
                      : isLoadingRescheduleSlots
                      ? t({ ar: "جاري التحميل...", en: "Loading..." })
                      : t({ ar: "اختر الوقت", en: "Select Time" })
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {rescheduleSlots.length === 0 && rescheduleDate && !isLoadingRescheduleSlots ? (
                  <div className="p-2 text-xs text-center text-muted-foreground">
                    {t({ ar: "لا توجد مواعيد متاحة هذا اليوم", en: "No available slots for this day" })}
                  </div>
                ) : (
                  rescheduleSlots.map((slot: any) => (
                    <SelectItem key={slot._id} value={slot._id}>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        <span>
                          {slot.startTime} - {slot.endTime}
                        </span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {rescheduleDate && rescheduleSlots.length > 0 && (
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 mt-1">
                <Info className="h-3 w-3" />
                <span>{t({ ar: "المواعيد معروضة بالتوقيت المحلي لمصر", en: "Times are in Egypt local time" })}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>{t({ ar: "سبب تعديل الموعد (اختياري)", en: "Reason for Rescheduling (Optional)" })}</Label>
            <Textarea
              value={rescheduleReason}
              onChange={(e) => setRescheduleReason(e.target.value)}
              placeholder={t({ ar: "مثال: ظرف طارئ...", en: "e.g., An emergency..." })}
              rows={2}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={onClose}>
              {t({ ar: "إإلغاء", en: "Cancel" })}
            </Button>
            <Button disabled={!rescheduleSlotId || isPending} onClick={handleConfirm}>
              {isPending ? t({ ar: "جاري الحفظ...", en: "Saving..." }) : t({ ar: "تأكيد الموعد الجديد", en: "Confirm New Time" })}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

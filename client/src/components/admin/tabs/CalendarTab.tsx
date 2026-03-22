import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { adminFetch } from "@/lib/admin";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, Clock, Users, CheckCircle2, XCircle, Edit, Save, CheckSquare, Square, Layers, Tag, Calendar as CalendarIcon, Filter } from "lucide-react";
import { format, addMinutes, addMonths } from "date-fns";
import { ar } from "date-fns/locale";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AvailabilitySlotType } from "@shared/schema";

const daysMap = [
  { id: 0, label: "الأحد" },
  { id: 1, label: "الإثنين" },
  { id: 2, label: "الثلاثاء" },
  { id: 3, label: "الأربعاء" },
  { id: 4, label: "الخميس" },
  { id: 5, label: "الجمعة" },
  { id: 6, label: "السبت" },
];

export function CalendarTab() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isBulkAddDialogOpen, setIsBulkAddDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<AvailabilitySlotType | null>(null);
  const [initialEditingStartTime, setInitialEditingStartTime] = useState<string | null>(null);
  const [selectedSlotIds, setSelectedSlotIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [dayFilter, setDayFilter] = useState<number | "all">("all");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [isBulkEditDialogOpen, setIsBulkEditDialogOpen] = useState(false);
  const [bulkEditConfig, setBulkEditConfig] = useState<{ capacity?: number; label?: string; isActive?: boolean }>({});
  
  const [isRestructureDialogOpen, setIsRestructureDialogOpen] = useState(false);
  const [restructureConfig, setRestructureConfig] = useState({
    startTime: "09:00",
    endTime: "17:00",
    duration: 45,
    capacity: 1,
  });

  const [newSlot, setNewSlot] = useState({
    date: format(new Date(), "yyyy-MM-dd"),
    startTime: "10:00",
    endTime: "10:30",
    capacity: 1,
    label: "",
  });

  const [bulkConfig, setBulkConfig] = useState({
    startDate: format(new Date(), "yyyy-MM-dd"),
    endDate: format(addMonths(new Date(), 1), "yyyy-MM-dd"),
    daysOfWeek: [new Date().getDay()],
    startTime: "09:00",
    endTime: "17:00",
    duration: 30, // minutes
    capacity: 1,
    label: "",
  });

  const [seriesAction, setSeriesAction] = useState<"item" | "series">("item");

  const { data: slots = [], isLoading } = useQuery<AvailabilitySlotType[]>({
    queryKey: ["/api/admin/availability", "upcoming"],
    queryFn: async () => {
      const res = await adminFetch(`/api/admin/availability`);
      if (!res.ok) throw new Error("Failed to fetch slots");
      return res.json();
    },
  });

  const uniqueLabels = useMemo(() => {
    return Array.from(new Set(slots.filter(s => !!s.label).map(s => s.label as string)));
  }, [slots]);

  const filteredSlots = useMemo(() => {
    let list = slots;
    if (activeTab === "general") list = list.filter(s => !s.label);
    else if (activeTab !== "all") list = list.filter(s => s.label === activeTab);

    if (dayFilter !== "all") {
      // Use local getDay() to perfectly align with the UI formatted text regardless of old data timestamp jitter
      list = list.filter(s => new Date(s.date).getDay() === dayFilter);
    }
    
    if (dateFilter) {
      // Evaluate string representation using local format to guarantee what they filter is what they see
      list = list.filter(s => format(new Date(s.date), "yyyy-MM-dd") === dateFilter);
    }
    return list;
  }, [slots, activeTab, dayFilter, dateFilter]);

  const addSlotMutation = useMutation({
    mutationFn: async (data: any) => {
      const payload = { ...data };
      if (!payload.label) delete payload.label;

      const res = await adminFetch("/api/admin/availability", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to add slot");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/availability", "upcoming"] });
      setIsAddDialogOpen(false);
      setNewSlot(prev => ({ ...prev, label: "" }));
      toast({ title: "تم إضافة الموعد بنجاح" });
    },
    onError: (error) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });

  const deleteSlotMutation = useMutation({
    mutationFn: async ({ id, isSeries }: { id: string; isSeries: boolean }) => {
      const endpoint = isSeries && slots.find(s => s._id === id)?.recurrenceId
        ? `/api/admin/availability-series/${slots.find(s => s._id === id)?.recurrenceId}`
        : `/api/admin/availability-item/${id}`;
        
      const res = await adminFetch(endpoint, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete slot");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/availability", "upcoming"] });
      setSelectedSlotIds([]); // clear selection just in case
      toast({ title: "تم حذف الموعد" });
    },
  });

  const addBulkSlotsMutation = useMutation({
    mutationFn: async (payload: { slots: any[]; startDate: string; endDate: string; daysOfWeek: number[] }) => {
      const res = await adminFetch("/api/admin/availability-bulk", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to add bulk slots");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/availability", "upcoming"] });
      setIsBulkAddDialogOpen(false);
      toast({ title: "تم إضافة المواعيد بالجملة بنجاح" });
    },
    onError: (error) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });

  const updateBulkSlotsMutation = useMutation({
    mutationFn: async ({ ids, data }: { ids: string[]; data: any }) => {
      const res = await adminFetch("/api/admin/availability-bulk", {
        method: "PATCH",
        body: JSON.stringify({ ids, data }),
      });
      if (!res.ok) throw new Error("Failed to update slots");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/availability"] });
      setSelectedSlotIds([]);
      setIsBulkEditDialogOpen(false);
      setBulkEditConfig({});
      toast({ title: "تم تحديث المواعيد المحددة بنجاح" });
    },
    onError: (error) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });

  const restructureMutation = useMutation({
    mutationFn: async (payload: { ids: string[]; startTime: string; endTime: string; duration: number; capacity: number }) => {
      const res = await adminFetch("/api/admin/availability-restructure", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
         const err = await res.json();
         throw new Error(err.message || "Failed to restructure");
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/availability"] });
      setSelectedSlotIds([]);
      setIsRestructureDialogOpen(false);
      toast({ 
        title: "تمت إعادة الهيكلة بنجاح",
        description: data.message || "تم تحديث هيكل المواعيد للأيام المختارة."
      });
    },
    onError: (error) => {
      toast({ title: "حدث خطأ", description: error.message, variant: "destructive" });
    }
  });

  const updateSlotMutation = useMutation({
    mutationFn: async ({ id, data, isSeries, originalStartTime }: { id: string; data: any; isSeries: boolean; originalStartTime?: string }) => {
      const endpoint = isSeries && editingSlot?.recurrenceId 
        ? `/api/admin/availability-series/${editingSlot.recurrenceId}`
        : `/api/admin/availability-item/${id}`;
        
      const bodyPayload = isSeries ? { updateData: data, originalStartTime } : data;
      
      const res = await adminFetch(endpoint, {
        method: "PATCH",
        body: JSON.stringify(bodyPayload),
      });
      if (!res.ok) throw new Error("Failed to update slot");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/availability", "upcoming"] });
      setEditingSlot(null);
      toast({ title: "تم تحديث الموعد بنجاح" });
    },
    onError: (error) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });

  const deleteBulkSlotsMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const res = await adminFetch("/api/admin/availability-bulk", {
        method: "DELETE",
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) throw new Error("Failed to delete slots");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/availability"] });
      setSelectedSlotIds([]);
      toast({ title: "تم حذف المواعيد المحددة" });
    },
  });

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    addSlotMutation.mutate(newSlot);
  };

  const handleBulkAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (bulkConfig.daysOfWeek.length === 0) {
      return toast({ title: "خطأ", description: "يرجى تحديد يوم واحد على الأقل", variant: "destructive" });
    }

    const baseSlots = [];
    let currentStart = bulkConfig.startTime;
    const endLimit = bulkConfig.endTime;
    
    while (currentStart < endLimit) {
      const [hours, minutes] = currentStart.split(":").map(Number);
      const startDateTime = new Date();
      startDateTime.setHours(hours, minutes, 0, 0);
      
      const endDateTime = addMinutes(startDateTime, bulkConfig.duration);
      const currentEnd = format(endDateTime, "HH:mm");
      
      if (currentEnd > endLimit) break;
      
      baseSlots.push({
        startTime: currentStart,
        endTime: currentEnd,
        capacity: bulkConfig.capacity,
        label: bulkConfig.label || undefined
      });
      
      currentStart = currentEnd;
    }
    
    if (baseSlots.length > 0) {
      addBulkSlotsMutation.mutate({
        slots: baseSlots,
        startDate: bulkConfig.startDate,
        endDate: bulkConfig.endDate,
        daysOfWeek: bulkConfig.daysOfWeek
      });
    } else {
      toast({ title: "تنبيه", description: "لم يتم إنشاء أي مواعيد، يرجى مراجعة إعدادات الوقت الأساسي", variant: "destructive" });
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedSlotIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    const allIds = filteredSlots.map(s => s._id);
    const areAllSelected = allIds.length > 0 && allIds.every(id => selectedSlotIds.includes(id));
    
    if (areAllSelected) {
      // Deselect all in current view
      setSelectedSlotIds(prev => prev.filter(id => !allIds.includes(id)));
    } else {
      // Select all in current view
      setSelectedSlotIds(prev => Array.from(new Set([...prev, ...allIds])));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/30 p-4 rounded-lg">
        <div className="flex items-center gap-3">
          <CalendarIcon className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">المواعيد القابلة للحجز وإدارة الأوقات المتاحة</h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* BULK ADD DIALOG */}
          <Dialog open={isBulkAddDialogOpen} onOpenChange={setIsBulkAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2 border-primary/20 hover:border-primary/50 text-primary">
                <Layers className="h-4 w-4" />
                إضافة ذكية وتوليد فترات
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>توليد مواعيد تلقائياً</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleBulkAdd} className="space-y-6 py-4">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold border-b pb-2">نطاق التواريخ والأيام</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>من تاريخ</Label>
                      <Input type="date" value={bulkConfig.startDate} onChange={e => setBulkConfig(p => ({ ...p, startDate: e.target.value }))} required />
                    </div>
                    <div className="space-y-2">
                      <Label>إلى تاريخ</Label>
                      <Input type="date" value={bulkConfig.endDate} onChange={e => setBulkConfig(p => ({ ...p, endDate: e.target.value }))} required />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>الأيام المشمولة في النطاق</Label>
                    <div className="flex flex-wrap gap-3 p-3 bg-muted/20 rounded-lg border border-border/50">
                      {daysMap.map(day => (
                        <label key={day.id} className="flex items-center gap-2 cursor-pointer text-sm">
                          <Checkbox 
                            checked={bulkConfig.daysOfWeek.includes(day.id)}
                            onCheckedChange={(checked) => {
                              setBulkConfig(p => ({
                                ...p,
                                daysOfWeek: checked 
                                  ? [...p.daysOfWeek, day.id]
                                  : p.daysOfWeek.filter(d => d !== day.id)
                              }))
                            }}
                          />
                          {day.label}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold border-b pb-2">تفاصيل الموعد لكل يوم</h3>
                  
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Tag className="h-3 w-3" />
                      الاسم / المسمى (اختياري)
                    </Label>
                    <Input 
                      placeholder="مثال: أستاذ أحمد، قسم المبيعات..."
                      value={bulkConfig.label} 
                      onChange={e => setBulkConfig(p => ({ ...p, label: e.target.value }))} 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>بداية العمل اليومي</Label>
                      <Input type="time" value={bulkConfig.startTime} onChange={e => setBulkConfig(p => ({ ...p, startTime: e.target.value }))} required />
                    </div>
                    <div className="space-y-2">
                      <Label>نهاية العمل اليومي</Label>
                      <Input type="time" value={bulkConfig.endTime} onChange={e => setBulkConfig(p => ({ ...p, endTime: e.target.value }))} required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>سعة الزوار لكل موعد</Label>
                      <Input type="number" min="1" value={bulkConfig.capacity} onChange={e => setBulkConfig(p => ({ ...p, capacity: parseInt(e.target.value) }))} required />
                    </div>
                    <div className="space-y-2">
                      <Label>مدة كل توقيت (بالدقائق)</Label>
                      <Input type="number" min="5" step="5" value={bulkConfig.duration} onChange={e => setBulkConfig(p => ({ ...p, duration: parseInt(e.target.value) }))} required />
                    </div>
                  </div>
                </div>

                <DialogFooter className="pt-2">
                  <Button type="submit" disabled={addBulkSlotsMutation.isPending}>
                    {addBulkSlotsMutation.isPending ? "جاري التوليد..." : "توليد المواعيد"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* SINGLE ADD DIALOG */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                إضافة منفردة محددة
              </Button>
            </DialogTrigger>
            <DialogContent aria-describedby="add-slot-description">
              <DialogHeader>
                <DialogTitle>إضافة موعد متاح</DialogTitle>
                <p id="add-slot-description" className="text-sm text-muted-foreground">
                  حدد التاريخ والوقت والسعة لإضافة موعد فردي ومخصص.
                </p>
              </DialogHeader>
              <form onSubmit={handleAddSlot} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>تاريخ الموعد</Label>
                  <Input 
                    type="date" 
                    value={newSlot.date} 
                    onChange={(e) => setNewSlot(p => ({ ...p, date: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Tag className="h-3 w-3" />
                    الاسم / المسمى (اختياري)
                  </Label>
                  <Input 
                    placeholder="سيظهر هذا الاسم لتسهيل الانتباه للمواعيد"
                    value={newSlot.label} 
                    onChange={(e) => setNewSlot(p => ({ ...p, label: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>وقت البداية</Label>
                    <Input 
                      type="time" 
                      value={newSlot.startTime} 
                      onChange={(e) => setNewSlot(p => ({ ...p, startTime: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>وقت النهاية</Label>
                    <Input 
                      type="time" 
                      value={newSlot.endTime} 
                      onChange={(e) => setNewSlot(p => ({ ...p, endTime: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>السعة (الحد الأقصى للمراجعين)</Label>
                  <Input 
                    type="number" 
                    min="1" 
                    value={newSlot.capacity} 
                    onChange={(e) => setNewSlot(p => ({ ...p, capacity: parseInt(e.target.value) }))}
                    required
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={addSlotMutation.isPending}>
                    {addSlotMutation.isPending ? "جاري الإضافة..." : "حفظ الموعد"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {selectedSlotIds.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between bg-primary/5 border border-primary/20 p-4 rounded-lg animate-in fade-in slide-in-from-top-2 gap-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">تم تحديد {selectedSlotIds.length} مواعيد</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setSelectedSlotIds([])}
            >
              إلغاء التحديد
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 border-primary/40 text-primary"
              onClick={() => setIsRestructureDialogOpen(true)}
            >
              <Layers className="h-4 w-4" />
              إعادة الهيكلة وتعديل المدة
            </Button>

            <Button 
              variant="secondary" 
              size="sm" 
              className="gap-2"
              onClick={() => setIsBulkEditDialogOpen(true)}
            >
              <Edit className="h-4 w-4" />
              تحرير سريع للمحددة
            </Button>
            
            <Button 
              variant="destructive" 
              size="sm" 
              className="gap-2"
              onClick={() => deleteBulkSlotsMutation.mutate(selectedSlotIds)}
              disabled={deleteBulkSlotsMutation.isPending}
            >
              <Trash2 className="h-4 w-4" />
              حذف المحددة
            </Button>
          </div>
        </div>
      )}

      {/* Bulk Edit Dialog */}
      <Dialog open={isBulkEditDialogOpen} onOpenChange={setIsBulkEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعديل سريع متعدد ({selectedSlotIds.length} مواعيد)</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-xs text-muted-foreground">أدخل فقط الحقول التي ترغب في تغييرها لجميع المواعيد المحددة دون المساس بأوقاتها وتواريخها.</p>
            
            <div className="space-y-2">
              <Label>المسمى الوظيفي أو التسمية</Label>
              <Input 
                placeholder="تغيير المسمى الدلالي (يترك فارغاً للنسيان)..."
                value={bulkEditConfig.label || ""}
                onChange={(e) => setBulkEditConfig(p => ({ ...p, label: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>السعة (العدد المتاح لكل موعد)</Label>
              <Input 
                type="number" 
                min="1" 
                placeholder="تغيير السعة الاستيعابية..."
                value={bulkEditConfig.capacity || ""}
                onChange={(e) => setBulkEditConfig(p => ({ ...p, capacity: e.target.value ? parseInt(e.target.value) : undefined }))}
              />
            </div>

            <div className="flex items-center gap-2 mt-4">
              <Checkbox 
                id="bulk-active-toggle"
                checked={bulkEditConfig.isActive === true}
                onCheckedChange={(checked) => {
                  if (checked === true) setBulkEditConfig(p => ({ ...p, isActive: true }));
                  else setBulkEditConfig(p => ({ ...p, isActive: undefined }));
                }}
              />
              <Label htmlFor="bulk-active-toggle" className="cursor-pointer">تفعيل جميع المواعيد المحددة (سحب الإيقاف المؤقت)</Label>
            </div>

            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => setIsBulkEditDialogOpen(false)}>إلغاء</Button>
              <Button 
                onClick={() => {
                  const payload: any = {};
                  if (bulkEditConfig.capacity !== undefined) payload.capacity = bulkEditConfig.capacity;
                  if (bulkEditConfig.label !== undefined) payload.label = bulkEditConfig.label;
                  if (bulkEditConfig.isActive !== undefined) payload.isActive = bulkEditConfig.isActive;
                  updateBulkSlotsMutation.mutate({ ids: selectedSlotIds, data: payload });
                }}
                disabled={updateBulkSlotsMutation.isPending}
              >
                {updateBulkSlotsMutation.isPending ? "جاري التحديث..." : "تطبيق التعديلات السريعة"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Restructure Dialog */}
      <Dialog open={isRestructureDialogOpen} onOpenChange={setIsRestructureDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إعادة هيكلة الأوقات (Smart Adjust)</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-primary/5 p-4 rounded-lg border border-primary/20 text-xs space-y-2">
              <p className="font-bold text-primary flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                تعديل ذكي وآمن
              </p>
              <p className="text-muted-foreground leading-relaxed">
                هذه العملية ستقوم بتحديث المواعيد القائمة في الأيام المحددة لتناسب التقسيم الجديد (مثلاً تحويلها من 30 دقيقة إلى 45 دقيقة).
              </p>
              <p className="text-muted-foreground">
                النظام سيقوم بـ <strong>تحديث</strong> المواعيد الحالية بالترتيب، مما يحافظ على المسميات والحجوزات بقدر الإمكان. سيتم حذف المواعيد الزائدة فقط في نهاية اليوم.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>الدوام يبدأ في:</Label>
                <Input 
                  type="time" 
                  value={restructureConfig.startTime}
                  onChange={(e) => setRestructureConfig(p => ({ ...p, startTime: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>الدوام ينتهي في:</Label>
                <Input 
                  type="time" 
                  value={restructureConfig.endTime}
                  onChange={(e) => setRestructureConfig(p => ({ ...p, endTime: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>المدة الجديدة (بالدقائق)</Label>
                <Input 
                  type="number" 
                  min="5" 
                  step="5"
                  value={restructureConfig.duration}
                  onChange={(e) => setRestructureConfig(p => ({ ...p, duration: parseInt(e.target.value) || 45 }))}
                />
              </div>
              <div className="space-y-2">
                <Label>السعة لكل جلسة</Label>
                <Input 
                  type="number" 
                  min="1" 
                  value={restructureConfig.capacity}
                  onChange={(e) => setRestructureConfig(p => ({ ...p, capacity: parseInt(e.target.value) || 1 }))}
                />
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => setIsRestructureDialogOpen(false)}>إلغاء الأمر</Button>
              <Button 
                variant="default"
                onClick={() => {
                  restructureMutation.mutate({ 
                    ids: selectedSlotIds, 
                    startTime: restructureConfig.startTime,
                    endTime: restructureConfig.endTime,
                    duration: restructureConfig.duration,
                    capacity: restructureConfig.capacity
                  });
                }}
                disabled={restructureMutation.isPending}
              >
                {restructureMutation.isPending ? "جاري المزامنة الذكية..." : "تأكيد التحديث الذكي"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Tabs 
        defaultValue="all" 
        value={activeTab} 
        onValueChange={(t) => { setActiveTab(t); setDayFilter("all"); setDateFilter(""); }} 
        className="w-full"
      >
        <div className="bg-muted/10 p-2 rounded-lg border">
          <TabsList className="w-full justify-start overflow-auto flex-nowrap rounded-md p-1 min-h-[44px] bg-transparent">
            <TabsTrigger value="all" className="flex-shrink-0">كافة المواعيد</TabsTrigger>
            <TabsTrigger value="general" className="flex-shrink-0">مواعيد عامة</TabsTrigger>
            {uniqueLabels.map(label => (
              <TabsTrigger key={label} value={label} className="flex-shrink-0">
                {label} ({slots.filter(s => s.label === label).length})
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex flex-col xl:flex-row gap-4 px-2 pb-2">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-muted-foreground ml-2">
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">فلترة بحسب اليوم:</span>
              </div>
              <Button 
                variant={dayFilter === "all" ? "default" : "outline"} 
                size="sm" 
                className={dayFilter === "all" ? "" : "bg-transparent hover:bg-muted"}
                onClick={() => setDayFilter("all")}
              >الكل</Button>
              {daysMap.map(d => (
                <Button 
                  key={d.id} 
                  variant={dayFilter === d.id ? "default" : "outline"} 
                  size="sm" 
                  className={dayFilter === d.id ? "" : "bg-transparent hover:bg-muted"}
                  onClick={() => setDayFilter(d.id)}
                >{d.label}</Button>
              ))}
            </div>
            
            <div className="flex flex-wrap items-center gap-2 xl:border-r border-border/50 xl:pr-4">
              <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">أو بتاريخ محدد:</span>
              <Input 
                type="date" 
                className="h-8 w-auto min-w-[130px]"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
              {dateFilter && (
                <Button variant="ghost" size="sm" className="h-8 px-2 text-destructive" onClick={() => setDateFilter("")}>
                  إلغاء التأريخ
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {slots.length > 0 && (
          <div className="flex items-center gap-2 mt-4 mb-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs gap-1.5 h-8 bg-transparent"
              onClick={selectAll}
            >
              {filteredSlots.length > 0 && filteredSlots.every(s => selectedSlotIds.includes(s._id)) ? <CheckSquare className="h-3.5 w-3.5 text-primary" /> : <Square className="h-3.5 w-3.5 text-muted-foreground" />}
              {activeTab === "all" && dayFilter === "all" && !dateFilter
                ? "تحديد جميع المواعيد" 
                : (dayFilter !== "all" || dateFilter) ? `تحديد المواعيد المفلترة (${filteredSlots.length})` : "تحديد كامل المجموعة"
              }
            </Button>
          </div>
        )}

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {isLoading ? (
            <div className="col-span-full py-12 text-center text-muted-foreground animate-pulse">جاري تحميل البنى الزمنية...</div>
          ) : filteredSlots.length === 0 ? (
            <Card className="col-span-full border-dashed bg-transparent">
              <CardContent className="py-12 text-center text-muted-foreground flex flex-col items-center gap-3 opacity-60">
                <CalendarIcon className="w-10 h-10" />
                <span>لا توجد مواعيد مضافة في هذه التصفية. هل ترغب في (إضافة ذكية وتوليد فترات)؟</span>
              </CardContent>
            </Card>
          ) : (
            filteredSlots.map((slot) => (
              <Card 
                key={slot._id} 
                className={`relative overflow-hidden group transition-all duration-200 ${
                  selectedSlotIds.includes(slot._id) 
                    ? "border-primary ring-1 ring-primary shadow-sm bg-primary/5 scale-[1.01]" 
                    : "hover:border-primary/50"
                }`}
              >
                <div 
                  className="absolute top-3 left-3 z-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Checkbox 
                    checked={selectedSlotIds.includes(slot._id)}
                    onCheckedChange={() => toggleSelection(slot._id)}
                  />
                </div>

                <CardHeader className="pb-2 pt-8">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1.5 min-h-[4rem]">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium pb-1 mb-1">
                        <CalendarIcon className="h-3.5 w-3.5 text-primary/70" />
                        <span>{format(new Date(slot.date), "EEEE, d MMM yyyy", { locale: ar })}</span>
                      </div>
                      <div className="flex items-center gap-2 text-primary font-bold">
                        <Clock className="h-4 w-4" />
                        <span>{slot.startTime} - {slot.endTime}</span>
                      </div>
                      {slot.label && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1 bg-primary/5 inline-flex px-1.5 py-0.5 rounded">
                          <Tag className="h-3 w-3" />
                          <span>{slot.label}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-primary"
                        onClick={() => {
                          setEditingSlot(slot);
                          setInitialEditingStartTime(slot.startTime);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive"
                        onClick={() => {
                          if (slot.recurrenceId) {
                            if (confirm(`هل تريد حذف سلسلة المواعيد التابعة لـ '${slot.label || "السلسلة"}' بالكامل أم هذا الموعد فقط؟\n\nاضغط 'OK' للحذف الشامل، أو 'Cancel' لموعد اليوم فقط.`)) {
                              deleteSlotMutation.mutate({ id: slot._id, isSeries: true });
                            } else {
                              deleteSlotMutation.mutate({ id: slot._id, isSeries: false });
                            }
                          } else {
                            deleteSlotMutation.mutate({ id: slot._id, isSeries: false });
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>سعة المجلس: {slot.capacity}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-[10px] uppercase font-bold">المحجوز</span>
                      <span className={`text-sm ${slot.totalBooked >= slot.capacity ? "text-destructive font-bold" : "text-emerald-600 font-bold"}`}>
                        {slot.totalBooked}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {slot.totalBooked >= slot.capacity ? (
                        <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
                          <XCircle className="h-3 w-3" />
                          مكتمل العدد
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-emerald-600 bg-emerald-100/50 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="h-3 w-3" />
                          متاح للحجز
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={() => updateSlotMutation.mutate({ 
                        id: slot._id, 
                        data: { isActive: !slot.isActive },
                        isSeries: false 
                      })}
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full transition-colors ${
                        slot.isActive 
                          ? "bg-primary/10 text-primary hover:bg-primary/20" 
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {slot.isActive ? "فعال" : "موقوف مؤقتاً"}
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </Tabs>

      {/* Edit Slot Dialog */}
      <Dialog open={!!editingSlot} onOpenChange={(open) => !open && setEditingSlot(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعديل الموعد</DialogTitle>
          </DialogHeader>
          {editingSlot && (
            <div className="space-y-4 py-4">
              {!editingSlot.recurrenceId && (
                <div className="space-y-2">
                  <Label>تاريخ الموعد</Label>
                  <Input 
                    type="date" 
                    defaultValue={format(new Date(editingSlot.date), "yyyy-MM-dd")}
                    onChange={(e) => setEditingSlot({...editingSlot, date: e.target.value})}
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Tag className="h-3 w-3" />
                  المسمى أو الموظف (اختياري)
                </Label>
                <Input 
                  defaultValue={editingSlot.label || ""}
                  onChange={(e) => setEditingSlot({...editingSlot, label: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>وقت البداية</Label>
                  <Input 
                    type="time" 
                    defaultValue={editingSlot.startTime}
                    onChange={(e) => setEditingSlot({...editingSlot, startTime: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>وقت النهاية</Label>
                  <Input 
                    type="time" 
                    defaultValue={editingSlot.endTime}
                    onChange={(e) => setEditingSlot({...editingSlot, endTime: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>السعة</Label>
                <Input 
                  type="number" 
                  min="1" 
                  defaultValue={editingSlot.capacity}
                  onChange={(e) => setEditingSlot({...editingSlot, capacity: parseInt(e.target.value)})}
                />
              </div>
              
              {editingSlot.recurrenceId && (
                <div className="bg-primary/5 p-3 rounded-md space-y-3 border border-primary/20 mt-4">
                  <Label className="text-primary font-bold block mb-2">تسلسل التعديل</Label>
                  <p className="text-xs text-muted-foreground mb-3">حدد نطاق الحفظ لهذه البيانات، هل تسري على هذا اليوم فقط أم نعممها؟</p>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="seriesAction" 
                        checked={seriesAction === "item"} 
                        onChange={() => setSeriesAction("item")}
                      />
                      <span className="text-sm">تطبيق وحفظ بشكل استثنائي (اليوم فقط)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="seriesAction" 
                        checked={seriesAction === "series"} 
                        onChange={() => setSeriesAction("series")}
                      />
                      <span className="text-sm">تطبيق إجباري على كل أيام هذه السلسلة</span>
                    </label>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button 
                  onClick={() => {
                    const payload: any = {
                      startTime: editingSlot.startTime,
                      endTime: editingSlot.endTime,
                      capacity: editingSlot.capacity,
                      isActive: editingSlot.isActive,
                      label: editingSlot.label || ""
                    };
                    
                    if (seriesAction === "item" || !editingSlot.recurrenceId) {
                      payload.date = editingSlot.date;
                    }

                    updateSlotMutation.mutate({ 
                      id: editingSlot._id, 
                      data: payload,
                      isSeries: seriesAction === "series",
                      originalStartTime: initialEditingStartTime || undefined
                    });
                  }}
                  disabled={updateSlotMutation.isPending}
                >
                  {updateSlotMutation.isPending ? "جاري الحفظ..." : "تأكيد واستمرار"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

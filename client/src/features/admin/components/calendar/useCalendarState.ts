import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { adminFetch } from "@/lib/admin";
import { useToast } from "@/hooks/use-toast";
import { format, addMinutes, addMonths } from "date-fns";
import type { AvailabilitySlotType } from "@shared/schema";
import { BulkConfig, NewSlot, RestructureConfig, BulkEditConfig } from "./calendar.types";

export function useCalendarState() {
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
  const [bulkEditConfig, setBulkEditConfig] = useState<BulkEditConfig>({});
  
  const [isRestructureDialogOpen, setIsRestructureDialogOpen] = useState(false);
  const [restructureConfig, setRestructureConfig] = useState<RestructureConfig>({
    startTime: "09:00",
    endTime: "17:00",
    duration: 45,
    capacity: 1,
  });

  const [newSlot, setNewSlot] = useState<NewSlot>({
    date: format(new Date(), "yyyy-MM-dd"),
    startTime: "10:00",
    endTime: "10:30",
    capacity: 1,
    label: "",
  });

  const [bulkConfig, setBulkConfig] = useState<BulkConfig>({
    startDate: format(new Date(), "yyyy-MM-dd"),
    endDate: format(addMonths(new Date(), 1), "yyyy-MM-dd"),
    daysOfWeek: [new Date().getDay()],
    startTime: "09:00",
    endTime: "17:00",
    duration: 30,
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
      list = list.filter(s => new Date(s.date).getDay() === dayFilter);
    }
    
    if (dateFilter) {
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
      const slot = slots.find(s => s._id === id);
      const endpoint = isSeries && slot?.recurrenceId
        ? `/api/admin/availability-series/${slot.recurrenceId}`
        : `/api/admin/availability-item/${id}`;
        
      const res = await adminFetch(endpoint, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete slot");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/availability", "upcoming"] });
      setSelectedSlotIds([]);
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
      setSelectedSlotIds(prev => prev.filter(id => !allIds.includes(id)));
    } else {
      setSelectedSlotIds(prev => Array.from(new Set([...prev, ...allIds])));
    }
  };

  return {
    isAddDialogOpen, setIsAddDialogOpen,
    isBulkAddDialogOpen, setIsBulkAddDialogOpen,
    editingSlot, setEditingSlot,
    initialEditingStartTime, setInitialEditingStartTime,
    selectedSlotIds, setSelectedSlotIds,
    activeTab, setActiveTab,
    dayFilter, setDayFilter,
    dateFilter, setDateFilter,
    isBulkEditDialogOpen, setIsBulkEditDialogOpen,
    bulkEditConfig, setBulkEditConfig,
    isRestructureDialogOpen, setIsRestructureDialogOpen,
    restructureConfig, setRestructureConfig,
    newSlot, setNewSlot,
    bulkConfig, setBulkConfig,
    seriesAction, setSeriesAction,
    slots, isLoading,
    uniqueLabels, filteredSlots,
    addSlotMutation, deleteSlotMutation,
    addBulkSlotsMutation, updateBulkSlotsMutation,
    restructureMutation, updateSlotMutation,
    deleteBulkSlotsMutation,
    handleAddSlot, handleBulkAdd,
    toggleSelection, selectAll
  };
}

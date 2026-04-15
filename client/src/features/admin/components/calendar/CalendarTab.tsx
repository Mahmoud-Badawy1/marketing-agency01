import { Calendar as CalendarIcon, Filter, Plus, Layers, CheckSquare, Square } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/atoms/Input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCalendarState } from "./useCalendarState";
import { daysMap } from "./calendar.types";
import { AddSlotDialog } from "./AddSlotDialog";
import { BulkAddDialog } from "./BulkAddDialog";
import { EditSlotDialog } from "./EditSlotDialog";
import { BulkEditDialog } from "./BulkEditDialog";
import { RestructureDialog } from "./RestructureDialog";
import { SlotCard } from "./SlotCard";

export function CalendarTab() {
  const s = useCalendarState();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/30 p-4 rounded-lg">
        <div className="flex items-center gap-3">
          <CalendarIcon className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">المواعيد القابلة للحجز وإدارة الأوقات المتاحة</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" className="gap-2 border-primary/20 hover:border-primary/50 text-primary" onClick={() => s.setIsBulkAddDialogOpen(true)}>
            <Layers className="h-4 w-4" /> إضافة ذكية وتوليد فترات
          </Button>
          <Button className="gap-2" onClick={() => s.setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4" /> إضافة منفردة محددة
          </Button>
        </div>
      </div>

      {s.selectedSlotIds.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between bg-primary/5 border border-primary/20 p-4 rounded-lg gap-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">تم تحديد {s.selectedSlotIds.length} مواعيد</span>
            <Button variant="outline" size="sm" onClick={() => s.setSelectedSlotIds([])}>إلغاء التحديد</Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2 border-primary/40 text-primary" onClick={() => s.setIsRestructureDialogOpen(true)}>
              <Layers className="h-4 w-4" /> إعادة الهيكلة
            </Button>
            <Button variant="secondary" size="sm" className="gap-2" onClick={() => s.setIsBulkEditDialogOpen(true)}>
              <Edit className="h-4 w-4" /> تحرير سريع
            </Button>
            <Button variant="destructive" size="sm" className="gap-2" onClick={() => s.deleteBulkSlotsMutation.mutate(s.selectedSlotIds)} disabled={s.deleteBulkSlotsMutation.isPending}>
              <Trash2 className="h-4 w-4" /> حذف المحددة
            </Button>
          </div>
        </div>
      )}

      <Tabs defaultValue="all" value={s.activeTab} onValueChange={(t) => { s.setActiveTab(t); s.setDayFilter("all"); s.setDateFilter(""); }} className="w-full">
        <div className="bg-muted/10 p-2 rounded-lg border">
          <TabsList className="w-full justify-start overflow-auto flex-nowrap rounded-md p-1 min-h-[44px] bg-transparent">
            <TabsTrigger value="all">كافة المواعيد</TabsTrigger>
            <TabsTrigger value="general">مواعيد عامة</TabsTrigger>
            {s.uniqueLabels.map(label => (
              <TabsTrigger key={label} value={label}>{label} ({s.slots.filter(slot => slot.label === label).length})</TabsTrigger>
            ))}
          </TabsList>
          <div className="flex flex-col xl:flex-row gap-4 px-2 pb-2">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-muted-foreground ml-2"><Filter className="w-4 h-4" /><span className="text-sm font-medium">فلترة باليوم:</span></div>
              <Button variant={s.dayFilter === "all" ? "default" : "outline"} size="sm" onClick={() => s.setDayFilter("all")}>الكل</Button>
              {daysMap.map(d => <Button key={d.id} variant={s.dayFilter === d.id ? "default" : "outline"} size="sm" onClick={() => s.setDayFilter(d.id)}>{d.label}</Button>)}
            </div>
            <div className="flex flex-wrap items-center gap-2 xl:border-r border-border/50 xl:pr-4">
              <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">أو بتاريخ:</span>
              <Input type="date" className="h-8 w-auto min-w-[130px]" value={s.dateFilter} onChange={(e) => s.setDateFilter(e.target.value)} />
              {s.dateFilter && <Button variant="ghost" size="sm" className="h-8 px-2 text-destructive" onClick={() => s.setDateFilter("")}>إلغاء</Button>}
            </div>
          </div>
        </div>
        
        {s.slots.length > 0 && (
          <div className="flex items-center gap-2 mt-4 mb-2">
            <Button variant="outline" size="sm" className="text-xs gap-1.5 h-8 bg-transparent" onClick={s.selectAll}>
              {s.filteredSlots.length > 0 && s.filteredSlots.every(slot => s.selectedSlotIds.includes(slot._id)) ? <CheckSquare className="h-3.5 w-3.5 text-primary" /> : <Square className="h-3.5 w-3.5 text-muted-foreground" />}
              تحديد المجموع المفلتر ({s.filteredSlots.length})
            </Button>
          </div>
        )}

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {s.isLoading ? (
            <div className="col-span-full py-12 text-center text-muted-foreground animate-pulse">جاري تحميل البيانات...</div>
          ) : s.filteredSlots.length === 0 ? (
            <Card className="col-span-full border-dashed bg-transparent">
              <CardContent className="py-12 text-center text-muted-foreground flex flex-col items-center gap-3 opacity-60"><CalendarIcon className="w-10 h-10" /><span>لا توجد مواعيد. استخدم الإضافة الذكية.</span></CardContent>
            </Card>
          ) : (
            s.filteredSlots.map((slot) => (
              <SlotCard 
                key={slot._id} slot={slot} 
                isSelected={s.selectedSlotIds.includes(slot._id)} 
                onToggleSelection={s.toggleSelection}
                onEdit={() => { s.setEditingSlot(slot); s.setInitialEditingStartTime(slot.startTime); }}
                onDelete={() => {
                  if (slot.recurrenceId) {
                    if (confirm(`حذف السلسلة بالكامل أم هذا الموعد فقط؟`)) s.deleteSlotMutation.mutate({ id: slot._id, isSeries: true });
                    else s.deleteSlotMutation.mutate({ id: slot._id, isSeries: false });
                  } else s.deleteSlotMutation.mutate({ id: slot._id, isSeries: false });
                }}
                onToggleActive={() => s.updateSlotMutation.mutate({ id: slot._id, data: { isActive: !slot.isActive }, isSeries: false })}
              />
            ))
          )}
        </div>
      </Tabs>

      <AddSlotDialog isOpen={s.isAddDialogOpen} onOpenChange={s.setIsAddDialogOpen} newSlot={s.newSlot} setNewSlot={s.setNewSlot} onAdd={s.handleAddSlot} isPending={s.addSlotMutation.isPending} />
      <BulkAddDialog isOpen={s.isBulkAddDialogOpen} onOpenChange={s.setIsBulkAddDialogOpen} config={s.bulkConfig} setConfig={s.setBulkConfig} onAdd={s.handleBulkAdd} isPending={s.addBulkSlotsMutation.isPending} />
      <EditSlotDialog editingSlot={s.editingSlot} setEditingSlot={s.setEditingSlot} seriesAction={s.seriesAction} setSeriesAction={s.setSeriesAction} onUpdate={s.updateSlotMutation.mutate} isPending={s.updateSlotMutation.isPending} initialStartTime={s.initialEditingStartTime} />
      <BulkEditDialog isOpen={s.isBulkEditDialogOpen} onOpenChange={s.setIsBulkEditDialogOpen} selectedCount={s.selectedSlotIds.length} config={s.bulkEditConfig} setConfig={s.setBulkEditConfig} onUpdate={() => s.updateBulkSlotsMutation.mutate({ ids: s.selectedSlotIds, data: s.bulkEditConfig })} isPending={s.updateBulkSlotsMutation.isPending} />
      <RestructureDialog isOpen={s.isRestructureDialogOpen} onOpenChange={s.setIsRestructureDialogOpen} config={s.restructureConfig} setConfig={s.setRestructureConfig} onRestructure={() => s.restructureMutation.mutate({ ...s.restructureConfig, ids: s.selectedSlotIds })} isPending={s.restructureMutation.isPending} />
    </div>
  );
}

import { Trash2, Edit } from "lucide-react"; // Import missing icons used in inline buttons

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/atoms/Button";
import { Checkbox } from "@/components/atoms/Checkbox";
import { Clock, Users, CheckCircle2, XCircle, Edit, Trash2, Tag, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import type { AvailabilitySlotType } from "@shared/schema";

interface SlotCardProps {
  slot: AvailabilitySlotType;
  isSelected: boolean;
  onToggleSelection: (id: string) => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
}

export function SlotCard({
  slot,
  isSelected,
  onToggleSelection,
  onEdit,
  onDelete,
  onToggleActive
}: SlotCardProps) {
  return (
    <Card 
      className={`relative overflow-hidden group transition-all duration-200 ${
        isSelected 
          ? "border-primary ring-1 ring-primary shadow-sm bg-primary/5 scale-[1.01]" 
          : "hover:border-primary/50"
      }`}
    >
      <div 
        className="absolute top-3 left-3 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <Checkbox 
          checked={isSelected}
          onCheckedChange={() => onToggleSelection(slot._id)}
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
              onClick={onEdit}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-destructive"
              onClick={onDelete}
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
            onClick={onToggleActive}
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
  );
}

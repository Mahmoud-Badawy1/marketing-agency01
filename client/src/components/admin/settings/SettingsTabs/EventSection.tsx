import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";
import { BilingualInput } from "../BilingualInput";
import { BilingualTextarea } from "../BilingualTextarea";
import { ImageUploadInput } from "../ImageUploadInput";

interface EventSectionProps {
  upcomingEvent: any;
  setUpcomingEvent: (val: any | ((prev: any) => any)) => void;
  handleSave: (key: string, value: any) => void;
  isSaving: boolean;
}

export function EventSection({ upcomingEvent, setUpcomingEvent, handleSave, isSaving }: EventSectionProps) {
  return (
    <AccordionItem value="item-9Event" className="bg-card border shadow-sm rounded-lg overflow-hidden mb-6 border-none">
      <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50 transition-colors border-none group">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-primary group-data-[state=open]:text-foreground transition-colors" />
          <span className="font-semibold">تنبيه حدث القادم (Upcoming Event)</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pt-0">
        <CardContent className="space-y-6 pt-6">
          <div className="flex items-center space-x-2 space-x-reverse mb-4">
            <Switch checked={upcomingEvent.visible} onCheckedChange={v => setUpcomingEvent((p:any) => ({...p, visible: v}))} />
            <Label>إظهار الحدث على الصفحة الرئيسية</Label>
          </div>
          <BilingualInput label="شارة الحدث" value={upcomingEvent.badge} onChange={v => setUpcomingEvent((p:any) => ({...p, badge: v}))} />
          <BilingualInput label="اسم الحدث" value={upcomingEvent.title} onChange={v => setUpcomingEvent((p:any) => ({...p, title: v}))} />
          <BilingualInput label="تاريخ الحدث" value={upcomingEvent.date} onChange={v => setUpcomingEvent((p:any) => ({...p, date: v}))} />
          <BilingualTextarea label="وصف الحدث" value={upcomingEvent.description} onChange={v => setUpcomingEvent((p:any) => ({...p, description: v}))} />
          <ImageUploadInput label="صورة خلفية الحدث" value={upcomingEvent.backgroundImage} onChange={v => setUpcomingEvent((p:any) => ({...p, backgroundImage: v}))} />
          <Button className="w-full mt-4" onClick={() => handleSave("upcoming_event", upcomingEvent)} disabled={isSaving}>حفظ الحدث</Button>
        </CardContent>
      </AccordionContent>
    </AccordionItem>
  );
}

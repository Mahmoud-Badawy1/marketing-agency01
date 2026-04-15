import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/atoms/Button";
import { Briefcase, Plus, Trash2 } from "lucide-react";
import { BilingualInput } from "../BilingualInput";

interface ServicesSectionProps {
  services: any[];
  setServices: (val: any[] | ((prev: any[]) => any[])) => void;
  handleSave: (key: string, value: any) => void;
  isSaving: boolean;
}

export function ServicesSection({ services, setServices, handleSave, isSaving }: ServicesSectionProps) {
  return (
    <AccordionItem value="item-11Services" className="bg-card border shadow-sm rounded-lg overflow-hidden mb-6 border-none">
      <div className="flex items-center justify-between px-4 border-b ">
        <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50 transition-colors border-none group">
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary group-data-[state=open]:text-foreground transition-colors" />
            <span className="font-semibold">خدمات الوكالة (Agency Services)</span>
          </div>
        </AccordionTrigger>
        <Button 
          variant="outline" 
          size="sm" 
          className="mr-6 relative z-10" 
          onClick={(e) => {
            e.stopPropagation();
            setServices((p: any[]) => [...p, { title: {ar:"", en:""}, icon: "Star" }]);
          }}
        >
          <Plus className="h-4 w-4 ml-1" /> إضافة خدمة
        </Button>
      </div>
      <AccordionContent className="pt-0">
        <CardContent className="space-y-6 pt-6">
          {services.map((service, i) => (
            <div key={i} className="flex gap-2 items-start border p-4 rounded-md bg-muted/5">
              <div className="flex-1 space-y-4">
                <BilingualInput label={`خدمة ${i+1}`} value={service.title} onChange={v => setServices((p: any[]) => p.map((s, idx) => idx === i ? {...s, title: v} : s))} />
                <BilingualInput label="اسم الأيقونة (Lucide)" value={{ar: service.icon, en: service.icon}} onChange={v => setServices((p: any[]) => p.map((s, idx) => idx === i ? {...s, icon: v.en} : s))} />
              </div>
              <Button variant="ghost" size="icon" onClick={() => setServices((p: any[]) => p.filter((_, idx) => idx !== i))}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
          <Button className="w-full mt-4" onClick={() => handleSave("services", services)} disabled={isSaving}>حفظ الخدمات</Button>
        </CardContent>
      </AccordionContent>
    </AccordionItem>
  );
}

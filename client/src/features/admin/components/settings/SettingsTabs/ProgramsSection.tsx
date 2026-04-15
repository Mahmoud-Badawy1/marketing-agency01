import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/atoms/Button";
import { BookOpen, Plus, Trash2 } from "lucide-react";
import { BilingualInput } from "../BilingualInput";
import { BilingualTextarea } from "../BilingualTextarea";

interface ProgramsSectionProps {
  programsData: any[];
  setProgramsData: (val: any[] | ((prev: any[]) => any[])) => void;
  handleSave: (key: string, value: any) => void;
  isSaving: boolean;
}

export function ProgramsSection({ programsData, setProgramsData, handleSave, isSaving }: ProgramsSectionProps) {
  return (
    <AccordionItem value="item-3Programs" className="bg-card border shadow-sm rounded-lg overflow-hidden mb-6 border-none">
      <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50 transition-colors border-none group">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <span className="font-semibold">مستويات البرامج (Program Levels)</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pt-0">
        <CardContent className="space-y-6 pt-6">
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={() => setProgramsData((p: any[]) => [...p, { level: {ar:"", en:""}, title: {ar:"", en:""}, subtitle: {ar:"", en:""}, description: {ar:"", en:""}, age: {ar:"", en:""}, color: "" }])}>
              <Plus className="h-4 w-4 ml-1" /> إضافة مستوى
            </Button>
          </div>
          {programsData.map((prog, i) => (
            <div key={i} className="border p-4 rounded-lg bg-card/50 space-y-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold">المستوى {i + 1}</span>
                <Button variant="ghost" size="icon" onClick={() => setProgramsData((p: any[]) => p.filter((_, idx) => idx !== i))}><Trash2 className="h-4 w-4 text-destructive"/></Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <BilingualInput label="اسم المستوى" value={prog.level} onChange={v => setProgramsData((p: any[]) => p.map((s, idx) => idx === i ? {...s, level: v} : s))} />
                <BilingualInput label="العنوان" value={prog.title} onChange={v => setProgramsData((p: any[]) => p.map((s, idx) => idx === i ? {...s, title: v} : s))} />
                <BilingualInput label="العنوان الفرعي" value={prog.subtitle} onChange={v => setProgramsData((p: any[]) => p.map((s, idx) => idx === i ? {...s, subtitle: v} : s))} />
                <BilingualInput label="الفئة المستهدفة" value={prog.age} onChange={v => setProgramsData((p: any[]) => p.map((s, idx) => idx === i ? {...s, age: v} : s))} />
              </div>
              <BilingualTextarea label="الوصف" value={prog.description} onChange={v => setProgramsData((p: any[]) => p.map((s, idx) => idx === i ? {...s, description: v} : s))} />
              <BilingualInput label="اللون (CSS class)" value={{ar: prog.color, en: prog.color}} onChange={v => setProgramsData((p: any[]) => p.map((s, idx) => idx === i ? {...s, color: v.en} : s))} />
            </div>
          ))}
          <Button className="w-full mt-4" onClick={() => handleSave("programs", programsData)} disabled={isSaving}>حفظ البرامج</Button>
        </CardContent>
      </AccordionContent>
    </AccordionItem>
  );
}

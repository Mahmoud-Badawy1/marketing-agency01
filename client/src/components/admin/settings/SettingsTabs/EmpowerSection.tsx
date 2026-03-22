import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { BilingualInput } from "../BilingualInput";
import { BilingualTextarea } from "../BilingualTextarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EmpowerSectionProps {
  empowerSection: any;
  setEmpowerSection: (val: any | ((prev: any) => any)) => void;
  handleSave: (key: string, value: any) => void;
  isSaving: boolean;
}

export function EmpowerSection({ empowerSection, setEmpowerSection, handleSave, isSaving }: EmpowerSectionProps) {
  return (
    <AccordionItem value="item-12Empower" className="bg-card border shadow-sm rounded-lg overflow-hidden border-none mb-6">
      <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50 transition-colors border-none group">
        <div className="flex-1 text-start">
          <CardHeader className="flex flex-row items-center justify-between p-0">
            <CardTitle>قسم التمكين (Empower Section)</CardTitle>
          </CardHeader>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pt-0">
        <CardContent className="space-y-6 pt-6">
          <BilingualInput label="العنوان الفرعي" value={empowerSection.subtitle} onChange={v => setEmpowerSection((p:any) => ({...p, subtitle: v}))} />
          <BilingualInput label="العنوان الرئيسي" value={empowerSection.title} onChange={v => setEmpowerSection((p:any) => ({...p, title: v}))} />
          <BilingualInput label="الجزء المميز من العنوان" value={empowerSection.titleHighlight} onChange={v => setEmpowerSection((p:any) => ({...p, titleHighlight: v}))} />
          <BilingualTextarea label="الوصف" value={empowerSection.description} onChange={v => setEmpowerSection((p:any) => ({...p, description: v}))} />
          <BilingualInput label="نص الزر" value={empowerSection.ctaText} onChange={v => setEmpowerSection((p:any) => ({...p, ctaText: v}))} />
          
          <div className="pt-4 border-t space-y-4">
            <div className="flex justify-between items-center">
              <Label className="font-bold">إحصائيات القسم المدمجة</Label>
              <Button size="sm" variant="outline" onClick={() => setEmpowerSection((p:any) => ({...p, stats: [...(p.stats||[]), {label: {ar:"", en:""}, value: ""}]}))}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {empowerSection.stats?.map((st:any, i:number) => (
              <div key={i} className="flex gap-2 items-start border p-3 rounded-md bg-muted/10">
                <div className="flex-1 space-y-2">
                  <Input placeholder="القيمة الرقمية (45M+)" value={st.value} dir="ltr" onChange={e => setEmpowerSection((p:any) => { const s = [...p.stats]; s[i].value = e.target.value; return {...p, stats: s}; })} />
                  <BilingualInput label={`وصف ${i+1}`} value={st.label} onChange={v => setEmpowerSection((p:any) => { const s = [...p.stats]; s[i].label = v; return {...p, stats: s}; })} />
                </div>
                <Button variant="ghost" size="icon" className="mt-8" onClick={() => setEmpowerSection((p:any) => ({...p, stats: p.stats.filter((_:any, idx:number) => idx !== i)}))}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
          </div>
          <Button className="w-full mt-4" onClick={() => handleSave("empower_section", empowerSection)} disabled={isSaving}>حفظ التعديلات</Button>
        </CardContent>
      </AccordionContent>
    </AccordionItem>
  );
}

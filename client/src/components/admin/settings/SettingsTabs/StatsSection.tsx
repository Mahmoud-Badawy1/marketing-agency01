import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BarChart3, Plus, Trash2 } from "lucide-react";
import { BilingualInput, type BilingualText } from "../BilingualInput";

interface StatsSectionProps {
  stats: { value: string; label: BilingualText; color: string }[];
  setStats: (val: any | ((prev: any[]) => any[])) => void;
  handleSave: (key: string, value: any) => void;
  isSaving: boolean;
}

export function StatsSection({ stats, setStats, handleSave, isSaving }: StatsSectionProps) {
  return (
    <AccordionItem value="item-6Stats" className="bg-card border shadow-sm rounded-lg overflow-hidden mb-6 border-none">
      <div className="flex items-center justify-between px-4 border-b ">
        <AccordionTrigger className="flex-1 px-6 py-4 hover:no-underline hover:bg-muted/50 transition-colors border-none group">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary group-data-[state=open]:text-foreground transition-colors" />
            <span className="font-semibold">إحصائيات النجاح (Success Stats)</span>
          </div>
        </AccordionTrigger>
        <Button 
          variant="outline" 
          size="sm" 
          className="mr-6 relative z-10" 
          onClick={(e) => {
            e.stopPropagation();
            setStats((p: any[]) => [...p, { label: {ar:"", en:""}, value: "", color: "" }]);
          }}
        >
          <Plus className="h-4 w-4 ml-1" /> إضافة إحصائية
        </Button>
      </div>
      <AccordionContent className="pt-0">
        <CardContent className="space-y-6 pt-6">
          {stats.map((st, i) => (
            <div key={i} className="flex gap-2 items-start border p-4 rounded-md bg-muted/5 mb-4">
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">القيمة (مثال: 50M+)</label>
                    <Input value={st.value} onChange={e => setStats((p: any[]) => p.map((s, idx) => idx === i ? {...s, value: e.target.value} : s))} dir="ltr" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">اللون (CSS class)</label>
                    <Input value={st.color} onChange={e => setStats((p: any[]) => p.map((s, idx) => idx === i ? {...s, color: e.target.value} : s))} dir="ltr" />
                  </div>
                </div>
                <BilingualInput label="الوصف" value={st.label} onChange={v => setStats((p: any[]) => p.map((s, idx) => idx === i ? {...s, label: v} : s))} />
              </div>
              <Button variant="ghost" size="icon" onClick={() => setStats((p: any[]) => p.filter((_, idx) => idx !== i))}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
          <Button className="w-full mt-4" onClick={() => handleSave("stats", stats)} disabled={isSaving}>حفظ الإحصائيات</Button>
        </CardContent>
      </AccordionContent>
    </AccordionItem>
  );
}

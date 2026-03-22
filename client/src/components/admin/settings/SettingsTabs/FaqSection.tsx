import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HelpCircle, Plus, Trash2 } from "lucide-react";
import { BilingualInput, type BilingualText } from "../BilingualInput";

interface FaqSectionProps {
  faqs: { q: BilingualText; a: BilingualText }[];
  setFaqs: (val: any | ((prev: any[]) => any[])) => void;
  handleSave: (key: string, value: any) => void;
  isSaving: boolean;
}

export function FaqSection({ faqs, setFaqs, handleSave, isSaving }: FaqSectionProps) {
  return (
    <AccordionItem value="item-4Faq" className="bg-card border shadow-sm rounded-lg overflow-hidden mb-6 border-none">
      <div className="flex items-center justify-between px-4 border-b ">
        <AccordionTrigger className="flex-1 px-6 py-4 hover:no-underline hover:bg-muted/50 transition-colors border-none group">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary group-data-[state=open]:text-foreground transition-colors" />
            <span className="font-semibold">الأسئلة الشائعة (FAQs)</span>
          </div>
        </AccordionTrigger>
        <Button 
          variant="outline" 
          size="sm" 
          className="mr-6 relative z-10" 
          onClick={(e) => {
            e.stopPropagation();
            setFaqs((p: any[]) => [...p, { q: {ar:"", en:""}, a: {ar:"", en:""} }]);
          }}
        >
          <Plus className="h-4 w-4 ml-1" /> إضافة سؤال
        </Button>
      </div>
      <AccordionContent className="pt-0">
        <CardContent className="space-y-6 pt-6">
          {faqs.map((faq, i) => (
            <div key={i} className="border p-4 rounded-lg bg-card/50 space-y-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold">سؤال {i + 1}</span>
                <Button variant="ghost" size="icon" onClick={() => setFaqs((p: any[]) => p.filter((_, idx) => idx !== i))}><Trash2 className="h-4 w-4 text-destructive"/></Button>
              </div>
              <BilingualInput label="السؤال" value={faq.q} onChange={v => setFaqs((p: any[]) => p.map((s, idx) => idx === i ? {...s, q: v} : s))} />
              <BilingualInput label="الإجابة" value={faq.a} onChange={v => setFaqs((p: any[]) => p.map((s, idx) => idx === i ? {...s, a: v} : s))} />
            </div>
          ))}
          <Button className="w-full mt-4" onClick={() => handleSave("faqs", faqs)} disabled={isSaving}>حفظ الأسئلة</Button>
        </CardContent>
      </AccordionContent>
    </AccordionItem>
  );
}

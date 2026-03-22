import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Plus, Trash2 } from "lucide-react";
import { BilingualInput } from "../BilingualInput";

interface PricingSectionProps {
  plans: any[];
  setPlans: (val: any[] | ((prev: any[]) => any[])) => void;
  handleSave: (key: string, value: any) => void;
  isSaving: boolean;
}

export function PricingSection({ plans, setPlans, handleSave, isSaving }: PricingSectionProps) {
  return (
    <AccordionItem value="item-5PricingPlans" className="bg-card border shadow-sm rounded-lg overflow-hidden mb-6 border-none">
      <div className="flex items-center justify-between px-4 border-b ">
        <AccordionTrigger className="flex-1 px-6 py-4 hover:no-underline hover:bg-muted/50 transition-colors border-none group">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary group-data-[state=open]:text-foreground transition-colors" />
            <span className="font-semibold">باقات التسعير (Pricing Plans)</span>
          </div>
        </AccordionTrigger>
        <Button 
          variant="outline" 
          size="sm" 
          className="mr-6 relative z-10" 
          onClick={(e) => {
            e.stopPropagation();
            setPlans((p: any[]) => [...p, { name: {ar:"", en:""}, price: "0", features: [] }]);
          }}
        >
          <Plus className="h-4 w-4 ml-1" /> إضافة باقة
        </Button>
      </div>
      <AccordionContent className="pt-0">
        <CardContent className="space-y-6 pt-6">
          {plans.map((plan, pi) => (
            <div key={pi} className="border p-4 rounded-lg bg-card/50 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">باقة {pi+1}</h3>
                <Button variant="destructive" size="sm" onClick={() => setPlans((p: any[]) => p.filter((_, i) => i !== pi))}><Trash2 className="h-4 w-4"/></Button>
              </div>
              <BilingualInput label="اسم الباقة" value={plan.name} onChange={v => setPlans((p: any[]) => p.map((c, idx) => idx === pi ? {...c, name: v} : c))} />
              <BilingualInput label="المدة (مثال: شهرياً)" value={plan.period} onChange={v => setPlans((p: any[]) => p.map((c, idx) => idx === pi ? {...c, period: v} : c))} />
              <div className="space-y-2">
                <Label>السعر رقماً</Label>
                <Input type="number" value={plan.price} onChange={e => setPlans((p: any[]) => p.map((c, idx) => idx === pi ? {...c, price: e.target.value} : c))} />
              </div>
              
              <div className="pt-4">
                <div className="flex justify-between items-center mb-2">
                  <Label>المميزات (Features)</Label>
                  <Button size="sm" variant="outline" onClick={() => setPlans((p: any[]) => p.map((c, idx) => idx === pi ? {...c, features: [...(c.features||[]), {ar:"", en:""}]} : c))}>إضافة ميزة</Button>
                </div>
                {plan.features?.map((feat: any, fi: number) => (
                   <div key={fi} className="flex gap-2 items-center mb-2">
                     <div className="flex-1"><BilingualInput label={`ميزة ${fi + 1}`} value={feat} onChange={v => setPlans((p: any[]) => { const newP = [...p]; newP[pi].features[fi] = v; return newP; })} /></div>
                     <Button variant="ghost" size="icon" onClick={() => setPlans((p: any[]) => { const newP = [...p]; newP[pi].features = newP[pi].features.filter((_:any, index:number) => index !== fi); return newP; })}><Trash2 className="h-4 w-4"/></Button>
                   </div>
                ))}
              </div>
            </div>
          ))}
          <Button className="w-full mt-4" onClick={() => handleSave("plans", plans)} disabled={isSaving}>حفظ الباقات</Button>
        </CardContent>
      </AccordionContent>
    </AccordionItem>
  );
}

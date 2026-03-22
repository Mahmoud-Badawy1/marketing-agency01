import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
            setPlans((p: any[]) => [...p, { 
              id: `plan-${Date.now()}`,
              name: {ar:"", en:""}, 
              subtitle: {ar:"", en:""}, 
              price: "0", 
              period: {ar:"", en:""},
              features: [],
              popular: false,
              perChild: true,
              discountPercent: 0,
              discountLabel: {ar:"", en:""}
            }]);
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
              <BilingualInput label="الكلمة المفتاحية (Subtitle)" value={plan.subtitle} onChange={v => setPlans((p: any[]) => p.map((c, idx) => idx === pi ? {...c, subtitle: v} : c))} />
              <BilingualInput label="المدة (مثال: شهرياً)" value={plan.period} onChange={v => setPlans((p: any[]) => p.map((c, idx) => idx === pi ? {...c, period: v} : c))} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>معرف الباقة (ID/Slug)</Label>
                  <Input value={plan.id} onChange={e => setPlans((p: any[]) => p.map((c, idx) => idx === pi ? {...c, id: e.target.value} : c))} placeholder="e.g. basic-plan" />
                </div>
                <div className="space-y-2">
                  <Label>السعر رقماً</Label>
                  <Input type="number" value={plan.price} onChange={e => setPlans((p: any[]) => p.map((c, idx) => idx === pi ? {...c, price: e.target.value} : c))} />
                </div>
              </div>

              <div className="flex flex-wrap gap-6 py-2">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Switch id={`popular-${pi}`} checked={plan.popular} onCheckedChange={v => setPlans((p: any[]) => p.map((c, idx) => idx === pi ? {...c, popular: v} : c))} />
                  <Label htmlFor={`popular-${pi}`}>باقة مميزة (Popular)</Label>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Switch id={`perChild-${pi}`} checked={plan.perChild} onCheckedChange={v => setPlans((p: any[]) => p.map((c, idx) => idx === pi ? {...c, perChild: v} : c))} />
                  <Label htmlFor={`perChild-${pi}`}>التسعير لكل خدمة/مشروع (Per Child)</Label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                <div className="space-y-2">
                  <Label>نسبة الخصم % (Discount Percent)</Label>
                  <Input type="number" value={plan.discountPercent} onChange={e => setPlans((p: any[]) => p.map((c, idx) => idx === pi ? {...c, discountPercent: parseInt(e.target.value) || 0} : c))} />
                </div>
                <BilingualInput label="تسمية الخصم (Discount Label)" value={plan.discountLabel} onChange={v => setPlans((p: any[]) => p.map((c, idx) => idx === pi ? {...c, discountLabel: v} : c))} />
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

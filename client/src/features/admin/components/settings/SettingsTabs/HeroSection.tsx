import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/atoms/Button";
import { Images, Plus, Trash2 } from "lucide-react";
import { BilingualInput } from "../BilingualInput";

interface HeroSectionProps {
  heroSlides: any[];
  setHeroSlides: (val: any | ((prev: any[]) => any[])) => void;
  handleSave: (key: string, value: any) => void;
  isSaving: boolean;
}

export function HeroSection({ heroSlides, setHeroSlides, handleSave, isSaving }: HeroSectionProps) {
  return (
    <AccordionItem value="item-1HeroSlides" className="bg-card border shadow-sm rounded-lg overflow-hidden mb-6 border-none">
      <div className="flex items-center justify-between px-4 border-b ">
        <AccordionTrigger className="flex-1 px-6 py-4 hover:no-underline hover:bg-muted/50 transition-colors border-none group">
          <div className="flex items-center gap-2">
            <Images className="h-5 w-5 text-primary group-data-[state=open]:text-foreground transition-colors" />
            <span className="font-semibold">شرائح قسم البداية (Hero)</span>
          </div>
        </AccordionTrigger>
        <Button 
          variant="outline" 
          size="sm" 
          className="mr-6 relative z-10" 
          onClick={(e) => {
            e.stopPropagation();
            setHeroSlides((p: any[]) => [...p, { title: {ar:"", en:""}, highlight: {ar:"", en:""}, subtitle: {ar:"", en:""}, mediaUrl: "" }]);
          }}
        >
          <Plus className="h-4 w-4 ml-1" /> إضافة شريحة
        </Button>
      </div>
      <AccordionContent className="pt-0">
        <CardContent className="space-y-6 pt-6">
          {heroSlides.map((slide, i) => (
            <div key={i} className="border p-4 rounded-lg bg-card/50 space-y-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold">شريحة {i + 1}</span>
                <Button variant="ghost" size="icon" onClick={() => setHeroSlides((p: any[]) => p.filter((_, idx) => idx !== i))}><Trash2 className="h-4 w-4 text-destructive"/></Button>
              </div>
              <BilingualInput label="العنوان الرئيسي" value={slide.title} onChange={v => setHeroSlides((p: any[]) => p.map((s, idx) => idx === i ? {...s, title: v} : s))} />
              <BilingualInput label="الجزء الملون من العنوان" value={slide.highlight} onChange={v => setHeroSlides((p: any[]) => p.map((s, idx) => idx === i ? {...s, highlight: v} : s))} />
              <BilingualInput label="العنوان الفرعي" value={slide.subtitle} onChange={v => setHeroSlides((p: any[]) => p.map((s, idx) => idx === i ? {...s, subtitle: v} : s))} />
            </div>
          ))}
          <Button className="w-full mt-4" onClick={() => handleSave("hero_slides", heroSlides)} disabled={isSaving}>
            {isSaving ? "جاري الحفظ..." : "حفظ شرائح الهيرو / Save Hero Slides"}
          </Button>
        </CardContent>
      </AccordionContent>
    </AccordionItem>
  );
}

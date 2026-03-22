import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Images as ImagesIcon, Plus, Trash2 } from "lucide-react";
import { BilingualInput } from "../BilingualInput";
import { BilingualTextarea } from "../BilingualTextarea";
import { ImageUploadInput } from "../ImageUploadInput";

interface GallerySectionProps {
  galleryCards: any[];
  setGalleryCards: (val: any[] | ((prev: any[]) => any[])) => void;
  handleSave: (key: string, value: any) => void;
  isSaving: boolean;
}

export function GallerySection({ galleryCards, setGalleryCards, handleSave, isSaving }: GallerySectionProps) {
  return (
    <AccordionItem value="item-8Gallery" className="bg-card border shadow-sm rounded-lg overflow-hidden mb-6 border-none">
      <div className="flex items-center justify-between px-4 border-b ">
        <AccordionTrigger className="flex-1 px-6 py-4 hover:no-underline hover:bg-muted/50 transition-colors border-none group">
          <div className="flex items-center gap-2">
            <ImagesIcon className="h-5 w-5 text-primary group-data-[state=open]:text-foreground transition-colors" />
            <span className="font-semibold">معرض النجاح (Gallery Content)</span>
          </div>
        </AccordionTrigger>
        <Button 
          variant="outline" 
          size="sm" 
          className="mr-6 relative z-10" 
          onClick={(e) => {
            e.stopPropagation();
            setGalleryCards((p: any[]) => [...p, { badge: {ar:"", en:""}, title: {ar:"", en:""}, description: {ar:"", en:""}, image: "", badgeColor: "bg-primary" }]);
          }}
        >
          <Plus className="h-4 w-4 ml-1" /> إضافة عنصر
        </Button>
      </div>
      <AccordionContent className="pt-0">
        <CardContent className="space-y-6 pt-6">
          {galleryCards.map((card, i) => (
            <div key={i} className="border p-4 rounded-lg bg-card/50 space-y-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold">عنصر {i + 1}</span>
                <Button variant="ghost" size="icon" onClick={() => setGalleryCards((p: any[]) => p.filter((_, idx) => idx !== i))}><Trash2 className="h-4 w-4 text-destructive"/></Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <BilingualInput label="الشارة (Badge)" value={card.badge} onChange={v => setGalleryCards((p: any[]) => p.map((s, idx) => idx === i ? {...s, badge: v} : s))} />
                <BilingualInput label="لون الشارة (Tailwind)" value={{ar: card.badgeColor, en: card.badgeColor}} onChange={v => setGalleryCards((p: any[]) => p.map((s, idx) => idx === i ? {...s, badgeColor: v.en} : s))} />
              </div>
              <BilingualInput label="العنوان" value={card.title} onChange={v => setGalleryCards((p: any[]) => p.map((s, idx) => idx === i ? {...s, title: v} : s))} />
              <BilingualTextarea label="الوصف" value={card.description} onChange={v => setGalleryCards((p: any[]) => p.map((s, idx) => idx === i ? {...s, description: v} : s))} />
              <ImageUploadInput label="الصورة" value={card.image} onChange={v => setGalleryCards((p: any[]) => p.map((s, idx) => idx === i ? {...s, image: v} : s))} />
            </div>
          ))}
          <Button className="w-full mt-4" onClick={() => handleSave("gallery_cards", galleryCards)} disabled={isSaving}>حفظ المعرض</Button>
        </CardContent>
      </AccordionContent>
    </AccordionItem>
  );
}

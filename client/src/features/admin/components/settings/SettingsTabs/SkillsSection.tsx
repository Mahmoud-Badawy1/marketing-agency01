import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/atoms/Button";
import { Star, Plus, Trash2 } from "lucide-react";
import { BilingualInput } from "../BilingualInput";
import { BilingualTextarea } from "../BilingualTextarea";
import { ImageUploadInput } from "../ImageUploadInput";

interface SkillsSectionProps {
  skillsCards: any[];
  setSkillsCards: (val: any[] | ((prev: any[]) => any[])) => void;
  handleSave: (key: string, value: any) => void;
  isSaving: boolean;
}

export function SkillsSection({
  skillsCards,
  setSkillsCards,
  handleSave,
  isSaving,
}: SkillsSectionProps) {
  return (
    <AccordionItem
      value="item-10Skills"
      className="bg-card border shadow-sm rounded-lg overflow-hidden mb-6 border-none"
    >
      <div className="flex items-center justify-between px-4 border-b ">
        <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50 transition-colors border-none group">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary group-data-[state=open]:text-foreground transition-colors" />
            <span className="font-semibold">
              بطاقات مهارات الهيرو (Hero Skills)
            </span>
          </div>
        </AccordionTrigger>
        <Button
          variant="outline"
          size="sm"
          className="mr-6 relative z-10"
          onClick={(e) => {
            e.stopPropagation();
            setSkillsCards((p: any[]) => [
              ...p,
              {
                title: { ar: "", en: "" },
                description: { ar: "", en: "" },
                buttonText: { ar: "", en: "" },
                image: "",
              },
            ]);
          }}
        >
          <Plus className="h-4 w-4 ml-1" /> إضافة بطاقة
        </Button>
      </div>
      <AccordionContent className="pt-0">
        <CardContent className="space-y-6 pt-6">
          {skillsCards.map((card, i) => (
            <div key={i} className="border p-4 rounded-lg bg-card/50 space-y-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold">بطاقة {i + 1}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setSkillsCards((p: any[]) =>
                      p.filter((_, idx) => idx !== i),
                    )
                  }
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              <BilingualInput
                label="العنوان"
                value={card.title}
                onChange={(v) =>
                  setSkillsCards((p: any[]) =>
                    p.map((s, idx) => (idx === i ? { ...s, title: v } : s)),
                  )
                }
              />
              <BilingualTextarea
                label="الوصف"
                value={card.description}
                onChange={(v) =>
                  setSkillsCards((p: any[]) =>
                    p.map((s, idx) =>
                      idx === i ? { ...s, description: v } : s,
                    ),
                  )
                }
              />
              <BilingualInput
                label="نص الزر"
                value={card.buttonText}
                onChange={(v) =>
                  setSkillsCards((p: any[]) =>
                    p.map((s, idx) =>
                      idx === i ? { ...s, buttonText: v } : s,
                    ),
                  )
                }
              />
              <ImageUploadInput
                label="الصورة"
                value={card.image}
                onChange={(v: string) =>
                  setSkillsCards((p: any[]) =>
                    p.map((s, idx) => (idx === i ? { ...s, image: v } : s)),
                  )
                }
              />
            </div>
          ))}
          <Button
            className="w-full mt-4"
            onClick={() => handleSave("skills_cards", skillsCards)}
            disabled={isSaving}
          >
            حفظ المهارات
          </Button>
        </CardContent>
      </AccordionContent>
    </AccordionItem>
  );
}

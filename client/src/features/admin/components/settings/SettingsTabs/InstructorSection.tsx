import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/atoms/Button";
import { UserCircle, Plus, Trash2 } from "lucide-react";
import { BilingualInput } from "../BilingualInput";
import { BilingualTextarea } from "../BilingualTextarea";
import { ImageUploadInput } from "../ImageUploadInput";

interface InstructorSectionProps {
  instructorData: any;
  setInstructorData: (val: any | ((prev: any) => any)) => void;
  handleSave: (key: string, value: any) => void;
  isSaving: boolean;
}

export function InstructorSection({
  instructorData,
  setInstructorData,
  handleSave,
  isSaving,
}: InstructorSectionProps) {
  return (
    <AccordionItem
      value="item-2Instructor"
      className="bg-card border shadow-sm rounded-lg overflow-hidden mb-6 border-none"
    >
      <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50 transition-colors border-none group">
        <div className="flex items-center gap-2">
          <UserCircle className="h-5 w-5 text-primary group-data-[state=open]:text-foreground transition-colors" />
          <span className="font-semibold">بيانات الخبير (Expert Section)</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pt-0">
        <CardContent className="space-y-6 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <BilingualInput
                label="الاسم"
                value={instructorData.name}
                onChange={(v) =>
                  setInstructorData((p: any) => ({ ...p, name: v }))
                }
              />
              <BilingualInput
                label="المسمى الوظيفي"
                value={instructorData.title}
                onChange={(v) =>
                  setInstructorData((p: any) => ({ ...p, title: v }))
                }
              />
              <BilingualTextarea
                label="نبذة تعريفية"
                value={instructorData.bio}
                onChange={(v) =>
                  setInstructorData((p: any) => ({ ...p, bio: v }))
                }
              />
            </div>
            <div className="space-y-4">
              <BilingualInput
                label="كلمة ملهمة (Quote)"
                value={instructorData.quote}
                onChange={(v) =>
                  setInstructorData((p: any) => ({ ...p, quote: v }))
                }
              />
              <BilingualInput
                label="شارة (Badge)"
                value={instructorData.badge}
                onChange={(v) =>
                  setInstructorData((p: any) => ({ ...p, badge: v }))
                }
              />
              <ImageUploadInput
                label="صورة الخبير"
                value={instructorData.image}
                onChange={(v: string) =>
                  setInstructorData((p: any) => ({ ...p, image: v }))
                }
              />
            </div>
          </div>

          <div className="pt-4 border-t space-y-4">
            <div className="flex justify-between items-center">
              <label className="font-bold">الإنجازات (Achievements)</label>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setInstructorData((p: any) => ({
                    ...p,
                    achievements: [
                      ...(p.achievements || []),
                      { label: { ar: "", en: "" }, color: "" },
                    ],
                  }))
                }
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {instructorData.achievements?.map((ach: any, i: number) => (
              <div
                key={i}
                className="flex gap-2 items-start border p-3 rounded-md"
              >
                <div className="flex-1 space-y-2">
                  <BilingualInput
                    label={`إنجاز ${i + 1}`}
                    value={ach.label}
                    onChange={(v) =>
                      setInstructorData((p: any) => {
                        const a = [...p.achievements];
                        a[i].label = v;
                        return { ...p, achievements: a };
                      })
                    }
                  />
                  <BilingualInput
                    label="اللون (CSS classes)"
                    value={{ ar: ach.color, en: ach.color }}
                    onChange={(v) =>
                      setInstructorData((p: any) => {
                        const a = [...p.achievements];
                        a[i].color = v.en;
                        return { ...p, achievements: a };
                      })
                    }
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="mt-8"
                  onClick={() =>
                    setInstructorData((p: any) => ({
                      ...p,
                      achievements: p.achievements.filter(
                        (_: any, idx: number) => idx !== i,
                      ),
                    }))
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button
            className="w-full"
            onClick={() => handleSave("instructor", instructorData)}
            disabled={isSaving}
          >
            حفظ البيانات
          </Button>
        </CardContent>
      </AccordionContent>
    </AccordionItem>
  );
}

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/hooks/use-language";

interface ProjectEntry { name: string; budget: string; }

interface ProjectDetailsProps {
  projects: ProjectEntry[];
  perChild: boolean;
  price: number;
  discountedPrice: number;
  hasDiscount: boolean;
  totalAfterPlanDiscount: number;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, field: keyof ProjectEntry, value: string) => void;
}

export default function ProjectDetails({
  projects,
  perChild,
  price,
  discountedPrice,
  hasDiscount,
  totalAfterPlanDiscount,
  onAdd,
  onRemove,
  onUpdate
}: ProjectDetailsProps) {
  const { t, language } = useLanguage();

  return (
    <div className="border-t border-border pt-5">
      <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-foreground">{t({ ar: "تفاصيل العمل (الشركة/المشروع)", en: "Work Details (Company/Project)" })}</h3>
        </div>
        {perChild && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onAdd}
            data-testid="button-add-child"
          >
            <Plus className={`h-4 w-4 ${language === "ar" ? "ml-1" : "mr-1"}`} />
            {t({ ar: "إضافة مشروع آخر", en: "Add Another Project" })}
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {projects.map((project, index) => (
          <div
            key={index}
            className={`p-4 rounded-md border border-border ${projects.length > 1 ? "bg-muted/30" : ""}`}
            data-testid={`child-entry-${index}`}
          >
            <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
              <span className="text-sm font-bold text-foreground">
                {t({ ar: `مشروع / شركة ${index + 1}`, en: `Project / Company ${index + 1}` })}
              </span>
              {projects.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemove(index)}
                  data-testid={`button-remove-child-${index}`}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>{t({ ar: "اسم الشركة / المشروع", en: "Company / Project Name" })}</Label>
                <Input
                  value={project.name}
                  onChange={(e) => onUpdate(index, "name", e.target.value)}
                  placeholder={t({ ar: "ماركتير برو", en: "Marketer Pro" })}
                  data-testid={`input-child-name-${index}`}
                />
              </div>
              <div>
                <Label>{t({ ar: "الميزانية الإعلانية التقريبية (شهرياً)", en: "Est. Monthly Ad Budget" })}</Label>
                <Input
                  type="number"
                  min={1}
                  value={project.budget}
                  onChange={(e) => onUpdate(index, "budget", e.target.value)}
                  placeholder={t({ ar: "مثال: 50000", en: "e.g. 50000" })}
                  dir="ltr"
                  data-testid={`input-child-age-${index}`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {projects.length > 1 && perChild && (
        <div className="mt-3 p-3 rounded-md bg-accent/5 border border-accent/20 text-sm text-foreground">
          {hasDiscount ? (
            <>{t({ ar: "الإجمالي:", en: "Total:" })} <span className="text-muted-foreground line-through">{price} {t({ ar: "ج.م", en: "EGP" })}</span> → {discountedPrice} {t({ ar: "ج.م", en: "EGP" })} × {projects.length} {t({ ar: "مشاريع", en: "Projects" })} = <strong>{totalAfterPlanDiscount} {t({ ar: "ج.م", en: "EGP" })}</strong></>
          ) : (
            <>{t({ ar: "الإجمالي:", en: "Total:" })} {price} {t({ ar: "ج.م", en: "EGP" })} × {projects.length} {t({ ar: "مشاريع", en: "Projects" })} = <strong>{totalAfterPlanDiscount} {t({ ar: "ج.م", en: "EGP" })}</strong></>
          )}
        </div>
      )}
    </div>
  );
}

import { Clock } from "lucide-react";
import { Label } from "@/components/atoms/Label";
import { Input } from "@/components/atoms/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SkillsStepProps {
  t: any;
  language: string;
  formData: any;
  onChange: (field: string, value: string) => void;
}

export function SkillsStep({ t, language, formData, onChange }: SkillsStepProps) {
  return (
    <div className="grid md:grid-cols-2 gap-6 mt-6">
      <div>
        <Label htmlFor="marketingTools" className="mb-2 block">{t({ ar: "المنصات التسويقية التي تتقنها", en: "Marketing Platforms you master" })}</Label>
        <Input
          id="marketingTools"
          value={formData.marketingTools}
          onChange={(e) => onChange("marketingTools", e.target.value)}
          placeholder="Facebook Ads, Google Ads, TikTok..."
          dir="ltr"
        />
      </div>

      <div>
        <Label htmlFor="availableHours" className="flex items-center gap-2 mb-2">
          <Clock className="h-4 w-4" />
          {t({ ar: "الأوقات المتاحة للعمل *", en: "Available Work Hours *" })}
        </Label>
        <Select onValueChange={(value) => onChange("availableHours", value)} required dir={language === "ar" ? "rtl" : "ltr"}>
          <SelectTrigger>
            <SelectValue placeholder={t({ ar: "اختر وقت العمل المفضل", en: "Select preferred work schedule" })} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="صباحي">{t({ ar: "دوام كامل (عن بعد)", en: "Full-Time (Remote)" })}</SelectItem>
            <SelectItem value="مسائي">{t({ ar: "دوام جزئي (نصف يوم)", en: "Part-Time (Half Day)" })}</SelectItem>
            <SelectItem value="مرن">{t({ ar: "مستقل / فريلانس", en: "Freelance" })}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

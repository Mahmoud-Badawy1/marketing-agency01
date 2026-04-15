import { GraduationCap, BookOpen } from "lucide-react";
import { Label } from "@/components/atoms/Label";
import { Input } from "@/components/atoms/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { motion } from "framer-motion";
import { Textarea } from "@/components/atoms/Textarea";

interface ProfessionalInfoStepProps {
  t: any;
  language: string;
  formData: any;
  onChange: (field: string, value: string) => void;
}

export function ProfessionalInfoStep({ t, language, formData, onChange }: ProfessionalInfoStepProps) {
  return (
    <div className="space-y-6 mt-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="education" className="flex items-center gap-2 mb-2">
            <GraduationCap className="h-4 w-4" />
            {t({ ar: "المؤهل الدراسي *", en: "Education Level *" })}
          </Label>
          <Select onValueChange={(value) => onChange("education", value)} required dir={language === "ar" ? "rtl" : "ltr"}>
            <SelectTrigger>
              <SelectValue placeholder={t({ ar: "اختر المؤهل", en: "Select Education" })} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="دبلوم">{t({ ar: "دبلوم", en: "Diploma" })}</SelectItem>
              <SelectItem value="بكالوريوس">{t({ ar: "بكالوريوس", en: "Bachelor's Degree" })}</SelectItem>
              <SelectItem value="ماجستير">{t({ ar: "ماجستير", en: "Master's Degree" })}</SelectItem>
              <SelectItem value="دكتوراه">{t({ ar: "دكتوراه", en: "Ph.D." })}</SelectItem>
              <SelectItem value="أخرى">{t({ ar: "أخرى", en: "Other" })}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="specialization" className="flex items-center gap-2 mb-2">
            <BookOpen className="h-4 w-4" />
            {t({ ar: "التخصص المهني *", en: "Professional Specialization *" })}
          </Label>
          <Input
            id="specialization"
            value={formData.specialization}
            onChange={(e) => onChange("specialization", e.target.value)}
            required
            placeholder={t({ ar: "إدارة إعلانات، SEO، تصميم، مبيعات...", en: "Ads Management, SEO, Design, Sales..." })}
            dir={language === "ar" ? "rtl" : "ltr"}
          />
        </div>
        <div>
          <Label htmlFor="experienceYears" className="mb-2 block">{t({ ar: "سنوات الخبرة في التسويق / مجالك *", en: "Years of Experience in Marketing *" })}</Label>
          <Input
            id="experienceYears"
            type="number"
            min="0"
            max="40"
            value={formData.experienceYears}
            onChange={(e) => onChange("experienceYears", e.target.value)}
            required
            placeholder={t({ ar: "عدد السنوات", en: "Number of Years" })}
            dir="ltr"
          />
        </div>
      </div>

      <div>
        <Label className="mb-4 block">{t({ ar: "هل لديك خبرة سابقة في إدارة حملات تسويقية ناجحة؟ *", en: "Do you have previous experience managing successful marketing campaigns? *" })}</Label>
        <RadioGroup 
          onValueChange={(value) => onChange("hasAgencyExperience", value)}
          className="flex gap-6"
          required
          dir={language === "ar" ? "rtl" : "ltr"}
        >
          <div className={`flex items-center space-x-2 ${language === "ar" ? "space-x-reverse" : ""}`}>
            <RadioGroupItem value="true" id="agency-yes" />
            <Label htmlFor="agency-yes">{t({ ar: "نعم", en: "Yes" })}</Label>
          </div>
          <div className={`flex items-center space-x-2 ${language === "ar" ? "space-x-reverse" : ""}`}>
            <RadioGroupItem value="false" id="agency-no" />
            <Label htmlFor="agency-no">{t({ ar: "لا", en: "No" })}</Label>
          </div>
        </RadioGroup>
      </div>

      {formData.hasAgencyExperience === "true" && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="space-y-2"
        >
          <Label htmlFor="portfolioDetails" className="mb-2 block">{t({ ar: "أبرز إنجازاتك أو حملاتك التسويقية", en: "Your most prominent marketing achievements or campaigns" })}</Label>
          <Textarea
            id="portfolioDetails"
            value={formData.portfolioDetails}
            onChange={(e) => onChange("portfolioDetails", e.target.value)}
            placeholder={t({ ar: "اذكر تفاصيل خبرتك والنتائج التي حققتها للعملاء...", en: "Mention details of your experience and the results you achieved for clients..." })}
            rows={3}
            dir={language === "ar" ? "rtl" : "ltr"}
          />
        </motion.div>
      )}
    </div>
  );
}

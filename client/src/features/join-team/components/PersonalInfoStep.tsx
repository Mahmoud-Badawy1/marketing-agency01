import { User, Mail, Phone, MapPin } from "lucide-react";
import { Label } from "@/components/atoms/Label";
import { Input } from "@/components/atoms/Input";

interface PersonalInfoStepProps {
  t: any;
  language: string;
  formData: any;
  onChange: (field: string, value: string) => void;
}

export function PersonalInfoStep({ t, language, formData, onChange }: PersonalInfoStepProps) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <Label htmlFor="fullName" className="flex items-center gap-2 mb-2">
          <User className="h-4 w-4" />
          {t({ ar: "الاسم الكامل *", en: "Full Name *" })}
        </Label>
        <Input
          id="fullName"
          value={formData.fullName}
          onChange={(e) => onChange("fullName", e.target.value)}
          required
          placeholder={t({ ar: "أدخل اسمك الكامل", en: "Enter your full name" })}
          dir={language === "ar" ? "rtl" : "ltr"}
        />
      </div>
      <div>
        <Label htmlFor="email" className="flex items-center gap-2 mb-2">
          <Mail className="h-4 w-4" />
          {t({ ar: "البريد الإلكتروني *", en: "Email *" })}
        </Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => onChange("email", e.target.value)}
          required
          placeholder="example@email.com"
          dir="ltr"
        />
      </div>
      <div>
        <Label htmlFor="phone" className="flex items-center gap-2 mb-2">
          <Phone className="h-4 w-4" />
          {t({ ar: "رقم الهاتف (واتساب) *", en: "WhatsApp Number *" })}
        </Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => onChange("phone", e.target.value)}
          required
          placeholder="01xxxxxxxxx"
          dir="ltr"
        />
      </div>
      <div>
        <Label htmlFor="age" className="mb-2 block">{t({ ar: "العمر *", en: "Age *" })}</Label>
        <Input
          id="age"
          type="number"
          min="18"
          max="60"
          value={formData.age}
          onChange={(e) => onChange("age", e.target.value)}
          required
          placeholder={t({ ar: "العمر", en: "Age" })}
          dir="ltr"
        />
      </div>
      <div className="md:col-span-2">
        <Label htmlFor="city" className="flex items-center gap-2 mb-2">
          <MapPin className="h-4 w-4" />
          {t({ ar: "المدينة / المحافظة *", en: "City / Governorate *" })}
        </Label>
        <Input
          id="city"
          value={formData.city}
          onChange={(e) => onChange("city", e.target.value)}
          required
          placeholder={t({ ar: "القاهرة، الإسكندرية، الجيزة...", en: "Cairo, Alexandria, Giza..." })}
          dir={language === "ar" ? "rtl" : "ltr"}
        />
      </div>
    </div>
  );
}

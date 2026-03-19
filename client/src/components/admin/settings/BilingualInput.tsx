import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export interface BilingualText {
  ar: string;
  en: string;
}

interface BilingualInputProps {
  value: BilingualText | string | undefined;
  onChange: (value: BilingualText) => void;
  label: string;
  placeholderAr?: string;
  placeholderEn?: string;
  isTextArea?: boolean;
}

export function BilingualInput({ value, onChange, label, placeholderAr, placeholderEn, isTextArea }: BilingualInputProps) {
  const normalizedValue: BilingualText = 
    typeof value === 'object' && value !== null 
      ? { ar: value.ar || "", en: value.en || "" }
      : { ar: typeof value === 'string' ? value : "", en: "" };

  const InputComponent = isTextArea ? Textarea : Input;

  return (
    <div className="space-y-2 p-3 bg-card/50 border border-border/70 rounded-lg shadow-sm">
      <Label className="font-semibold text-foreground">{label}</Label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground flex items-center justify-between">
            <span>العربية (AR)</span>
            <span dir="ltr" className="text-[10px] font-mono opacity-50 bg-muted px-1 rounded">ar</span>
          </Label>
          <InputComponent 
            dir="rtl"
            value={normalizedValue.ar} 
            onChange={(e: any) => onChange({ ...normalizedValue, ar: e.target.value })} 
            placeholder={placeholderAr || "نص عربي..."}
            className="bg-background"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground flex items-center justify-between">
            <span>English (EN)</span>
            <span dir="ltr" className="text-[10px] font-mono opacity-50 bg-muted px-1 rounded">en</span>
          </Label>
          <InputComponent 
            dir="ltr"
            value={normalizedValue.en} 
            onChange={(e: any) => onChange({ ...normalizedValue, en: e.target.value })} 
            placeholder={placeholderEn || "English text..."}
            className="bg-background"
          />
        </div>
      </div>
    </div>
  );
}

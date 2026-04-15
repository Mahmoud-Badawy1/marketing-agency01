import { Input } from "@/components/atoms/Input";
import { Label } from "@/components/atoms/Label";

interface ImageUploadInputProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
}

export function ImageUploadInput({ label, value, onChange }: ImageUploadInputProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-3 items-center">
        {value && (
          <div className="w-10 h-10 rounded shadow-sm border overflow-hidden flex-shrink-0 bg-muted/30">
            <img src={value} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} onLoad={(e) => (e.currentTarget.style.display = 'block')} />
          </div>
        )}
        <Input 
          placeholder="https://... أو رابط الصورة" 
          value={value || ""} 
          onChange={(e) => onChange(e.target.value)} 
          dir="ltr"
        />
      </div>
    </div>
  );
}

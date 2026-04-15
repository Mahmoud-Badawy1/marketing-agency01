import { Heart, FileUp, Upload, Send } from "lucide-react";
import { Label } from "@/components/atoms/Label";
import { Button } from "@/components/atoms/Button";
import { Textarea } from "@/components/atoms/Textarea";

interface MotivationStepProps {
  t: any;
  language: string;
  formData: any;
  onChange: (field: string, value: string) => void;
  cvFile: File | null;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isPending: boolean;
}

export function MotivationStep({
  t, language, formData, onChange,
  cvFile, fileInputRef, onFileChange,
  isPending
}: MotivationStepProps) {
  return (
    <div className="space-y-6 mt-6">
      <div>
        <Label htmlFor="motivation" className="flex items-center gap-2 mb-2">
          <Heart className="h-4 w-4" />
          {t({ ar: "لماذا تريد الانضمام لفريق ماركتير برو؟", en: "Why do you want to join Marketer Pro's team?" })}
        </Label>
        <Textarea
          id="motivation"
          value={formData.motivation}
          onChange={(e) => onChange("motivation", e.target.value)}
          placeholder={t({ ar: "اكتب دافعك وطموحاتك من الانضمام إلينا...", en: "Write your motivation and ambitions for joining us..." })}
          rows={4}
          maxLength={500}
          dir={language === "ar" ? "rtl" : "ltr"}
        />
        <div className="text-sm text-muted-foreground mt-1">
          {formData.motivation.length}/500
        </div>
      </div>

      <div>
        <Label className="flex items-center gap-2 mb-2">
          <FileUp className="h-4 w-4" />
          {t({ ar: "السيرة الذاتية (PDF)", en: "Resume / CV (PDF)" })}
        </Label>
        <div className="flex items-center gap-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            {cvFile ? t({ ar: "تغيير الملف", en: "Change File" }) : t({ ar: "رفع السيرة الذاتية", en: "Upload Resume" })}
          </Button>
          {cvFile && (
            <span className="text-sm text-muted-foreground">
              {cvFile.name}
            </span>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={onFileChange}
          className="hidden"
        />
        <div className="text-sm text-muted-foreground mt-1">
          {t({ ar: "ملف PDF، حد أقصى 5 ميغابايت (اختياري)", en: "PDF file, maximum 5 MB (Optional)" })}
        </div>
      </div>

      <div className="pt-6">
        <Button
          type="submit"
          size="lg"
          className="w-full text-lg"
          disabled={isPending}
        >
          {isPending ? (
            t({ ar: "جارٍ الإرسال...", en: "Submitting..." })
          ) : (
            <>
              <Send className="ml-2 h-5 w-5" />
              {t({ ar: "أرسل طلب الانضمام", en: "Submit Application" })}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

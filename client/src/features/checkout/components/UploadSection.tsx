import { ImagePlus, Upload, X, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { useLanguage } from "@/hooks/use-language";

interface UploadSectionProps {
  imagePreview: string | null;
  uploading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  onRemove: () => void;
}

export default function UploadSection({
  imagePreview,
  uploading,
  fileInputRef,
  onFileSelect,
  onSubmit,
  onRemove
}: UploadSectionProps) {
  const { t, language } = useLanguage();

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden"
        onChange={onFileSelect}
        data-testid="input-file-upload"
      />

      {!imagePreview ? (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full border-2 border-dashed border-border rounded-md p-10 flex flex-col items-center gap-3 text-muted-foreground transition-colors hover:bg-muted/50"
          data-testid="button-select-image"
        >
          <Upload className="h-10 w-10" />
          <span className="text-sm font-medium">{t({ ar: "اضغط لاختيار صورة الإيصال", en: "Click to select receipt image" })}</span>
          <span className="text-xs">JPG, PNG, WEBP - {t({ ar: "أقصى حجم 10 ميجابايت", en: "Max size 10MB" })}</span>
        </button>
      ) : (
        <div className="relative">
          <img
            src={imagePreview}
            alt="Receipt"
            className="w-full max-h-80 object-contain rounded-md border border-border"
            data-testid="img-transfer-preview"
          />
          <Button
            size="icon"
            variant="destructive"
            className={`absolute top-2 ${language === "ar" ? "left-2" : "right-2"}`}
            onClick={onRemove}
            data-testid="button-remove-image"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="bg-muted/50 rounded-md p-4 border border-border flex items-start gap-3">
        <Clock className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
        <p className="text-sm text-muted-foreground">
          {t({ ar: "بعد إرفاق الإيصال، سيقوم فريقنا بمراجعة التحويل والتواصل معك لتأكيد الانطلاق وتحديد المواعيد.", en: "After attaching the receipt, our team will review the transfer and reach out to you to confirm boarding and scheduling." })}
        </p>
      </div>

      <Button
        size="lg"
        className="w-full bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700"
        onClick={onSubmit}
        disabled={!imagePreview || uploading}
        data-testid="button-confirm-upload"
      >
        {uploading ? t({ ar: "جاري الرفع...", en: "Uploading..." }) : t({ ar: "تأكيد وإرسال", en: "Confirm & Submit" })}
        <CheckCircle2 className={`h-4 w-4 ${language === "ar" ? "mr-2" : "ml-2"}`} />
      </Button>
    </div>
  );
}

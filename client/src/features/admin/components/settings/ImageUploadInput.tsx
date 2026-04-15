import { useState, useRef } from "react";
import { Input } from "@/components/atoms/Input";
import { Label } from "@/components/atoms/Label";
import { Button } from "@/components/atoms/Button";
import { Upload, X, Loader2 } from "lucide-react";
import { adminFetch } from "@/lib/admin";

interface ImageUploadInputProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
}

export function ImageUploadInput({ label, value, onChange }: ImageUploadInputProps) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await adminFetch("/api/admin/upload", {
        method: "POST",
        body: formData,
        // Don't set Content-Type — browser sets it automatically with boundary for FormData
        headers: {},
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      onChange(data.path);
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {/* Image Preview */}
      {value && (
        <div className="relative w-full max-w-xs rounded-lg border overflow-hidden bg-muted/20 group">
          <img
            src={value}
            alt="Preview"
            className="w-full h-40 object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onChange("")}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      {/* Upload Button + URL Input */}
      <div className="flex gap-2 items-center">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileUpload(file);
            // Reset so same file can be re-selected
            e.target.value = "";
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          className="shrink-0"
        >
          {uploading ? (
            <><Loader2 className="h-4 w-4 animate-spin ml-1" /> جاري الرفع...</>
          ) : (
            <><Upload className="h-4 w-4 ml-1" /> رفع صورة</>
          )}
        </Button>
        <Input
          placeholder="https://... أو رابط الصورة"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          dir="ltr"
          className="flex-1"
        />
      </div>
    </div>
  );
}

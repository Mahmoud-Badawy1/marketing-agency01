import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, Image as ImageIcon } from "lucide-react";
import { getAdminToken } from "@/lib/admin";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadInputProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export function ImageUploadInput({ value, onChange, label = "الصورة" }: ImageUploadInputProps) {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const token = getAdminToken();
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      onChange(data.path);
      toast({ title: "تم رفع الصورة بنجاح" });
    } catch {
      toast({ title: "خطأ", description: "فشل في رفع الصورة", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2 p-3 bg-muted/20 border border-border/50 rounded-lg">
      <div className="text-sm font-medium flex items-center gap-1.5 text-foreground">
        <ImageIcon className="h-4 w-4 text-muted-foreground" />
        {label}
      </div>
      
      {value ? (
        <div className="relative group rounded-md overflow-hidden border border-border/50">
          <img src={value} alt="Preview" className="w-full h-[24rem] object-contain" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <label className="cursor-pointer">
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => {
                  if (e.target.files?.[0]) handleUpload(e.target.files[0]);
                }}
              />
              <span className="bg-background text-foreground text-sm font-medium px-3 py-1.5 rounded-md hover:bg-accent hover:text-white transition-colors">
                تغيير الصورة
              </span>
            </label>
          </div>
        </div>
      ) : (
        <label className="block w-full cursor-pointer">
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={(e) => {
              if (e.target.files?.[0]) handleUpload(e.target.files[0]);
            }}
          />
          <div className="h-32 w-full border-2 border-dashed border-border/50 rounded-md flex flex-col items-center justify-center text-muted-foreground hover:bg-accent/5 hover:border-accent hover:text-accent transition-colors">
            {uploading ? (
              <Loader2 className="h-6 w-6 animate-spin mb-2" />
            ) : (
              <Upload className="h-6 w-6 mb-2" />
            )}
            <span className="text-sm font-medium">
              {uploading ? "جاري الرفع..." : "اختر صورة لرفعها"}
            </span>
          </div>
        </label>
      )}
    </div>
  );
}

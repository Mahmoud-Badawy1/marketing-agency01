import { Save, X, Upload } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/atoms/Button";
import { Label } from "@/components/atoms/Label";
import { Input } from "@/components/atoms/Input";
import { BilingualInput } from "../settings/BilingualInput";
import { adminFetch } from "@/lib/admin";

export function TestimonialForm({ t, t_data, resetForm }: any) {
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      t_data.toast({
        title: "Error",
        description: "Max 10MB",
        variant: "destructive",
      });
      return;
    }
    t_data.setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => t_data.setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!t_data.formData.name.ar && !t_data.formData.name.en) return;

    let imageUrl = t_data.formData.whatsappImage;
    if (t_data.imageFile) {
      t_data.setUploading(true);
      try {
        const fd = new FormData();
        fd.append("image", t_data.imageFile);
        const res = await adminFetch("/api/admin/upload", {
          method: "POST",
          body: fd,
        });
        if (res.ok) {
          const data = await res.json();
          imageUrl = data.path;
        }
      } catch {
        t_data.toast({ title: "Upload failed", variant: "destructive" });
      }
      t_data.setUploading(false);
    }

    const dataToSave = { ...t_data.formData, whatsappImage: imageUrl };
    if (t_data.editingId)
      t_data.updateMutation.mutate({ id: t_data.editingId, data: dataToSave });
    else t_data.createMutation.mutate(dataToSave);
  };

  return (
    <Card className="p-4 border border-accent/30">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <BilingualInput
            label="الاسم *"
            value={t_data.formData.name}
            onChange={(v: any) =>
              t_data.setFormData((p: any) => ({ ...p, name: v }))
            }
          />
          <BilingualInput
            label="الوصف"
            value={t_data.formData.role}
            onChange={(v: any) =>
              t_data.setFormData((p: any) => ({ ...p, role: v }))
            }
          />
        </div>
        <BilingualInput
          label="نص الرأي"
          value={t_data.formData.defaultText}
          isTextArea
          onChange={(v: any) =>
            t_data.setFormData((p: any) => ({ ...p, defaultText: v }))
          }
        />
        <div>
          <Label>صورة الواتساب</Label>
          <input
            ref={t_data.fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageSelect}
          />
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => t_data.fileInputRef.current?.click()}
              disabled={t_data.uploading}
            >
              <Upload className="h-4 w-4 ml-1" />
              {t_data.imagePreview ? "تغيير" : "اختيار"}
            </Button>
            {t_data.imagePreview && (
              <span className="text-xs text-green-600">✓</span>
            )}
          </div>
          {t_data.imagePreview && (
            <div className="mt-2">
              <img
                src={t_data.imagePreview}
                alt="preview"
                className="object-cover rounded border h-20"
              />
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <Label>الترتيب</Label>
            <Input
              type="number"
              value={t_data.formData.order}
              onChange={(e) =>
                t_data.setFormData((p: any) => ({
                  ...p,
                  order: parseInt(e.target.value) || 0,
                }))
              }
              dir="ltr"
            />
          </div>
          <div className="flex items-center gap-2 mt-6">
            <input
              type="checkbox"
              checked={t_data.formData.isActive}
              onChange={(e) =>
                t_data.setFormData((p: any) => ({
                  ...p,
                  isActive: e.target.checked,
                }))
              }
              id="isActive"
            />
            <Label htmlFor="isActive">مفعّل</Label>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            type="submit"
            size="sm"
            disabled={
              t_data.createMutation.isPending ||
              t_data.updateMutation.isPending ||
              t_data.uploading
            }
          >
            <Save className="h-4 w-4 ml-1" />
            {t_data.editingId ? "تحديث" : "إضافة"}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={resetForm}>
            <X className="h-4 w-4 ml-1" />
            إلغاء
          </Button>
        </div>
      </form>
    </Card>
  );
}

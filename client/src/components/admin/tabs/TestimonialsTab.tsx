import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { adminFetch } from "@/lib/admin";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Edit3, Save, X, Upload } from "lucide-react";
import { BilingualInput } from "../settings/BilingualInput";
import type { TestimonialType } from "@shared/schema";

export function TestimonialsTab() {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ 
    name: { ar: "", en: "" }, 
    role: { ar: "", en: "" }, 
    whatsappImage: "", 
    defaultText: { ar: "", en: "" },
    isActive: true, 
    order: 0 
  });
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: testimonials = [], isLoading } = useQuery<TestimonialType[]>({
    queryKey: ["/api/admin/testimonials"],
    queryFn: async () => {
      const res = await adminFetch("/api/admin/testimonials");
      if (!res.ok) throw new Error("Failed to fetch testimonials");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      try {
        console.log("🔵 Starting create mutation with data:", data);
        const res = await adminFetch("/api/admin/testimonials", {
          method: "POST",
          body: JSON.stringify(data),
        });
        console.log("🔵 Response received, status:", res.status, "ok:", res.ok);
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error("🔴 Create testimonial failed:", res.status, errorText);
          throw new Error(`Failed: ${res.status}`);
        }
        
        const result = await res.json();
        console.log("🟢 Create successful, result:", result);
        return result;
      } catch (error) {
        console.error("🔴 Exception in mutationFn:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("🟢 onSuccess called with:", data);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/testimonials"] });
      toast({ title: "تمت الإضافة بنجاح" });
      resetForm();
    },
    onError: (error) => {
      console.error("🔴 onError called with:", error);
      toast({ title: "خطأ", description: "فشل في الإضافة", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const res = await adminFetch(`/api/admin/testimonials/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Update testimonial failed:", res.status, errorText);
        throw new Error(`Failed: ${res.status}`);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/testimonials"] });
      toast({ title: "تم التحديث بنجاح" });
      resetForm();
    },
    onError: (error) => {
      console.error("Update mutation error:", error);
      toast({ title: "خطأ", description: "فشل في التحديث", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await adminFetch(`/api/admin/testimonials/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/testimonials"] });
      toast({ title: "تم الحذف بنجاح" });
    },
    onError: () => {
      toast({ title: "خطأ", description: "فشل في الحذف", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({ 
      name: { ar: "", en: "" }, 
      role: { ar: "", en: "" }, 
      whatsappImage: "", 
      defaultText: { ar: "", en: "" },
      isActive: true, 
      order: 0 
    });
    setImageFile(null);
    setImagePreview("");
    setEditingId(null);
    setShowForm(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const startEdit = (t: TestimonialType) => {
    setFormData({
      name: typeof t.name === 'string' ? { ar: t.name, en: t.name } : t.name,
      role: typeof t.role === 'string' ? { ar: t.role, en: t.role } : (t.role || { ar: "", en: "" }),
      whatsappImage: t.whatsappImage || "",
      defaultText: typeof t.defaultText === 'string' ? { ar: t.defaultText, en: t.defaultText } : (t.defaultText || { ar: "", en: "" }),
      isActive: t.isActive !== false,
      order: t.order || 0,
    });
    setImageFile(null);
    setImagePreview(t.whatsappImage || "");
    setEditingId(t._id);
    setShowForm(true);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "خطأ", description: "حجم الصورة يجب أن يكون أقل من 10 ميجابايت", variant: "destructive" });
      return;
    }

    // حفظ الملف وعمل preview محلي
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("handleSubmit started");
    
    // التحقق من الاسم والصورة
    if (!formData.name.ar && !formData.name.en) {
      toast({ title: "تنبيه", description: "يرجى إدخال الاسم", variant: "destructive" });
      return;
    }
    
    // إذا كان هناك ملف جديد، رفعه أولاً
    let imageUrl = formData.whatsappImage;
    if (imageFile) {
      console.log("Uploading image...");
      setUploading(true);
      try {
        const uploadFormData = new FormData();
        uploadFormData.append("image", imageFile);
        
        const res = await adminFetch("/api/admin/upload", {
          method: "POST",
          body: uploadFormData,
        });
        
        if (!res.ok) throw new Error("Upload failed");
        const data = await res.json();
        console.log("Upload successful:", data);
        imageUrl = data.path;
      } catch (err) {
        console.error("Upload error:", err);
        toast({ title: "خطأ", description: "فشل في رفع الصورة", variant: "destructive" });
        setUploading(false);
        return;
      }
      setUploading(false);
    }
    
    // التحقق من وجود صورة أو نص
    if (!imageUrl && !formData.defaultText.ar && !formData.defaultText.en) {
      toast({ title: "تنبيه", description: "يرجى رفع صورة الواتساب أو كتابة نص الرأي", variant: "destructive" });
      return;
    }
    
    // حفظ البيانات
    const dataToSave = { ...formData, whatsappImage: imageUrl };
    console.log("Saving testimonial:", dataToSave);
    
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: dataToSave });
    } else {
      createMutation.mutate(dataToSave);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <p className="text-sm text-muted-foreground">إدارة آراء العملاء المعروضة على الموقع</p>
        <Button
          size="sm"
          onClick={() => { resetForm(); setShowForm(true); }}
        >
          <Plus className="h-4 w-4 ml-1" />
          إضافة رأي جديد
        </Button>
      </div>

      {showForm && (
        <Card className="p-4 border border-accent/30">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <BilingualInput 
                label="الاسم *" 
                value={formData.name} 
                onChange={(v: any) => setFormData(p => ({...p, name: v}))} 
              />
              <BilingualInput 
                label="الوصف / الدور" 
                value={formData.role} 
                onChange={(v: any) => setFormData(p => ({...p, role: v}))} 
              />
            </div>

            <BilingualInput 
              label="نص الرأي (في حال عدم وجود صورة)" 
              value={formData.defaultText} 
              isTextArea
              onChange={(v: any) => setFormData(p => ({...p, defaultText: v}))} 
            />
            
            <div>
              <Label>صورة الواتساب *</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="hidden"
                onChange={handleImageSelect}
              />
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Upload className="h-4 w-4 ml-1" />
                  {imagePreview ? "تغيير الصورة" : "اختيار صورة"}
                </Button>
                {imagePreview && (
                  <span className="text-xs text-green-600">✓ تم اختيار الصورة</span>
                )}
              </div>
              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview}
                    alt="preview"
                    className="object-cover rounded border"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1">
                <Label>الترتيب</Label>
                <Input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData((p) => ({ ...p, order: parseInt(e.target.value) || 0 }))}
                  min={0}
                  dir="ltr"
                />
              </div>
              <div className="flex items-center gap-2 mt-6">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData((p) => ({ ...p, isActive: e.target.checked }))}
                  id="isActive"
                  className="rounded"
                />
                <Label htmlFor="isActive" className="cursor-pointer">مفعّل</Label>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={createMutation.isPending || updateMutation.isPending || uploading}>
                <Save className="h-4 w-4 ml-1" />
                {editingId ? "تحديث" : "إضافة"}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={resetForm}>
                <X className="h-4 w-4 ml-1" />
                إلغاء
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-right p-3 font-medium">الاسم</th>
              <th className="text-right p-3 font-medium">الوصف</th>
              <th className="text-right p-3 font-medium">صورة الواتساب</th>
              <th className="text-right p-3 font-medium">الحالة</th>
              <th className="text-right p-3 font-medium">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {testimonials.map((t) => (
              <tr key={t._id} className="border-b">
                <td className="p-3">
                  {typeof (t.name as any) === 'string' ? t.name : ((t.name as any)?.ar || (t.name as any)?.en)}
                </td>
                <td className="p-3 text-muted-foreground">
                  {typeof (t.role as any) === 'string' ? t.role : ((t.role as any)?.ar || (t.role as any)?.en || "-")}
                </td>
                <td className="p-3">
                  {t.whatsappImage ? (
                    <a href={t.whatsappImage} target="_blank" rel="noopener noreferrer" className="block w-fit">
                      <img
                        src={t.whatsappImage}
                        alt="صورة واتساب"
                        className="w-12 h-16 object-cover rounded cursor-pointer border hover:opacity-80 transition-opacity"
                      />
                    </a>
                  ) : t.defaultText ? (
                    <div className="text-[10px] text-muted-foreground max-w-[150px] line-clamp-3 italic bg-muted/30 p-1 rounded border border-dashed">
                      {typeof (t.defaultText as any) === 'string' ? t.defaultText : ((t.defaultText as any)?.ar || (t.defaultText as any)?.en)}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </td>
                <td className="p-3">
                  <Badge className={t.isActive !== false ? "bg-green-500 text-white" : "bg-gray-400 text-white"}>
                    {t.isActive !== false ? "مفعّل" : "معطّل"}
                  </Badge>
                </td>
                <td className="p-3">
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => startEdit(t)}>
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (confirm("هل أنت متأكد من الحذف؟")) {
                          deleteMutation.mutate(t._id);
                        }
                      }}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {testimonials.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">لا توجد آراء بعد</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

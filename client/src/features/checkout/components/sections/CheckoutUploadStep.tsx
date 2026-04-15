import { Card } from "@/components/ui/card";
import UploadSection from "@/features/checkout/components/UploadSection";

export function CheckoutUploadStep({ c }: any) {
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { c.toast({ title: "Error", description: "Max 10MB", variant: "destructive" }); return; }
    c.setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => c.setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleUploadSubmit = async () => {
    if (!c.imageFile || !c.orderId) return;
    c.setUploading(true);
    try {
      const fd = new FormData();
      fd.append("transferImage", c.imageFile);
      const res = await fetch(`/api/orders/${c.orderId}/upload`, { method: "POST", body: fd });
      if (!res.ok) throw new Error();
      c.setStep("success");
    } catch {
      c.toast({ title: "Error", variant: "destructive" });
    } finally { c.setUploading(false); }
  };

  return (
    <Card className="p-6 border border-card-border">
      <UploadSection
        imagePreview={c.imagePreview}
        uploading={c.uploading}
        fileInputRef={c.fileInputRef}
        onFileSelect={handleFileSelect}
        onSubmit={handleUploadSubmit}
        onRemove={() => { c.setImagePreview(null); c.setImageFile(null); if (c.fileInputRef.current) c.fileInputRef.current.value = ""; }}
      />
    </Card>
  );
}

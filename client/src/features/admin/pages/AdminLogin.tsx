import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { setAdminToken } from "@/lib/admin";
import { useToast } from "@/hooks/use-toast";
import { Lock } from "lucide-react";
import { AdminLoginForm } from "@/features/admin/components/AdminLoginForm";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [locked, setLocked] = useState(false);
  const [retryAfter, setRetryAfter] = useState(0);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (locked) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
      const data = await res.json();
      if (res.status === 429) {
        setLocked(true);
        const seconds = data.retryAfter || 900;
        setRetryAfter(seconds);
        toast({ title: "تم قفل الدخول مؤقتاً", description: data.message, variant: "destructive" });
        const interval = setInterval(() => { setRetryAfter((prev) => { if (prev <= 1) { clearInterval(interval); setLocked(false); return 0; } return prev - 1; }); }, 1000);
        return;
      }
      if (res.ok && data.success) { setAdminToken(data.token, data.expiresIn); setLocation("/admin"); }
      else toast({ title: "خطأ", description: data.message || "كلمة المرور غير صحيحة", variant: "destructive" });
    } catch { toast({ title: "خطأ", description: "حدث خطأ في الاتصال", variant: "destructive" }); }
    finally { setLoading(false); setPassword(""); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" dir="rtl">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2"><Lock className="h-8 w-8 text-muted-foreground" /></div>
          <CardTitle data-testid="text-admin-login-title">لوحة التحكم - ماركتير برو</CardTitle>
        </CardHeader>
        <AdminLoginForm password={password} setPassword={setPassword} loading={loading} locked={locked} retryAfter={retryAfter} onSubmit={handleSubmit} />
      </Card>
    </div>
  );
}

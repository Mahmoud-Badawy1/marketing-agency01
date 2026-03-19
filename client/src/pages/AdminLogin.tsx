import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { setAdminToken } from "@/lib/admin";
import { useToast } from "@/hooks/use-toast";
import { Lock, ShieldAlert } from "lucide-react";

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
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (res.status === 429) {
        // Rate limited
        setLocked(true);
        const seconds = data.retryAfter || 900;
        setRetryAfter(seconds);
        toast({
          title: "تم قفل الدخول مؤقتاً",
          description: data.message,
          variant: "destructive",
        });
        // Auto-unlock countdown
        const interval = setInterval(() => {
          setRetryAfter((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              setLocked(false);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        return;
      }

      if (res.ok && data.success) {
        setAdminToken(data.token, data.expiresIn);
        setLocation("/admin");
      } else {
        toast({
          title: "خطأ",
          description: data.message || "كلمة المرور غير صحيحة",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "خطأ",
        description: "حدث خطأ في الاتصال",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setPassword("");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" dir="rtl">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <Lock className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle data-testid="text-admin-login-title">لوحة التحكم - ماركتير برو</CardTitle>
        </CardHeader>
        <CardContent>
          {locked ? (
            <div className="text-center space-y-3 py-4">
              <ShieldAlert className="h-12 w-12 text-destructive mx-auto" />
              <p className="text-destructive font-semibold">تم قفل الدخول مؤقتاً</p>
              <p className="text-muted-foreground text-sm">حاول مجدداً بعد <span className="font-bold text-foreground">{retryAfter}</span> ثانية</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-password">كلمة المرور</Label>
                <Input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور"
                  data-testid="input-admin-password"
                  required
                  autoComplete="current-password"
                  maxLength={128}
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
                data-testid="button-admin-login"
              >
                {loading ? "جاري الدخول..." : "دخول"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

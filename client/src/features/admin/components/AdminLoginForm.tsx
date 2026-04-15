import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";
import { Label } from "@/components/atoms/Label";
import { CardContent } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";

interface AdminLoginFormProps {
  password: string;
  setPassword: (v: string) => void;
  loading: boolean;
  locked: boolean;
  retryAfter: number;
  onSubmit: (e: React.FormEvent) => void;
}

export function AdminLoginForm({ password, setPassword, loading, locked, retryAfter, onSubmit }: AdminLoginFormProps) {
  return (
    <CardContent>
      {locked ? (
        <div className="text-center space-y-3 py-4">
          <ShieldAlert className="h-12 w-12 text-destructive mx-auto" />
          <p className="text-destructive font-semibold">تم قفل الدخول مؤقتاً</p>
          <p className="text-muted-foreground text-sm">حاول مجدداً بعد <span className="font-bold text-foreground">{retryAfter}</span> ثانية</p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-password">كلمة المرور</Label>
            <Input id="admin-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="أدخل كلمة المرور" data-testid="input-admin-password"
              required autoComplete="current-password" maxLength={128}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading} data-testid="button-admin-login">
            {loading ? "جاري الدخول..." : "دخول"}
          </Button>
        </form>
      )}
    </CardContent>
  );
}

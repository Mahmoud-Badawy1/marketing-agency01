import { KeyRound } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Label } from "@/components/atoms/Label";
import { motion } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";

export function SetPasswordForm({ auth }: any) {
  const isReset = auth.step === "reset-password";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (auth.password.length < 6) { auth.toast({ title: "Min 6 chars", variant: "destructive" }); return; }
    auth.setLoading(true);
    try {
      if (isReset) {
        await apiRequest("POST", "/api/auth/reset-password", { email: auth.email, code: auth.code, password: auth.password });
        auth.setIsResetting(false); auth.setPassword(""); auth.setCode(""); auth.setStep("password");
        auth.toast({ title: "Success" });
      } else {
        await apiRequest("POST", "/api/auth/set-password", { password: auth.password });
        auth.toast({ title: "Success" });
        auth.setLocation("/dashboard");
      }
    } catch (err: any) {
      auth.toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally { auth.setLoading(false); }
  };

  return (
    <motion.form initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} onSubmit={handleSubmit} className="space-y-6">
      <div className="p-3 bg-accent/10 rounded-md text-sm text-accent">
        {isReset ? auth.t({ ar: "تعيين كلمة مرور جديدة", en: "Set new password" }) : auth.t({ ar: "إعداد كلمة المرور", en: "Set password" })}
      </div>
      <div>
        <Label>{auth.t({ ar: "كلمة المرور الجديدة", en: "New Password" })}</Label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none border-0"><KeyRound className="h-5 w-5 text-muted-foreground" /></div>
          <Input type="password" required minLength={6} value={auth.password} onChange={(e) => auth.setPassword(e.target.value)} className="pl-10 text-left" dir="ltr" placeholder="••••••••" />
        </div>
      </div>
      <Button type="submit" className="w-full bg-accent text-white" disabled={auth.loading || auth.password.length < 6}>
        {auth.loading ? "..." : auth.t({ ar: "حفظ ومتابعة", en: "Save & Continue" })}
      </Button>
    </motion.form>
  );
}

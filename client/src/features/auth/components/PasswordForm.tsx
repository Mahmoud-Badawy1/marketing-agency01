import { KeyRound } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Label } from "@/components/atoms/Label";
import { motion } from "framer-motion";

export function PasswordForm({ auth }: any) {
  return (
    <motion.form key="password-form" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} onSubmit={auth.handleLogin} className="space-y-6">
      <div>
        <Label htmlFor="password">{auth.t({ ar: "كلمة المرور", en: "Password" })}</Label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none border-0"><KeyRound className="h-5 w-5 text-muted-foreground" /></div>
          <Input id="password" type="password" required value={auth.password} onChange={(e) => auth.setPassword(e.target.value)} className="pl-10 text-left" dir="ltr" placeholder="••••••••" />
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <Button type="submit" className="w-full bg-accent text-white" disabled={auth.loading}>
          {auth.loading ? auth.t({ ar: "جاري الدخول...", en: "Logging in..." }) : auth.t({ ar: "تسجيل الدخول", en: "Login" })}
        </Button>
        <Button type="button" variant="ghost" onClick={() => { auth.setStep("email"); auth.setPassword(""); }} disabled={auth.loading}>{auth.t({ ar: "الرجوع", en: "Back" })}</Button>
        <Button type="button" variant="ghost" className="text-accent text-sm p-0 h-auto" onClick={() => { auth.setIsResetting(true); auth.handleSendOtp(); }} disabled={auth.loading}>
          {auth.t({ ar: "نسيت كلمة المرور؟", en: "Forgot Password?" })}
        </Button>
      </div>
    </motion.form>
  );
}

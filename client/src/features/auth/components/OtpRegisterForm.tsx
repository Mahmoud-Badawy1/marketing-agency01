import { User as UserIcon, Phone, KeyRound } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Label } from "@/components/atoms/Label";
import { motion } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";

export function OtpRegisterForm({ auth }: any) {
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.code) return;
    auth.setLoading(true);
    try {
      const payload: any = { email: auth.email, code: auth.code };
      if (auth.step === "register") {
        if (!auth.name) { auth.toast({ title: "الاسم مطلوب", variant: "destructive" }); auth.setLoading(false); return; }
        payload.name = auth.name; payload.phone = auth.phone;
      }
      const res = await apiRequest("POST", "/api/auth/verify-otp", payload);
      const data = await res.json();
      localStorage.setItem("userToken", data.token);
      if (data.isNew) auth.setStep("set-password");
      else if (auth.isResetting) auth.setStep("reset-password");
      else auth.setLocation("/dashboard");
    } catch (err: any) {
      if (err.message?.includes("الاسم مطلوب")) auth.setStep("register");
      else auth.toast({ title: auth.t({ ar: "خطأ", en: "Error" }), description: err.message, variant: "destructive" });
    } finally { auth.setLoading(false); }
  };

  return (
    <motion.form key="otp-form" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} onSubmit={handleVerifyOtp} className="space-y-6">
      {auth.step === "register" && (
        <div className="space-y-4 mb-4">
          <div className="p-3 bg-accent/10 rounded-md text-xs text-accent">{auth.t({ ar: "يرجى إكمال بياناتك", en: "Complete your details" })}</div>
          <div><Label>{auth.t({ ar: "الاسم", en: "Name" })}</Label><Input value={auth.name} onChange={(e) => auth.setName(e.target.value)} required /></div>
          <div><Label>{auth.t({ ar: "الهاتف", en: "Phone" })}</Label><Input type="tel" value={auth.phone} onChange={(e) => auth.setPhone(e.target.value)} dir="ltr" /></div>
        </div>
      )}
      <div>
        <Label>{auth.t({ ar: "رمز التحقق", en: "OTP" })}</Label>
        <p className="text-xs text-muted-foreground mb-2">{auth.t({ ar: `تم إرساله إلى ${auth.email}`, en: `Sent to ${auth.email}` })}</p>
        <div className="relative"><KeyRound className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" /><Input maxLength={6} value={auth.code} onChange={(e) => auth.setCode(e.target.value.replace(/\D/g, ''))} className="pl-10 text-center tracking-widest text-lg font-bold" dir="ltr" placeholder="123456" /></div>
      </div>
      <div className="flex flex-col gap-3">
        <Button type="submit" className="w-full bg-accent text-white" disabled={auth.loading || auth.code.length !== 6}>
          {auth.loading ? "..." : (auth.step === "register" ? auth.t({ ar: "إنشاء حساب", en: "Create Account" }) : auth.t({ ar: "تأكيد", en: "Verify" }))}
        </Button>
        <Button type="button" variant="ghost" onClick={() => { auth.setStep("email"); auth.setCode(""); }}>{auth.t({ ar: "تغيير البريد", en: "Change Email" })}</Button>
      </div>
    </motion.form>
  );
}

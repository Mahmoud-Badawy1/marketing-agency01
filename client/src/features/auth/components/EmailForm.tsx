import { Mail } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Label } from "@/components/atoms/Label";
import { motion } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";

export function EmailForm({ auth }: any) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.email) return;
    auth.setLoading(true);
    try {
      const res = await apiRequest("POST", "/api/auth/check-email", { email: auth.email });
      const data = await res.json();
      if (data.exists && data.hasPassword) {
        auth.setStep("password");
        auth.setLoading(false);
      } else {
        await auth.handleSendOtp();
      }
    } catch {
      auth.toast({ title: auth.t({ ar: "خطأ", en: "Error" }), variant: "destructive" });
      auth.setLoading(false);
    }
  };

  return (
    <motion.form initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="email">{auth.t({ ar: "البريد الإلكتروني", en: "Email Address" })}</Label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none border-0"><Mail className="h-5 w-5 text-muted-foreground" /></div>
          <Input id="email" type="email" required value={auth.email} onChange={(e) => auth.setEmail(e.target.value)} className="pl-10 text-left" dir="ltr" placeholder="you@example.com" />
        </div>
      </div>
      <Button type="submit" className="w-full bg-accent text-white" disabled={auth.loading}>
        {auth.loading ? auth.t({ ar: "جاري الإرسال...", en: "Sending..." }) : auth.t({ ar: "متابعة", en: "Continue" })}
      </Button>
    </motion.form>
  );
}

import { useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/hooks/use-language";

export type Step = "email" | "password" | "otp" | "register" | "set-password" | "reset-password";

export function useUserAuth() {
  const { t, language } = useLanguage();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [step, setStep] = useState<Step>("email");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  const handleSendOtp = async () => {
    if (!email) return;
    setLoading(true);
    try {
      const res = await apiRequest("POST", "/api/auth/send-otp", { email });
      const data = await res.json();
      toast({ title: t({ ar: "تم بنجاح", en: "Success" }), description: data.message });
      setStep("otp");
    } catch (err: any) {
      toast({ title: t({ ar: "خطأ", en: "Error" }), description: err.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiRequest("POST", "/api/auth/login", { email, password });
      const data = await res.json();
      localStorage.setItem("userToken", data.token);
      toast({ title: t({ ar: "مرحباً", en: "Welcome" }) });
      setLocation("/dashboard");
    } catch (err: any) {
      toast({ title: t({ ar: "خطأ", en: "Error" }), description: err.message, variant: "destructive" });
      setLoading(false);
    }
  };

  return {
    t, language, setLocation, toast,
    step, setStep, loading, setLoading,
    email, setEmail, password, setPassword,
    code, setCode, name, setName, phone, setPhone,
    isResetting, setIsResetting,
    handleSendOtp, handleLogin
  };
}

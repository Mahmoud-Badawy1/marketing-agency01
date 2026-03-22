import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Mail, KeyRound, User, Phone } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { apiRequest } from "@/lib/queryClient";

type Step = "email" | "password" | "otp" | "register" | "set-password" | "reset-password";

export default function UserLogin() {
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

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const res = await apiRequest("POST", "/api/auth/check-email", { email });
      const data = await res.json();
      
      if (data.exists && data.hasPassword) {
        setStep("password");
        setLoading(false);
      } else {
        await handleSendOtp(false); // pass flag indicating we just want to send otp
      }
    } catch (err: any) {
      toast({
        title: t({ ar: "خطأ", en: "Error" }),
        description: t({ ar: "حدث خطأ أثناء التحقق من البريد", en: "Error checking email" }),
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleSendOtp = async (preventEvent: boolean | React.FormEvent = false) => {
    if (preventEvent && typeof preventEvent !== "boolean") {
      preventEvent.preventDefault();
    }
    if (!email) return;

    setLoading(true);
    try {
      const res = await apiRequest("POST", "/api/auth/send-otp", { email });
      const data = await res.json();
      toast({ title: t({ ar: "تم بنجاح", en: "Success" }), description: data.message });
      setStep("otp");
    } catch (err: any) {
      toast({
        title: t({ ar: "خطأ", en: "Error" }),
        description: err.message || t({ ar: "حدث خطأ غير متوقع", en: "An unexpected error occurred" }),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    try {
      const res = await apiRequest("POST", "/api/auth/login", { email, password });
      const data = await res.json();
      
      localStorage.setItem("userToken", data.token);
      toast({ title: t({ ar: "مرحباً", en: "Welcome" }), description: t({ ar: "تم تسجيل الدخول بنجاح", en: "Logged in successfully" }) });
      setLocation("/dashboard");

    } catch (err: any) {
      toast({
        title: t({ ar: "خطأ", en: "Error" }),
        description: err.message || t({ ar: "بيانات الدخول غير صحيحة", en: "Invalid credentials" }),
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: t({ ar: "خطأ", en: "Error" }), description: t({ ar: "يجب أن تكون كلمة المرور 6 أحرف على الأقل", en: "Password must be at least 6 characters" }), variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const res = await apiRequest("POST", "/api/auth/set-password", { password });
      const data = await res.json();
      
      toast({ title: t({ ar: "نجاح", en: "Success" }), description: t({ ar: "تم إعداد كلمة المرور وتسجيل الدخول", en: "Password set and logged in" }) });
      setLocation("/dashboard");
    } catch (err: any) {
      toast({
        title: t({ ar: "خطأ", en: "Error" }),
        description: err.message || t({ ar: "حدث خطأ", en: "Error occurred" }),
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: t({ ar: "خطأ", en: "Error" }), description: t({ ar: "يجب أن تكون كلمة المرور 6 أحرف على الأقل", en: "Password must be at least 6 characters" }), variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      await apiRequest("POST", "/api/auth/reset-password", { email, code, password });
      toast({ 
        title: t({ ar: "نجاح", en: "Success" }), 
        description: t({ ar: "تم تغيير كلمة المرور بنجاح، يمكنك الآن تسجيل الدخول", en: "Password changed successfully, you can now login" }) 
      });
      setIsResetting(false);
      setPassword("");
      setCode("");
      setStep("password");
    } catch (err: any) {
      toast({
        title: t({ ar: "خطأ", en: "Error" }),
        description: err.message || t({ ar: "حدث خطأ", en: "Error occurred" }),
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;

    setLoading(true);
    try {
      const payload: any = { email, code };
      if (step === "register") {
        if (!name) {
          toast({ title: t({ ar: "تنبيه", en: "Notice" }), description: t({ ar: "الاسم مطلوب", en: "Name is required" }), variant: "destructive" });
          setLoading(false);
          return;
        }
        payload.name = name;
        payload.phone = phone;
      }

      const res = await apiRequest("POST", "/api/auth/verify-otp", payload);
      const data = await res.json();
      
      // Save token
      localStorage.setItem("userToken", data.token);
      
      if (data.isNew) {
        setStep("set-password");
      } else if (isResetting) {
        setStep("reset-password");
      } else {
        toast({ title: t({ ar: "مرحباً", en: "Welcome" }), description: t({ ar: "تم تسجيل الدخول بنجاح", en: "Logged in successfully" }) });
        setLocation("/dashboard");
      }

    } catch (err: any) {
      const msg = err.message || "";
      if (msg.includes("الاسم مطلوب")) {
        // User not found, need to register
        setStep("register");
        toast({
          title: t({ ar: "حساب جديد", en: "New Account" }),
          description: t({ ar: "يرجى إكمال بياناتك لتسجيل حساب جديد", en: "Please complete your details to register a new account" }),
        });
      } else {
        toast({
          title: t({ ar: "خطأ", en: "Error" }),
          description: msg || t({ ar: "الكود غير صحيح", en: "Invalid code" }),
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8" dir={language === "ar" ? "rtl" : "ltr"}>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              {language === "en" ? <ArrowLeft className="mr-2 h-4 w-4" /> : <ArrowRight className="ml-2 h-4 w-4" />}
              {t({ ar: "العودة للرئيسية", en: "Back to Home" })}
            </Button>
          </Link>
          <h2 className="text-3xl font-extrabold text-foreground">
            {t({ ar: "بوابة العملاء", en: "Client Portal" })}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t({ ar: "سجل الدخول أو أنشئ حساباً باستخدام بريدك الإلكتروني", en: "Login or create an account using your email" })}
          </p>
        </div>

        <Card className="py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-card-border relative overflow-hidden">
          <AnimatePresence mode="wait">
            {step === "email" && (
              <motion.form key="email-form" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} onSubmit={handleEmailSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="email">{t({ ar: "البريد الإلكتروني", en: "Email Address" })}</Label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 text-left"
                      dir="ltr"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-white" disabled={loading}>
                  {loading ? t({ ar: "جاري الإرسال...", en: "Sending..." }) : t({ ar: "متابعة", en: "Continue" })}
                </Button>
              </motion.form>
            )}

            {(step === "otp" || step === "register") && (
              <motion.form key="otp-form" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} onSubmit={handleVerifyOtp} className="space-y-6">
                
                {step === "register" && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="space-y-4 mb-4">
                    <div className="p-3 bg-accent/10 rounded-md text-sm text-accent-foreground mb-4">
                      {t({ ar: "لم نعثر على حساب بهذا البريد. يرجى إكمال بياناتك لإنشاء حساب جديد.", en: "No account found with this email. Please complete your details to create one." })}
                    </div>
                    <div>
                      <Label htmlFor="name">{t({ ar: "الاسم بالكامل", en: "Full Name" })}</Label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <Input
                          id="name"
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className={language==="ar" ? "pr-10" : "pl-10"}
                          placeholder={t({ ar: "أحمد محمد", en: "Ahmed Mohamed" })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="phone">{t({ ar: "رقم الهاتف", en: "Phone Number" })}</Label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <Input
                          id="phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="pl-10 text-left"
                          dir="ltr"
                          placeholder="01xxxxxxxxx"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                <div>
                  <Label htmlFor="code">{t({ ar: "رمز التحقق (6 أرقام)", en: "Verification Code (6 digits)" })}</Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    {t({ ar: `تم إرسال الرمز إلى ${email}`, en: `Code sent to ${email}` })}
                  </p>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <KeyRound className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <Input
                      id="code"
                      type="text"
                      required
                      maxLength={6}
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                      className="pl-10 text-center tracking-widest text-lg font-bold"
                      dir="ltr"
                      placeholder="123456"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-white" disabled={loading || code.length !== 6}>
                    {loading ? t({ ar: "جاري التحقق...", en: "Verifying..." }) : (step === "register" ? t({ ar: "إنشاء حساب وتسجيل الدخول", en: "Create Account & Login" }) : t({ ar: "تأكيد الدخول", en: "Verify Login" }))}
                  </Button>
                  
                  <Button type="button" variant="ghost" onClick={() => { setStep("email"); setCode(""); }} disabled={loading}>
                    {t({ ar: "تغيير البريد الإلكتروني", en: "Change Email" })}
                  </Button>
                </div>
              </motion.form>
            )}

            {step === "password" && (
              <motion.form key="password-form" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} onSubmit={handleLogin} className="space-y-6">
                <div>
                  <Label htmlFor="password">{t({ ar: "كلمة المرور", en: "Password" })}</Label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <KeyRound className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 text-left"
                      dir="ltr"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-white" disabled={loading}>
                    {loading ? t({ ar: "جاري الدخول...", en: "Logging in..." }) : t({ ar: "تسجيل الدخول", en: "Login" })}
                  </Button>
                  
                  <Button type="button" variant="ghost" onClick={() => { setStep("email"); setPassword(""); }} disabled={loading}>
                    {t({ ar: "الرجوع", en: "Back" })}
                  </Button>

                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="text-accent text-sm p-0 h-auto hover:bg-transparent hover:underline" 
                    onClick={() => {
                      setIsResetting(true);
                      handleSendOtp(true);
                    }}
                    disabled={loading}
                  >
                    {t({ ar: "نسيت كلمة المرور؟", en: "Forgot Password?" })}
                  </Button>
                </div>
              </motion.form>
            )}

            {step === "reset-password" && (
              <motion.form key="reset-password-form" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} onSubmit={handleResetPassword} className="space-y-6">
                <div className="p-3 bg-accent/10 rounded-md text-sm text-accent mb-4">
                  {t({ ar: "يرجى تعيين كلمة مرور جديدة لحسابك.", en: "Please set a new password for your account." })}
                </div>
                <div>
                  <Label htmlFor="reset-new-password">{t({ ar: "كلمة المرور الجديدة", en: "New Password" })}</Label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <KeyRound className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <Input
                      id="reset-new-password"
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 text-left"
                      dir="ltr"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-white" disabled={loading || password.length < 6}>
                  {loading ? t({ ar: "جاري الحفظ...", en: "Saving..." }) : t({ ar: "تغيير كلمة المرور", en: "Change Password" })}
                </Button>
              </motion.form>
            )}

            {step === "set-password" && (
              <motion.form key="set-password-form" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} onSubmit={handleSetPassword} className="space-y-6">
                <div className="p-3 bg-primary/10 rounded-md text-sm text-primary mb-4">
                  {t({ ar: "تم التحقق بنجاح! يرجى إعداد كلمة مرور لتأمين حسابك.", en: "Verified successfully! Please set a password to secure your account." })}
                </div>
                <div>
                  <Label htmlFor="new-password">{t({ ar: "كلمة المرور الجديدة", en: "New Password" })}</Label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <KeyRound className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <Input
                      id="new-password"
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 text-left"
                      dir="ltr"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-white" disabled={loading || password.length < 6}>
                  {loading ? t({ ar: "جاري الحفظ...", en: "Saving..." }) : t({ ar: "حفظ كلمة المرور والدخول", en: "Save & Login" })}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>
        </Card>
      </div>
    </div>
  );
}

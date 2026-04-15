import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/atoms/Button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useUserAuth } from "../hooks/useUserAuth";
import { EmailForm } from "./EmailForm";
import { PasswordForm } from "./PasswordForm";
import { OtpRegisterForm } from "./OtpRegisterForm";
import { SetPasswordForm } from "./SetPasswordForm";

export default function UserLoginPage() {
  const auth = useUserAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 px-4" dir={auth.language === "ar" ? "rtl" : "ltr"}>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              {auth.language === "en" ? <ArrowLeft className="mr-2 h-4 w-4" /> : <ArrowRight className="ml-2 h-4 w-4" />}
              {auth.t({ ar: "العودة للرئيسية", en: "Back to Home" })}
            </Button>
          </Link>
          <h2 className="text-3xl font-extrabold text-foreground">{auth.t({ ar: "بوابة العملاء", en: "Client Portal" })}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{auth.t({ ar: "سجل الدخول أو أنشئ حساباً", en: "Login or create an account" })}</p>
        </div>

        <Card className="py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-card-border relative overflow-hidden">
          <AnimatePresence mode="wait">
            {auth.step === "email" && <EmailForm auth={auth} />}
            {auth.step === "password" && <PasswordForm auth={auth} />}
            {(auth.step === "otp" || auth.step === "register") && <OtpRegisterForm auth={auth} />}
            {(auth.step === "set-password" || auth.step === "reset-password") && <SetPasswordForm auth={auth} />}
          </AnimatePresence>
        </Card>
      </div>
    </div>
  );
}

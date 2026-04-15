import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, ArrowLeft, UserCheck } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Helmet } from "react-helmet-async";

interface JoinTeamSuccessProps {
  t: any;
  language: string;
}

export function JoinTeamSuccess({ t, language }: JoinTeamSuccessProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Helmet>
        <title>{t({ ar: "تم إرسال طلبك | ماركتير برو", en: "Application Submitted | Marketer Pro" })}</title>
      </Helmet>
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center max-w-md mx-auto px-4"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="w-24 h-24 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center"
        >
          <UserCheck className="h-12 w-12 text-emerald-600" />
        </motion.div>
        <h1 className="text-2xl font-bold text-foreground mb-4">
          {t({ ar: "تم إرسال طلبك بنجاح!", en: "Application submitted successfully!" })}
        </h1>
        <p className="text-muted-foreground mb-8">
          {t({ ar: "سنراجع طلبك ونتواصل معك قريباً إن شاء الله", en: "We will review your application and contact you soon." })}
        </p>
        <Link href="/">
          <Button>
            {language === "en" ? <ArrowLeft className="mr-2 h-4 w-4" /> : <ArrowRight className="ml-2 h-4 w-4" />}
            {t({ ar: "العودة للرئيسية", en: "Back to Home" })}
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}

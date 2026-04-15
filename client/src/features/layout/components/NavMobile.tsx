import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/atoms/Button";
import { Globe, User, LogIn, Send } from "lucide-react";
import { NAV_ITEMS } from "@/lib/constants";

export function NavMobile({ t, language, toggleLanguage, isLoggedIn, setLocation, scrollTo, setMobileOpen }: any) {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
      className="md:hidden border-t border-border bg-background/95 backdrop-blur-md overflow-hidden fixed top-16 left-0 right-0 w-full"
    >
      <div className="px-4 py-3 space-y-1">
        {NAV_ITEMS.map((item, i) => (
          <button key={item.href} onClick={() => scrollTo(item.href)} className="block w-full text-right px-3 py-2.5 text-sm font-medium hover:bg-accent/5 rounded-md">
            {t(item.label)}
          </button>
        ))}
        <div className="space-y-2 pt-2">
          <Button variant="outline" onClick={toggleLanguage} className="w-full justify-center"><Globe className="mx-2 h-4 w-4" />{language === "ar" ? "English" : "العربية"}</Button>
          {isLoggedIn ? (
            <Button onClick={() => { setMobileOpen(false); setLocation("/dashboard"); }} variant="outline" className="w-full"><User className="mx-1 h-4 w-4" />{t({ ar: "لوحة التحكم", en: "Dashboard" })}</Button>
          ) : (
            <Link href="/login"><Button onClick={() => setMobileOpen(false)} variant="outline" className="w-full">{t("nav.login")}<LogIn className="mx-1 h-4 w-4" /></Button></Link>
          )}
          <Button onClick={() => scrollTo("#pricing")} className="w-full bg-accent text-accent-foreground">{t("nav.subscribe_now")}<Send className="mr-2 h-4 w-4 rtl:rotate-180 rotate-0" /></Button>
        </div>
      </div>
    </motion.div>
  );
}

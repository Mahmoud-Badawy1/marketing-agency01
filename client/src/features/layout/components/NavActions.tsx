import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/atoms/Button";
import { Globe, User, LogIn, LogOut, Send } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function NavActions({ t, language, toggleLanguage, isLoggedIn, handleLogout, setLocation, scrollTo }: any) {
  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="icon" onClick={toggleLanguage} className="rounded-full shrink-0" title="تغيير اللغة">
        <Globe className="h-4 w-4" />
      </Button>
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }} className="hidden sm:block">
        {isLoggedIn ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="outline" size="icon" className="rounded-full"><User className="h-5 w-5" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align={language === "ar" ? "start" : "end"} className="w-56">
              <DropdownMenuLabel>{t({ ar: "حسابي", en: "My Account" })}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setLocation("/dashboard")}><User className="ml-2 h-4 w-4" /><span>{t({ ar: "الملف الشخصي", en: "Profile" })}</span></DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive"><LogOut className="ml-2 h-4 w-4" /><span>{t({ ar: "تسجيل الخروج", en: "Logout" })}</span></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link href="/login"><Button variant="outline" size="sm">{t("nav.login")}<LogIn className="mx-1 h-4 w-4" /></Button></Link>
        )}
      </motion.div>
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.7 }}>
        <Button onClick={() => scrollTo("#pricing")} className="hidden sm:inline-flex bg-accent text-accent-foreground">{t("nav.subscribe_now")}<Send className="mr-2 h-4 w-4 rtl:rotate-180 rotate-0" /></Button>
      </motion.div>
    </div>
  );
}

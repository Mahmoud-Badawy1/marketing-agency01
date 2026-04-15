import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Button } from "@/components/atoms/Button";
import { Menu, X } from "lucide-react";
import { usePublicSettings } from "@/hooks/use-public-settings";
import { useLanguage } from "@/hooks/use-language";
import { fallbackImages } from "@/lib/fallbackImages";
import { NavLogo } from "../../features/layout/components/NavLogo";
import { NavDesktop } from "../../features/layout/components/NavDesktop";
import { NavActions } from "../../features/layout/components/NavActions";
import { NavMobile } from "../../features/layout/components/NavMobile";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const { data: settings } = usePublicSettings();
  const { language, setLanguage, t } = useLanguage();
  const mascotSrc = settings?.images?.mascot || fallbackImages.mascot;
  const isLoggedIn = !!localStorage.getItem("userToken");

  const scrollTo = (href: string) => {
    setMobileOpen(false);
    if (location !== "/") { setLocation("/"); setTimeout(() => document.querySelector(href)?.scrollIntoView({ behavior: "smooth" }), 300); }
    else setTimeout(() => document.querySelector(href)?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  return (
    <motion.nav initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b w-full">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <NavLogo mascotSrc={mascotSrc} onLogoClick={() => location !== "/" ? setLocation("/") : scrollTo("#hero")} />
        <NavDesktop t={t} scrollTo={scrollTo} />
        <div className="flex items-center gap-2">
          <NavActions t={t} language={language} toggleLanguage={() => setLanguage(language === "ar" ? "en" : "ar")} isLoggedIn={isLoggedIn} handleLogout={() => { localStorage.removeItem("userToken"); setLocation("/"); }} setLocation={setLocation} scrollTo={scrollTo} />
          <Button size="icon" variant="ghost" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? <X /> : <Menu />}</Button>
        </div>
      </div>
      <AnimatePresence>
        {mobileOpen && (
          <NavMobile t={t} language={language} toggleLanguage={() => setLanguage(language === "ar" ? "en" : "ar")} isLoggedIn={isLoggedIn} setLocation={setLocation} scrollTo={scrollTo} setMobileOpen={setMobileOpen} />
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

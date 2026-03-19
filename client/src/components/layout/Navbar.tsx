import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Link } from "wouter";
import { NAV_ITEMS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Menu, X, Send, Users, Globe } from "lucide-react";
import { usePublicSettings } from "@/hooks/use-public-settings";
import { useLanguage } from "@/hooks/use-language";
import { fallbackImages } from "@/lib/fallbackImages";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const { data: settings } = usePublicSettings();
  const { language, setLanguage, t } = useLanguage();
  const mascotSrc = settings?.images?.mascot || fallbackImages.mascot;

  const toggleLanguage = () => {
    setLanguage(language === "ar" ? "en" : "ar");
  };

  const scrollTo = (href: string) => {
    setMobileOpen(false);
    
    // If not on home page, navigate to home first
    if (location !== "/") {
      setLocation("/");
      setTimeout(() => {
        const el = document.querySelector(href);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 300);
    } else {
      setTimeout(() => {
        const el = document.querySelector(href);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  const goToCheckout = (plan: string) => {
    setMobileOpen(false);
    setLocation(`/checkout/${plan}`);
  };

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50 w-full"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          <motion.button
            onClick={() => {
              if (location !== "/") {
                setLocation("/");
              } else {
                scrollTo("#hero");
              }
            }}
            className="flex items-center gap-2 flex-shrink-0 cursor-pointer"
            data-testid="link-home"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <img src={mascotSrc} alt="ماركتير برو" className="h-10 w-10 rounded-full object-cover" />
            <span className="font-extrabold text-lg sm:text-xl tracking-wide flex items-center gap-1.5">
              ماركتير برو <span className="text-accent">|</span> <span className="font-sans text-sm">Marketer Pro</span>
            </span>
          </motion.button>

          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item, i) => (
              <motion.button
                key={item.href}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                onClick={() => scrollTo(item.href)}
                className="pr-3 py-2 text-sm font-medium text-muted-foreground transition-colors rounded-md hover-elevate"
                data-testid={`link-nav-${item.href.slice(1)}`}
              >
                {t(item.label)}
              </motion.button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleLanguage} className="rounded-full shrink-0" title="تغيير اللغة / Change Language">
              <Globe className="h-4 w-4" />
            </Button>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="hidden sm:block"
            >
              <Link href="/join-us">
                <Button variant="outline" size="sm">
                  <Users className="mx-1 h-4 w-4" />
                  {t("nav.join_as_instructor")}
                </Button>
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 }}
            >
              <Button
                onClick={() => scrollTo("#pricing")}
                className="hidden sm:inline-flex bg-accent text-accent-foreground border-accent-border"
                data-testid="button-cta-nav"
              >
                {t("nav.subscribe_now")}
                <Send className="mr-2 h-4 w-4 rtl:rotate-180 rotate-0" />
              </Button>
            </motion.div>
            <Button
              size="icon"
              variant="ghost"
              className="md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden border-t border-border bg-background/95 backdrop-blur-md overflow-hidden fixed top-16 left-0 right-0 w-full"
          >
            <div className="px-4 py-3 space-y-1">
              {NAV_ITEMS.map((item, i) => (
                <motion.button
                  key={item.href}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => scrollTo(item.href)}
                  className="block w-full text-right px-3 py-2.5 text-sm font-medium text-foreground rounded-md hover-elevate"
                  data-testid={`link-mobile-nav-${item.href.slice(1)}`}
                >
                  {t(item.label)}
                </motion.button>
              ))}
              <div className="space-y-2 pt-2">
                <Button variant="outline" onClick={toggleLanguage} className="w-full justify-center">
                  <Globe className="mx-2 h-4 w-4" />
                  {language === "ar" ? "English" : "العربية"}
                </Button>
                <Link href="/join-us">
                  <Button
                  onClick={() => setMobileOpen(false)}
                  variant="outline"
                  className="w-full"
                >
                  <Users className="mx-1 h-4 w-4" />
                  {t("nav.join_as_instructor")}
                </Button>
              </Link>
              <Button
                onClick={() => scrollTo("#pricing")}
                className="w-full bg-accent text-accent-foreground border-accent-border"
                data-testid="button-cta-mobile"
              >
                {t("nav.subscribe_now")}
                <Send className="mr-2 h-4 w-4 rtl:rotate-180 rotate-0" />
              </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

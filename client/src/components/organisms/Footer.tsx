import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { usePublicSettings } from "@/hooks/use-public-settings";
import { useLanguage } from "@/hooks/use-language";
import { fallbackImages } from "@/lib/fallbackImages";
import { FooterSocial } from "../../features/layout/components/FooterSocial";
import { FooterLinks } from "../../features/layout/components/FooterLinks";
import { FooterContact } from "../../features/layout/components/FooterContact";

export default function Footer() {
  const [location, setLocation] = useLocation();
  const { t } = useLanguage();
  const { data: settings } = usePublicSettings();
  const mascotSrc = settings?.images?.mascot || fallbackImages.mascot;
  const whatsappNumber = settings?.contact?.whatsapp || "201553145631";

  const handleClick = (href: string, type: "scroll" | "page") => {
    if (type === "page") { setLocation(href); window.scrollTo(0, 0); }
    else {
      if (location !== "/") { setLocation("/"); setTimeout(() => document.querySelector(href)?.scrollIntoView({ behavior: "smooth" }), 300); }
      else document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const navLinks = [
    { label: "nav.home", href: "#hero", type: "scroll" }, { label: "nav.programs", href: "#programs", type: "scroll" },
    { label: "nav.pricing", href: "#pricing", type: "scroll" }, { label: "nav.instructor", href: "#instructor", type: "scroll" },
    { label: "nav.join_as_instructor", href: "/join-us", type: "page" }
  ];
  const supportLinks = [
    { label: "footer.contact_us", href: "#contact", type: "scroll" }, { label: "footer.faqs", href: "/faq", type: "page" },
    { label: "footer.privacy_policy", href: "/privacy", type: "page" }, { label: "footer.terms_conditions", href: "/terms", type: "page" }
  ];

  return (
    <footer className="bg-primary text-primary-foreground py-16">
      <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-10">
        <div className="space-y-4">
          <div className="flex items-center gap-2"><img src={mascotSrc} alt="Logo" className="h-10 w-10 rounded-full bg-white" /><div className="font-extrabold text-xl">ماركتير برو</div></div>
          <p className="text-primary-foreground/70 text-sm">{t("footer.tagline")}</p>
          <FooterSocial socialLinks={settings?.social || {}} />
        </div>
        <FooterLinks title={t("footer.platform")} links={navLinks} t={t} onClick={handleClick} />
        <FooterLinks title={t("footer.support")} links={supportLinks} t={t} onClick={handleClick} />
        <FooterContact t={t} whatsappNumber={whatsappNumber} />
      </div>
      <div className="max-w-7xl mx-auto px-4 mt-10 pt-6 border-t border-white/10 flex justify-between text-xs text-primary-foreground/50">
        <p>&copy; {new Date().getFullYear()} {t("footer.all_rights_reserved")}</p>
        <p>{t("footer.tagline")}</p>
      </div>
    </footer>
  );
}

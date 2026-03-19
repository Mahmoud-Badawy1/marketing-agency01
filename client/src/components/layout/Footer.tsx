import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { SiWhatsapp, SiFacebook, SiInstagram, SiYoutube, SiTiktok } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { fadeInUp, fadeInRight, staggerContainer, viewportConfig } from "@/lib/animations";
import { usePublicSettings } from "@/hooks/use-public-settings";
import { useLanguage } from "@/hooks/use-language";
import { fallbackImages } from "@/lib/fallbackImages";

export default function Footer() {
  const [location, setLocation] = useLocation();
  const { t } = useLanguage();
  const { data: settings } = usePublicSettings();
  const mascotSrc = settings?.images?.mascot || fallbackImages.mascot;
  const socialLinks = settings?.social || {};
  const whatsappNumber = settings?.contact?.whatsapp || "201007673634";

  const footerLinks = {
    platform: [
      { label: "nav.home", href: "#hero", type: "scroll" as const },
      { label: "nav.programs", href: "#programs", type: "scroll" as const },
      { label: "nav.pricing", href: "#pricing", type: "scroll" as const },
      { label: "nav.instructor", href: "#instructor", type: "scroll" as const },
      { label: "nav.join_as_instructor", href: "/join-us", type: "page" as const },
    ],
    support: [
      { label: "footer.contact_us", href: "#contact", type: "scroll" as const },
      { label: "footer.faqs", href: "/faq", type: "page" as const },
      { label: "footer.privacy_policy", href: "/privacy", type: "page" as const },
      { label: "footer.terms_conditions", href: "/terms", type: "page" as const },
    ],
  };

  const handleClick = (href: string, type: "scroll" | "page") => {
    if (type === "page") {
      setLocation(href);
      window.scrollTo(0, 0);
    } else {
      if (location !== "/") {
        setLocation("/");
        setTimeout(() => {
          const el = document.querySelector(href);
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }, 300);
      } else {
        const el = document.querySelector(href);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <footer className="bg-primary dark:bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          className="grid md:grid-cols-4 gap-10"
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp} className="md:col-span-1 space-y-4">
            <motion.div
              className="flex items-center gap-2"
              whileHover={{ scale: 1.03 }}
            >
              <img src={mascotSrc} alt="ماركتير برو" className="h-10 w-10 rounded-full object-cover bg-white" />
              <div className="font-extrabold text-xl sm:text-2xl tracking-wide flex items-center gap-2">
                ماركتير برو <span className="text-accent">|</span> <span className="text-sm">Marketer Pro</span>
              </div>
            </motion.div>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              {t("footer.tagline")}
            </p>
            <div className="flex gap-2">
              {[
                { icon: SiFacebook, href: socialLinks.facebook, label: "فيسبوك" },
                { icon: SiInstagram, href: socialLinks.instagram, label: "انستجرام" },
                { icon: SiYoutube, href: socialLinks.youtube, label: "يوتيوب" },
                { icon: SiTiktok, href: socialLinks.tiktok, label: "تيك توك" },
              ].filter((s) => s.href && s.href.trim() !== "").map((social, i) => (
                <motion.div
                  key={social.label}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={viewportConfig}
                  transition={{ delay: 0.3 + i * 0.1, type: "spring" }}
                >
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-primary-foreground/70"
                    onClick={() => window.open(social.href, "_blank")}
                    data-testid={`button-social-${social.label}`}
                  >
                    <social.icon className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={fadeInUp} custom={1}>
            <h4 className="font-bold mb-4 text-sm">{t("footer.platform")}</h4>
            <ul className="space-y-2">
              {footerLinks.platform.map((link, i) => (
                <motion.li
                  key={link.label}
                  initial={{ opacity: 0, x: 15 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={viewportConfig}
                  transition={{ delay: 0.3 + i * 0.08 }}
                >
                  <button
                    onClick={() => handleClick(link.href, link.type)}
                    className="text-primary-foreground/70 text-sm transition-colors"
                    data-testid={`link-footer-${link.label}`}
                  >
                    {t(link.label)}
                  </button>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={fadeInUp} custom={2}>
            <h4 className="font-bold mb-4 text-sm">{t("footer.support")}</h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link, i) => (
                <motion.li
                  key={link.label}
                  initial={{ opacity: 0, x: 15 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={viewportConfig}
                  transition={{ delay: 0.4 + i * 0.08 }}
                >
                  <button
                    onClick={() => handleClick(link.href, link.type)}
                    className="text-primary-foreground/70 text-sm transition-colors"
                    data-testid={`link-footer-${link.label}`}
                  >
                    {t(link.label)}
                  </button>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={fadeInUp} custom={3}>
            <h4 className="font-bold mb-4 text-sm">{t("footer.contact_us")}</h4>
            <Button
              variant="outline"
              className="w-full bg-emerald-600/20 border-emerald-600/30 text-white mb-3"
              onClick={() => window.open(`https://wa.me/${whatsappNumber}`, "_blank")}
              data-testid="button-footer-whatsapp"
            >
              <SiWhatsapp className="mx-2 h-4 w-4" />
              {t("footer.whatsapp")}
            </Button>
            <p className="text-primary-foreground/60 text-xs text-center">
              {t("footer.hours")}
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          className="border-t border-primary-foreground/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={viewportConfig}
          transition={{ delay: 0.5 }}
        >
          <p className="text-primary-foreground/50 text-xs" data-testid="text-copyright">
            &copy; {new Date().getFullYear()} {t("footer.all_rights_reserved")}
          </p>
          <p className="text-sm text-muted-foreground/60 flex items-center justify-center gap-1.5 mt-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent/50" />
            {t("footer.tagline")}
            <span className="w-1.5 h-1.5 rounded-full bg-accent/50" />
          </p>
        </motion.div>
      </div>
    </footer>
  );
}

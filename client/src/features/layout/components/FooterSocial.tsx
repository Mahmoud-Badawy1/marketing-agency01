import { motion } from "framer-motion";
import { SiFacebook, SiInstagram, SiYoutube, SiTiktok } from "react-icons/si";
import { Button } from "@/components/atoms/Button";

export function FooterSocial({ socialLinks }: { socialLinks: any }) {
  const platforms = [
    { icon: SiFacebook, href: socialLinks.facebook, label: "Facebook" },
    { icon: SiInstagram, href: socialLinks.instagram, label: "Instagram" },
    { icon: SiYoutube, href: socialLinks.youtube, label: "Youtube" },
    { icon: SiTiktok, href: socialLinks.tiktok, label: "Tiktok" },
  ].filter(s => s.href?.trim());

  return (
    <div className="flex gap-2">
      {platforms.map((s, i) => (
        <motion.div key={s.label} initial={{ opacity: 0, scale: 0 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 + i * 0.1 }}>
          <Button size="icon" variant="ghost" className="text-primary-foreground/70" onClick={() => window.open(s.href, "_blank")}>
            <s.icon className="h-4 w-4" />
          </Button>
        </motion.div>
      ))}
    </div>
  );
}

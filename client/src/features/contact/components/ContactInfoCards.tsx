import { motion } from "framer-motion";
import { SiWhatsapp } from "react-icons/si";
import { Phone, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/atoms/Button";
import { fadeInLeft } from "@/lib/animations";

interface ContactInfoCardsProps {
  t: any;
}

export function ContactInfoCards({ t }: ContactInfoCardsProps) {
  return (
    <div className="lg:col-span-2 space-y-4">
      <motion.div variants={fadeInLeft} custom={0}>
        <Card className="p-6 border border-card-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-md bg-emerald-500/10 flex items-center justify-center animate-pulse">
              <SiWhatsapp className="h-6 w-6 text-emerald-500" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">{t({ ar: "تواصل عبر واتساب", en: "Contact via WhatsApp" })}</h3>
              <p className="text-sm text-muted-foreground">{t({ ar: "رد فوري على استفساراتك", en: "Instant reply" })}</p>
            </div>
          </div>
          <Button variant="outline" className="w-full" onClick={() => window.open("https://wa.me/201553145631", "_blank")}>
            <SiWhatsapp className="mx-2 h-4 w-4 text-emerald-500" />
            {t({ ar: "ابدأ محادثة", en: "Start a Conversation" })}
          </Button>
        </Card>
      </motion.div>

      <motion.div variants={fadeInLeft} custom={1}>
        <Card className="p-6 border border-card-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-md bg-accent/10 flex items-center justify-center">
              <Phone className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">{t({ ar: "اتصل بنا", en: "Call Us" })}</h3>
              <p className="text-sm text-muted-foreground">{t({ ar: "متاحون من 10 ص - 10 م", en: "Available 10 AM - 10 PM" })}</p>
            </div>
          </div>
          <p className="text-lg font-bold text-foreground text-center" dir="ltr">+201553145631</p>
        </Card>
      </motion.div>

      <motion.div variants={fadeInLeft} custom={2}>
        <Card className="p-6 border border-accent/20 bg-accent/5">
          <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-accent animate-spin-4" />
            {t({ ar: "نتائج مبنية على الأرقام", en: "Data-Driven Results" })}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t({ ar: "نضمن لك شفافية تامة في إدارة ميزانيتك الإعلانية وتحقيق أفضل عائد على الاستثمار.", en: "We guarantee full transparency in managing your ad budget." })}
          </p>
        </Card>
      </motion.div>
    </div>
  );
}

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { useLanguage } from "@/hooks/use-language";

interface FAQAccordionProps {
  faqs: { q: string; a: string }[];
}

export function FAQAccordion({ faqs }: FAQAccordionProps) {
  const { language } = useLanguage();
  return (
    <motion.div className="space-y-4" initial="hidden" animate="visible" variants={staggerContainer} dir={language === "ar" ? "rtl" : "ltr"}>
      {faqs.map((faq, i) => (
        <motion.div key={i} variants={fadeInUp} custom={i}>
          <Card className={`p-6 border border-card-border text-${language === "ar" ? "right" : "left"}`} data-testid={`card-faq-${i}`}>
            <h3 className="text-lg font-bold text-foreground mb-2">{faq.q}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{faq.a}</p>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}

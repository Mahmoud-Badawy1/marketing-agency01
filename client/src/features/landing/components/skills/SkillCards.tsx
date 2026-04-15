import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/atoms/Button";
import { ArrowLeft } from "lucide-react";
import { fadeInRight, fadeInLeft, staggerContainer, viewportConfig } from "@/lib/animations";
import { useLanguage } from "@/hooks/use-language";
import { usePublicSettings } from "@/hooks/use-public-settings";
import { fallbackImages } from "@/lib/fallbackImages";

export function SkillCards() {
  const { data: settings } = usePublicSettings();
  const { t } = useLanguage();
  const skillsImg1 = settings?.images?.gallery4 || fallbackImages.gallery4;
  const skillsImg2 = settings?.images?.gallery3 || fallbackImages.gallery3;

  const defaultSkillCards = [
    { title: "skills_section.card1_title", description: "skills_section.card1_desc", buttonText: "skills_section.card1_cta", buttonLink: "#contact", imageKey: "gallery3", image: "" },
    { title: "skills_section.card2_title", description: "skills_section.card2_desc", buttonText: "skills_section.card2_cta", buttonLink: "#programs", imageKey: "gallery4", image: "" },
  ];
  const skillsCards = settings?.skills_cards || defaultSkillCards;

  return (
    <motion.div className="grid md:grid-cols-2 gap-6 mt-12" initial="hidden" whileInView="visible" viewport={viewportConfig} variants={staggerContainer}>
      {skillsCards.map((card: any, idx: number) => {
        const cardImage = card.image || (card.imageKey === "gallery3" ? skillsImg2 : skillsImg1);
        const variants = idx % 2 === 0 ? fadeInRight : fadeInLeft;
        return (
          <motion.div key={idx} variants={variants}>
            <Card className="relative overflow-hidden border-0 min-h-[280px]" data-testid={`card-skill-${idx}`}>
              <img src={cardImage} alt={t(card.title)} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="relative h-full flex flex-col justify-end p-6 text-white md:top-[120px] top-[90px]">
                <h3 className="text-2xl font-extrabold mb-2">{t(card.title)}</h3>
                <p className="text-white/80 text-sm mb-4">{t(card.description)}</p>
                <Button variant="outline" className="w-fit bg-white/10 backdrop-blur-sm border-white/30 text-white"
                  onClick={() => document.querySelector(card.buttonLink)?.scrollIntoView({ behavior: "smooth" })}
                  data-testid={`button-skill-${idx}`}>
                  {t(card.buttonText)}<ArrowLeft className="mx-2 h-4 w-4 rtl:rotate-0 rotate-180" />
                </Button>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

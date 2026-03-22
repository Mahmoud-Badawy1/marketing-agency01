import { motion } from "framer-motion";
import { SERVICES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, BookOpen, Search, BarChart3, PenTool, Palette, Star, Globe, Users, Megaphone, Layout, Settings, Briefcase } from "lucide-react";
import {
  fadeInUp,
  fadeInRight,
  fadeInLeft,
  scaleIn,
  staggerContainer,
  viewportConfig,
} from "@/lib/animations";
import { usePublicSettings } from "@/hooks/use-public-settings";
import { useLanguage } from "@/hooks/use-language";
import { fallbackImages } from "@/lib/fallbackImages";

export default function SkillsSection() {
  const { data: settings } = usePublicSettings();
  const { t } = useLanguage();
  const skillsImg1 = settings?.images?.gallery4 || fallbackImages.gallery4;
  const skillsImg2 = settings?.images?.gallery3 || fallbackImages.gallery3;

  // Skills cards with dynamic or default data
  const defaultSkillCards = [
    {
      title: "skills_section.card1_title",
      description: "skills_section.card1_desc",
      buttonText: "skills_section.card1_cta",
      buttonLink: "#contact",
      imageKey: "gallery3",
      image: "",
    },
    {
      title: "skills_section.card2_title",
      description: "skills_section.card2_desc",
      buttonText: "skills_section.card2_cta",
      buttonLink: "#programs",
      imageKey: "gallery4",
      image: "",
    },
  ];

  const skillsCards = settings?.skills_cards || defaultSkillCards;
  const servicesData = settings?.services || settings?.subjects || SERVICES;

  // Icon mapping for dynamic icons
  const iconMap: Record<string, any> = {
    Search, BarChart3, PenTool, Palette, Star, Globe, Users, Megaphone, Layout, Settings, BookOpen, Briefcase
  };
  return (
    <section className="py-20 bg-card dark:bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* <div className="grid lg:grid-cols-2 gap-12 items-start mb-20">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
            variants={staggerContainer}
          >
            <motion.h2
              variants={fadeInRight}
              className="text-3xl sm:text-4xl font-extrabold text-foreground mb-4"
              data-testid="text-skills-title"
            >
              أطفال أذكياء وأقوياء
              <br />
              جاهزون للتحليق!
            </motion.h2>
            <motion.p variants={fadeInRight} custom={1} className="text-muted-foreground text-lg mb-6">
              تعلّم بذكاء معنا. نعلم "درساً ذكياً واحداً" في كل مرة
            </motion.p>
            <motion.div variants={fadeInRight} custom={2}>
              <Button
                variant="outline"
                onClick={() => document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" })}
                data-testid="button-enroll-skills"
              >
                سجّل الآن
                <ArrowLeft className="mr-2 h-4 w-4" />
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 gap-3"
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
            variants={staggerContainer}
          >
            <motion.div
              variants={scaleIn}
              custom={0}
              className={`${SKILLS_GRID[0].color} rounded-md p-6 text-white flex items-end min-h-[160px] hover:scale-[1.03] transition-transform duration-300`}
            >
              <p className="font-bold text-lg leading-tight">{SKILLS_GRID[0].title.ar}</p>
            </motion.div>
            <motion.div
              variants={scaleIn}
              custom={1}
              className="row-span-2 rounded-md overflow-hidden relative hover:scale-[1.02] transition-transform duration-300"
            >
              <img src={skillsImg1} alt="فعالية عبقري" className="w-full h-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <p className="absolute bottom-4 right-4 text-white font-bold text-sm">{SKILLS_GRID[2].title.ar}</p>
            </motion.div>
            <motion.div
              variants={scaleIn}
              custom={2}
              className={`${SKILLS_GRID[1].color} rounded-md p-6 text-white flex items-end min-h-[160px] hover:scale-[1.03] transition-transform duration-300`}
            >
              <p className="font-bold text-lg leading-tight">{SKILLS_GRID[1].title.ar}</p>
            </motion.div>
          </motion.div>
        </div> */}

        <motion.div
          className="text-center mb-10"
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          variants={staggerContainer}
        >
          <motion.p
            variants={fadeInUp}
            className="text-accent font-semibold text-sm mb-2"
          >
            {t("skills_section.focus")}
          </motion.p>
          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl font-extrabold text-foreground"
            data-testid="text-future-title"
          >
            {t("skills_section.impact")}
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-accent to-blue-600">
              {t("skills_section.digital")}
            </span>{" "}
            {t("skills_section.marketing")}
          </motion.h2>
        </motion.div>

        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          variants={staggerContainer}
        >
          {servicesData.map((service: any, i: number) => {
            const IconComponent = iconMap[service.icon] || Briefcase;
            return (
              <motion.div key={i} variants={fadeInUp} custom={i}>
                <Card
                  className="p-5 text-center hover-elevate border border-card-border"
                  data-testid={`card-service-${i}`}
                >
                  <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center hover:rotate-[15deg] transition-transform duration-300">
                    <IconComponent className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="font-bold text-foreground text-sm mb-1">
                    {t(service.title)}
                  </h3>
                  {service.grade && (
                    <p className="text-xs text-muted-foreground">
                      {t(service.grade)}
                    </p>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          className="grid md:grid-cols-2 gap-6 mt-12"
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          variants={staggerContainer}
        >
          {skillsCards.map((card, idx) => {
            const cardImage = card.image || (card.imageKey === "gallery3" ? skillsImg2 : skillsImg1);
            const isLeft = idx % 2 === 0;
            const MotionComponent = isLeft ? fadeInRight : fadeInLeft;
            
            return (
              <motion.div key={idx} variants={MotionComponent}>
                <Card
                  className="relative overflow-hidden border-0 min-h-[280px]"
                  data-testid={`card-skill-${idx}`}
                >
                  <img
                    src={cardImage}
                    alt={t(card.title)}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="relative h-full flex flex-col justify-end p-6 text-white md:top-[120px] top-[90px]">
                    <h3 className="text-2xl font-extrabold mb-2">
                      {t(card.title)}
                    </h3>
                    <p className="text-white/80 text-sm mb-4">
                      {t(card.description)}
                    </p>
                    <Button
                      variant="outline"
                      className="w-fit bg-white/10 backdrop-blur-sm border-white/30 text-white"
                      onClick={() =>
                        document
                          .querySelector(card.buttonLink)
                          ?.scrollIntoView({ behavior: "smooth" })
                      }
                      data-testid={`button-skill-${idx}`}
                    >
                      {t(card.buttonText)}
                      <ArrowLeft className="mx-2 h-4 w-4 rtl:rotate-0 rotate-180" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

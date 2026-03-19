import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Users, BookOpen, Heart, CheckCircle, Mail, Globe, Quote } from "lucide-react";
import { fadeInUp, fadeInRight, fadeInLeft, scaleIn, staggerContainer, viewportConfig } from "@/lib/animations";
import { usePublicSettings } from "@/hooks/use-public-settings";
import { useLanguage } from "@/hooks/use-language";
import instructorFallback from "@assets/instructor.png";

export default function InstructorSection() {
  const { data: settings } = usePublicSettings();
  const { t } = useLanguage();
  const dynamicInstructor = settings?.instructor;
  const instructorSrc = dynamicInstructor?.image || settings?.images?.instructor || instructorFallback;

  const instructorName = dynamicInstructor?.name || "instructor.default_name";
  const instructorTitle = dynamicInstructor?.title || "instructor.default_title";
  const instructorBio = dynamicInstructor?.bio || "instructor.default_bio";
  const instructorQuote = dynamicInstructor?.quote || "instructor.default_quote";
  const instructorBadge = dynamicInstructor?.badge || "instructor.default_badge";
  
  const defaultAchievements = [
    { icon: Users, label: "instructor.achievements.clients", color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
    { icon: Award, label: "instructor.achievements.budgets", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
    { icon: BookOpen, label: "instructor.achievements.strategies", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
    { icon: Heart, label: "instructor.achievements.rating", color: "text-red-500 bg-red-500/10 border-red-500/20" },
  ];

  const achievementIcons = [Users, Award, BookOpen, Heart];
  const achievements = dynamicInstructor?.achievements && dynamicInstructor.achievements.length > 0
    ? dynamicInstructor.achievements.map((a, i) => ({
        icon: achievementIcons[i % achievementIcons.length] || CheckCircle,
        label: a.label,
        color: a.color || defaultAchievements[i % defaultAchievements.length]?.color || "text-blue-500 bg-blue-500/10 border-blue-500/20",
      }))
    : defaultAchievements;

  return (
    <section id="instructor" className="py-24 bg-muted/30 relative overflow-hidden">
      {/* Premium Dark Gradient Backdrop */}
      <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-transparent via-background to-card/50 pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 -translate-x-1/2 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-6 border border-primary/20 backdrop-blur-sm">
            <Award className="w-4 h-4" />
            {t("instructor.expertise")}
          </motion.div>
          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground"
            data-testid="text-instructor-title"
          >
            {t("instructor.work_with")}
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-primary to-blue-400">
              {t("instructor.top_experts")}
            </span>
          </motion.h2>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Text Content */}
          <motion.div
            className="lg:col-span-7 space-y-8 order-2 lg:order-1"
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
            variants={staggerContainer}
          >
            <div>
              <motion.h3 variants={fadeInLeft} className="text-3xl font-bold text-foreground mb-2">
                {t(instructorName)}
              </motion.h3>
              <motion.p variants={fadeInLeft} className="text-lg text-accent font-medium mb-6">
                {t(instructorTitle)}
              </motion.p>
              
              <motion.p variants={fadeInLeft} className="text-lg text-muted-foreground leading-relaxed">
                {t(instructorBio)}
              </motion.p>
            </div>

            <motion.blockquote
              variants={fadeInLeft}
              className="relative p-6 rounded-2xl bg-card border border-border/50 shadow-sm"
            >
              <Quote className="absolute top-4 right-4 w-10 h-10 text-muted-foreground/10 rtl:rotate-180 rotate-0" />
              <motion.p
                className="text-foreground font-semibold text-xl italic leading-relaxed rtl:pr-6 ltr:pl-6"
                variants={fadeInLeft}
              >
                "{t(instructorQuote)}"
              </motion.p>
            </motion.blockquote>

            <motion.div
              className="grid sm:grid-cols-2 gap-4 pt-6"
              variants={staggerContainer}
            >
              {achievements.map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div key={i} variants={scaleIn} custom={i}>
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-background border border-border/50 shadow-sm hover:shadow-md hover:border-accent/40 transition-all duration-300 group">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center border shadow-inner group-hover:scale-110 transition-transform duration-300 ${item.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="font-bold text-foreground group-hover:text-accent transition-colors">{t(item.label)}</span>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>

          {/* Image Content */}
          <motion.div
            className="lg:col-span-5 relative order-1 lg:order-2"
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
            variants={fadeInRight}
          >
            <div className="relative mx-auto max-w-md group">
              <div className="absolute inset-0 bg-gradient-to-tr from-accent/40 to-primary/40 rounded-[3rem] transform rotate-6 scale-105 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="absolute inset-0 bg-gradient-to-tr from-accent/20 to-primary/20 rounded-[3rem] transform rotate-3 scale-105 blur-lg" />
              
              <Card className="overflow-hidden border-0 shadow-2xl rounded-[3rem] bg-card relative group/card ring-1 ring-white/10">
                <div className="aspect-[4/5] relative">
                  <img
                    src={instructorSrc}
                    alt={t(instructorName)}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover/card:scale-110"
                    loading="lazy"
                    data-testid="img-instructor"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628] via-transparent to-transparent opacity-60 group-hover/card:opacity-40 transition-opacity duration-700" />
                  
                  {/* Floating Action Buttons */}
                  <div className="absolute top-8 left-8 flex flex-col gap-4 opacity-0 group-hover/card:opacity-100 transition-all duration-500 -translate-x-4 group-hover/card:translate-x-0">
                    <a href="#" className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:bg-accent hover:border-accent hover:scale-110 transition-all shadow-xl">
                      <Globe className="w-6 h-6" />
                    </a>
                    <a href="#" className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:bg-accent hover:border-accent hover:scale-110 transition-all shadow-xl">
                      <Mail className="w-6 h-6" />
                    </a>
                  </div>

                  <div className="absolute bottom-8 right-8 left-8 translate-y-4 group-hover/card:translate-y-0 transition-transform duration-700">
                    <div className="mb-4">
                      <Badge className="bg-accent/90 text-accent-foreground px-4 py-1.5 text-xs font-black uppercase tracking-widest border-none shadow-xl backdrop-blur-md">
                        {t(instructorBadge)}
                      </Badge>
                    </div>
                    <h3 className="text-white font-black text-3xl mb-1 tracking-tight">{t(instructorName)}</h3>
                    <div className="flex items-center gap-2">
                       <div className="h-0.5 w-8 bg-accent rounded-full" />
                       <p className="text-white/80 text-sm font-bold uppercase tracking-wide">{t(instructorTitle)}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

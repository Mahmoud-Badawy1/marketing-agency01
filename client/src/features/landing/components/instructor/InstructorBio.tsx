import { motion } from "framer-motion";
import { CheckCircle, Quote } from "lucide-react";
import { Award, Users, BookOpen, Heart } from "lucide-react";
import { fadeInLeft, scaleIn, staggerContainer, viewportConfig } from "@/lib/animations";
import { useLanguage } from "@/hooks/use-language";

const achievementIcons = [Users, Award, BookOpen, Heart];
const defaultAchievements = [
  { icon: Users, label: "instructor.achievements.clients", color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
  { icon: Award, label: "instructor.achievements.budgets", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
  { icon: BookOpen, label: "instructor.achievements.strategies", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
  { icon: Heart, label: "instructor.achievements.rating", color: "text-red-500 bg-red-500/10 border-red-500/20" },
];

interface InstructorBioProps {
  instructorName: string; instructorTitle: string; instructorBio: string;
  instructorQuote: string; dynamicAchievements?: any[];
}

export function InstructorBio({ instructorName, instructorTitle, instructorBio, instructorQuote, dynamicAchievements }: InstructorBioProps) {
  const { t } = useLanguage();
  const achievements = dynamicAchievements?.length
    ? dynamicAchievements.map((a, i) => ({ icon: achievementIcons[i % achievementIcons.length] || CheckCircle, label: a.label, color: a.color || defaultAchievements[i % defaultAchievements.length]?.color || "text-blue-500 bg-blue-500/10 border-blue-500/20" }))
    : defaultAchievements;

  return (
    <motion.div className="lg:col-span-7 space-y-8 order-2 lg:order-1" initial="hidden" whileInView="visible" viewport={viewportConfig} variants={staggerContainer}>
      <div>
        <motion.h3 variants={fadeInLeft} className="text-3xl font-bold text-foreground mb-2">{t(instructorName)}</motion.h3>
        <motion.p variants={fadeInLeft} className="text-lg text-accent font-medium mb-6">{t(instructorTitle)}</motion.p>
        <motion.p variants={fadeInLeft} className="text-lg text-muted-foreground leading-relaxed">{t(instructorBio)}</motion.p>
      </div>
      <motion.blockquote variants={fadeInLeft} className="relative p-6 rounded-2xl bg-card border border-border/50 shadow-sm">
        <Quote className="absolute top-4 right-4 w-10 h-10 text-muted-foreground/10 rtl:rotate-180 rotate-0" />
        <motion.p className="text-foreground font-semibold text-xl italic leading-relaxed rtl:pr-6 ltr:pl-6" variants={fadeInLeft}>"{t(instructorQuote)}"</motion.p>
      </motion.blockquote>
      <motion.div className="grid sm:grid-cols-2 gap-4 pt-6" variants={staggerContainer}>
        {achievements.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div key={i} variants={scaleIn} custom={i}>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-background border border-border/50 shadow-sm hover:shadow-md hover:border-accent/40 transition-all duration-300 group">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center border shadow-inner group-hover:scale-110 transition-transform duration-300 ${item.color}`}><Icon className="h-6 w-6" /></div>
                <span className="font-bold text-foreground group-hover:text-accent transition-colors">{t(item.label)}</span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}

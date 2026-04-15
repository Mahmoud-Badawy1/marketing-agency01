import { motion } from "framer-motion";
import { PROGRAMS } from "@/lib/constants";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/atoms/Badge";
import { Trophy, Star, Rocket } from "lucide-react";
import { fadeInUp, staggerContainer, viewportConfig } from "@/lib/animations";
import { usePublicSettings } from "@/hooks/use-public-settings";
import { useLanguage } from "@/hooks/use-language";

const iconMap = [Star, Trophy, Rocket];

export default function ProgramsSection() {
  const { data: settings } = usePublicSettings();
  const { t } = useLanguage();
  const dynamicPrograms = settings?.programs;
  const displayPrograms = dynamicPrograms && dynamicPrograms.length > 0
    ? dynamicPrograms
    : PROGRAMS;

  return (
    <section id="programs" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-14"
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          variants={staggerContainer}
        >
          <motion.p variants={fadeInUp} className="text-accent font-semibold text-sm mb-2">
            {t("programs.badge")}
          </motion.p>
          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl font-extrabold text-foreground"
            data-testid="text-programs-title"
          >
            {t("programs.title_main")}
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-accent to-blue-600">
              {t("programs.title_highlight")}
            </span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="mt-4 text-muted-foreground max-w-2xl mx-auto text-lg">
            {t("programs.description")}
          </motion.p>
        </motion.div>

        <div className="relative">
          <div
            className="hidden md:block absolute top-1/2 inset-x-0 h-0.5 bg-gradient-to-r ltr:bg-gradient-to-r rtl:bg-gradient-to-l from-emerald-400 via-blue-400 to-blue-600 -translate-y-1/2 opacity-30"
          />

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
            variants={staggerContainer}
          >
            {displayPrograms.map((program, i) => {
              const Icon = iconMap[i % iconMap.length];
              return (
                <motion.div key={i} variants={fadeInUp} custom={i}>
                  <Card className="relative p-6 hover-elevate border border-card-border h-full" data-testid={`card-program-${i}`}>
                    <div
                      className={`w-14 h-14 rounded-md bg-gradient-to-br ${program.color} flex items-center justify-center mb-5 hover:rotate-[360deg] hover:scale-110 transition-transform duration-500`}
                    >
                      <Icon className="h-7 w-7 text-white" />
                    </div>

                    <Badge variant="secondary" className="mb-3 text-xs">{t(program.level)}</Badge>

                    <h3 className="text-xl font-extrabold text-foreground mb-1">{t(program.title)}</h3>
                    <p className="text-sm font-medium text-accent mb-2">{t(program.subtitle)}</p>
                    <p className="text-sm text-muted-foreground mb-4">{t(program.description)}</p>

                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs">{t(program.age)}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {t("programs.interactive")}
                      </span>
                    </div>

                    {i < displayPrograms.length - 1 && (
                      <div
                        className="hidden md:flex absolute top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background border-2 border-accent items-center justify-center z-20 ltr:right-0 ltr:translate-x-1/2 rtl:left-0 rtl:-translate-x-1/2"
                      >
                        <span className="text-accent text-xs font-bold" dir="ltr">{i + 1}</span>
                      </div>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

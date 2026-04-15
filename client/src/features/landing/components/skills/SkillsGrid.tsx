import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Briefcase } from "lucide-react";
import { fadeInUp, staggerContainer, viewportConfig } from "@/lib/animations";
import { useLanguage } from "@/hooks/use-language";
import { BookOpen, Search, BarChart3, PenTool, Palette, Star, Globe, Users, Megaphone, Layout, Settings } from "lucide-react";

const iconMap: Record<string, any> = {
  Search, BarChart3, PenTool, Palette, Star, Globe, Users, Megaphone, Layout, Settings, BookOpen, Briefcase
};

interface SkillsGridProps {
  servicesData: any[];
}

export function SkillsGrid({ servicesData }: SkillsGridProps) {
  const { t } = useLanguage();
  return (
    <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-4" initial="hidden" whileInView="visible" viewport={viewportConfig} variants={staggerContainer}>
      {servicesData.map((service: any, i: number) => {
        const IconComponent = iconMap[service.icon] || Briefcase;
        return (
          <motion.div key={i} variants={fadeInUp} custom={i}>
            <Card className="p-5 text-center hover-elevate border border-card-border" data-testid={`card-service-${i}`}>
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center hover:rotate-[15deg] transition-transform duration-300">
                <IconComponent className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-bold text-foreground text-sm mb-1">{t(service.title)}</h3>
              {service.grade && <p className="text-xs text-muted-foreground">{t(service.grade)}</p>}
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { CheckCircle, Globe } from "lucide-react";
import { scaleIn, staggerContainer, viewportConfig } from "@/lib/animations";
import { useLanguage } from "@/hooks/use-language";

interface EmpowerStatsProps {
  stats: any[];
}

export function EmpowerStats({ stats }: EmpowerStatsProps) {
  const { t } = useLanguage();
  return (
    <motion.div className="grid grid-cols-2 gap-4" initial="hidden" whileInView="visible" viewport={viewportConfig} variants={staggerContainer}>
      {stats.map((stat: any, idx: number) => {
        const iconType = stat.iconType || stat.icon;
        const isCheck = iconType === "check";
        const Icon = isCheck ? CheckCircle : Globe;
        const bgColor = isCheck ? "bg-emerald-500/20" : "bg-accent/20";
        const animClass = isCheck ? "animate-pulse" : "animate-spin-15";
        return (
          <motion.div key={idx} variants={scaleIn} custom={idx}>
            <Card className="p-6 bg-white/10 border-white/10 backdrop-blur-sm text-center hover-elevate" data-testid={`card-stat-${idx}`}>
              <div className={`w-10 h-10 mx-auto mb-3 rounded-full ${bgColor} flex items-center justify-center ${animClass}`}>
                <Icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
              <p className="text-3xl font-extrabold text-white">{stat.value}</p>
              <p className="text-xs text-white/70 mt-1">{t(stat.label)}</p>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

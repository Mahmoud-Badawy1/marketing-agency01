import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { STATS } from "@/lib/constants";
import { Card } from "@/components/ui/card";
import { Users, Target, Award } from "lucide-react";
import { staggerContainer, fadeInUp, viewportConfig } from "@/lib/animations";
import { usePublicSettings } from "@/hooks/use-public-settings";
import { useLanguage } from "@/hooks/use-language";

const icons = [Users, Target, Award];

function AnimatedCounter({ target, suffix = "" }: { target: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);
  const numericTarget = parseInt(target.replace(/\D/g, ""));

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 2000;
    const increment = numericTarget / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= numericTarget) {
        setCount(numericTarget);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, numericTarget]);

  return (
    <span ref={ref} className="font-mono tracking-tight">
      {count}{suffix}
    </span>
  );
}

export default function StatsSection() {
  const { data: settings } = usePublicSettings();
  const { t } = useLanguage();
  const dynamicStats = settings?.stats;
  const displayStats = dynamicStats && dynamicStats.length > 0
    ? dynamicStats.map((s: any) => ({ value: s.value, label: s.label, color: s.color }))
    : STATS;

  return (
    <section className="py-20 bg-background border-y border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          variants={staggerContainer}
        >
          {displayStats.map((stat: any, i: number) => {
            const Icon = icons[i % icons.length];
            return (
              <motion.div 
                key={i} 
                variants={fadeInUp} 
                custom={i}
                className="flex flex-col items-center"
              >
                <div className="flex items-center justify-center mb-6 text-accent">
                  <Icon className="h-12 w-12" />
                </div>
                <div className="text-5xl lg:text-7xl font-black text-foreground mb-4 tracking-tighter flex items-center justify-center gap-1 hover:scale-105 transition-transform duration-300">
                  <AnimatedCounter target={stat.value} />
                  <span className="text-4xl text-accent font-light">+</span>
                </div>
                
                <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-l from-foreground to-foreground/60">
                  {t(stat.label)}
                </h3>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/atoms/Badge";
import { Mail, Globe } from "lucide-react";
import { fadeInRight, viewportConfig } from "@/lib/animations";
import { useLanguage } from "@/hooks/use-language";

interface InstructorImageCardProps {
  instructorSrc: string;
  instructorName: string;
  instructorTitle: string;
  instructorBadge: string;
}

export function InstructorImageCard({ instructorSrc, instructorName, instructorTitle, instructorBadge }: InstructorImageCardProps) {
  const { t } = useLanguage();
  return (
    <motion.div className="lg:col-span-5 relative order-1 lg:order-2" initial="hidden" whileInView="visible" viewport={viewportConfig} variants={fadeInRight}>
      <div className="relative mx-auto max-w-md group">
        <div className="absolute inset-0 bg-gradient-to-tr from-accent/40 to-primary/40 rounded-[3rem] transform rotate-6 scale-105 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        <div className="absolute inset-0 bg-gradient-to-tr from-accent/20 to-primary/20 rounded-[3rem] transform rotate-3 scale-105 blur-lg" />
        <Card className="overflow-hidden border-0 shadow-2xl rounded-[3rem] bg-card relative group/card ring-1 ring-white/10">
          <div className="aspect-[4/5] relative">
            <img src={instructorSrc} alt={t(instructorName)} className="w-full h-full object-cover transition-transform duration-1000 group-hover/card:scale-110" loading="lazy" data-testid="img-instructor" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628] via-transparent to-transparent opacity-60 group-hover/card:opacity-40 transition-opacity duration-700" />
            <div className="absolute top-8 left-8 flex flex-col gap-4 opacity-0 group-hover/card:opacity-100 transition-all duration-500 -translate-x-4 group-hover/card:translate-x-0">
              <a href="#" className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:bg-accent hover:border-accent hover:scale-110 transition-all shadow-xl"><Globe className="w-6 h-6" /></a>
              <a href="#" className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:bg-accent hover:border-accent hover:scale-110 transition-all shadow-xl"><Mail className="w-6 h-6" /></a>
            </div>
            <div className="absolute bottom-8 right-8 left-8 translate-y-4 group-hover/card:translate-y-0 transition-transform duration-700">
              <div className="mb-4"><Badge className="bg-accent/90 text-accent-foreground px-4 py-1.5 text-xs font-black uppercase tracking-widest border-none shadow-xl backdrop-blur-md">{t(instructorBadge)}</Badge></div>
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
  );
}

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/atoms/Badge";
import { Calendar } from "lucide-react";
import { viewportConfig, fadeInUp } from "@/lib/animations";
import { useLanguage } from "@/hooks/use-language";

interface GalleryEventBannerProps {
  upcomingEvent: any;
}

export function GalleryEventBanner({ upcomingEvent }: GalleryEventBannerProps) {
  const { t } = useLanguage();
  if (!upcomingEvent.visible) return null;
  return (
    <motion.div initial="hidden" whileInView="visible" viewport={viewportConfig} variants={fadeInUp}>
      <Card className="relative overflow-hidden border-0 text-primary-foreground shadow-2xl"
        style={{ backgroundImage: upcomingEvent.backgroundType === "image" && upcomingEvent.backgroundImage ? `url(${upcomingEvent.backgroundImage})` : undefined, backgroundSize: "cover", backgroundPosition: "center" }}
        data-testid="card-upcoming-event">
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30" />
        {upcomingEvent.backgroundType === "gradient" && (
          <div className={`absolute inset-0 bg-gradient-to-l ${upcomingEvent.backgroundGradient || "from-primary to-primary/80"}`} />
        )}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-accent/10 to-transparent animate-shimmer" />
        <div className="p-8 sm:p-12 relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="flex-1">
            <Badge variant="secondary" className="mb-4 bg-accent/20 text-accent hover:bg-accent/30 border border-accent/30 text-sm py-1 px-3 backdrop-blur-sm">{t(upcomingEvent.badge)}</Badge>
            <h3 className="text-3xl sm:text-4xl font-black mb-3 text-white">{t(upcomingEvent.title)}</h3>
            <p className="text-white/80 text-lg max-w-2xl leading-relaxed">{t(upcomingEvent.description)}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 min-w-[200px] text-center shrink-0">
            <Calendar className="h-8 w-8 mx-auto mb-3 text-accent" />
            <p className="text-sm font-medium text-white/70 mb-1">{t("gallery.event_date_label")}</p>
            <p className="text-xl font-bold text-white">{t(upcomingEvent.date)}</p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

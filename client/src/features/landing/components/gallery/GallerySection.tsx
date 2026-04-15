import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, viewportConfig } from "@/lib/animations";
import { usePublicSettings } from "@/hooks/use-public-settings";
import { useLanguage } from "@/hooks/use-language";
import { fallbackImages } from "@/lib/fallbackImages";
import { GalleryCarousel } from "./GalleryCarousel";
import { GalleryEventBanner } from "./GalleryEventBanner";

export default function GallerySection() {
  const { data: settings } = usePublicSettings();
  const { t } = useLanguage();
  const galleryImg1 = settings?.images?.gallery1 || fallbackImages.gallery1;
  const galleryImg2 = settings?.images?.gallery2 || fallbackImages.gallery2;
  const galleryImg3 = settings?.images?.gallery3 || fallbackImages.gallery3;
  const galleryImg4 = settings?.images?.gallery4 || fallbackImages.gallery4;

  const getImageByKey = (key: string) => ({ gallery1: galleryImg1, gallery2: galleryImg2, gallery3: galleryImg3, gallery4: galleryImg4 }[key] ?? galleryImg1);

  const defaultGalleryCards = [
    { badge: "gallery.success_story", badgeColor: "bg-accent", title: "gallery.card1.title", description: "gallery.card1.description", imageKey: "gallery1", image: "" },
    { badge: "gallery.workshop", badgeColor: "bg-primary", title: "gallery.card2.title", description: "gallery.card2.description", imageKey: "gallery2", image: "" },
    { badge: "gallery.case_study", badgeColor: "bg-emerald-500", title: "gallery.card3.title", description: "gallery.card3.description", imageKey: "gallery3", image: "" },
  ];
  const galleryCards = settings?.gallery_cards || defaultGalleryCards;
  const defaultUpcomingEvent = { badge: "gallery.news", title: "gallery.event.title", description: "gallery.event.description", date: "gallery.event.date", backgroundType: "gradient" as const, backgroundGradient: "from-primary to-primary/80", visible: true };
  const upcomingEvent = settings?.upcoming_event || defaultUpcomingEvent;

  return (
    <section className="py-24 bg-card dark:bg-card relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div className="text-center mb-16" initial="hidden" whileInView="visible" viewport={viewportConfig} variants={staggerContainer}>
          <motion.p variants={fadeInUp} className="text-accent font-semibold text-sm mb-2 uppercase tracking-wide">{t("gallery.subtitle")}</motion.p>
          <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground" data-testid="text-gallery-title">
            {t("gallery.title_main")}<span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-blue-400">{t("gallery.title_highlight")}</span>{t("gallery.title_end")}
          </motion.h2>
          <motion.p variants={fadeInUp} className="mt-4 text-muted-foreground max-w-2xl mx-auto text-lg">{t("gallery.description")}</motion.p>
        </motion.div>
        <GalleryCarousel galleryCards={galleryCards} getImageByKey={getImageByKey} />
        <GalleryEventBanner upcomingEvent={upcomingEvent} />
      </div>
    </section>
  );
}

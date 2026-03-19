import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { fadeInUp, staggerContainer, viewportConfig } from "@/lib/animations";
import { usePublicSettings } from "@/hooks/use-public-settings";
import { useLanguage } from "@/hooks/use-language";
import { fallbackImages } from "@/lib/fallbackImages";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default function GallerySection() {
  const { data: settings } = usePublicSettings();
  const { t } = useLanguage();
  const galleryImg1 = settings?.images?.gallery1 || fallbackImages.gallery1;
  const galleryImg2 = settings?.images?.gallery2 || fallbackImages.gallery2;
  const galleryImg3 = settings?.images?.gallery3 || fallbackImages.gallery3;
  const galleryImg4 = settings?.images?.gallery4 || fallbackImages.gallery4;

  const getImageByKey = (key: string) => {
    switch(key) {
      case "gallery1": return galleryImg1;
      case "gallery2": return galleryImg2;
      case "gallery3": return galleryImg3;
      case "gallery4": return galleryImg4;
      default: return galleryImg1;
    }
  }

  // Gallery cards from admin or hardcoded defaults
  const defaultGalleryCards = [
    {
      badge: "gallery.success_story",
      badgeColor: "bg-accent",
      title: "gallery.card1.title",
      description: "gallery.card1.description",
      imageKey: "gallery1",
      image: "",
    },
    {
      badge: "gallery.workshop",
      badgeColor: "bg-primary",
      title: "gallery.card2.title",
      description: "gallery.card2.description",
      imageKey: "gallery2",
      image: "",
    },
    {
      badge: "gallery.case_study",
      badgeColor: "bg-emerald-500",
      title: "gallery.card3.title",
      description: "gallery.card3.description",
      imageKey: "gallery3",
      image: "",
    },
  ];

  const galleryCards = settings?.gallery_cards || defaultGalleryCards;

  // Upcoming event from admin or hardcoded default
  const defaultUpcomingEvent = {
    badge: "gallery.news",
    title: "gallery.event.title",
    description: "gallery.event.description",
    date: "gallery.event.date",
    backgroundType: "gradient" as const,
    backgroundGradient: "from-primary to-primary/80",
    visible: true,
  };

  const upcomingEvent = settings?.upcoming_event || defaultUpcomingEvent;

  return (
    <section className="py-24 bg-card dark:bg-card relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          variants={staggerContainer}
        >
          <motion.p variants={fadeInUp} className="text-accent font-semibold text-sm mb-2 uppercase tracking-wide">
            {t("gallery.subtitle")}
          </motion.p>
          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground"
            data-testid="text-gallery-title"
          >
            {t("gallery.title_main")}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-blue-400">
              {t("gallery.title_highlight")}
            </span>
            {t("gallery.title_end")}
          </motion.h2>
          <motion.p variants={fadeInUp} className="mt-4 text-muted-foreground max-w-2xl mx-auto text-lg">
            {t("gallery.description")}
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          variants={fadeInUp}
          className="mb-16"
          dir="rtl"
        >
          {galleryCards.length > 0 ? (
            <Carousel
              opts={{
                align: "start",
                direction: "rtl",
                dragFree: true,
                containScroll: "trimSnaps"
              }}
              className="w-full relative group"
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {galleryCards.map((card, idx) => (
                  <CarouselItem key={idx} className="pl-2 md:pl-4 basis-[85%] sm:basis-[60%] md:basis-1/2 lg:basis-1/3">
                    <Card className="overflow-hidden border border-card-border shadow-md hover:shadow-xl transition-all duration-300 h-full flex flex-col group/card cursor-grab active:cursor-grabbing" data-testid={`card-gallery-${idx}`}>
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img
                          src={card.image || getImageByKey(card.imageKey)}
                          alt={t(card.title)}
                          className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover/card:scale-110"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent opacity-80 group-hover/card:opacity-90 transition-opacity duration-300" />
                        
                        <div className="absolute top-4 right-4">
                          <Badge className={`${card.badgeColor} text-white shadow-lg`}>{t(card.badge)}</Badge>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-2 group-hover/card:translate-y-0 transition-transform duration-300">
                          <h3 className="text-white font-bold text-xl sm:text-2xl mb-2">{t(card.title)}</h3>
                          <p className="text-white/80 text-sm leading-relaxed line-clamp-2 group-hover/card:line-clamp-none transition-all duration-300">{t(card.description)}</p>
                        </div>
                      </div>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none z-20">
                <CarouselPrevious className="static translate-y-0 -translate-x-1/2 bg-background/80 backdrop-blur-md border-border shadow-xl w-12 h-12 hover:bg-accent hover:text-accent-foreground transition-all pointer-events-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-0 rtl:rotate-180" />
                <CarouselNext className="static translate-y-0 translate-x-1/2 bg-background/80 backdrop-blur-md border-border shadow-xl w-12 h-12 hover:bg-accent hover:text-accent-foreground transition-all pointer-events-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-0 rtl:rotate-180" />
              </div>
            </Carousel>
          ) : (
            <div className="text-center py-20 text-muted-foreground">{t("gallery.no_items")}</div>
          )}
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          variants={fadeInUp}
        >
          {upcomingEvent.visible && (
            <Card 
              className="relative overflow-hidden border-0 text-primary-foreground shadow-2xl"
              style={{
                backgroundImage: upcomingEvent.backgroundType === "image" && upcomingEvent.backgroundImage
                  ? `url(${upcomingEvent.backgroundImage})`
                  : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center"
              }}
              data-testid="card-upcoming-event"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30" />
              
              {upcomingEvent.backgroundType === "gradient" && (
                <div className={`absolute inset-0 bg-gradient-to-l ${upcomingEvent.backgroundGradient || 'from-primary to-primary/80'}`} />
              )}
              
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-accent/10 to-transparent animate-shimmer" />
              
              <div className="p-8 sm:p-12 relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                <div className="flex-1">
                  <Badge variant="secondary" className="mb-4 bg-accent/20 text-accent hover:bg-accent/30 border border-accent/30 text-sm py-1 px-3 backdrop-blur-sm">
                    {t(upcomingEvent.badge)}
                  </Badge>
                  <h3 className="text-3xl sm:text-4xl font-black mb-3 text-white">
                    {t(upcomingEvent.title)}
                  </h3>
                  <p className="text-white/80 text-lg max-w-2xl leading-relaxed">
                    {t(upcomingEvent.description)}
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 min-w-[200px] text-center shrink-0">
                  <Calendar className="h-8 w-8 mx-auto mb-3 text-accent" />
                  <p className="text-sm font-medium text-white/70 mb-1">{t("gallery.event_date_label")}</p>
                  <p className="text-xl font-bold text-white">{t(upcomingEvent.date)}</p>
                </div>
              </div>
            </Card>
          )}
        </motion.div>
      </div>
    </section>
  );
}

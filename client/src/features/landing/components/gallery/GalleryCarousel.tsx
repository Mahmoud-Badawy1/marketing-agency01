import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/atoms/Badge";
import { useLanguage } from "@/hooks/use-language";
import { viewportConfig, fadeInUp } from "@/lib/animations";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

interface GalleryCarouselProps {
  galleryCards: any[];
  getImageByKey: (key: string) => string;
}

export function GalleryCarousel({ galleryCards, getImageByKey }: GalleryCarouselProps) {
  const { t } = useLanguage();
  if (!galleryCards.length) {
    return <div className="text-center py-20 text-muted-foreground">{t("gallery.no_items")}</div>;
  }
  return (
    <motion.div initial="hidden" whileInView="visible" viewport={viewportConfig} variants={fadeInUp} className="mb-16" dir="rtl">
      <Carousel opts={{ align: "start", direction: "rtl", dragFree: true, containScroll: "trimSnaps" }} className="w-full relative group">
        <CarouselContent className="-ml-2 md:-ml-4">
          {galleryCards.map((card: any, idx: number) => (
            <CarouselItem key={idx} className="pl-2 md:pl-4 basis-[85%] sm:basis-[60%] md:basis-1/2 lg:basis-1/3">
              <Card className="overflow-hidden border border-card-border shadow-md hover:shadow-xl transition-all duration-300 h-full flex flex-col group/card cursor-grab active:cursor-grabbing" data-testid={`card-gallery-${idx}`}>
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={card.image || getImageByKey(card.imageKey)} alt={t(card.title)} className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover/card:scale-110" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent opacity-80 group-hover/card:opacity-90 transition-opacity duration-300" />
                  <div className="absolute top-4 right-4"><Badge className={`${card.badgeColor} text-white shadow-lg`}>{t(card.badge)}</Badge></div>
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
          <CarouselPrevious className="static translate-y-0 -translate-x-1/2 bg-background/80 backdrop-blur-md border-border shadow-xl w-12 h-12 hover:bg-accent hover:text-accent-foreground transition-all pointer-events-auto opacity-0 group-hover:opacity-100 rtl:rotate-180" />
          <CarouselNext className="static translate-y-0 translate-x-1/2 bg-background/80 backdrop-blur-md border-border shadow-xl w-12 h-12 hover:bg-accent hover:text-accent-foreground transition-all pointer-events-auto opacity-0 group-hover:opacity-100 rtl:rotate-180" />
        </div>
      </Carousel>
    </motion.div>
  );
}

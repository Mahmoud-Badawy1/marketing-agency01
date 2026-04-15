import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { fadeInUp, staggerContainer, viewportConfig } from "@/lib/animations";
import { useLanguage } from "@/hooks/use-language";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useTestimonialsSlider } from "@/features/testimonials/hooks/useTestimonialsSlider";
import { TestimonialCard } from "@/features/testimonials/components/TestimonialCard";

export default function TestimonialsSection() {
  const { t, language } = useLanguage();
  const { items, api, setApi, current } = useTestimonialsSlider();

  if (items.length === 0) return null;

  return (
    <section
      id="testimonials"
      className="py-24 bg-card relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 z-10">
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp} className="flex justify-center mb-4">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-5 h-5 fill-accent text-accent" />
              ))}
            </div>
          </motion.div>
          <motion.p
            variants={fadeInUp}
            className="text-accent font-semibold text-sm mb-2"
          >
            {t("testimonials.badge")}
          </motion.p>
          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground"
          >
            {t("testimonials.title_main")}
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-accent to-blue-500">
              {t("testimonials.title_highlight")}
            </span>{" "}
            {t("testimonials.title_end")}
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="mt-4 text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed"
          >
            {t("testimonials.description")}
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          variants={fadeInUp}
        >
          <Carousel
            setApi={setApi}
            opts={{
              align: "center",
              direction: language === "ar" ? "rtl" : "ltr",
              slidesToScroll: 1,
              loop: items.length > 1,
              containScroll: false,
            }}
            className="w-full relative group"
          >
            <CarouselContent className="py-4" overflowHidden={false}>
              {items.map((item, index) => (
                <CarouselItem
                  key={item._id || index}
                  className={`pl-4 basis-full sm:basis-1/2 md:basis-1/3 transition-all ${items.length === 1 ? "mx-auto" : ""}`}
                >
                  <TestimonialCard
                    item={item}
                    t={t}
                    isCenter={index === current}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            {items.length > 1 && (
              <>
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none z-20 px-4 sm:-mx-6">
                  <CarouselPrevious className="static pointer-events-auto bg-background/90" />
                  <CarouselNext className="static pointer-events-auto bg-background/90" />
                </div>
                <div className="flex justify-center gap-2 mt-8">
                  {items.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => api?.scrollTo(i)}
                      className={`h-2 rounded-full transition-all ${i === current ? "w-8 bg-accent" : "w-2 bg-muted-foreground/30"}`}
                    />
                  ))}
                </div>
              </>
            )}
          </Carousel>
        </motion.div>
      </div>
    </section>
  );
}

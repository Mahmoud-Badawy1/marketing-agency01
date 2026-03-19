import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fadeInUp, staggerContainer, viewportConfig } from "@/lib/animations";
import { useLanguage } from "@/hooks/use-language";
import type { TestimonialType } from "@shared/schema";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi
} from "@/components/ui/carousel";

// Fallback testimonials shown when none exist in DB
const FALLBACK_TESTIMONIALS: TestimonialType[] = [
  {
    _id: "1",
    name: "مجموعة العليان",
    role: "شريك استراتيجي",
    whatsappImage: "",
    defaultText: {
      ar: "شراكة استراتيجية مثمرة ساهمت في تعزيز حضورنا الرقمي بشكل كبير وملحوظ في السوق السعودي.",
      en: "A fruitful strategic partnership that significantly enhanced our digital presence in the Saudi market."
    }
  },
  {
    _id: "2",
    name: "شركة تكامل",
    role: "عميل متميز",
    // whatsappImage: "https://res.cloudinary.com/dz4q2fl8k/image/upload/v1771463359/abqary-uploads/upload-1771463358119.png",
    defaultText: {
      ar: "تعاون مثمر ",
      en: "Great cooperation."
    }
  },
  {
    _id: "3",
    name: "مؤسسة الأفق",
    role: "شريك نجاح",
    // whatsappImage: "https://via.placeholder.com/400x600/25D366/FFFFFF?text=WhatsApp+Screenshot+3",
    defaultText: {
      ar: "شراكة استراتيجية مثمرة ساهمت في تعزيز حضورنا الرقمي بشكل كبير وملحوظ في السوق السعودي.",
      en: "A fruitful strategic partnership that significantly enhanced our digital presence in the Saudi market."
    }
  },
  {
    _id: "4",
    name: "متجر تميز",
    role: "عميل",
    // whatsappImage: "https://via.placeholder.com/400x600/25D366/FFFFFF?text=WhatsApp+Screenshot+4",
    defaultText: {
      ar: "شراكة استراتيجية مثمرة ساهمت في تعزيز حضورنا الرقمي بشكل كبير وملحوظ في السوق السعودي.",
      en: "A fruitful strategic partnership that significantly enhanced our digital presence in the Saudi market."
    }
  },
];

export default function TestimonialsSection() {
  const { t, language } = useLanguage();
  const { data: testimonials = [] } = useQuery<TestimonialType[]>({
    queryKey: ["/api/testimonials"],
    queryFn: async () => {
      const res = await fetch("/api/testimonials");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const items = testimonials.length > 0 ? testimonials : FALLBACK_TESTIMONIALS;
  const hasMultipleTestimonials = items.length > 1;
  
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());

    const onSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };

    api.on("select", onSelect);

    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  // Auto-play
  useEffect(() => {
    if (!api || !hasMultipleTestimonials) return;
    const interval = setInterval(() => {
      api.scrollNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [api, hasMultipleTestimonials]);


  if (items.length === 0) return null;

  return (
    <section id="testimonials" className="py-24 bg-card relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center mb-16 sm:mb-20"
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
          
          <motion.p variants={fadeInUp} className="text-accent font-semibold text-sm mb-2 uppercase tracking-wide">
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
          
          <motion.p variants={fadeInUp} className="mt-4 text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
            {t("testimonials.description")}
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          variants={fadeInUp}
          className="relative max-w-7xl mx-auto"
        >
          <Carousel
            setApi={setApi}
            opts={{
              align: "center",
              direction: language === "ar" ? "rtl" : "ltr",
              slidesToScroll: 1,
              loop: hasMultipleTestimonials,
              containScroll: false,
            }}
            className="w-full relative group"
          >
            <CarouselContent className="py-4" overflowHidden={false}>
              {items.map((item, index) => {
                // With center alignment, selected snap is the centered card.
                const isCenter = index === current;
                
                return (
                  <CarouselItem 
                    key={item._id || index} 
                    className={`pl-4 basis-full sm:basis-1/2 md:basis-1/3 transition-all duration-500 ${!hasMultipleTestimonials ? "mx-auto" : ""}`}
                  >
                    <div className={`h-full transition-all duration-500 ease-out ${isCenter ? "scale-105 z-20" : "scale-95 opacity-70"}`}>
                      <Card className={`p-5 h-[340px] bg-background border transition-all duration-500 flex flex-col group/card rounded-[2rem] overflow-hidden shadow-sm
                        ${isCenter ? "border-accent ring-2 ring-accent/10 shadow-xl" : "border-border/50 hover:border-accent/30"}
                      `}>
                        <div className="relative flex-1 overflow-hidden rounded-2xl bg-muted/20 flex items-center justify-center">
                          <Quote className={`absolute top-3 right-3 w-8 h-8 transition-colors duration-500 z-10 ${isCenter ? "text-accent" : "text-muted-foreground/20"}`} />
                          
                          {item.whatsappImage ? (
                            <img
                              src={item.whatsappImage}
                              alt={`${t("testimonials.quote_alt")} ${item.name}`}
                              className="w-full h-full object-contain transition-transform duration-700 ease-out group-hover/card:scale-110"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center p-6 text-center">
                              <Quote className="w-12 h-12 text-accent/10 mb-4" strokeWidth={1} />
                              <p className="text-lg font-bold italic text-muted-foreground leading-relaxed line-clamp-6 px-2">
                                {item.defaultText ? t(item.defaultText as any) : t("testimonials.default_text")}
                              </p>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 pointer-events-none" />
                        </div>
                        
                        <div className="mt-4 text-center shrink-0">
                          <h4 className={`font-bold transition-colors duration-300 ${isCenter ? "text-accent text-lg" : "text-foreground"}`}>
                            {t(item.name as any)}
                          </h4>
                          {item.role && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1 font-medium">
                              {t(item.role as any)}
                            </p>
                          )}
                        </div>
                      </Card>
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            
            {hasMultipleTestimonials && (
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none z-20 px-2 sm:px-0 sm:-mx-6">
                <CarouselPrevious className="static translate-y-0 bg-background/90 backdrop-blur border-border shadow-lg w-12 h-12 hover:bg-accent hover:text-accent-foreground transition-all pointer-events-auto rtl:rotate-180" />
                <CarouselNext className="static translate-y-0 bg-background/90 backdrop-blur border-border shadow-lg w-12 h-12 hover:bg-accent hover:text-accent-foreground transition-all pointer-events-auto rtl:rotate-180" />
              </div>
            )}
            
            {hasMultipleTestimonials && (
              <div className="flex items-center justify-center gap-2 mt-8">
                {items.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => api?.scrollTo(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === current
                        ? "w-8 bg-accent"
                        : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </Carousel>
        </motion.div>
      </div>
    </section>
  );
}


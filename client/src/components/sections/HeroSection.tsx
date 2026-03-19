import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import heroImage1 from "@assets/images/marketing_hero_1_1773563925795.png";
import heroImage2 from "@assets/images/marketing_hero_2_1773563941883.png";
import heroImage3 from "@assets/images/marketing_hero_3_1773563957738.png";
import { usePublicSettings } from "@/hooks/use-public-settings";
import { useLanguage } from "@/hooks/use-language";

interface SlideData {
  video: string;
  mediaUrl: string;
  title: string | { ar: string; en: string };
  highlight: string | { ar: string; en: string };
  subtitle: string | { ar: string; en: string };
  mediaType: "video" | "image" | "gif";
}

const defaultSlides: SlideData[] = [
  {
    video: heroImage1,
    mediaUrl: heroImage1,
    title: "hero.default_slide1.title",
    highlight: "hero.default_slide1.highlight",
    subtitle: "hero.default_slide1.subtitle",
    mediaType: "image",
  },
  {
    video: heroImage2,
    mediaUrl: heroImage2,
    title: "hero.default_slide2.title",
    highlight: "hero.default_slide2.highlight",
    subtitle: "hero.default_slide2.subtitle",
    mediaType: "image",
  },
  {
    video: heroImage3,
    mediaUrl: heroImage3,
    title: "hero.default_slide3.title",
    highlight: "hero.default_slide3.highlight",
    subtitle: "hero.default_slide3.subtitle",
    mediaType: "image",
  },
];

const SLIDE_DURATION = 7000;

export default function HeroSection() {
  const { data: settings } = usePublicSettings();
  const { t } = useLanguage();
  
  // Use admin slides if available, otherwise use defaults
  let slides: SlideData[] = defaultSlides;
  
  if (settings?.hero_slides && settings.hero_slides.length > 0) {
    slides = settings.hero_slides.map((slide: any, idx: number) => ({
      ...slide,
      title: slide.title || defaultSlides[idx]?.title || { ar: "", en: "" },
      highlight: slide.highlight || defaultSlides[idx]?.highlight || { ar: "", en: "" },
      subtitle: slide.subtitle || defaultSlides[idx]?.subtitle || { ar: "", en: "" },
      mediaType: (slide.mediaType || "video") as "video" | "image" | "gif",
      // Use dynamic URL or fallback to static images
      video: slide.mediaUrl || (idx === 0 ? heroImage1 : idx === 1 ? heroImage2 : idx === 2 ? heroImage3 : heroImage1),
      mediaUrl: slide.mediaUrl || (idx === 0 ? heroImage1 : idx === 1 ? heroImage2 : idx === 2 ? heroImage3 : heroImage1),
    }));
  }
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, SLIDE_DURATION);
  }, []);

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [current, resetTimer]);

  useEffect(() => {
    // Play current video if slide type is video, pause others
    videoRefs.current.forEach((video, i) => {
      if (!video) return;
      if (slides[i]?.mediaType === "video") {
        if (i === current) {
          video.currentTime = 0;
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      }
    });
  }, [current, slides]);

  const goTo = (index: number) => {
    if (index === current) return;
    setCurrent(index);
  };

  const goNext = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const goPrev = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const scrollToPricing = () => {
    document.querySelector("#pricing")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToDemo = () => {
    document.querySelector("#demo")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="hero" className="relative h-[90vh] min-h-[600px] max-h-[900px] overflow-hidden" data-testid="section-hero">
      {/* All media stay in DOM — no re-fetching on slide change */}
      {slides.map((slide, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 1 : 0 }}
        >
          {slide.mediaType === "video" ? (
            <video
              ref={(el) => { videoRefs.current[i] = el; }}
              src={slide.video || slide.mediaUrl}
              className="absolute inset-0 w-full h-full object-cover"
              autoPlay={i === 0}
              muted
              loop
              playsInline
              preload={i === 0 ? "auto" : "metadata"}
              poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1280 720'%3E%3Crect fill='%23000'/%3E%3C/svg%3E"
              data-testid={`video-hero-slide-${i}`}
            />
          ) : (
            <img
              src={slide.mediaUrl || slide.video}
              alt={`${t(slides[current].title)} - ${t(slides[current].highlight)}`}
              className="absolute inset-0 w-full h-full object-cover"
              loading={i === 0 ? "eager" : "lazy"}
              data-testid={`image-hero-slide-${i}`}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent rtl:bg-gradient-to-l" />
        </div>
      ))}

      <div className="relative h-full flex items-center z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={current}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm font-semibold border border-white/20"
                >
                  <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  {t("hero.reg_open")}
                </div>

                <h1
                  className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-white"
                  data-testid="text-hero-title"
                >
                  {t(slides[current].title)}
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-l from-accent to-blue-400">
                    {t(slides[current].highlight)}
                  </span>
                </h1>

                <p
                  className="text-lg sm:text-xl text-white/80 max-w-xl"
                  data-testid="text-hero-subtitle"
                >
                  {t(slides[current].subtitle)}
                </p>

                <div className="flex flex-wrap gap-4">
                  <Button
                    onClick={scrollToPricing}
                    size="lg"
                    className="bg-accent text-accent-foreground border-accent-border text-base px-8 mb-4 sm:mb-0"
                    data-testid="button-hero-cta"
                  >
                    {t("hero.book_consultation")}
                    <ArrowLeft className="mx-2 h-5 w-5 rtl:rotate-0 rotate-180" />
                  </Button>
                  <Button
                    onClick={scrollToDemo}
                    variant="outline"
                    size="lg"
                    className="text-base bg-white/10 backdrop-blur-sm border-white/30 text-white"
                    data-testid="button-hero-demo"
                  >
                    {t("hero.explore_services")}
                  </Button>
                </div>

                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/70">
                  {[
                    t("hero.marketing_consulting"), 
                    t("hero.professional_courses"), 
                    t("hero.brand_building")
                  ].map((text) => (
                    <span key={text} className="flex items-center gap-1.5">
                      <CheckCircle className="h-4 w-4 text-emerald-400" />
                      {text}
                    </span>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className="group relative"
            aria-label={`الانتقال للشريحة ${i + 1}`}
            data-testid={`button-slide-dot-${i}`}
          >
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                i === current ? "w-10 bg-accent" : "w-2 bg-white/50 group-hover:bg-white/80"
              }`}
            />
            {i === current && (
              <motion.div
                className="absolute inset-0 h-2 rounded-full bg-accent/50"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: SLIDE_DURATION / 1000, ease: "linear" }}
                style={{ transformOrigin: "right" }}
              />
            )}
          </button>
        ))}
      </div>

      <div className="absolute top-1/2 -translate-y-1/2 left-4 z-20 hidden sm:block">
        <Button
          size="icon"
          variant="ghost"
          className="text-white/70 bg-black/20 backdrop-blur-sm border border-white/10"
          onClick={goPrev}
          aria-label="الشريحة السابقة"
          data-testid="button-slide-prev"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      </div>
      <div className="absolute top-1/2 -translate-y-1/2 right-4 z-20 hidden sm:block">
        <Button
          size="icon"
          variant="ghost"
          className="text-white/70 bg-black/20 backdrop-blur-sm border border-white/10"
          onClick={goNext}
          aria-label="الشريحة التالية"
          data-testid="button-slide-next"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </section>
  );
}

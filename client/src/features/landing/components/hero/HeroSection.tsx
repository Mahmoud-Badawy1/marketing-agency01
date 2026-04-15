import { usePublicSettings } from "@/hooks/use-public-settings";
import { useLanguage } from "@/hooks/use-language";
import { useHeroSlides } from "@/features/landing/hooks/useHeroSlides";
import { HeroSlide } from "@/features/landing/components/HeroSlide";
import { HeroContent } from "@/features/landing/components/HeroContent";
import { HeroControls } from "@/features/landing/components/HeroControls";

export default function HeroSection() {
  const { data: settings } = usePublicSettings();
  const { t } = useLanguage();
  const { slides, current, goTo, goNext, goPrev } = useHeroSlides(settings);

  const scroll = (id: string) =>
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section
      id="hero"
      className="relative h-[90vh] min-h-[600px] max-h-[900px] overflow-hidden"
    >
      {slides.map((s: any, i: number) => (
        <HeroSlide key={i} slide={s} active={i === current} index={i} />
      ))}
      <div className="relative h-full flex items-center z-10">
        <div className="max-w-7xl mx-auto px-4 w-full">
          <div className="max-w-2xl">
            <HeroContent
              slide={slides[current]}
              t={t}
              current={current}
              onPricing={() => scroll("#pricing")}
              onDemo={() => scroll("#demo")}
            />
          </div>
        </div>
      </div>
      <HeroControls
        slides={slides}
        current={current}
        goTo={goTo}
        goNext={goNext}
        goPrev={goPrev}
      />
    </section>
  );
}

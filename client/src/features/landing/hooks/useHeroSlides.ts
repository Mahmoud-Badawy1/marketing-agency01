import { useState, useEffect, useRef, useCallback } from "react";
import heroImage1 from "@assets/images/marketing_hero_1_1773563925795.png";
import heroImage2 from "@assets/images/marketing_hero_2_1773563941883.png";
import heroImage3 from "@assets/images/marketing_hero_3_1773563957738.png";

const defaultSlides = [
  { mediaUrl: heroImage1, title: "hero.default_slide1.title", highlight: "hero.default_slide1.highlight", subtitle: "hero.default_slide1.subtitle", mediaType: "image" },
  { mediaUrl: heroImage2, title: "hero.default_slide2.title", highlight: "hero.default_slide2.highlight", subtitle: "hero.default_slide2.subtitle", mediaType: "image" },
  { mediaUrl: heroImage3, title: "hero.default_slide3.title", highlight: "hero.default_slide3.highlight", subtitle: "hero.default_slide3.subtitle", mediaType: "image" },
];

export function useHeroSlides(settings: any) {
  const slides = (settings?.hero_slides?.length > 0) 
    ? settings.hero_slides.map((s: any, i: number) => ({ ...s, mediaType: s.mediaType || "video", mediaUrl: s.mediaUrl || [heroImage1, heroImage2, heroImage3][i % 3] }))
    : defaultSlides;

  const [current, setCurrent] = useState(0);
  const timerRef = useRef<any>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCurrent(p => (p + 1) % slides.length), 7000);
  }, [slides.length]);

  useEffect(() => { resetTimer(); return () => clearTimeout(timerRef.current); }, [current, resetTimer]);

  return { 
    slides, 
    current, 
    setCurrent, 
    goTo: (i: number) => setCurrent(i),
    goNext: () => setCurrent(p => (p + 1) % slides.length), 
    goPrev: () => setCurrent(p => (p - 1 + slides.length) % slides.length) 
  };
}

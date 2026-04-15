import { useEffect, useRef } from "react";

export function HeroSlide({ slide, active, index }: any) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (slide.mediaType === "video" && videoRef.current) {
      if (active) { videoRef.current.currentTime = 0; videoRef.current.play().catch(() => {}); }
      else videoRef.current.pause();
    }
  }, [active, slide.mediaType]);

  return (
    <div className="absolute inset-0 transition-opacity duration-700" style={{ opacity: active ? 1 : 0, zIndex: active ? 1 : 0 }}>
      {slide.mediaType === "video" ? (
        <video ref={videoRef} src={slide.mediaUrl} className="absolute inset-0 w-full h-full object-cover" muted loop playsInline />
      ) : (
        <img src={slide.mediaUrl} alt="Hero" className="absolute inset-0 w-full h-full object-cover" loading={index === 0 ? "eager" : "lazy"} />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent rtl:bg-gradient-to-l" />
    </div>
  );
}

import { motion } from "framer-motion";
import { Button } from "@/components/atoms/Button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function HeroControls({ slides, current, goTo, goNext, goPrev }: any) {
  return (
    <>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
        {slides.map((_: any, i: number) => (
          <button key={i} onClick={() => goTo(i)} className="group relative">
            <div className={`h-2 rounded-full transition-all duration-500 ${i === current ? "w-10 bg-accent" : "w-2 bg-white/50"}`} />
            {i === current && (
              <motion.div className="absolute inset-0 h-2 rounded-full bg-accent/50" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 7, ease: "linear" }} style={{ transformOrigin: "right" }} />
            )}
          </button>
        ))}
      </div>
      <div className="absolute top-1/2 -translate-y-1/2 left-4 z-20 hidden sm:block">
        <Button size="icon" variant="ghost" className="text-white/70 bg-black/20" onClick={goPrev}><ChevronLeft className="h-5 w-5" /></Button>
      </div>
      <div className="absolute top-1/2 -translate-y-1/2 right-4 z-20 hidden sm:block">
        <Button size="icon" variant="ghost" className="text-white/70 bg-black/20" onClick={goNext}><ChevronRight className="h-5 w-5" /></Button>
      </div>
    </>
  );
}

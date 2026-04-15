import { Card } from "@/components/ui/card";
import { Quote } from "lucide-react";

export function TestimonialCard({ item, t, isCenter }: any) {
  return (
    <div className={`h-full transition-all duration-500 ease-out ${isCenter ? "scale-105 z-20" : "scale-95 opacity-70"}`}>
      <Card className={`p-5 h-[340px] border flex flex-col rounded-[2rem] overflow-hidden shadow-sm ${isCenter ? "border-accent ring-2 ring-accent/10 shadow-xl" : "border-border/50 hover:border-accent/30"}`}>
        <div className="relative flex-1 overflow-hidden rounded-2xl bg-muted/20 flex items-center justify-center">
          <Quote className={`absolute top-3 right-3 w-8 h-8 transition-colors ${isCenter ? "text-accent" : "text-muted-foreground/20"}`} />
          {item.whatsappImage ? (
            <img src={item.whatsappImage} alt="Feedback" className="w-full h-full object-contain transition-transform duration-700 hover:scale-110" />
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <Quote className="w-12 h-12 text-accent/10 mb-4" strokeWidth={1} />
              <p className="text-lg font-bold italic text-muted-foreground leading-relaxed line-clamp-6">{item.defaultText ? t(item.defaultText) : t("testimonials.default_text")}</p>
            </div>
          )}
        </div>
        <div className="mt-4 text-center shrink-0">
          <h4 className={`font-bold transition-colors ${isCenter ? "text-accent text-lg" : "text-foreground"}`}>{t(item.name)}</h4>
          {item.role && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{t(item.role)}</p>}
        </div>
      </Card>
    </div>
  );
}

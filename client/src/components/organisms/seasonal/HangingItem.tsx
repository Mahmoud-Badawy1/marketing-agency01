import { useCallback, useState } from "react";
import { sounds } from "./SeasonalSounds";
import { HangingString, LanternSVG, CrescentSVG, StarSVG } from "./SeasonalSVGs";

export type ItemType = "lantern" | "star" | "crescent";

export interface DecorationItem {
  type: ItemType;
  stringHeight: number;
  size: number;
  swayDuration: number;
  swayDeg: number;
}

export interface HangingItemProps extends DecorationItem {
  delay: number;
}

export function HangingItem({ type, stringHeight, size, swayDuration, swayDeg, delay }: HangingItemProps) {
  const [glowing, setGlowing] = useState(false);

  const handleClick = useCallback(() => {
    if (glowing) return;
    setGlowing(true);
    sounds[type]();
    setTimeout(() => setGlowing(false), 1200);
  }, [type, glowing]);

  return (
    <div
      className="flex flex-col items-center cursor-pointer select-none animate-[fadeInDown_0.8s_ease-out_both]"
      style={{ animationDelay: `${delay}s` }}
    >
      <HangingString height={stringHeight} />
      <div style={{ animation: `sway-${swayDeg} ${swayDuration}s ease-in-out infinite`, transformOrigin: "top center" }}>
        <div
          onClick={handleClick}
          className="relative hover:scale-110 active:scale-90 transition-transform duration-200"
          style={{
            width: size,
            height: type === "lantern" ? size * 1.7 : size,
            animation: glowing ? "clickBounce 0.65s ease-out" : undefined,
          }}
          title="اضغط عليّ! 🌙"
        >
          {type === "lantern" && <LanternSVG glowing={glowing} />}
          {type === "crescent" && <CrescentSVG glowing={glowing} />}
          {type === "star" && <StarSVG glowing={glowing} />}
        </div>
      </div>
    </div>
  );
}

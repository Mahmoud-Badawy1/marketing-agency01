import { useMemo } from "react";
import { DecorationItem, HangingItem } from "./HangingItem";

function SideDecoration({ items, side, delay }: { items: DecorationItem[]; side: "left" | "right"; delay: number }) {
  return (
    <div className={`fixed top-16 ${side === "left" ? "left-0 sm:left-1 md:left-2" : "right-0 sm:right-1 md:right-2"} z-30 pointer-events-auto flex gap-1 sm:gap-2 md:gap-3`}>
      {items.map((item, i) => (
        <div key={i} className="flex-shrink-0">
          <HangingItem {...item} delay={delay + i * 0.15} />
        </div>
      ))}
    </div>
  );
}

export function RamadanBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-l from-amber-700/90 via-amber-600/90 to-yellow-600/90 dark:from-amber-800/85 dark:via-amber-700/85 dark:to-yellow-700/85 text-white text-center py-2.5 px-4 text-sm font-medium shadow-md z-40 animate-[slideDown_0.5s_ease-out]">
      <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0L40 20L20 40L0 20Z' fill='none' stroke='%23fff' stroke-width='0.5'/%3E%3Cpath d='M20 5L35 20L20 35L5 20Z' fill='none' stroke='%23fff' stroke-width='0.5'/%3E%3Ccircle cx='20' cy='20' r='4' fill='none' stroke='%23fff' stroke-width='0.5'/%3E%3C/svg%3E")` }} />
      <div className="relative flex items-center justify-center gap-3">
        <span className="text-lg animate-[wiggle_3s_ease-in-out_infinite]">🌙</span>
        <span className="font-semibold tracking-wide">رمضان كريم — كل عام وأنتم بخير</span>
        <button onClick={onDismiss} className="absolute left-2 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors text-xs w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/15" aria-label="إغلاق">✕</button>
      </div>
    </div>
  );
}

export function RamadanDecorBody() {
  const rightItems = useMemo<DecorationItem[]>(
    () => [
      { type: "star", stringHeight: 30, size: 18, swayDuration: 4, swayDeg: 6 },
      { type: "crescent", stringHeight: 50, size: 28, swayDuration: 5, swayDeg: 4 },
      { type: "lantern", stringHeight: 25, size: 32, swayDuration: 3.5, swayDeg: 3 },
      { type: "star", stringHeight: 55, size: 14, swayDuration: 4.5, swayDeg: 7 },
    ],
    [],
  );

  const leftItems = useMemo<DecorationItem[]>(
    () => [
      { type: "star", stringHeight: 45, size: 16, swayDuration: 4.2, swayDeg: 5 },
      { type: "lantern", stringHeight: 20, size: 30, swayDuration: 3.8, swayDeg: 3 },
      { type: "crescent", stringHeight: 55, size: 26, swayDuration: 5.2, swayDeg: 4 },
      { type: "star", stringHeight: 35, size: 14, swayDuration: 3.5, swayDeg: 8 },
    ],
    [],
  );

  return (
    <>
      <SideDecoration items={rightItems} side="right" delay={0.2} />
      <SideDecoration items={leftItems} side="left" delay={0.4} />
    </>
  );
}

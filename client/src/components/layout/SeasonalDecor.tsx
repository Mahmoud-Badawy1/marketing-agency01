/**
 * SeasonalDecor — Ramadan Edition 🌙
 *
 * Hanging decorations on left & right sides — lanterns, crescents, stars.
 * Interactive: click elements for sounds + animations (fun for kids!).
 * Controlled via admin "decoration" setting.
 *
 * To remove: delete this file + its import in Home.tsx.
 */
import { useCallback, useMemo, useState } from "react";
import { usePublicSettings } from "@/hooks/use-public-settings";

// ═══════════════════════════════════════════════════════════════════════════
// Sound Generator (Web Audio API — no external files needed)
// ═══════════════════════════════════════════════════════════════════════════
let audioCtx: AudioContext | null = null;

function getAudioCtx() {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

function playChime(freq: number, duration = 0.4) {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch {
    /* audio not supported */
  }
}

const sounds = {
  lantern: () => {
    playChime(523, 0.5);
    setTimeout(() => playChime(659, 0.3), 120);
  },
  star: () => {
    playChime(880, 0.25);
    setTimeout(() => playChime(1047, 0.2), 80);
    setTimeout(() => playChime(1319, 0.15), 160);
  },
  crescent: () => {
    playChime(392, 0.6);
    setTimeout(() => playChime(523, 0.4), 200);
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// SVG Elements
// ═══════════════════════════════════════════════════════════════════════════

// ─── Lantern (Fanoos) — uses ramadan1.svg from /public ──────────────────
function LanternSVG({ glowing }: { glowing: boolean }) {
  return (
    <div className="w-full h-full relative flex items-center justify-center">
      <img
        src="/ramadan1.svg"
        alt="فانوس"
        draggable={false}
        className="w-full h-full object-contain transition-all duration-300 select-none"
        style={{
          filter: glowing
            ? "drop-shadow(0 0 10px #FFD700) drop-shadow(0 0 20px #FFA000) brightness(1.4) saturate(1.5)"
            : "drop-shadow(0 0 3px rgba(200,150,60,0.4)) brightness(1)",
        }}
      />
      {/* Subtle warm glow overlay when clicked */}
      {glowing && (
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(255,215,0,0.35) 0%, transparent 70%)",
          }}
        />
      )}
    </div>
  );
}

// ─── Crescent Moon ──────────────────────────────────────────────────────
function CrescentSVG({ glowing }: { glowing: boolean }) {
  const filterId = useMemo(
    () => `moonGlow_${Math.random().toString(36).slice(2, 8)}`,
    [],
  );
  return (
    <svg viewBox="0 0 44 44" fill="none" className="w-full h-full">
      <defs>
        {glowing && (
          <filter id={filterId}>
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
      </defs>
      <path
        d="M22 2C12.06 2 4 10.06 4 20s8.06 18 18 18c2 0 3.92-.3 5.72-.86A14.5 14.5 0 0 1 14.5 20 14.5 14.5 0 0 1 27.72 2.86 18.2 18.2 0 0 0 22 2Z"
        fill={glowing ? "#FFD54F" : "#E8C876"}
        filter={glowing ? `url(#${filterId})` : undefined}
      />
    </svg>
  );
}

// ─── Star ───────────────────────────────────────────────────────────────
function StarSVG({ glowing }: { glowing: boolean }) {
  const filterId = useMemo(
    () => `starGlow_${Math.random().toString(36).slice(2, 8)}`,
    [],
  );
  return (
    <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
      <defs>
        {glowing && (
          <filter id={filterId}>
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
      </defs>
      <polygon
        points="16,2 19.5,11 29,11 21.5,17 24,27 16,21 8,27 10.5,17 3,11 12.5,11"
        fill={glowing ? "#FFD54F" : "#D4A853"}
        opacity={glowing ? 1 : 0.7}
        filter={glowing ? `url(#${filterId})` : undefined}
      />
    </svg>
  );
}

// ─── String / Chain ─────────────────────────────────────────────────────
function HangingString({ height }: { height: number }) {
  return (
    <svg width="3" height={height} className="mx-auto">
      <line
        x1="1.5"
        y1="0"
        x2="1.5"
        y2={height}
        stroke="#C6953C"
        strokeWidth="1.2"
        strokeDasharray="3 2"
        opacity={0.5}
      />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Interactive Hanging Item
// ═══════════════════════════════════════════════════════════════════════════
type ItemType = "lantern" | "star" | "crescent";

interface HangingItemProps {
  type: ItemType;
  stringHeight: number;
  size: number;
  swayDuration: number;
  swayDeg: number;
  delay: number;
}

function HangingItem({
  type,
  stringHeight,
  size,
  swayDuration,
  swayDeg,
  delay,
}: HangingItemProps) {
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
      <div
        style={{
          animation: `sway-${swayDeg} ${swayDuration}s ease-in-out infinite`,
          transformOrigin: "top center",
        }}
      >
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

// ═══════════════════════════════════════════════════════════════════════════
// Side Decoration Column
// ═══════════════════════════════════════════════════════════════════════════
interface DecorationItem {
  type: ItemType;
  stringHeight: number;
  size: number;
  swayDuration: number;
  swayDeg: number;
}

function SideDecoration({
  items,
  side,
  delay,
}: {
  items: DecorationItem[];
  side: "left" | "right";
  delay: number;
}) {
  return (
    <div
      className={`fixed top-16 ${side === "left" ? "left-0 sm:left-1 md:left-2" : "right-0 sm:right-1 md:right-2"} z-30 pointer-events-auto flex gap-1 sm:gap-2 md:gap-3`}
    >
      {items.map((item, i) => (
        <div key={i} className="flex-shrink-0">
          <HangingItem
            type={item.type}
            stringHeight={item.stringHeight}
            size={item.size}
            swayDuration={item.swayDuration}
            swayDeg={item.swayDeg}
            delay={delay + i * 0.15}
          />
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Ramadan Banner (dismissible)
// ═══════════════════════════════════════════════════════════════════════════
function RamadanBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div
      className="relative overflow-hidden bg-gradient-to-l from-amber-700/90 via-amber-600/90 to-yellow-600/90 dark:from-amber-800/85 dark:via-amber-700/85 dark:to-yellow-700/85 text-white text-center py-2.5 px-4 text-sm font-medium shadow-md z-40 animate-[slideDown_0.5s_ease-out]"
    >
      {/* Islamic geometric pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0L40 20L20 40L0 20Z' fill='none' stroke='%23fff' stroke-width='0.5'/%3E%3Cpath d='M20 5L35 20L20 35L5 20Z' fill='none' stroke='%23fff' stroke-width='0.5'/%3E%3Ccircle cx='20' cy='20' r='4' fill='none' stroke='%23fff' stroke-width='0.5'/%3E%3C/svg%3E")`,
        }}
      />
      <div className="relative flex items-center justify-center gap-3">
        <span
          className="text-lg animate-[wiggle_3s_ease-in-out_infinite]"
        >
          🌙
        </span>
        <span className="font-semibold tracking-wide">
          رمضان كريم — كل عام وأنتم بخير
        </span>
        <button
          onClick={onDismiss}
          className="absolute left-2 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors text-xs w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/15"
          aria-label="إغلاق"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Main Export
// ═══════════════════════════════════════════════════════════════════════════
export default function SeasonalDecor() {
  const { data: settings } = usePublicSettings();
  const decorationEnabled = settings?.decoration?.enabled === true;
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // Right side items
  const rightItems = useMemo<DecorationItem[]>(
    () => [
      { type: "star", stringHeight: 30, size: 18, swayDuration: 4, swayDeg: 6 },
      {
        type: "crescent",
        stringHeight: 50,
        size: 28,
        swayDuration: 5,
        swayDeg: 4,
      },
      {
        type: "lantern",
        stringHeight: 25,
        size: 32,
        swayDuration: 3.5,
        swayDeg: 3,
      },
      {
        type: "star",
        stringHeight: 55,
        size: 14,
        swayDuration: 4.5,
        swayDeg: 7,
      },
    ],
    [],
  );

  // Left side items (mirrored arrangement)
  const leftItems = useMemo<DecorationItem[]>(
    () => [
      {
        type: "star",
        stringHeight: 45,
        size: 16,
        swayDuration: 4.2,
        swayDeg: 5,
      },
      {
        type: "lantern",
        stringHeight: 20,
        size: 30,
        swayDuration: 3.8,
        swayDeg: 3,
      },
      {
        type: "crescent",
        stringHeight: 55,
        size: 26,
        swayDuration: 5.2,
        swayDeg: 4,
      },
      {
        type: "star",
        stringHeight: 35,
        size: 14,
        swayDuration: 3.5,
        swayDeg: 8,
      },
    ],
    [],
  );

  if (!decorationEnabled) return null;

  return (
    <>
      {/* Ramadan banner */}
      {!bannerDismissed && (
        <RamadanBanner onDismiss={() => setBannerDismissed(true)} />
      )}

      {/* Right side hanging decorations */}
      <SideDecoration items={rightItems} side="right" delay={0.2} />

      {/* Left side hanging decorations */}
      <SideDecoration items={leftItems} side="left" delay={0.4} />
    </>
  );
}

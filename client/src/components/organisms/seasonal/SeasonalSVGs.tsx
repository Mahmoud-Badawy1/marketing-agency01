import { useMemo } from "react";

export function LanternSVG({ glowing }: { glowing: boolean }) {
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

export function CrescentSVG({ glowing }: { glowing: boolean }) {
  const filterId = useMemo(() => `moonGlow_${Math.random().toString(36).slice(2, 8)}`, []);
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

export function StarSVG({ glowing }: { glowing: boolean }) {
  const filterId = useMemo(() => `starGlow_${Math.random().toString(36).slice(2, 8)}`, []);
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

export function HangingString({ height }: { height: number }) {
  return (
    <svg width="3" height={height} className="mx-auto">
      <line x1="1.5" y1="0" x2="1.5" y2={height} stroke="#C6953C" strokeWidth="1.2" strokeDasharray="3 2" opacity={0.5} />
    </svg>
  );
}

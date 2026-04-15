import { motion } from "framer-motion";

export function NavLogo({ mascotSrc, onLogoClick }: { mascotSrc: string, onLogoClick: () => void }) {
  return (
    <motion.button
      onClick={onLogoClick}
      className="flex items-center gap-2 shrink-0 cursor-pointer"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
    >
      <img src={mascotSrc} alt="Logo" className="h-10 w-10 rounded-full object-cover" />
      <span className="font-extrabold text-lg sm:text-xl tracking-wide flex items-center gap-1.5">
        ماركتير برو <span className="text-accent">|</span> <span className="font-sans text-sm">Marketer Pro</span>
      </span>
    </motion.button>
  );
}

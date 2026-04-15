import { motion } from "framer-motion";
import { NAV_ITEMS } from "@/lib/constants";

export function NavDesktop({ t, scrollTo }: any) {
  return (
    <div className="hidden md:flex items-center gap-1">
      {NAV_ITEMS.map((item, i) => (
        <motion.button
          key={item.href}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 + i * 0.08 }}
          onClick={() => scrollTo(item.href)}
          className="pr-3 py-2 text-sm font-medium text-muted-foreground transition-colors rounded-md hover:bg-accent/5"
        >
          {t(item.label)}
        </motion.button>
      ))}
    </div>
  );
}

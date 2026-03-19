import { motion } from "framer-motion";
import { SiWhatsapp } from "react-icons/si";
import { usePublicSettings } from "@/hooks/use-public-settings";

export default function WhatsAppFloat() {
  const { data: settings } = usePublicSettings();
  const whatsappNumber = settings?.contact?.whatsapp || "201007673634";

  return (
    <motion.a
      href={`https://wa.me/${whatsappNumber.replace("+", "")}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30"
      data-testid="button-whatsapp-float"
      aria-label="تواصل عبر واتساب"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1.5, type: "spring", stiffness: 200 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <div className="animate-pulse">
        <SiWhatsapp className="h-7 w-7" />
      </div>
      <motion.div
        className="absolute inset-0 rounded-full bg-emerald-500"
        animate={{ scale: [1, 1.5], opacity: [0.4, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </motion.a>
  );
}

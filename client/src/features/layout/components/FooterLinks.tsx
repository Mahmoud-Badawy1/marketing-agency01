import { motion } from "framer-motion";

export function FooterLinks({ title, links, t, onClick }: any) {
  return (
    <div className="space-y-4">
      <h4 className="font-bold text-sm">{title}</h4>
      <ul className="space-y-2">
        {links.map((link: any, i: number) => (
          <motion.li key={link.label} initial={{ opacity: 0, x: 15 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.08 }}>
            <button onClick={() => onClick(link.href, link.type)} className="text-primary-foreground/70 text-sm hover:text-white transition-colors">
              {t(link.label)}
            </button>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

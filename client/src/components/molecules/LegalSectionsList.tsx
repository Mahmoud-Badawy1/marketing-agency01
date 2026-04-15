import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { fadeInUp, staggerContainer } from "@/lib/animations";

interface LegalSectionsListProps {
  sections: { title: string; content: string }[];
  testIdPrefix: string;
}

export function LegalSectionsList({ sections, testIdPrefix }: LegalSectionsListProps) {
  return (
    <motion.div className="space-y-4" initial="hidden" animate="visible" variants={staggerContainer}>
      {sections.map((section, i) => (
        <motion.div key={i} variants={fadeInUp} custom={i}>
          <Card className="p-6 border border-card-border" data-testid={`card-${testIdPrefix}-${i}`}>
            <h3 className="text-lg font-bold text-foreground mb-2">{section.title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{section.content}</p>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}

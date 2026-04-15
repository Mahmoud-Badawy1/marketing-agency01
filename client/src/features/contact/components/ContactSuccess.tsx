import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/atoms/Button";

interface ContactSuccessProps {
  t: any;
  onReset: () => void;
}

export function ContactSuccess({ t, onReset }: ContactSuccessProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 200 }}
    >
      <Card className="p-10 text-center border border-emerald-200 dark:border-emerald-900/30">
        <motion.div
          className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/10 flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
        >
          <CheckCircle className="h-8 w-8 text-emerald-500" />
        </motion.div>
        <motion.h3 className="text-2xl font-bold text-foreground mb-2">{t({ ar: "تم التسجيل بنجاح!", en: "Registered Successfully!" })}</motion.h3>
        <motion.p className="text-muted-foreground mb-6">{t({ ar: "شكراً لك! سيتواصل معك خبير النمو لدينا خلال 24 ساعة لتحديد موعد الاستشارة المجانية", en: "Thank you! Our growth strategist will reach out within 24 hours" })}</motion.p>
        <Button variant="outline" onClick={onReset}>{t({ ar: "تسجيل طلب آخر", en: "Register Another Request" })}</Button>
      </Card>
    </motion.div>
  );
}

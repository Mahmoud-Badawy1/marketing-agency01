import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";

interface SuccessSectionProps {
  clientName: string;
  projectNames: string;
  planName: string;
  orderId: string;
  whatsappUrl: string;
}

export default function SuccessSection({
  clientName,
  projectNames,
  planName,
  orderId,
  whatsappUrl
}: SuccessSectionProps) {
  const { t, language } = useLanguage();

  return (
    <Card className="p-8 border border-emerald-500/30 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
        className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/10 flex items-center justify-center"
      >
        <CheckCircle2 className="h-10 w-10 text-emerald-500" />
      </motion.div>

      <h2 className="text-2xl font-extrabold text-foreground mb-2" data-testid="text-success-title">
        {t({ ar: "تم تسجيل طلبك بنجاح!", en: "Your request has been successfully recorded!" })}
      </h2>
      <p className="text-muted-foreground mb-2">
        {t({ ar: `شكراً لك ${clientName}`, en: `Thank you, ${clientName}` })}
      </p>
      <p className="text-sm text-muted-foreground mb-6">
        {t({ ar: `سيتم مراجعة التحويل والتواصل معك قريباً للانطلاق في رحلة نمو ${projectNames} عبر ${t(planName)}`, en: `The transfer will be reviewed and we will contact you soon to begin the growth journey of ${projectNames} with ${t(planName)}` })}
      </p>

      <div className={`bg-muted/50 rounded-md p-4 border border-border mb-6 text-${language === "ar" ? "right" : "left"}`}>
        <p className="text-xs text-muted-foreground mb-1">{t({ ar: "رقم الطلب", en: "Order ID" })}</p>
        <p className="text-sm font-mono font-bold text-foreground" dir="ltr" data-testid="text-order-id">{orderId}</p>
      </div>

      <div className="space-y-3">
        <Button
          size="lg"
          className="w-full bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700"
          onClick={() => window.open(whatsappUrl, "_blank")}
          data-testid="button-whatsapp-confirm"
        >
          <SiWhatsapp className={`h-5 w-5 ${language === "ar" ? "ml-2" : "mr-2"}`} />
          {t({ ar: "تأكيد الطّلب عبر واتساب للحصول على استجابة أسرع", en: "Confirm order via WhatsApp for faster response" })}
        </Button>
      </div>
    </Card>
  );
}

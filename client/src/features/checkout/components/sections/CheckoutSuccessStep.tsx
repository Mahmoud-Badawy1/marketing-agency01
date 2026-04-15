import { motion } from "framer-motion";
import SuccessSection from "@/features/checkout/components/SuccessSection";

export function CheckoutSuccessStep({ c, plan }: any) {
  const whatsappNumber = c.publicSettings?.contact?.whatsapp || "201553145631";
  const projectNames = c.projects.map((p: any) => p.name).join(c.t({ ar: " و ", en: " and " }));
  
  const whatsappMessage = encodeURIComponent(
    c.t({
      ar: `مرحباً، أنا ${c.clientName}\nتم طلب ${c.t(plan.name)}${c.projects.length > 1 ? ` لـ ${c.projects.length} شركات` : ` للشركة: ${projectNames}`}\nرقم الطلب: ${c.orderId}`,
      en: `Hello, I'm ${c.clientName}\nI requested ${c.t(plan.name)}\nOrder: ${c.orderId}`
    })
  );

  const whatsappUrl = `https://wa.me/${whatsappNumber.replace("+", "")}?text=${whatsappMessage}`;

  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
      <SuccessSection
        clientName={c.clientName}
        projectNames={projectNames}
        planName={plan.name}
        orderId={c.orderId}
        whatsappUrl={whatsappUrl}
      />
    </motion.div>
  );
}

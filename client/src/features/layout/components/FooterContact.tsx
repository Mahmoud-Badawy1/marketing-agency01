import { SiWhatsapp } from "react-icons/si";
import { Button } from "@/components/atoms/Button";

export function FooterContact({ t, whatsappNumber }: { t: any, whatsappNumber: string }) {
  return (
    <div className="space-y-4">
      <h4 className="font-bold text-sm">{t("footer.contact_us")}</h4>
      <Button
        variant="outline"
        className="w-full bg-emerald-600/20 border-emerald-600/30 text-white hover:bg-emerald-600/30"
        onClick={() => window.open(`https://wa.me/${whatsappNumber}`, "_blank")}
      >
        <SiWhatsapp className="mx-2 h-4 w-4" />
        {t("footer.whatsapp")}
      </Button>
      <p className="text-primary-foreground/60 text-xs text-center">{t("footer.hours")}</p>
    </div>
  );
}

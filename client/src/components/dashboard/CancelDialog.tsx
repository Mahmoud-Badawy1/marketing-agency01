import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/hooks/use-language";

interface CancelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
  isPending: boolean;
  title: string;
  description: string;
}

export default function CancelDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending,
  title,
  description,
}: CancelDialogProps) {
  const { t, language } = useLanguage();
  const [reason, setReason] = React.useState("");

  React.useEffect(() => {
    if (!open) setReason("");
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir={language === "ar" ? "rtl" : "ltr"}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>{t({ ar: "سبب الإلغاء", en: "Cancellation Reason" })}</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t({ ar: "اذكر السبب هنا...", en: "Enter reason here..." })}
              rows={4}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t({ ar: "تراجع", en: "Go Back" })}
            </Button>
            <Button
              variant="destructive"
              disabled={!reason.trim() || isPending}
              onClick={() => onConfirm(reason)}
            >
              {isPending ? t({ ar: "جاري الإلغاء...", en: "Cancelling..." }) : t({ ar: "تأكيد الإلغاء", en: "Confirm Cancellation" })}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import * as React from "react";
